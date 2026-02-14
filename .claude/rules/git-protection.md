---
name: git-protection
scope: git
---

# Git Branch Protection

## Aplica a
Operaciones que afectan branches protegidos: main, develop.

## Modo de Operación

> Las reglas de este documento aplican según el modo de operación del proyecto.

| Condición | Modo | Operaciones en develop |
|-----------|------|------------------------|
| `.worktrees/` NO existe | **Tradicional** | `git checkout develop` OK |
| `.worktrees/` existe | **Worktrees** | develop en `dev/`, NO checkout en repo principal |

**Detección automática:**
```bash
if [ -d ".worktrees/environments/dev" ]; then
  MODE="worktrees"
  # develop está en dev/, usar cd .worktrees/environments/dev
else
  MODE="traditional"
  # develop accesible via git checkout develop
fi
```

## Branches protegidos

| Branch | Nivel | Operaciones permitidas |
|--------|-------|------------------------|
| `main` | Crítico | Solo merges de release/hotfix |
| `develop` | Alto | Merges de features, sync con main |

## Reglas

### 1. NUNCA hacer commits directos a main

**Sin worktrees:**
```bash
# PROHIBIDO
git checkout main
git commit -m "quick fix"

# CORRECTO
git checkout -b hotfix/123-urgent-fix
# ... cambios ...
git checkout main
git merge hotfix/123-urgent-fix
```

**Con worktrees:**
```bash
# PROHIBIDO
git checkout main
git commit -m "quick fix"

# CORRECTO
git worktree add -b hotfix/123-urgent-fix .worktrees/features/hotfix-123-urgent-fix origin/main
cd .worktrees/features/hotfix-123-urgent-fix
# ... cambios ...
cd {repo_principal}
git checkout main
git merge hotfix/123-urgent-fix
```

### 2. NUNCA force push a branches protegidos

```bash
# PROHIBIDO
git push --force origin main
git push --force origin develop

# Si necesitas revertir, usa revert
git revert {commit}
git push origin main
```

### 3. NUNCA eliminar branches protegidos

```bash
# PROHIBIDO
git branch -D main
git branch -D develop
git push origin --delete main
```

### 4. Merges a main solo desde release o hotfix

```bash
# CORRECTO: desde release
git checkout main
git merge release/v1.2.0 --no-ff

# CORRECTO: desde hotfix
git checkout main
git merge hotfix/123-critical --no-ff

# INCORRECTO: desde feature
git checkout main
git merge feature/auth  # NO, va a develop primero
```

### 5. Siempre usar --no-ff para merges importantes

```bash
# Preserva historial de merges
git merge feature/auth --no-ff -m "Merge feature/auth into develop"
```

## Flujo GitFlow

```
feature/* ─────┐
               │
               ▼
           develop ────┐
               │       │
               │       ▼
               │   release/* ────┐
               │       │         │
               │       ▼         ▼
               │   develop ◄── main
               │                 ▲
               │                 │
hotfix/* ──────┴─────────────────┘
```

## Validaciones antes de merge a main

1. [ ] Todos los tests pasan
2. [ ] QA aprobado
3. [ ] Sin conflictos
4. [ ] Versión actualizada
5. [ ] Changelog actualizado

## Worktrees y Branch Protection

Con worktrees habilitados, el acceso a branches cambia:

| Branch | Ubicación | Acceso |
|--------|-----------|--------|
| `main` | Repo principal | `git checkout main` (checked out por defecto) |
| `develop` | dev/ worktree | `cd .worktrees/environments/dev` |
| `qa state` | qa/ worktree | Detached HEAD, sincronizar con `git reset --hard` |
| `prod state` | prod/ worktree | Detached HEAD, readonly |

### Regla: No usar `git checkout develop` en repo principal

```bash
# FALLA con worktrees (develop ya está en dev/):
git checkout develop  # fatal: 'develop' is already checked out at...

# CORRECTO con worktrees:
cd .worktrees/environments/dev
```

### Regla: Merges a develop solo desde dev/

