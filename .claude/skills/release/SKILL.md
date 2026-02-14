---
name: release
version: 2.0
description: "Genera releases con SemVer, changelog y GitFlow. Automatiza el proceso completo de release desde develop hasta main con tags y documentación."
---

# Release

## QUICK REFERENCE

### BLOCKING CONDITIONS
> ⛔ Si alguna es TRUE, DETENER inmediatamente

- [ ] No está en branch develop o main
- [ ] Working tree no limpio (cambios pendientes)
- [ ] Operación git en progreso (merge/rebase)
- [ ] Ya existe release branch activo
- [ ] Tag de versión ya existe
- [ ] `/qa --env qa` resultado FAILED
- [ ] `/qa --env qa` no ejecutado Y worktrees habilitados (sin --skip-checks)
- [ ] No hay commits nuevos desde último release

### REQUIRED OUTPUTS
> 📦 Archivos que DEBEN existir al finalizar

- [ ] Tag vX.Y.Z creado y pusheado
- [ ] `CHANGELOG.md` actualizado
- [ ] `.claude/releases/vX.Y.Z.md` (si backend=local)
- [ ] GitHub Release (si backend=github)
- [ ] `.claude/sessions/YYYY-MM-DD-release-vX.Y.Z.md`
- [ ] prod/ sincronizado con main (si worktrees)

### PHASES OVERVIEW
```
PHASE 0 → PHASE 1 → PHASE 2 → PHASE 3 → PHASE 4 → PHASE 5
PRE-CHECK  VERSION   CHANGELOG  GITFLOW   PUBLISH   SESSION
    ↓         ↓         ↓          ↓         ↓         ↓
  Verify   Analyze   Generate   Branch    GitHub    Register
  state    commits   grouped    + merge   Release   + done
```

### PARAMETERS
| Parámetro | Descripción | Default |
|-----------|-------------|---------|
| `--type {major\|minor\|patch}` | Forzar tipo de bump | auto |
| `--dry-run` | Simular sin ejecutar | false |
| `--pre {alpha\|beta\|rc}` | Versión pre-release | null |
| `--from {tag}` | Punto de inicio | último tag |
| `--skip-checks` | Omitir pre-checks | false |
| `--force` | Forzar con QA CONDITIONAL | false |

---

## Overview

Skill que automatiza el proceso de release siguiendo Semantic Versioning (SemVer) y GitFlow. Analiza los conventional commits desde el último release, calcula la versión automáticamente, genera changelog agrupado, ejecuta el flujo GitFlow completo y publica según el backend configurado.

## Parámetros

| Parámetro | Descripción | Default |
|-----------|-------------|---------|
| `--type {major\|minor\|patch}` | Forzar tipo de bump (ignora análisis de commits) | auto |
| `--dry-run` | Simula el release sin ejecutar cambios | false |
| `--pre {alpha\|beta\|rc}` | Versión pre-release (ej: v1.2.0-beta.1) | null |
| `--from {tag\|commit}` | Punto de inicio para análisis de commits | último tag |
| `--skip-checks` | Omitir pre-checks (no recomendado) | false |
| `--force` | Forzar release con QA CONDITIONAL (requiere justificación) | false |

## Prerrequisitos

1. Repositorio git inicializado
2. Branch actual: `develop` o `main`
3. Working tree limpio (sin cambios pendientes)
4. Sin operaciones git en progreso (merge/rebase)
5. Sincronizado con remote (si existe)

---

## Proceso

### Fase 0: Pre-checks

> Referencia: `.claude/validation/pre-checks/release.md`

