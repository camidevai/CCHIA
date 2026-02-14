---
name: worktree
version: 2.0
description: "Gestión de Git Worktrees para desarrollo aislado. Maneja ambientes permanentes (dev, qa, prod) y worktrees temporales por feature."
---

# Worktree - Gestión de Git Worktrees

## QUICK REFERENCE

> **Nota estructural**: Este skill usa estructura basada en comandos (no fases)
> porque gestiona operaciones interactivas discretas. Ver `.claude/skills/README.md`
> sección "Structural Exceptions".

### BLOCKING CONDITIONS
> ⛔ Condiciones que bloquean comandos específicos

**`init`:**
- [ ] No es un repositorio Git
- [ ] Branch main no existe

**`create {nombre}`:**
- [ ] Sistema de worktrees no inicializado
- [ ] Branch con ese nombre ya existe

**`delete {nombre}`:**
- [ ] Worktree es un ambiente (dev/qa/prod)
- [ ] Cambios sin commit (requiere confirmación)

### REQUIRED OUTPUTS

**`init`:**
- [ ] `.worktrees/environments/dev/` existe
- [ ] `.worktrees/environments/qa/` existe
- [ ] `.worktrees/environments/prod/` existe
- [ ] `.worktrees/.meta/config.json` existe

**`create {nombre}`:**
- [ ] `.worktrees/features/{tipo}-{nombre}/` existe
- [ ] `.worktrees/.meta/active-features.json` actualizado

### COMMANDS OVERVIEW
```
init ─────► create {feature} ─────► update {feature} ─────► delete {feature}
  │              │                       │                       │
  └─► list       └─► switch              └─► status              └─► cleanup
                                              │
                                              └─► env sync {env}
```

---

## Overview

Gestiona Git Worktrees para desarrollo aislado de features con ambientes permanentes para dev, qa y prod. Integra GitFlow.

## Comandos

| Comando | Descripción | Uso |
|---------|-------------|-----|
| `init` | Configura estructura inicial | Una vez por proyecto |
| `create {nombre}` | Crea worktree feature/hotfix | Por cada feature |
| `list` | Lista worktrees activos | Consulta |
| `switch {nombre}` | Muestra path del worktree | Navegación |
| `delete {nombre}` | Elimina worktree temporal | Cleanup manual |
| `cleanup` | Limpia huérfanos | Mantenimiento |
| `update {nombre}` | Sincroniza feature con develop | Antes de merge |
| `env sync {env}` | Sincroniza ambiente | dev/qa/prod |
| `status` | Estado completo | Diagnóstico |

---

## init

**Prerrequisitos:** Git repo con branch `main`

**Proceso:**
1. Verificar Git: `git rev-parse --is-inside-work-tree`
2. Crear estructura:
   ```
   .worktrees/
   ├── .meta/
   │   ├── config.json
   │   ├── active-features.json
   │   └── promotions.json
   ├── environments/{dev, qa, prod}
   └── features/
   ```
3. Crear branch develop si no existe
4. Crear worktrees de ambiente:
   - `dev` → branch develop (único dueño del branch)
     `git worktree add .worktrees/environments/dev develop`
   - `qa` → detached HEAD en origin/develop (se sincroniza con reset)
     `git worktree add --detach .worktrees/environments/qa origin/develop`
   - `prod` → detached HEAD en origin/main (readonly, se sincroniza con reset)
     `git worktree add --detach .worktrees/environments/prod origin/main`

   > **Nota**: Solo dev/ tiene un branch real (para poder hacer merges).
   > qa/ y prod/ usan HEAD desacoplado porque se sincronizan via `git reset --hard`
   > y no necesitan branch propio. Esto evita el error `fatal: 'develop' is already
   > checked out at...` que ocurre cuando dos worktrees intentan usar el mismo branch.
5. Guardar config en `.worktrees/.meta/config.json`:
   ```json
   {
     "initialized": true,
     "initializedAt": "2026-01-28T10:00:00Z",
     "mainBranch": "main",
     "developBranch": "develop",
     "environments": {
       "dev": { "branch": "develop", "detached": false, "path": ".worktrees/environments/dev" },
       "qa": { "branch": "develop", "detached": true, "path": ".worktrees/environments/qa" },
       "prod": { "branch": "main", "detached": true, "path": ".worktrees/environments/prod", "readonly": true }
     }
   }
   ```
   > `detached: true` indica worktree con HEAD desacoplado (creado con `--detach`).
   > Solo dev/ tiene `detached: false` para poder ejecutar merges directamente.
