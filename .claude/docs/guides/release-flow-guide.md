# Guía Completa: Flujo de /release

> Documentación detallada del proceso de releases con SemVer y GitFlow del framework InformatiK-AI.

## Índice

- [Visión General](#visión-general)
- [Parámetros](#parámetros)
- [Prerrequisitos](#prerrequisitos)
- [Fase 0: Pre-checks](#fase-0-pre-checks)
- [Fase 1: Cálculo de Versión](#fase-1-cálculo-de-versión)
- [Fase 2: Generación de Changelog](#fase-2-generación-de-changelog)
- [Fase 3: GitFlow](#fase-3-gitflow)
- [Fase 4: Publicar](#fase-4-publicar)
- [Fase 5: Registro de Sesión](#fase-5-registro-de-sesión)
- [Semantic Versioning](#semantic-versioning)
- [Conventional Commits](#conventional-commits)
- [Rollback de Release](#rollback-de-release)
- [Ejemplo Práctico](#ejemplo-práctico-release-v200)
- [Resumen Visual](#resumen-visual)

---

## Visión General

El skill `/release` automatiza el proceso completo de release siguiendo **Semantic Versioning (SemVer)** y **GitFlow**. Analiza commits, calcula versiones, genera changelog y publica el release.

### Características Principales

| Aspecto | Descripción |
|---------|-------------|
| **Versionado** | SemVer automático basado en conventional commits |
| **Workflow** | GitFlow completo (release branch, merges, tags) |
| **Changelog** | Generación automática agrupada por tipo |
| **Publicación** | GitHub Releases o sistema local |

### Ubicación en el Flujo

```
[✓] /genesis           → Infraestructura
[✓] /brainstorming     → Diseño
[✓] /create-issues     → Issues
[✓] /build-feature     → Implementación (múltiples)
[✓] /qa                → Testing por feature
[✓] /merge             → Integración por feature (múltiples)
[✓] /promote --to qa   → Sincronizar qa/ con develop
[✓] /qa --env qa       → Validación formal de integración
[→] /release           ← ESTÁS AQUÍ (cuando hay suficientes cambios)
```

### Flujo de Release

```
Pre-checks
    │
    ▼
Analizar commits desde último tag
    │
    ▼
Calcular versión (MAJOR.MINOR.PATCH)
    │
    ▼
Generar changelog agrupado
    │
    ▼
Confirmar con usuario
    │
    ▼
GitFlow completo
    ├─► Crear release branch
    ├─► Actualizar versión en archivos
    ├─► Commit de release
    ├─► Merge a main
    ├─► Crear tag anotado
    ├─► Merge de vuelta a develop
    └─► Cleanup
    │
    ▼
Publicar (GitHub/Local)
    │
    ▼
🎉 RELEASE COMPLETADO
```

---

## Parámetros

| Parámetro | Descripción | Default |
|-----------|-------------|---------|
| `--type {major\|minor\|patch}` | Forzar tipo de bump | auto |
| `--dry-run` | Simular sin ejecutar cambios | false |
| `--pre {alpha\|beta\|rc}` | Versión pre-release | null |
| `--from {tag\|commit}` | Punto de inicio para análisis | último tag |
| `--skip-checks` | Omitir pre-checks | false |

### Ejemplos de Uso

```bash
# Release automático (analiza commits)
/release

# Forzar versión major
/release --type major

# Simular sin cambios
/release --dry-run

# Pre-release beta
/release --pre beta

# Desde commit específico
/release --from abc1234
```

---

## Prerrequisitos

### Requisitos del Repositorio

| Requisito | Verificación |
|-----------|--------------|
| Git inicializado | `git rev-parse --is-inside-work-tree` |
| Branch correcto | `develop` o `main` |
| Working tree limpio | Sin cambios pendientes |
| Sin operaciones pendientes | No merge/rebase en progreso |
| Sincronizado con remote | `git fetch origin` |

### Branch de Inicio

| Branch | Escenario |
|--------|-----------|
| `develop` | Release normal (GitFlow estándar) |
| `main` | Hotfix release (sin GitFlow completo) |

---

## Fase 0: Pre-checks

### Verificaciones Ejecutadas

```bash
# 1. Verificar repositorio existe
git rev-parse --is-inside-work-tree

# 2. Verificar branch permitido
BRANCH=$(git branch --show-current)
# Debe ser develop o main

# 3. Verificar working tree limpio
git status --porcelain
# Debe estar vacío

# 4. Verificar no hay operaciones pendientes
test ! -f .git/MERGE_HEAD
test ! -d .git/rebase-merge

# 5. Sincronizar con remote
git fetch origin
git rev-list HEAD..origin/$BRANCH --count
# Advertir si está detrás
```

### Si Pre-checks Fallan

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

### Si Está Detrás del Remote

```
⚠️ Advertencia: Branch está detrás del remote

Tu branch develop está 2 commits detrás de origin/develop.

Opciones:
a) Actualizar branch: git pull origin develop
b) Continuar de todas formas (no recomendado)
c) Abortar

¿Qué deseas hacer? [a/b/c]
```

---

## Fase 1: Cálculo de Versión

### 1.1 Obtener Último Tag

```bash
# Buscar último tag semver
LAST_TAG=$(git describe --tags --abbrev=0 --match "v*" 2>/dev/null || echo "v0.0.0")
```

```
📍 Último release: v1.2.3
   Fecha: 2026-01-15
   Commits desde entonces: 8
```

### 1.2 Analizar Commits

```bash
# Lista de commits desde último tag
git log v1.2.3..HEAD --oneline --format="%s"
```

```
Commits analizados:
  1. feat!: restructure API endpoints
  2. feat: add user authentication
  3. feat: add profile page
  4. fix: validation error in forms
  5. fix: memory leak in service
  6. docs: update API documentation
  7. chore: update dependencies
  8. test: add integration tests
```

### 1.3 Determinar Tipo de Bump

#### Reglas de Conventional Commits

| Patrón en Commit | Tipo de Bump | Ejemplo |
|------------------|--------------|---------|
| `feat!:` o `BREAKING CHANGE:` | **MAJOR** | `feat!: new API` |
| `feat:` | **MINOR** | `feat: add login` |
| `fix:` | **PATCH** | `fix: validation error` |
| `docs:` | **PATCH** | `docs: update README` |
| `style:` | **PATCH** | `style: format code` |
| `refactor:` | **PATCH** | `refactor: simplify logic` |
| `test:` | **PATCH** | `test: add unit tests` |
| `chore:` | **PATCH** | `chore: update deps` |
| `perf:` | **PATCH** | `perf: optimize query` |

#### Algoritmo de Decisión

```
1. Si hay BREAKING CHANGE (feat!, fix!, o "BREAKING CHANGE:" en body)
   → MAJOR

2. Si no hay BREAKING pero hay feat:
   → MINOR

3. Si solo hay fix/docs/style/refactor/test/chore/perf:
   → PATCH
```

### 1.4 Calcular Nueva Versión

```
📊 Análisis de versión:

  Versión actual: v1.2.3

  Cambios detectados:
    ├─ BREAKING: 1 (feat!: restructure API)
    ├─ Features: 2
    ├─ Fixes: 2
    └─ Otros: 3

  Bump requerido: MAJOR

  Nueva versión: v2.0.0
```

#### Con Pre-release

```bash
/release --pre beta
```

```
  Nueva versión: v2.0.0-beta.1
```

### 1.5 Confirmación del Usuario

```
📦 Release propuesto:

  Versión actual: v1.2.3
  Nueva versión:  v2.0.0

  Tipo de cambio: MAJOR (breaking changes detectados)

  Commits incluidos: 8
    - feat!: restructure API endpoints
    - feat: add user authentication
    - feat: add profile page
    - fix: validation error in forms
    - fix: memory leak in service
    - docs: update API documentation
    - chore: update dependencies
    - test: add integration tests

¿Continuar con el release? [S/n]
```

### Modo Dry-Run

```bash
/release --dry-run
```

```
🏃 Modo dry-run: Simulación completada

  Se crearía:
    - Tag: v2.0.0
    - Branch: release/v2.0.0
    - CHANGELOG.md actualizado
    - GitHub Release

  No se ejecutaron cambios reales.

  Para ejecutar el release real:
  /release
```

---

## Fase 2: Generación de Changelog

### 2.1 Agrupar Commits por Tipo

| Tipo | Sección en Changelog |
|------|---------------------|
| `feat!` / BREAKING | Breaking Changes |
| `feat` | Features |
| `fix` | Bug Fixes |
| `perf` | Performance |
| `docs` | Documentation |
| `refactor`, `style`, `test`, `chore` | Internal |

### 2.2 Formato del Changelog

```markdown
## [2.0.0] - 2026-01-28

### Breaking Changes
- Restructure API endpoints (#45)

### Features
- Add user authentication (#42)
- Add profile page (#41)

### Bug Fixes
- Validation error in forms (#40)
- Memory leak in service (#39)

### Documentation
- Update API documentation (#38)

### Internal
- Update dependencies (#37)
- Add integration tests (#36)
```

### 2.3 Actualizar CHANGELOG.md

#### Si Existe

Insertar nueva sección después del header:

```markdown
# Changelog

Todos los cambios notables...

## [Unreleased]

## [2.0.0] - 2026-01-28    ← Nueva sección insertada

### Breaking Changes
...

## [1.2.3] - 2026-01-15    ← Versión anterior
...
```

#### Si No Existe

Crear archivo completo:

```markdown
# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

## [2.0.0] - 2026-01-28

### Breaking Changes
- Restructure API endpoints (#45)

### Features
- Add user authentication (#42)
...
```

### 2.4 Preview y Confirmación

```
📝 Preview de CHANGELOG:

## [2.0.0] - 2026-01-28

### Breaking Changes
- Restructure API endpoints (#45)

### Features
- Add user authentication (#42)
- Add profile page (#41)

### Bug Fixes
- Validation error in forms (#40)
- Memory leak in service (#39)

¿El changelog se ve correcto? [S/n/editar]
```

| Opción | Acción |
|--------|--------|
| `S` | Continuar con GitFlow |
| `n` | Abortar release |
| `editar` | Abrir editor para modificar |

---

## Fase 3: GitFlow

### Flujo Completo

```
develop ─────────────────────────────────────────► develop
    │                                                 ▲
    │ checkout -b                                     │
    ▼                                                 │
release/v2.0.0 ──────────────────────────────────────┤
    │                                                 │
    │ merge --no-ff                                   │ merge --no-ff
    ▼                                                 │
  main ──────────────────────────────────────────────►
    │
    │ tag -a v2.0.0
    ▼
```

### 3.1 Crear Branch de Release

**Sin worktrees:**
```bash
# Desde develop
git checkout -b release/v2.0.0
```

**Con worktrees habilitados** (develop está en dev/):
```bash
# Crear release branch desde dev/ worktree
cd .worktrees/environments/dev
git pull origin develop
git checkout -b release/v2.0.0
```

> **Nota**: Con worktrees, develop está en `.worktrees/environments/dev/`.
> El release branch se crea desde allí.

```
📦 Branch creado: release/v2.0.0
   Base: develop
```

### 3.2 Actualizar Archivos de Versión

El skill busca y actualiza automáticamente:

| Archivo | Campo | Antes | Después |
|---------|-------|-------|---------|
| `package.json` | `"version"` | "1.2.3" | "2.0.0" |
| `pyproject.toml` | `version` | "1.2.3" | "2.0.0" |
| `Cargo.toml` | `version` | "1.2.3" | "2.0.0" |
| `version.txt` | - | 1.2.3 | 2.0.0 |

```bash
# Para Node.js
npm version 2.0.0 --no-git-tag-version
```

```
📝 Archivos actualizados:
   - package.json: "version": "2.0.0"
   - CHANGELOG.md: nueva sección [2.0.0]
```

### 3.3 Commit de Release

```bash
git add CHANGELOG.md package.json
git commit -m "chore(release): v2.0.0

- Update CHANGELOG.md
- Bump version to 2.0.0"
```

### 3.4 Merge a Main

**Sin worktrees:**
```bash
# Cambiar a main
git checkout main
git pull origin main

# Merge con no-fast-forward (preserva historial)
git merge release/v2.0.0 --no-ff -m "Merge release/v2.0.0 into main"
```

**Con worktrees habilitados:**
```bash
# Volver al repo principal (main está checked out aquí)
cd {repo_principal}
git checkout release/v2.0.0   # OK: release es branch nuevo
git checkout main
git pull origin main
git merge release/v2.0.0 --no-ff -m "Merge release/v2.0.0 into main"
```

```
✅ Merge a main completado
   Commit: abc1234
```

### 3.5 Crear Tag Anotado

```bash
git tag -a v2.0.0 -m "Release v2.0.0

## [2.0.0] - 2026-01-28

### Breaking Changes
- Restructure API endpoints

### Features
- Add user authentication
- Add profile page

### Bug Fixes
- Validation error in forms
- Memory leak in service"
```

```
🏷️ Tag creado: v2.0.0
   Tipo: Annotated
   Mensaje: Incluye changelog completo
```

### 3.6 Merge de Vuelta a Develop

**Sin worktrees:**
```bash
git checkout develop
git merge release/v2.0.0 --no-ff -m "Merge release/v2.0.0 back into develop"
```

**Con worktrees habilitados** (develop está en dev/):
```bash
cd .worktrees/environments/dev
git merge release/v2.0.0 --no-ff -m "Merge release/v2.0.0 back into develop"
git push origin develop
cd {repo_principal}
```

> **Nota**: Con worktrees, `git checkout develop` falla porque develop ya
> está en el worktree dev/. El merge de vuelta se ejecuta dentro de dev/.

```
✅ Merge a develop completado
   Develop sincronizado con el release
```

### 3.7 Cleanup

```bash
# Eliminar branch de release (ya no es necesaria)
git branch -d release/v2.0.0
```

```
🧹 Cleanup:
   Branch eliminada: release/v2.0.0
```

### 3.8 Push

```bash
# Push de todo: main, develop, y tags
git push origin main develop --tags
```

```
📤 Push completado:
   - main → origin/main
   - develop → origin/develop
   - v2.0.0 → origin/tags/v2.0.0
```

---

## Fase 4: Publicar

### Backend: GitHub

```bash
gh release create v2.0.0 \
  --title "v2.0.0" \
  --notes "## [2.0.0] - 2026-01-28

### Breaking Changes
- Restructure API endpoints (#45)

### Features
- Add user authentication (#42)
- Add profile page (#41)

### Bug Fixes
- Validation error in forms (#40)
- Memory leak in service (#39)

[Full Changelog](https://github.com/owner/repo/compare/v1.2.3...v2.0.0)"
```

```
🚀 GitHub Release creado:

   Versión: v2.0.0
   URL: https://github.com/owner/repo/releases/tag/v2.0.0
   Estado: Published
```

### Backend: Local

Crear archivo `.claude/releases/v2.0.0.md`:

```markdown
# Release v2.0.0

**Fecha:** 2026-01-28
**Commit:** abc1234
**Tag:** v2.0.0

## Changelog

### Breaking Changes
- Restructure API endpoints

### Features
- Add user authentication
- Add profile page

### Bug Fixes
- Validation error in forms
- Memory leak in service

## Estadísticas

- Commits incluidos: 8
- Archivos modificados: 24
- Insertions: 1,250
- Deletions: 380

## Contributors

- @developer1
- @developer2
```

```
📦 Release local creado:

   Tag: v2.0.0
   Archivo: .claude/releases/v2.0.0.md
```

---

## Fase 5: Registro de Sesión

### Archivo de Sesión

Se crea `.claude/sessions/YYYY-MM-DD-release-vX.Y.Z.md`:

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
| Commits incluidos | 8 |
| Branch origen | develop |
| Tag creado | v2.0.0 |

## Commits incluidos

- feat!: restructure API endpoints (#45)
- feat: add user authentication (#42)
- feat: add profile page (#41)
- fix: validation error in forms (#40)
- fix: memory leak in service (#39)
- docs: update API documentation (#38)
- chore: update dependencies (#37)
- test: add integration tests (#36)

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

## Próximo paso sugerido

- Verificar que el release está disponible
- Monitorear pipelines de CI/CD
- Comunicar al equipo
```

### Resumen Final

```
✅ Release v2.0.0 completado exitosamente!

📦 Detalles:
   Versión anterior: v1.2.3
   Nueva versión:    v2.0.0
   Tipo de cambio:   MAJOR
   Commits:          8

📋 Changelog actualizado:
   - 1 breaking change
   - 2 features
   - 2 bug fixes
   - 3 otros

🏷️ Tag: v2.0.0

🚀 Publicación:
   URL: https://github.com/owner/repo/releases/tag/v2.0.0

📁 Archivos actualizados:
   - CHANGELOG.md
   - package.json

📍 Sesión registrada:
   .claude/sessions/2026-01-28-release-v2.0.0.md

👉 Próximos pasos:
   - Verificar CI/CD en el release
   - Comunicar al equipo el nuevo release
   - Si hay hotfix urgente: git checkout main && /build-feature --hotfix
```

---

## Semantic Versioning

### Formato

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]

Ejemplos:
  1.0.0
  2.1.0
  2.1.1
  3.0.0-alpha.1
  3.0.0-beta.2
  3.0.0-rc.1
```

### Cuándo Incrementar

| Componente | Cuándo | Ejemplo |
|------------|--------|---------|
| **MAJOR** | Breaking changes, incompatible API | 1.x.x → 2.0.0 |
| **MINOR** | Nueva funcionalidad, backward compatible | 1.1.x → 1.2.0 |
| **PATCH** | Bug fixes, backward compatible | 1.1.1 → 1.1.2 |

### Pre-releases

| Tipo | Uso | Ejemplo |
|------|-----|---------|
| `alpha` | Desarrollo temprano, inestable | v2.0.0-alpha.1 |
| `beta` | Feature-complete, testing | v2.0.0-beta.1 |
| `rc` | Release candidate, casi listo | v2.0.0-rc.1 |

```bash
# Crear beta release
/release --pre beta

# Resultado: v2.0.0-beta.1
```

---

## Conventional Commits

### Formato

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Tipos y su Impacto

| Tipo | Descripción | Bump |
|------|-------------|------|
| `feat` | Nueva funcionalidad | MINOR |
| `fix` | Corrección de bug | PATCH |
| `docs` | Documentación | PATCH |
| `style` | Formato (no afecta código) | PATCH |
| `refactor` | Refactorización | PATCH |
| `perf` | Mejora de performance | PATCH |
| `test` | Agregar/modificar tests | PATCH |
| `chore` | Mantenimiento | PATCH |

### Breaking Changes

Indicar breaking change de dos formas:

```bash
# Opción 1: ! después del tipo
feat!: change API response format

# Opción 2: Footer BREAKING CHANGE
feat: change API response format

BREAKING CHANGE: API now returns objects instead of arrays
```

### Ejemplos

```bash
# Feature con scope
feat(auth): add JWT token refresh

# Fix con issue reference
fix(api): handle timeout errors

Closes #123

# Breaking change con explicación
feat!: migrate to new database schema

BREAKING CHANGE: User table now requires email field.
Migration guide: docs/migration-v2.md
```

---

## Rollback de Release

### Cuándo Hacer Rollback

- Bug crítico descubierto post-release
- Breaking change no documentado
- Problemas de seguridad
- Release accidental

### Proceso de Rollback

#### 1. Eliminar Tag

```bash
# Local
git tag -d v2.0.0

# Remoto
git push origin :refs/tags/v2.0.0
```

#### 2. Revertir Merge en Main

```bash
git checkout main
git revert -m 1 HEAD
git push origin main
```

#### 3. Revertir Merge en Develop

**Sin worktrees:**
```bash
git checkout develop
git revert -m 1 HEAD
git push origin develop
```

**Con worktrees** (develop está en dev/):
```bash
cd .worktrees/environments/dev
git revert -m 1 HEAD
git push origin develop
cd {repo_principal}
```

#### 4. Eliminar GitHub Release

```bash
gh release delete v2.0.0 --yes
```

#### 5. Documentar Rollback

Agregar a la sesión:

```markdown
## Rollback ejecutado

**Razón:** Bug crítico en autenticación
**Fecha:** 2026-01-28 15:30

Acciones:
- Tag v2.0.0 eliminado
- Merge en main revertido
- Merge en develop revertido
- GitHub Release eliminado

Estado: Repositorio vuelve a v1.2.3
```

---

## Ejemplo Práctico: Release v2.0.0

### Contexto

Después de varios sprints, hay 8 commits listos para release.

### Flujo Completo

```
/release
    │
    ├─► Fase 0: Pre-checks
    │     ✓ Repo existe
    │     ✓ Branch: develop
    │     ✓ Working tree limpio
    │     ✓ Sincronizado con remote
    │
    ├─► Fase 1: Cálculo de Versión
    │     Último tag: v1.2.3
    │     Commits: 8
    │     Breaking changes: 1
    │     → Bump: MAJOR
    │     → Nueva versión: v2.0.0
    │     Usuario confirma: Sí
    │
    ├─► Fase 2: Generación de Changelog
    │     Agrupando commits...
    │     Preview mostrado
    │     Usuario confirma: Sí
    │
    ├─► Fase 3: GitFlow
    │     ├─► git checkout -b release/v2.0.0
    │     ├─► Actualizar package.json
    │     ├─► Actualizar CHANGELOG.md
    │     ├─► git commit "chore(release): v2.0.0"
    │     ├─► git checkout main
    │     ├─► git merge release/v2.0.0 --no-ff
    │     ├─► git tag -a v2.0.0
    │     ├─► merge back to develop (cd dev/ con worktrees)
    │     ├─► git merge release/v2.0.0 --no-ff
    │     ├─► git branch -d release/v2.0.0
    │     └─► git push origin main develop --tags
    │
    ├─► Fase 4: Publicar
    │     gh release create v2.0.0
    │     URL: github.com/owner/repo/releases/tag/v2.0.0
    │
    └─► Fase 5: Registro
          Sesión: 2026-01-28-release-v2.0.0.md
          ✅ Release completado!
```

### CHANGELOG Generado

```markdown
## [2.0.0] - 2026-01-28

### Breaking Changes
- Restructure API endpoints (#45)

### Features
- Add user authentication (#42)
- Add profile page (#41)

### Bug Fixes
- Validation error in forms (#40)
- Memory leak in service (#39)

### Documentation
- Update API documentation (#38)

### Internal
- Update dependencies (#37)
- Add integration tests (#36)
```

---

## Manejo de Errores

### Conflicto al Merge a Main

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

### Tag Ya Existe

```
⚠️ El tag v2.0.0 ya existe

Opciones:
  a) Usar siguiente versión (v2.0.1)
  b) Eliminar tag existente y recrear (peligroso)
  c) Abortar release

¿Qué deseas hacer? [a/b/c]
```

### No Hay Commits Nuevos

```
ℹ️ No hay commits nuevos desde v1.2.3

No hay cambios para incluir en un release.

👉 Desarrolla nuevas features con /build-feature primero.
```

### Sin QA Reciente

```
⚠️ No se encontró sesión de QA reciente.

Se recomienda ejecutar /qa antes de release para:
  - Verificar que tests pasan
  - Ejecutar Security Gate
  - Validar criterios de aceptación

¿Continuar de todas formas? [s/N]
```

---

## Resumen Visual

```
/release
    │
    ├─► Fase 0: Pre-checks
    │       │
    │       ├─► Git repo existe
    │       ├─► Branch: develop | main
    │       ├─► Working tree limpio
    │       ├─► Sin merge/rebase pendiente
    │       └─► Sincronizado con remote
    │
    ├─► Fase 1: Cálculo de Versión
    │       │
    │       ├─► Obtener último tag
    │       ├─► Analizar commits
    │       ├─► Determinar bump (MAJOR/MINOR/PATCH)
    │       ├─► Calcular nueva versión
    │       └─► Confirmar con usuario
    │
    ├─► Fase 2: Generación de Changelog
    │       │
    │       ├─► Agrupar commits por tipo
    │       ├─► Generar markdown
    │       ├─► Mostrar preview
    │       └─► Confirmar con usuario
    │
    ├─► Fase 3: GitFlow
    │       │
    │       ├─► Crear release branch
    │       ├─► Actualizar versión en archivos
    │       ├─► Commit de release
    │       ├─► Merge a main (--no-ff)
    │       ├─► Crear tag anotado
    │       ├─► Merge a develop (--no-ff)
    │       ├─► Eliminar release branch
    │       └─► Push (main, develop, tags)
    │
    ├─► Fase 4: Publicar
    │       │
    │       ├─► GitHub: gh release create
    │       └─► Local: crear .claude/releases/
    │
    └─► Fase 5: Registro
            │
            ├─► Crear sesión
            ├─► Resumen final
            └─► Próximos pasos
```

---

## Comparación: Release vs Merge

| Aspecto | /merge | /release |
|---------|--------|----------|
| **Propósito** | Integrar un issue | Publicar versión |
| **Scope** | Un issue/feature | Múltiples cambios |
| **Branch** | feature → main | develop → main |
| **Tag** | No | Sí (SemVer) |
| **Changelog** | Entrada única | Sección completa |
| **GitFlow** | Parcial | Completo |
| **Publicación** | No | GitHub/Local |

---

## Referencias

- Skill Release: `.claude/skills/release/SKILL.md`
- Semantic Versioning: https://semver.org/
- Conventional Commits: https://conventionalcommits.org/
- Keep a Changelog: https://keepachangelog.com/
- GitFlow: https://nvie.com/posts/a-successful-git-branching-model/
- Template de Sesión: `.claude/skills/_common/session-template.md`