```bash
# 0. Verificar que no hay otro release en progreso
EXISTING_RELEASE=$(git branch --list "release/*" 2>/dev/null | head -1 | tr -d ' ')
EXISTING_REMOTE_RELEASE=$(git branch -r --list "origin/release/*" 2>/dev/null | head -1 | tr -d ' ')

if [[ -n "$EXISTING_RELEASE" ]] || [[ -n "$EXISTING_REMOTE_RELEASE" ]]; then
  RELEASE_NAME="${EXISTING_RELEASE:-$EXISTING_REMOTE_RELEASE}"
  echo "⛔ Ya existe un release en progreso: $RELEASE_NAME"
  echo ""
  echo "No se puede crear un nuevo release mientras hay otro activo."
  echo ""
  echo "Opciones:"
  echo "  1. Completar el release existente primero"
  echo "  2. Eliminar el release abandonado:"
  echo "     git branch -d $RELEASE_NAME"
  echo "     (si es remoto: git push origin --delete $RELEASE_NAME)"
  echo ""
  echo "👉 Resuelve el release existente antes de crear uno nuevo."
  exit 1
fi

# 1. Verificar repositorio existe
git rev-parse --is-inside-work-tree

# 2. Verificar branch permitido
BRANCH=$(git branch --show-current)
if [[ "$BRANCH" != "develop" && "$BRANCH" != "main" ]]; then
  echo "ERROR: Release debe iniciarse desde develop o main"
  exit 1
fi

# 3. Verificar working tree limpio
if [[ -n $(git status --porcelain) ]]; then
  echo "ERROR: Working tree no está limpio"
  exit 1
fi

# 4. Verificar no hay operaciones pendientes
if [[ -f .git/MERGE_HEAD ]] || [[ -d .git/rebase-merge ]]; then
  echo "ERROR: Hay operaciones git pendientes"
  exit 1
fi

# 5. Sincronizar con remote
git fetch origin
if [[ $(git rev-list HEAD..origin/$BRANCH --count) -gt 0 ]]; then
  echo "WARNING: Branch está detrás del remote"
fi
```

Si los pre-checks fallan:
```
❌ Pre-checks fallidos:

Problema:
  - Branch actual: feature/auth (debe ser develop o main)
  - Working tree: 3 archivos modificados

Solución:
  1. Commitea o stashea los cambios pendientes
  2. Cambia a develop:
     - Sin worktrees: git checkout develop
     - Con worktrees: cd .worktrees/environments/dev
  3. Ejecuta /release nuevamente
```

### Fase 0.1: Pre-checks de Ambiente (si worktrees habilitados)

Verificaciones adicionales cuando el sistema de worktrees está activo:

```bash
# 1. Verificar que qa/ está sincronizado con develop
if [[ -d ".worktrees/environments/qa" ]]; then
  QA_COMMIT=$(cd .worktrees/environments/qa && git rev-parse HEAD)
  DEVELOP_COMMIT=$(git rev-parse develop)

  if [[ "$QA_COMMIT" != "$DEVELOP_COMMIT" ]]; then
    COMMITS_DIFF=$(git rev-list ${QA_COMMIT}..${DEVELOP_COMMIT} --count)
    echo "WARNING: qa/ está ${COMMITS_DIFF} commits atrás de develop"
  fi
fi

# 2. Verificar features con QA pendiente
# Leer active-features.json y verificar sesiones de QA

# Inicializar promotions.json si no existe (primer release)
if [[ ! -f ".worktrees/.meta/promotions.json" ]]; then
  echo '{"promotions": [], "lastSync": {"dev": null, "qa": null, "prod": null}}' > .worktrees/.meta/promotions.json
  echo "ℹ️ promotions.json inicializado (primer release)"
fi

PENDING_QA=$(find .claude/sessions -name "*-qa-*.md" -newer .worktrees/.meta/promotions.json 2>/dev/null | wc -l)
```

#### 3. Verificar sesión de QA de integración (`/qa --env qa`)