```bash
# CORRECTO con worktrees:
cd .worktrees/environments/dev
git pull origin develop
git merge feature/xxx --no-ff
git push origin develop

# INCORRECTO con worktrees:
git checkout develop  # falla
git merge feature/xxx
```

### Regla: Sincronización de qa/ y prod/

```bash
# qa/ y prod/ usan detached HEAD, sincronizar con reset:
cd .worktrees/environments/qa
git fetch origin develop
git reset --hard origin/develop

# NUNCA hacer commits en qa/ o prod/
```

### Excepción: Detached HEAD en ambientes worktree

> **Nota**: Los warnings genéricos sobre detached HEAD en git pre-checks
> NO aplican a los ambientes `qa/` y `prod/` de worktrees.
> Estos ambientes DEBEN usar detached HEAD por diseño (ver `rules/git-worktrees.md` regla 6).
> Solo `dev/` tiene branch real (develop).

### Regla: NUNCA `git checkout develop` en repo principal con worktrees activos

```bash
# PROHIBIDO (con worktrees activos):
git checkout develop  # fatal: 'develop' is already checked out at .worktrees/environments/dev

# PROHIBIDO (con worktrees activos):
cd /repo-principal
git merge feature/xxx  # develop no está aquí, está en dev/

# CORRECTO:
cd .worktrees/environments/dev
git merge feature/xxx --no-ff
```

> **Razón**: Cuando worktrees están habilitados, `develop` está checked out en `.worktrees/environments/dev/`. Git no permite tener el mismo branch en dos worktrees simultáneamente. Todas las operaciones sobre `develop` deben ejecutarse dentro de `dev/`.

### Regla: NUNCA `git add -A` o `git add .` en contexto de merge

```bash
# PROHIBIDO en merge:
git add -A
git add .

# CORRECTO en merge:
git add src/features/auth/login.tsx src/features/auth/types.ts
```

> **Razón**: `git add -A` puede incluir secrets, archivos temporales, o archivos de otros worktrees. En merge, siempre hacer staging explícito de archivos relevantes al feature.

---

## Ejemplos

### Correcto: Release a producción

```bash
# Preparar release
git checkout develop
git checkout -b release/v1.2.0

# Ajustes finales, bumps de versión
# ... cambios ...

# Merge a main
git checkout main
git merge release/v1.2.0 --no-ff
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin main --tags

# Sync develop
git checkout develop
git merge release/v1.2.0 --no-ff
git push origin develop

# Cleanup
git branch -d release/v1.2.0
```

### Correcto: Hotfix urgente

```bash
# Desde main
git checkout main
git checkout -b hotfix/456-security-patch

# Fix
# ... cambios ...

# Merge a main
git checkout main
git merge hotfix/456-security-patch --no-ff
git tag -a v1.2.1 -m "Hotfix v1.2.1"
git push origin main --tags

# Sync develop
git checkout develop
git merge hotfix/456-security-patch --no-ff
git push origin develop

# Cleanup
git branch -d hotfix/456-security-patch
```

### Incorrecto: Commit directo

```bash
# En main o develop directamente
git add .
git commit -m "oops"  # NUNCA
```

### Incorrecto: Rebase de branch protegido

```bash
# NUNCA
git checkout main
git rebase feature/something
git push --force  # DESASTRE
```

## Recuperación de errores

### Si se hizo commit directo a main

```bash
# Revertir el commit
git revert HEAD
git push origin main

# O crear branch desde el commit anterior
git checkout -b hotfix/revert-mistake HEAD~1
```

### Si se hizo force push (emergencia)

```bash
# Buscar el commit correcto en reflog
git reflog show origin/main

# Restaurar
git push origin {commit_correcto}:main --force
# Notificar al equipo inmediatamente
```

## Razón

Proteger branches principales:
- Evita pérdida de código en producción
- Mantiene historial limpio y trazable
- Permite rollbacks seguros
- Facilita debugging con git bisect

## Cuándo romper las reglas

- Emergencias de seguridad críticas (documentar)
- Repositorios personales de prueba
- Siempre con aprobación de lead/architect
- Siempre documentar en sesión con razón