6. Inicializar `.worktrees/.meta/promotions.json`:
   ```json
   {
     "promotions": [],
     "lastSync": {
       "dev": null,
       "qa": null,
       "prod": null
     }
   }
   ```
7. Agregar `.worktrees/` a `.gitignore`

---

## create {nombre}

**Tipo automático:**
- Contiene la palabra "hotfix" (case insensitive) → `hotfix/{nombre}`
- Nombre coincide con patrón `^\d+-` (empieza con dígitos seguidos de guión, ej: `123-fix-payment`) → `hotfix/{nombre}`
- Todo lo demás → `feature/{nombre}`

**Ejemplos:**
| Input | Resultado | Razón |
|-------|-----------|-------|
| `auth-login` | `feature/auth-login` | No empieza con número ni contiene "hotfix" |
| `hotfix-payment` | `hotfix/hotfix-payment` | Contiene "hotfix" |
| `123-fix-crash` | `hotfix/123-fix-crash` | Empieza con dígitos + guión |
| `123feature` | `feature/123feature` | Empieza con dígitos pero sin guión |
| `add-v2-api` | `feature/add-v2-api` | Número en medio, no al inicio |

> **Nota**: Git worktrees comparten el `.git` del repo principal, por lo que el espacio adicional es mínimo (solo los archivos de trabajo). No se requiere pre-check de espacio en disco para la mayoría de proyectos.

**Proceso:**
1. Verificar que branch no existe
2. Actualizar referencia de develop: `git fetch origin develop`
3. Crear branch y worktree en operación atómica:
   ```bash
   git worktree add -b {tipo}/{nombre} .worktrees/features/{tipo}-{nombre} origin/develop
   ```
   > **Importante**: Esta operación atómica NO cambia el HEAD del repo principal, evitando race conditions cuando se crean múltiples features simultáneamente.
4. Registrar en `active-features.json`

**Output:**
```
Worktree creado: {tipo}-{nombre}
Directorio: .worktrees/features/{tipo}-{nombre}
```

---

## list

Ejecuta `git worktree list` y formatea:

```
AMBIENTES (permanentes):
   dev  → develop  (branch)    .worktrees/environments/dev
   qa   → develop  (detached)  .worktrees/environments/qa
   prod → main     (detached)  .worktrees/environments/prod (readonly)

FEATURES (temporales):
   feature-auth → feature/auth  .worktrees/features/feature-auth
```

---

## switch {nombre}

Resuelve path y muestra instrucción:
- Ambiente: `.worktrees/environments/{nombre}`
- Feature: `.worktrees/features/feature-{nombre}` o `hotfix-{nombre}`

```
cd .worktrees/features/{tipo}-{nombre}
```

---

## update {nombre}

**Propósito:** Sincroniza un worktree de feature con los últimos cambios de develop. Esencial cuando otros features ya se mergearon a develop y se necesitan incorporar esos cambios.

**Proceso:**
1. Verificar que el worktree existe y es un feature (no ambiente)
2. Verificar que no hay operaciones git pendientes en el worktree
3. Sincronizar con develop:
   ```bash
   cd .worktrees/features/{tipo}-{nombre}
   git fetch origin develop
   git merge origin/develop --no-ff -m "chore: sync with develop"
   ```
4. Si hay conflictos → Mostrar archivos en conflicto y pedir resolución manual
5. Informar resultado

**Output (éxito):**
```
✅ Feature {nombre} sincronizado con develop

Commits incorporados: {N}
Estado: Limpio, listo para continuar desarrollo

💡 Si hay conflictos de merge, resuélvelos y haz commit.
```

**Output (conflictos):**
```
⚠️ Conflictos al sincronizar {nombre} con develop:

Archivos en conflicto:
  - {archivo1}
  - {archivo2}

Resuelve los conflictos manualmente:
  cd .worktrees/features/{tipo}-{nombre}
  # Resolver conflictos en los archivos
  git add {archivos_resueltos}
  git commit
```