```bash
# Buscar sesión más reciente de qa-env
QA_ENV_SESSION=$(ls -t .claude/sessions/*-qa-env-qa.md 2>/dev/null | head -1)
QA_ENV_RESULT="NOT_RUN"  # Default: no se ha ejecutado

if [[ -z "$QA_ENV_SESSION" ]]; then
  # Verificar si worktrees están habilitados
  if [[ -d ".worktrees/environments/qa" ]]; then
    # CON WORKTREES: QA de integración es OBLIGATORIO
    if [[ "$SKIP_CHECKS" != "true" ]]; then
      echo "⛔ BLOQUEADO: No se encontró sesión de /qa --env qa"
      echo ""
      echo "Cuando worktrees están habilitados, el QA de integración"
      echo "es OBLIGATORIO antes de crear un release."
      echo ""
      echo "El ambiente qa/ existe pero no se ha ejecutado /qa --env qa"
      echo "para validar la integración completa de todos los features."
      echo ""
      echo "👉 Ejecuta /qa --env qa primero."
      echo ""
      echo "Si hay una razón válida para saltarse esta verificación,"
      echo "usa --skip-checks (requiere justificación documentada)."
      exit 1
    else
      echo "⚠️ WARNING: --skip-checks usado para bypass de /qa --env qa"
      echo ""
      echo "Se requiere justificación para continuar sin QA de integración:"
      echo "(Esta justificación se documentará en la sesión de release)"
      # La justificación se solicitará y documentará en la sesión
    fi
  else
    # SIN WORKTREES: Solo warning (modo tradicional)
    echo "⚠️ WARNING: No se encontró sesión de /qa --env qa"
    echo ""
    echo "No se ha ejecutado QA formal de integración."
    echo "Se recomienda ejecutar /qa --env qa antes de crear un release."
    echo ""
    echo "Opciones:"
    echo "  a) Continuar sin QA de integración (no recomendado)"
    echo "  b) Ejecutar /qa --env qa primero (recomendado)"
    echo "  c) Abortar release"
  fi
fi

# Si existe, verificar resultado
if [[ -n "$QA_ENV_SESSION" ]]; then
  QA_ENV_RESULT=$(grep -m1 "^\*\*\(APPROVED\|FAILED\|CONDITIONAL\)\*\*" "$QA_ENV_SESSION" | tr -d '*')
  QA_ENV_RESULT=${QA_ENV_RESULT:-"NOT_RUN"}  # Fallback si grep no encuentra resultado

  if [[ "$QA_ENV_RESULT" == "FAILED" ]]; then
    echo "⛔ BLOQUEADO: La última sesión de /qa --env qa resultó FAILED"
    echo "   Sesión: $QA_ENV_SESSION"
    echo ""
    echo "No se puede crear un release con QA de integración fallido."
    echo ""
    echo "👉 Corrige los issues en develop → /promote --to qa → /qa --env qa"
    exit 1
  fi

  if [[ "$QA_ENV_RESULT" == "CONDITIONAL" ]]; then
    # Verificar si se proporcionó --force
    if [[ "$FORCE_FLAG" != "true" ]]; then
      echo "⛔ BLOQUEADO: QA resultó CONDITIONAL y no se proporcionó --force"
      echo "   Sesión: $QA_ENV_SESSION"
      echo ""
      echo "El release NO puede continuar sin --force cuando QA es CONDITIONAL."
      echo ""
      echo "Opciones:"
      echo "  a) Resolver las condiciones y re-ejecutar /qa --env qa"
      echo "  b) Usar --force con justificación documentada:"
      echo "     /release --force"
      echo ""
      echo "Si usa --force, deberá proporcionar:"
      echo "  1. Justificación escrita del bypass"
      echo "  2. Análisis de riesgo de las condiciones"
      echo "  3. Plan de mitigación post-release"
      exit 1
    fi

    # --force proporcionado: solicitar y documentar justificación
    echo "⚠️ WARNING: QA CONDITIONAL con --force"
    echo "   Sesión: $QA_ENV_SESSION"
    echo ""
    echo "Se requiere justificación para continuar:"
    echo ""
    # La justificación se solicitará interactivamente y se documentará en la sesión
    # Formato de documentación en sesión:
    # ## Force Override
    # **QA Result:** CONDITIONAL
    # **Justificación:** {texto del usuario}
    # **Condiciones aceptadas:**
    #   - {condición 1}
    #   - {condición 2}
    # **Riesgo asumido:** {HIGH|MEDIUM|LOW}
    # **Mitigación:** {plan}
    echo "El release continuará con las condiciones documentadas."
  fi

  if [[ "$QA_ENV_RESULT" == "NOT_RUN" ]]; then
    echo "⚠️ WARNING: La sesión existe pero no se pudo determinar el resultado"
    echo "   Sesión: $QA_ENV_SESSION"
    echo ""
    echo "Verifique manualmente el resultado en la sesión."
  fi
fi
```

Mostrar estado de ambientes antes de continuar:

```
📊 Estado de ambientes pre-release:

   qa/     → develop  [sincronizado ✓ | {N} commits atrás ⚠️]
   qa-env  → {APPROVED ✓ | FAILED ⛔ | CONDITIONAL ⚠️ | NOT RUN ⚠️}

   Features con QA:
   ────────────────────────────────────────
   001-auth-login      QA: APPROVED ✓
   002-payments        QA: APPROVED ✓
   003-profile         QA: PENDING ⚠️
```

**Si qa/ no está sincronizado:**

