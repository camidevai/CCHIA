---
name: git-worktrees
scope: git
---

# Git Worktrees

## Aplica a
Operaciones con Git Worktrees y desarrollo de features.

## Reglas de uso

### 1. Estructura obligatoria

Todos los worktrees deben estar bajo `.worktrees/`:

```
.worktrees/
├── .meta/           # Configuración y locks
│   ├── config.json
│   ├── active-features.json
│   └── merge.lock   # Lock de concurrencia (temporal)
├── environments/    # Permanentes
│   ├── dev/        # develop (branch real - único dueño)
│   ├── qa/         # origin/develop (detached HEAD)
│   └── prod/       # origin/main (detached HEAD, READONLY)
└── features/       # Temporales
    └── feature-*/  # Por feature/hotfix
```

### 2. Nomenclatura de branches

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| Feature | `feature/{modulo}-{descripcion}` | `feature/auth-login` |
| Hotfix | `hotfix/{id}-{descripcion}` | `hotfix/123-payment-fix` |
| Release | `release/v{major}.{minor}.{patch}` | `release/v1.2.0` |

> **Nota sobre naming**: Los branches usan `/` como separador (ej: `feature/auth-login`)
> mientras que los paths de worktree usan `-` (ej: `.worktrees/features/feature-auth-login`).
> Esto es porque Git branches soportan `/` pero directorios con `/` crearían subdirectorios no deseados.

### 3. Flujo de trabajo

```
develop (ambiente dev)
    │
    ├─► feature/xxx → worktree aislado
    │       │
    │       └─► merge a develop
    │
    ├─► release/vX.Y.Z (ambiente qa)
    │       │
    │       └─► merge a main + develop
    │
    └─► main (ambiente prod, readonly)
```

### 4. Un feature = un worktree

- Cada issue/feature tiene su propio worktree
- No mezclar trabajo de múltiples features
- Eliminar worktree tras merge

### 5. Ambientes protegidos

- **dev**: Puede recibir merges de features
- **qa**: Solo release branches
- **prod**: READONLY, solo sincronización

### 6. HEAD desacoplado para qa y prod

Solo dev/ tiene branch real (develop). qa/ y prod/ usan detached HEAD:

```bash
# dev: branch real (puede hacer merges)
git worktree add .worktrees/environments/dev develop

# qa: detached HEAD (se sincroniza con reset)
git worktree add --detach .worktrees/environments/qa origin/develop

# prod: detached HEAD (readonly, se sincroniza con reset)
git worktree add --detach .worktrees/environments/prod origin/main
```

> Esto evita `fatal: 'develop' is already checked out at...`

### 7. Merge se ejecuta en dev/

Con worktrees habilitados, el merge de features a develop se ejecuta
DENTRO de `.worktrees/environments/dev/`, no en el repo principal:

```bash
cd .worktrees/environments/dev
git pull origin develop
git merge feature/xxx --no-ff
git push origin develop
cd {repo_principal}
```

> `git checkout develop` en el repo principal FALLA porque
> develop ya está en el worktree dev/.

### 8. NUNCA `git add -A` o `git add .` en contexto de merge

```bash
# PROHIBIDO en merge:
git add -A                    # Incluye TODO, incluyendo secrets y temporales
git add .                     # Mismo problema

# CORRECTO en merge:
git add src/features/auth/login.tsx
git add src/features/auth/types.ts
```

> **Razon**: En merge, los archivos a stage deben ser explicitamente los del feature.
> `git add -A` puede incluir: archivos `.env`, secrets, archivos temporales de otros
> worktrees, archivos de configuracion local, o binarios accidentales.
> El staging explicito es especialmente critico en entornos con multiples worktrees.

### 9. Lock de merge para concurrencia

Merges concurrentes sobre dev/ causan corrupcion. Usar lock:

```
.worktrees/.meta/merge.lock
```

**Formato del lock file (JSON):**
```json
{
  "pid": 12345,
  "timestamp": "2026-02-04T10:30:00Z",
  "operation": "merge",
  "branch": "feature/auth-login",
  "target": "develop"
}
```

**Reglas:**
- Adquirir antes de merge, liberar después (éxito o fallo)
- Si lock existe y < 10 min → esperar y reintentar cada 30s
- Si lock existe y > 10 min → ejecutar algoritmo de detección stale (ver abajo)
- Crear nuevo lock file con PID actual antes de proceder con merge

**Algoritmo de detección de lock stale:**
1. Leer lock file → obtener `pid` y `timestamp`
2. Si `timestamp` < 10 minutos → lock activo, esperar y reintentar cada 30s
3. Si `timestamp` > 10 minutos:
   a. Verificar si PID sigue activo: `tasklist /FI "PID eq {pid}"` (Windows) o `kill -0 {pid}` (Unix)
   b. Si PID activo → lock genuinamente long-running (merge con muchos conflictos). Mostrar:
      ```
      Merge lock activo por más de 10 min (PID {pid} sigue ejecutándose).
      Operación: {operation} en {branch}
      Opciones:
        a) Esperar (el proceso sigue activo)
        b) Forzar liberación (puede corromper merge en curso)
      ```
      - Si usuario elige a) → reintentar cada 30s, re-verificar PID en cada intento
      - Si usuario elige b) → eliminar lock, registrar en sesión: "Lock forzado por usuario. PID {pid} seguía activo."
   c. Si PID no activo → lock stale. Eliminar automáticamente con advertencia:
      ```
      Lock stale detectado (PID {pid} ya no existe). Eliminando lock...
      ```
4. Crear nuevo lock file con PID actual antes de proceder

## Ejemplos

### Correcto: Crear worktree para feature

```bash
# Operación ATÓMICA: crear branch y worktree sin cambiar HEAD del repo principal
git fetch origin develop
git worktree add -b feature/auth-login .worktrees/features/feature-auth-login origin/develop
```

> **Importante**: Usar `git worktree add -b` (atómico) en vez de
> `git checkout -b` + `git worktree add` (2 pasos con race condition).

### Correcto: Trabajar en worktree

```bash
cd .worktrees/features/feature-auth-login
# Hacer cambios - staging explícito por archivo
git add src/features/auth/login.tsx src/features/auth/types.ts
git commit -m "feat(auth): add login form"
```

> **Nota**: Evitar `git add .` o `git add -A`. Siempre staging explícito
> para prevenir inclusión accidental de secrets o archivos no deseados.

### Correcto: Cleanup tras merge

```bash
# Después de merge exitoso
git worktree remove .worktrees/features/feature-auth-login
git branch -d feature/auth-login
```

### Incorrecto: Modificar ambiente prod

```bash
cd .worktrees/environments/prod
git commit -m "quick fix"  # PROHIBIDO
```

### Incorrecto: Trabajar sin worktree

```bash
# En el repo principal, mezclando features
git checkout -b feature/auth
# ... trabajo ...
git stash
git checkout -b feature/payments
# ... confusión ...
```

## Comandos útiles

```bash
# Listar worktrees
git worktree list

# Limpiar huérfanos
git worktree prune

# Ver estado de todos
git worktree list --porcelain
```

## Razón

Los worktrees permiten:
- Desarrollo aislado sin stash/switch constante
- Ambientes siempre disponibles para pruebas
- Flujo GitFlow limpio y predecible
- Menos errores por contexto mezclado

## Cuándo romper las reglas

- Hotfixes urgentes pueden ir directo a main (documentar)
- Proyectos muy pequeños pueden omitir worktrees
- Siempre documentar excepciones en la sesión