**Cuándo usar:**
- Antes de `/merge` (recomendado)
- Cuando otro feature se mergeó a develop y necesitas sus cambios
- Cuando `/worktree status` muestra divergencia con develop

---

## delete {nombre}

**Restricción:** No permite eliminar ambientes (dev/qa/prod)

**Proceso:**
1. Verificar cambios sin commit → confirmar si existen
2. `git worktree remove .worktrees/features/{tipo}-{nombre} --force`
3. Opcional: eliminar branch
4. Actualizar `active-features.json`

---

## cleanup

1. `git worktree prune --dry-run` → mostrar huérfanos
2. Confirmar limpieza
3. `git worktree prune`
4. Sincronizar `active-features.json`

---

## env sync {env}

**Válidos:** dev, qa, prod

**Proceso:**
1. Verificar cambios locales → confirmar descarte
2. `git fetch origin && git reset --hard origin/{branch}`
3. Post-sync: `npm install` o `pip install` si aplica

**prod:** Sincroniza pero recuerda que es readonly.

---

## status

Muestra estado completo del sistema de worktrees con información de sincronización y sugerencias.

**Proceso:**

1. Obtener estado de cada ambiente:
```bash
# Para cada ambiente (dev, qa, prod)
cd .worktrees/environments/{env}
BRANCH=$(git branch --show-current)
if [ -z "$BRANCH" ]; then
  BRANCH="(detached at $(git rev-parse --short HEAD))"
fi
COMMIT=$(git rev-parse --short HEAD)
CHANGES=$(git status --porcelain | wc -l)
```

2. Calcular diferencias entre ambientes:
```bash
# Obtener commits de cada ambiente (funciona con detached HEAD)
DEV_COMMIT=$(cd .worktrees/environments/dev && git rev-parse HEAD)
QA_COMMIT=$(cd .worktrees/environments/qa && git rev-parse HEAD)
PROD_COMMIT=$(cd .worktrees/environments/prod && git rev-parse HEAD)

# Commits de dev adelante de qa
DEV_AHEAD_QA=$(git rev-list ${QA_COMMIT}..${DEV_COMMIT} --count 2>/dev/null || echo "?")

# Commits de qa adelante de prod
QA_AHEAD_PROD=$(git rev-list ${PROD_COMMIT}..${QA_COMMIT} --count 2>/dev/null || echo "?")

# Cálculo robusto usando merge-base (funciona con detached HEAD)
MERGE_BASE=$(git merge-base ${QA_COMMIT} ${DEV_COMMIT} 2>/dev/null)
if [ -n "$MERGE_BASE" ]; then
  COMMITS_AHEAD=$(git rev-list ${MERGE_BASE}..${DEV_COMMIT} --count 2>/dev/null || echo "?")
  COMMITS_BEHIND=$(git rev-list ${MERGE_BASE}..${QA_COMMIT} --count 2>/dev/null || echo "?")
else
  # Fallback: branches divergieron completamente
  COMMITS_AHEAD="?"
  COMMITS_BEHIND="?"
  echo "⚠️ No se pudo calcular merge-base entre qa/ y dev/"
fi
```

> **Nota**: Se usan commits resueltos en vez de nombres de branch porque
> qa/ y prod/ usan detached HEAD (no tienen branch local).
> El cálculo con `merge-base` es más robusto cuando los ambientes divergen
> (ej: reset parcial en qa/) ya que detecta tanto commits adelante como atrás.

3. Obtener estado de QA de features activos:
```bash
# Leer active-features.json
# Para cada feature, buscar sesión de QA
# Determinar estado: PENDING, APPROVED, REJECTED
```

4. Detectar solapamiento de archivos entre features activos:
```bash
# Para cada par de features activos, comparar archivos modificados
for FEATURE in .worktrees/features/*/; do
  cd "$FEATURE"
  # Archivos modificados respecto a develop
  git diff --name-only origin/develop...HEAD
done
# Cruzar listas para encontrar archivos modificados en común
```

**Salida mejorada:**