```
⚠️ El ambiente qa/ no está sincronizado con develop.

   qa/     → abc123d (hace 2 días)
   develop → def456a (actual)

   Diferencia: 3 commits

Esto significa que el código a liberar no ha sido probado
formalmente en el ambiente de QA.

Opciones:
  a) Continuar de todas formas (no recomendado)
  b) Ejecutar /promote --to qa primero (recomendado)
  c) Abortar release

¿Qué deseas hacer? [a/b/c]
```

**Si hay features con QA pendiente:**

```
⚠️ Hay features sin QA aprobado:

   003-profile    QA: PENDING

Estos cambios serán incluidos en el release sin
validación formal de QA.

Opciones:
  a) Continuar de todas formas
  b) Ejecutar /qa --issue 003 primero
  c) Abortar release

¿Qué deseas hacer? [a/b/c]
```

---

### Fase 1: Cálculo de versión

#### 1.1 Obtener último tag

```bash
# Último tag semver
LAST_TAG=$(git describe --tags --abbrev=0 --match "v*" 2>/dev/null || echo "v0.0.0")
echo "Último release: $LAST_TAG"
```

#### 1.2 Analizar commits desde último tag

```bash
# Lista de commits desde último tag
git log $LAST_TAG..HEAD --oneline --format="%s"
```

#### 1.3 Determinar tipo de bump según conventional commits

| Patrón en commit | Tipo de bump |
|------------------|--------------|
| `feat!:` o `BREAKING CHANGE:` | MAJOR |
| `feat:` | MINOR |
| `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`, `perf:` | PATCH |

**Algoritmo:**
```
1. Si hay BREAKING CHANGE → MAJOR
2. Si no hay BREAKING pero hay feat → MINOR
3. Si solo hay fix/docs/etc → PATCH
4. Si NINGÚN commit sigue conventional commits → WARNING y fallback:
   - Tratar todos como PATCH
   - Mostrar: "⚠️ Commits no siguen conventional commits. Se asume PATCH."
   - Sugerir: "Use --type major|minor|patch para override manual"
```

#### 1.4 Calcular nueva versión

```
Versión actual: v1.2.3
Commits analizados: 5

Cambios detectados:
  - feat!: new API (BREAKING CHANGE)
  - feat: add login
  - fix: validation error

Bump requerido: MAJOR
Nueva versión: v2.0.0
```

Si `--pre` está activo:
```
Nueva versión: v2.0.0-beta.1
```

#### 1.5 Confirmación del usuario

```
📦 Release propuesto:

  Versión actual: v1.2.3
  Nueva versión:  v2.0.0

  Tipo de cambio: MAJOR (breaking changes detectados)

  Commits incluidos: 5
  - feat!: new API restructure
  - feat: add login feature
  - fix: validation error in forms
  - docs: update README
  - chore: update dependencies

¿Continuar con el release? [S/n]
```

Si `--dry-run` está activo:
```
🏃 Modo dry-run: Simulación completada

  Se crearía:
    - Tag: v2.0.0
    - Branch: release/v2.0.0
    - CHANGELOG.md actualizado
    - GitHub Release (si backend=github)

  No se ejecutaron cambios reales.
```

---

### Fase 2: Generación de changelog

#### 2.1 Agrupar commits por tipo

```markdown
## [2.0.0] - 2026-01-28

### Breaking Changes
- New API restructure (#45)

### Features
- Add login feature (#42)

### Bug Fixes
- Validation error in forms (#40)

### Documentation
- Update README (#38)

### Internal
- Update dependencies (#36)
```

#### 2.2 Generar/Actualizar CHANGELOG.md

Si existe `CHANGELOG.md`:
```bash
# Insertar nueva sección después de "# Changelog"
```

Si no existe, crear con formato:
```markdown
# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

## [2.0.0] - 2026-01-28

### Breaking Changes
- New API restructure (#45)
...
```

#### 2.3 Mostrar preview

```
📝 Preview de CHANGELOG:

## [2.0.0] - 2026-01-28

### Breaking Changes
- New API restructure (#45)

### Features
- Add login feature (#42)
- Add user profile page (#41)

### Bug Fixes
- Validation error in forms (#40)
- Fix memory leak in service (#39)

¿El changelog se ve correcto? [S/n/editar]
```

---

### Fase 3: GitFlow

#### 3.1 Crear branch de release (desde develop)

**Sin worktrees:**
```bash
# Crear branch de release
git checkout -b release/v2.0.0
```

**Si worktrees están habilitados** (develop está en dev/):

> Con worktrees activos, `develop` está checked out en `.worktrees/environments/dev/`.
> El release branch se crea desde allí; el merge a main se hace desde el repo principal.

```bash
# 3.1: Crear release branch desde dev/ worktree
cd .worktrees/environments/dev
git pull origin develop
git checkout -b release/v{VERSION}
```

#### 3.2 Actualizar archivos de versión

Buscar y actualizar archivos comunes:
- `package.json` → `"version": "2.0.0"`
- `pyproject.toml` → `version = "2.0.0"`
- `Cargo.toml` → `version = "2.0.0"`
- `version.txt` → `2.0.0`

```bash
# Actualizar según stack detectado:

# Node.js (package.json)
npm version 2.0.0 --no-git-tag-version

# Python (pyproject.toml con Poetry)
poetry version 2.0.0
# Python (pyproject.toml manual)
# Editar version = "2.0.0" en pyproject.toml

# Rust (Cargo.toml)
cargo set-version 2.0.0  # requiere cargo-edit
# O editar version = "2.0.0" en Cargo.toml manualmente

# Go (no tiene archivo de versión centralizado)
# La versión se maneja via git tags (v2.0.0)

# Detección automática:
# 1. Si existe package.json → npm version
# 2. Si existe pyproject.toml → poetry version (o edición manual)
# 3. Si existe Cargo.toml → cargo set-version (o edición manual)
# 4. Si existe version.txt → escribir versión directamente
# 5. Si es Go → solo git tag (no hay archivo de versión)
```

#### 3.3 Commit de release

```bash
git add CHANGELOG.md package.json
git commit -m "chore(release): v2.0.0

- Update CHANGELOG.md
- Bump version to 2.0.0"
```

#### 3.4 Merge a main

**Sin worktrees:**
```bash
git checkout main
git pull origin main
git merge release/v2.0.0 --no-ff -m "Merge release/v2.0.0 into main"
```

**Con worktrees habilitados:**
```bash
# Volver al repo principal (main está checked out aquí)
cd {repo_principal}
git checkout release/v{VERSION}   # OK: release es branch nuevo, no conflicta
git checkout main
git pull origin main
git merge release/v{VERSION} --no-ff -m "Merge release/v{VERSION} into main"
```

#### 3.5 Crear tag anotado

```bash
git tag -a v2.0.0 -m "Release v2.0.0

## [2.0.0] - 2026-01-28

### Breaking Changes
- New API restructure

### Features
- Add login feature
- Add user profile page

### Bug Fixes
- Validation error in forms
- Fix memory leak in service"
```

#### 3.6 Merge de vuelta a develop

**Sin worktrees:**
```bash
git checkout develop
git merge release/v2.0.0 --no-ff -m "Merge release/v2.0.0 back into develop"
```

**Con worktrees habilitados:**
```bash
# Merge de vuelta a develop (en dev/ worktree)
cd .worktrees/environments/dev
git merge release/v{VERSION} --no-ff -m "Merge release/v{VERSION} back into develop"
git push origin develop
cd {repo_principal}
```

> **Nota**: Con worktrees, `git checkout develop` falla en el repo principal porque
> develop ya está en el worktree dev/. El merge de vuelta se ejecuta dentro de dev/.

#### 3.7 Cleanup

```bash
# Eliminar branch de release
git branch -d release/v2.0.0
```

#### 3.8 Push

```bash
# Push todo
git push origin main develop --tags
```

#### 3.9 Auto-Promote a PROD (si worktrees habilitados)

Si el sistema de worktrees está activo, sincronizar automáticamente el ambiente prod/:

```bash
# Verificar que worktrees están habilitados
if [[ -d ".worktrees/environments/prod" ]]; then
  echo "📦 Sincronizando ambiente prod/..."

  cd .worktrees/environments/prod
  git fetch origin main
  git reset --hard origin/main

  # Verificar versión
  VERSION=$(git describe --tags --exact-match 2>/dev/null || echo "sin tag")

  echo "✓ prod/ actualizado a ${VERSION}"
fi
```

Actualizar `promotions.json`:

```json
{
  "promotions": [
    {
      "from": "main",
      "to": "prod",
      "commit": "release_commit_hash",
      "timestamp": "2026-02-03T12:00:00Z",
      "release": "v2.0.0",
      "type": "auto-post-release"
    }
  ],
  "lastSync": {
    "dev": "...",
    "qa": "...",
    "prod": "2026-02-03T12:00:00Z"
  }
}
```