```
=== ESTADO DE AMBIENTES ===

ENV     BRANCH      COMMIT    SYNC STATUS
───────────────────────────────────────────────────
dev/    develop     abc123d   [3 commits ahead of qa]
qa/     develop     def456a   [2 commits ahead of prod]
prod/   main        789xyz0   [v1.2.3] ✓ sincronizado

Última sincronización:
  dev:  2026-02-03 10:00
  qa:   2026-02-02 15:30
  prod: 2026-02-01 09:00

=== FEATURES ACTIVOS ===

WORKTREE                    BRANCH                    COMMITS   QA STATUS
────────────────────────────────────────────────────────────────────────
feature-001-auth-login      feature/001-auth-login    +5        PENDING
feature-002-payments        feature/002-payments      +2        APPROVED
hotfix-123-urgent           hotfix/123-urgent         +1        APPROVED

=== SOLAPAMIENTO DE ARCHIVOS ===

(Solo se muestra si hay archivos modificados en común entre features)

ADVERTENCIA: Los siguientes features modifican archivos en común:

feature/001-auth-login × feature/002-payments:
  - src/middleware/session.ts
  - src/types/user.ts

Recomendación: Sincronizar con develop frecuentemente (/worktree update)

**Algoritmo de detección de solapamiento:**
1. Para cada feature activo: obtener lista de archivos modificados via `git diff --name-only origin/develop...{feature_branch}`
2. Comparar listas par a par (feature A vs feature B)
3. Intersección no vacía = solapamiento detectado
4. Reportar archivos en común con ambos features que los modifican

=== ACCIONES SUGERIDAS ===

→ /promote --to qa     (2 features con QA aprobado listos)
→ /qa --env qa         (validar integración post-promote)
→ /release             (qa-env aprobado, considerar release)
→ /qa --issue 001      (feature pendiente de QA individual)
```

**Lógica de sugerencias:**

| Condición | Sugerencia |
|-----------|------------|
| Features con QA aprobado + dev ahead of qa | `/promote --to qa` |
| qa promovido + sin qa-env session | `/qa --env qa` |
| qa-env aprobado + sin features pendientes | `/release` |
| Features sin QA | `/qa --issue {id}` |
| Release completado + main ahead of prod | `/promote --to prod` |
| Features en worktrees sin commits | `/build-feature` |

**Información adicional:**

- Si hay cambios sin commit en algún worktree, mostrar advertencia
- Si hay worktrees huérfanos, sugerir `/worktree cleanup`
- Mostrar tiempo desde última promoción si hay promotions.json

---

## Integración con otros skills

| Skill | Integración |
|-------|-------------|
| `/build-feature` | Crea worktree automático si habilitado |
| `/merge` | Cleanup automático post-merge, auto-sync dev/ |
| `/qa` | Opción de probar en worktree o ambiente QA |
| `/promote` | Sincroniza ambientes con verificación de calidad |
| `/release` | Auto-ejecuta `/promote --to prod` post-release |

---

## Nomenclatura GitFlow

| Tipo | Branch | Worktree |
|------|--------|----------|
| Feature | `feature/{slug}` | `.worktrees/features/feature-{slug}` |
| Hotfix | `hotfix/{id}-{slug}` | `.worktrees/features/hotfix-{id}-{slug}` |
| Release | `release/v{X.Y.Z}` | - |

---

## Principios

- **Aislamiento**: Cada feature tiene su espacio
- **Ambientes permanentes**: dev, qa, prod siempre disponibles
- **Cleanup automático**: Features eliminados tras merge
- **Protección de prod**: Readonly

---

---

## FINAL CHECKPOINT (por comando)

**Para `init`:**
- [ ] Estructura `.worktrees/` creada
- [ ] Ambientes dev/qa/prod creados con HEAD correcto
- [ ] config.json y promotions.json inicializados
- [ ] `.worktrees/` agregado a .gitignore

**Para `create`:**
- [ ] Worktree creado en `.worktrees/features/`
- [ ] Branch creado con prefijo correcto (feature/ o hotfix/)
- [ ] active-features.json actualizado

**Para `delete`:**
- [ ] Worktree removido
- [ ] Branch eliminado (si se confirmó)
- [ ] active-features.json actualizado

**Para `status`:**
- [ ] Estado de ambientes mostrado
- [ ] Features activos listados
- [ ] Solapamiento de archivos detectado (si aplica)
- [ ] Acciones sugeridas mostradas

---

## Registro de sesión

> Formato base: `.claude/skills/_common/session-template.md`

Crea `.claude/sessions/YYYY-MM-DD-worktree-{comando}.md` con:
- **Estado actual**: Resumen del sistema de worktrees