Informar al usuario:

```
📦 Auto-promoción a PROD completada:

   prod/   → main     [v2.0.0] ✓

   El ambiente prod/ ahora refleja el release v2.0.0.
```

---

### Fase 4: Publicar

#### 4.1 Según backend

##### GitHub (backend=github)

```bash
# Crear GitHub Release
gh release create v2.0.0 \
  --title "v2.0.0" \
  --notes "## [2.0.0] - 2026-01-28

### Breaking Changes
- New API restructure (#45)

### Features
- Add login feature (#42)

### Bug Fixes
- Validation error in forms (#40)

[Full Changelog](https://github.com/owner/repo/compare/v1.2.3...v2.0.0)"
```

Resultado:
```
🚀 GitHub Release creado:
   URL: https://github.com/owner/repo/releases/tag/v2.0.0
```

##### Local (backend=local)

Crear archivo en `.claude/releases/v2.0.0.md`:

```markdown
# Release v2.0.0

**Fecha:** 2026-01-28
**Commit:** abc1234
**Tag:** v2.0.0

## Changelog

### Breaking Changes
- New API restructure

### Features
- Add login feature
- Add user profile page

### Bug Fixes
- Validation error in forms
- Fix memory leak in service

## Estadísticas

- Commits incluidos: 5
- Archivos modificados: 12
- Insertions: 450
- Deletions: 120

## Contributors

- @developer1
- @developer2
```

Resultado:
```
📦 Release local creado:
   Tag: v2.0.0
   Archivo: .claude/releases/v2.0.0.md
```

---

### Fase 5: Registro de sesión

> Formato base: `.claude/skills/_common/session-template.md`

Crear `.claude/sessions/YYYY-MM-DD-release-vX.Y.Z.md` con:

```markdown
# Sesión: Release v2.0.0

**Fecha:** 2026-01-28
**Skill:** /release
**Duración:** ~5 min

## Resumen

Release v2.0.0 creado exitosamente siguiendo GitFlow.

## Detalles del Release

| Campo | Valor |
|-------|-------|
| Versión anterior | v1.2.3 |
| Nueva versión | v2.0.0 |
| Tipo de bump | MAJOR |
| Commits incluidos | 5 |
| Branch origen | develop |
| Tag creado | v2.0.0 |

## Commits incluidos

- feat!: new API restructure (#45)
- feat: add login feature (#42)
- fix: validation error in forms (#40)
- docs: update README (#38)
- chore: update dependencies (#36)

## Archivos modificados

- CHANGELOG.md
- package.json

## GitFlow ejecutado

1. ✅ Branch release/v2.0.0 creado desde develop
2. ✅ Archivos de versión actualizados
3. ✅ Commit de release
4. ✅ Merge a main (--no-ff)
5. ✅ Tag v2.0.0 creado
6. ✅ Merge de vuelta a develop
7. ✅ Branch release eliminado
8. ✅ Push a remote

## Publicación

- Backend: github
- URL: https://github.com/owner/repo/releases/tag/v2.0.0

## Próximos pasos sugeridos

- Verificar que el release está disponible
- Monitorear pipelines de CI/CD
- Comunicar al equipo
```

---

## Resumen final

```
✅ Release v2.0.0 completado exitosamente!

📦 Detalles:
   Versión anterior: v1.2.3
   Nueva versión:    v2.0.0
   Tipo de cambio:   MAJOR
   Commits:          5

📋 Changelog actualizado:
   - 1 breaking change
   - 2 features
   - 2 bug fixes

🏷️ Tag: v2.0.0

🚀 Publicación:
   URL: https://github.com/owner/repo/releases/tag/v2.0.0

📁 Archivos actualizados:
   - CHANGELOG.md
   - package.json

📦 Ambientes (si worktrees activos):
   prod/   → main     [v2.0.0] ✓ auto-sincronizado

📍 Sesión registrada:
   .claude/sessions/2026-01-28-release-v2.0.0.md

👉 Próximos pasos:
   - Verificar CI/CD en el release
   - Verificar aplicación en prod/
   - Comunicar al equipo el nuevo release
   - Si hay hotfix urgente: git checkout main && /build-feature --hotfix
```

---

## Rollback de Release

Si algo sale mal después de publicar el release:

### 1. Eliminar tag local y remoto

```bash
# Local
git tag -d v2.0.0

# Remoto
git push origin :refs/tags/v2.0.0
```

### 2. Revertir merge en main

```bash
git checkout main
git revert -m 1 HEAD
git push origin main
```

### 3. Revertir merge en develop

```bash
git checkout develop
git revert -m 1 HEAD
git push origin develop
```

### 4. Eliminar GitHub Release (si aplica)

```bash
gh release delete v2.0.0 --yes
```

### 5. Documentar en sesión

Agregar sección de rollback en la sesión:
```markdown
## Rollback ejecutado

**Razón:** [Descripción del problema]
**Fecha:** 2026-01-28 15:30

Acciones:
- Tag v2.0.0 eliminado
- Merge en main revertido
- Merge en develop revertido
- GitHub Release eliminado

Estado: Repositorio vuelve a estado pre-release
```

---

## Manejo de errores

### Conflicto al merge a main

```
⚠️ Conflicto detectado al hacer merge a main

Archivos en conflicto:
  - src/config.ts
  - package.json

Opciones:
  a) Resolver conflictos manualmente
  b) Abortar release (recomendado si no estás seguro)

¿Qué deseas hacer? [a/b]
```

### Tag ya existe

```
⚠️ El tag v2.0.0 ya existe

Opciones:
  a) Usar siguiente versión (v2.0.1)
  b) Eliminar tag existente y recrear (peligroso si ya está publicado)
  c) Abortar release

¿Qué deseas hacer? [a/b/c]
```

### No hay commits nuevos

```
ℹ️ No hay commits nuevos desde v1.2.3

No hay cambios para incluir en un release.

👉 Desarrolla nuevas features con /build-feature primero.
```

---

## Integración con Sistema de Calidad

### Pre-checks obligatorios

El skill ejecuta los pre-checks de:
- `.claude/validation/pre-checks/git.md`
- `.claude/validation/pre-checks/release.md`

### Security Gate

Se recomienda ejecutar `/qa` antes de `/release` para asegurar que:
- No hay vulnerabilidades conocidas
- No hay secrets expuestos
- Tests pasan

El skill **no** bloquea si QA no se ejecutó, pero muestra advertencia:
```
⚠️ No se encontró sesión de QA reciente.
   Se recomienda ejecutar /qa antes de release.

   ¿Continuar de todas formas? [s/N]
```

---

## Principios

1. **SemVer estricto**: Versiones calculadas según conventional commits
2. **GitFlow completo**: Branch de release, merges controlados, cleanup
3. **Changelog automático**: Agrupado por tipo, con referencias a issues/PRs
4. **Backend agnóstico**: GitHub o local según configuración
5. **Trazabilidad**: Sesión completa con todos los detalles
6. **Rollback documentado**: Procedimientos claros para revertir
7. **Confirmación del usuario**: No ejecuta cambios sin aprobación
8. **Ambiente-aware**: Verifica sincronización de qa/ antes de release
9. **Auto-promote**: Sincroniza prod/ automáticamente post-release

---

## FINAL CHECKPOINT

Antes de terminar, verificar:

- [ ] Versión calculada y confirmada por usuario
- [ ] CHANGELOG.md actualizado
- [ ] Release branch creado, mergeado y eliminado
- [ ] Tag vX.Y.Z creado y pusheado
- [ ] Merge de vuelta a develop completado
- [ ] GitHub Release o archivo local creado
- [ ] prod/ sincronizado (si worktrees activos)
- [ ] promotions.json actualizado
- [ ] Sesión registrada en `.claude/sessions/`
- [ ] Próximo paso comunicado (verificar prod, monitorear)

---

## Integración con Sistema de Worktrees

Cuando worktrees están habilitados, el skill:

| Fase | Acción |
|------|--------|
| Pre-check | Verifica que qa/ está sincronizado con develop |
| Pre-check | Detecta features con QA pendiente |
| Post-release | Auto-ejecuta `/promote --to prod` |
| Registro | Actualiza `promotions.json` con timestamp |

Referencia: `.claude/skills/promote/SKILL.md`

---

## Ver también

- **Guía**: `.claude/docs/guides/release-flow-guide.md`
- **Skill anterior**: `.claude/skills/qa/SKILL.md` (con `--env qa`)
- **Pre-checks**: `.claude/validation/pre-checks/release.md`
- **Validación**: `.claude/validation/VALIDATION.md` → "Checklist: /release"
- **Session template**: `.claude/skills/_common/session-template.md`
- **Git protection**: `.claude/rules/git-protection.md`
