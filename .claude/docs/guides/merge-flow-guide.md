# Guía Completa: Flujo de /merge

> Documentación detallada del proceso de integración y cierre del framework InformatiK-AI.

## Índice

- [Visión General](#visión-general)
- [Parámetros](#parámetros)
- [Prerrequisitos](#prerrequisitos)
- [Paso 0: Verificar Security Gate](#paso-0-verificar-security-gate)
- [Paso 1: Verificar Estado](#paso-1-verificar-estado)
- [Paso 2: Preparar Cambios](#paso-2-preparar-cambios)
- [Paso 3: Integración según Backend](#paso-3-integración-según-backend)
- [Paso 4: Cerrar Issue](#paso-4-cerrar-issue)
- [Paso 5: Actualizar Changelog](#paso-5-actualizar-changelog)
- [Paso 6: Cleanup de Worktree](#paso-6-cleanup-de-worktree)
- [Paso 7: Resumen Final](#paso-7-resumen-final)
- [Manejo de Conflictos](#manejo-de-conflictos)
- [Rollback](#rollback)
- [Ejemplo Práctico](#ejemplo-práctico-videobackground)
- [Resumen Visual](#resumen-visual)

---

## Visión General

El skill `/merge` es el **cierre del ciclo de desarrollo**. Integra los cambios implementados, cierra el issue, actualiza documentación y limpia recursos temporales como worktrees.

### Características Principales

| Aspecto | Descripción |
|---------|-------------|
| **Input** | Issue con QA aprobado |
| **Prerrequisito** | Security Gate + QA pasados |
| **Output** | Código mergeado + Issue cerrado |
| **Cleanup** | Worktree eliminado, branches limpiados |

### Ubicación en el Flujo

```
[✓] /genesis        → Infraestructura del proyecto
[✓] /brainstorming  → Diseño de la feature
[✓] /create-issues  → Issues accionables
[✓] /build-feature  → Código implementado
[✓] /qa             → Testing + Security
[→] /merge          ← ESTÁS AQUÍ (FINAL)
```

### Flujo de Integración

```
Verificar Security Gate
        │
        ├─► NO pasó → BLOQUEAR → /qa primero
        │
        ▼ PASÓ
Verificar Estado Git
        │
        ▼
Preparar Commits
        │
        ├─► GitHub → Crear PR → Merge
        │
        └─► Local → Merge directo
                │
                ▼
        Cerrar Issue
                │
                ▼
        Actualizar Changelog
                │
                ▼
        Cleanup Worktree
                │
                ▼
        🎉 COMPLETADO
```

---

## Parámetros

| Parámetro | Requerido | Descripción | Ejemplo |
|-----------|-----------|-------------|---------|
| `--issue {número}` | ❌ | Issue a cerrar (usa último con QA aprobado) | `--issue 001` |
| `--no-pr` | ❌ | Merge directo sin PR (solo backend=local) | `--no-pr` |

### Ejemplos de Uso

```bash
# Básico (usa issue con QA aprobado más reciente)
/merge

# Issue específico
/merge --issue 001

# Merge directo sin PR (local)
/merge --issue 001 --no-pr
```

---

## Prerrequisitos

### Verificaciones Obligatorias

Antes de ejecutar `/merge`, se verifican:

| Prerrequisito | Verificación |
|---------------|--------------|
| Issue en in-progress | Archivo en `.claude/issues/in-progress/` |
| QA aprobado | Sesión de QA con "Resultado: APROBADO" |
| Security Gate pasado | Sección "Security Gate: APROBADO" en sesión QA |

### Si No Se Cumplen

```
⚠️ No se puede hacer merge:

❌ Issue #001 no tiene QA aprobado
   Última sesión: 2026-01-28-qa-001.md
   Resultado: RECHAZADO

👉 Ejecuta /qa --issue 001 primero
```

```
⚠️ No se puede hacer merge:

❌ Security Gate no pasó para issue #001
   Sesión QA: 2026-01-28-qa-001.md
   Security Gate: BLOQUEADO
   Problema: API key detectada en src/config.ts

👉 Corrige el problema y ejecuta /qa de nuevo
```

---

## Paso 0: Verificar Security Gate

### Proceso de Verificación

```
1. Buscar última sesión de QA
   → .claude/sessions/YYYY-MM-DD-qa-{issue}.md

2. Leer sección "## Security Gate"
   → Verificar: Resultado = "APROBADO"

3. Si NO pasó → Bloquear merge
   → Mensaje: "Security Gate no pasó, ejecutar /qa"

4. Si PASÓ → Continuar
   → Mostrar: 🔒 Security Gate: VERIFICADO
```

### Verificación Exitosa

```
🔒 Security Gate: VERIFICADO
   Sesión: 2026-01-28-qa-001.md
   Resultado: APROBADO
   Fecha: 2026-01-28T17:00:00

Continuando con merge...
```

### Verificación Fallida

```
⛔ Security Gate: NO VERIFICADO

No se puede proceder con el merge.

Problema encontrado en sesión QA:
  - Secrets Detection: API_KEY hardcodeada
  - Archivo: src/config/api.ts:12

Acciones requeridas:
  1. Mover API_KEY a variable de entorno
  2. Ejecutar /qa de nuevo
  3. Ejecutar /merge después de QA aprobado
```

---

## Paso 0.5: Adquirir Lock de Merge

### Protección contra Merges Concurrentes

Si worktrees están habilitados, verificar y adquirir lock antes de proceder:

```bash
LOCK_FILE=".worktrees/.meta/merge.lock"

# Verificar si hay merge en progreso
if [ -f "$LOCK_FILE" ]; then
  LOCK_AGE=$(( $(date +%s) - $(stat -c %Y "$LOCK_FILE" 2>/dev/null || echo 0) ))
  if [ "$LOCK_AGE" -lt 600 ]; then
    echo "Merge en progreso (lock activo hace ${LOCK_AGE}s). Esperar."
    exit 1
  else
    echo "Lock stale (${LOCK_AGE}s). Eliminando con advertencia."
    rm "$LOCK_FILE"
  fi
fi

# Adquirir lock
echo "merge:$(date -Iseconds):feature/001-video-background" > "$LOCK_FILE"
```

> **Importante**: El lock se libera al finalizar el merge (éxito o fallo).
> Si el lock tiene más de 10 minutos, se considera stale y se elimina con advertencia.

### Liberación del Lock

```bash
# AL FINALIZAR (éxito o fallo)
rm -f ".worktrees/.meta/merge.lock"
```

---

## Paso 1: Verificar Estado

### Verificaciones de Git

```bash
# Verificar estado del working tree
git status

# Actualizar referencias remotas
git fetch origin

# Ver commits pendientes de merge
git log origin/develop..HEAD
```

### Checklist de Estado

```
📋 Verificando estado para merge...

✓ Sesión de QA aprobada: 2026-01-28-qa-001.md
✓ Security Gate: APROBADO
✓ Working tree limpio (sin cambios pendientes)
✓ Branch actualizado con origin/develop

Todo listo para merge.
```

### Si Hay Problemas

```
⚠️ Problemas detectados:

1. Cambios sin commit:
   - src/components/HeroSection/VideoBackground.tsx (modified)

2. Branch desactualizado:
   - Tu branch está 3 commits detrás de origin/develop

Opciones:
a) Hacer commit de cambios y actualizar branch
b) Stash cambios y actualizar
c) Abortar merge
```

---

## Paso 2: Preparar Cambios

### Si Hay Cambios Sin Commit

```bash
# Stage SOLO archivos del feature (NUNCA usar git add -A ni git add .)
git add src/components/HeroSection/VideoBackground.tsx
git add src/components/HeroSection/VideoBackground.test.tsx
git add src/types/hero.ts

# Crear commit con mensaje convencional
git commit -m "feat(hero-section): implement VideoBackground component

Implement video background component with:
- Autoplay, loop, muted video
- Poster image fallback
- Full viewport coverage
- Accessibility attributes

Closes #001"
```

> **Importante**: Siempre staging explícito por archivo. `git add -A` o `git add .`
> pueden incluir secrets, archivos temporales o cambios no deseados.

### Formato del Commit

```
{type}({scope}): {descripción corta}

{descripción detallada de los cambios}

Closes #{número}
```

**Tipos:**
| Tipo | Uso |
|------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Documentación |
| `refactor` | Refactorización |
| `test` | Tests |
| `chore` | Mantenimiento |

---

## Paso 3: Integración según Backend

### Backend: GitHub

#### Crear Pull Request

```bash
gh pr create \
  --title "feat(hero-section): implement VideoBackground component" \
  --body "$(cat <<'EOF'
## Descripción

Implementación del componente VideoBackground para el hero section.
Video de fondo con autoplay, loop y fallback de poster.

## Issue

Closes #001

## Cambios

- `src/components/HeroSection/VideoBackground.tsx` (nuevo)
- `src/components/HeroSection/VideoBackground.test.tsx` (nuevo)
- `src/components/HeroSection/index.ts` (modificado)

## Verificaciones

- [x] Tests pasan (5/5)
- [x] QA aprobado
- [x] Security Gate aprobado
- [x] Accessibility Gate aprobado

## Screenshots

N/A (componente de video, sin cambios visuales estáticos)
EOF
)"
```

#### Presentar PR Creado

```
📝 Pull Request creado: #42
   URL: https://github.com/usuario/proyecto/pull/42

   Título: feat(hero-section): implement VideoBackground component
   Base: develop ← feature/001-video-background

¿Deseas hacer merge ahora o esperar review?
a) Merge ahora (si tienes permisos)
b) Esperar review
```

#### Si Elige Merge Ahora

```bash
# Merge con squash (commits limpios)
gh pr merge 42 --squash --delete-branch
```

```
✅ PR #42 mergeado exitosamente

   Método: squash
   Branch feature/001-video-background: eliminada
   Commit: abc1234
```

### Backend: Local

#### Merge Directo

**Si worktrees están habilitados** (merge en dev/):

```bash
cd .worktrees/environments/dev

# Stash cambios exploratorios si existen
CHANGES=$(git status --porcelain)
if [ -n "$CHANGES" ]; then
  git stash push -m "auto-stash before merge $(date -Iseconds)"
fi

# Actualizar develop y merge del feature
git pull origin develop
git merge feature/001-video-background --no-ff \
  -m "feat(hero-section): implement VideoBackground component (#001)"
git push origin develop

# Volver al repo principal para cleanup
cd {repo_principal}
git branch -d feature/001-video-background
```

**Si worktrees NO están habilitados**:

```bash
git checkout develop
git pull origin develop
git merge feature/001-video-background --no-ff \
  -m "feat(hero-section): implement VideoBackground component (#001)"
git push origin develop
git branch -d feature/001-video-background
```

> **¿Por qué a develop y no a main?** Las features se integran a develop.
> Solo release y hotfix van a main (GitFlow).
>
> **¿Por qué en dev/?** Con worktrees, develop está en dev/.
> Git no permite checkout de un branch que ya está en otro worktree.

```
✅ Merge completado

   Branch: develop
   Commit: abc1234
   Branch feature/001-video-background: eliminada
```

---

## Paso 4: Cerrar Issue

### Backend: GitHub

```bash
# Cerrar issue con comentario
gh issue close 001 --comment "Implementado en PR #42

Commit: abc1234
Fecha: 2026-01-28"
```

```
✅ Issue #001 cerrado

   Estado: closed
   Comentario: Implementado en PR #42
```

### Backend: Local

Mover archivo de `in-progress/` a `done/`:

```bash
mv .claude/issues/in-progress/001-video-background.md \
   .claude/issues/done/001-video-background.md
```

Actualizar frontmatter:

```yaml
---
id: 001
title: Crear componente VideoBackground
status: done              # Cambiado de in-progress
created: 2026-01-28
closed: 2026-01-28        # Agregado
implemented_in: abc1234   # Agregado
labels: [feature, hero-section]
---
```

```
✅ Issue #001 cerrado

   Movido a: .claude/issues/done/001-video-background.md
   Estado: done
   Commit: abc1234
```

---

## Paso 5: Actualizar Changelog

### Si Existe CHANGELOG.md

Agregar entrada en la sección `[Unreleased]`:

```markdown
## [Unreleased]

### Added
- VideoBackground component for hero section (#001)
```

### Si No Existe CHANGELOG.md

```
📝 No se encontró CHANGELOG.md

¿Deseas crearlo? (sí/no)
```

Si elige "sí", crear con estructura:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- VideoBackground component for hero section (#001)
```

### Categorías del Changelog

| Categoría | Uso |
|-----------|-----|
| `Added` | Nuevas funcionalidades |
| `Changed` | Cambios en funcionalidad existente |
| `Deprecated` | Features que serán removidas |
| `Removed` | Features removidas |
| `Fixed` | Corrección de bugs |
| `Security` | Correcciones de seguridad |

---

## Paso 6: Cleanup de Worktree

### Si Worktrees Están Habilitados

#### Verificar que Estamos en Repo Principal

```bash
# Asegurarse de no estar en el worktree
cd /ruta/al/repo/principal
```

#### Eliminar Worktree

```bash
# Eliminar worktree del feature
git worktree remove .worktrees/features/feature-001-video-background --force
```

#### Eliminar Branch Local

```bash
# Branch ya fue mergeada, eliminar local
git branch -d feature/001-video-background
```

#### Actualizar Registro

Actualizar `active-features.json`:

```json
{
  "features": [],  // Removida la entrada del feature
  "lastUpdated": "2026-01-28T18:00:00Z"
}
```

#### Sincronizar Ambiente Dev

**Si el merge se ejecutó en dev/** (worktrees habilitados):
dev/ ya está sincronizado. No necesita acción adicional.

**Si el merge se ejecutó en repo principal** (sin worktrees):
```bash
cd .worktrees/environments/dev
git fetch origin develop
git reset --hard origin/develop
```

> **Nota**: Si el merge se hizo dentro de dev/, ejecutar `git reset --hard`
> destruiría el merge local que aún no se ha pusheado. Solo sincronizar
> cuando el merge se hizo fuera del worktree.

### Output de Cleanup

```
🧹 Cleanup completado:

   Worktree eliminado:
     .worktrees/features/feature-001-video-background ✓

   Branch eliminado:
     feature/001-video-background ✓

   Registro actualizado:
     active-features.json ✓

   Ambiente dev sincronizado:
     .worktrees/environments/dev → origin/develop ✓
```

### Si Worktrees NO Están Habilitados

```
🧹 Cleanup:
   Branch eliminado: feature/001-video-background ✓
   Worktrees: No aplica (no habilitados)
```

---

## Paso 7: Resumen Final

### Output Completo

```
✅ Issue #001 completado y mergeado.

📋 Resumen:
   Issue: #001 - Crear componente VideoBackground
   PR: #42 (GitHub)
   Commit: abc1234
   Branch: feature/001-video-background (eliminada)

🔒 Security Gate: VERIFICADO
   Sesión: 2026-01-28-qa-001.md

📁 Archivos finales:
   - src/components/HeroSection/VideoBackground.tsx
   - src/components/HeroSection/VideoBackground.test.tsx
   - src/components/HeroSection/index.ts

📝 Documentación actualizada:
   - CHANGELOG.md (Added: VideoBackground component)
   - .claude/docs/features/hero-section/implementation.md

🧹 Worktree cleanup:
   - Worktree eliminado: feature-001-video-background
   - Branch eliminado: feature/001-video-background
   - Ambiente dev sincronizado

📍 Progreso del flujo:
   [✓] Génesis
   [✓] Brainstorming
   [✓] Crear Issues
   [✓] Build Feature
   [✓] QA + Merge ← completado

🎉 Feature completada!

👉 Próximos pasos:
   - /build-feature --issue 002 (siguiente issue del hero section)
   - /brainstorming (para nueva feature)
   - /release (si es momento de release)
```

### Registro de Sesión

Se crea `.claude/sessions/YYYY-MM-DD-merge-001.md`:

```markdown
# Sesión: Merge - Issue #001
Fecha: 2026-01-28T18:00:00
Skill: /merge

## Resumen
Issue #001 completado y mergeado exitosamente.

## Detalles de integración
- Método: GitHub PR (squash merge)
- PR: #42
- Commit: abc1234
- Branch: feature/001-video-background → develop

## Security Gate
- Estado: VERIFICADO
- Sesión QA: 2026-01-28-qa-001.md
- Resultado original: APROBADO

## Worktree cleanup
- Path: .worktrees/features/feature-001-video-background
- Estado: Eliminado
- Branch: Eliminada
- Dev sync: Completado

## Cambios incluidos
- src/components/HeroSection/VideoBackground.tsx (nuevo)
- src/components/HeroSection/VideoBackground.test.tsx (nuevo)
- src/components/HeroSection/index.ts (export agregado)

## Documentación actualizada
- CHANGELOG.md
- .claude/issues/done/001-video-background.md

## Issue cerrado
- Número: #001
- Estado anterior: in-progress
- Estado nuevo: done
- Fecha cierre: 2026-01-28

## Próximo paso sugerido
/build-feature --issue 002
```

---

## Manejo de Conflictos

### Detección de Conflictos

```bash
# Durante el merge
git merge feature/001-video-background --no-ff
# Auto-merging src/components/HeroSection/index.ts
# CONFLICT (content): Merge conflict in src/components/HeroSection/index.ts
```

### Presentación al Usuario

```
⚠️ Conflictos detectados en:

   1. src/components/HeroSection/index.ts
      - Líneas 5-12
      - Causa: Ambos branches modificaron los exports

Opciones:
a) Resolver automáticamente (intentar)
b) Mostrar conflictos para resolver manualmente
c) Abortar merge
```

### Opción A: Resolución Automática

```
🔧 Intentando resolver automáticamente...

Analizando conflicto en index.ts:
- Tu versión: export { VideoBackground }
- Main versión: export { HeroContent }
- Resolución: Combinar ambos exports

Propuesta de resolución:
```diff
- export { HeroContent } from './HeroContent';
+ export { HeroContent } from './HeroContent';
+ export { VideoBackground } from './VideoBackground';
```

¿Aplicar esta resolución? (sí/no)
```

### Opción B: Resolución Manual

```
📝 Conflicto en src/components/HeroSection/index.ts:

<<<<<<< HEAD
export { HeroContent } from './HeroContent';
=======
export { VideoBackground } from './VideoBackground';
>>>>>>> feature/001-video-background

Instrucciones:
1. Edita el archivo manualmente
2. Resuelve el conflicto
3. Ejecuta: git add src/components/HeroSection/index.ts
4. Vuelve a ejecutar /merge
```

### Opción C: Abortar

```bash
git merge --abort
```

```
⚠️ Merge abortado

El working tree ha sido restaurado al estado anterior.
Los conflictos deben resolverse antes de reintentar.
```

---

## Rollback

### Si Algo Sale Mal Después del Merge

#### Revertir Último Commit

```bash
# Crear commit de reversión (en dev/ con worktrees, o en develop sin worktrees)
git revert HEAD

# Push del revert
git push origin develop
```

```
🔄 Rollback ejecutado

   Commit revertido: abc1234
   Commit de reversión: def5678

   El código ha sido restaurado al estado anterior.
```

#### Reabrir Issue (GitHub)

```bash
gh issue reopen 001 --comment "Rollback ejecutado debido a: {razón}"
```

#### Reabrir Issue (Local)

```bash
# Mover de done a in-progress
mv .claude/issues/done/001-video-background.md \
   .claude/issues/in-progress/001-video-background.md
```

Actualizar frontmatter:
```yaml
status: in-progress  # Cambiado de done
# Remover closed e implemented_in
```

### Documentar Rollback

Agregar a la sesión de merge:

```markdown
## Rollback

- Ejecutado: 2026-01-28T19:00:00
- Razón: {descripción del problema}
- Commit revertido: abc1234
- Commit de reversión: def5678
- Issue reabierto: Sí
```

---

## Ejemplo Práctico: VideoBackground

### Contexto

Issue #001 con QA aprobado, listo para merge.

### Flujo Completo

```
/merge --issue 001
        │
        ├─► Paso 0: Verificar Security Gate
        │     Buscando sesión: 2026-01-28-qa-001.md
        │     Security Gate: APROBADO ✓
        │
        ├─► Paso 1: Verificar Estado
        │     ✓ QA aprobado
        │     ✓ Working tree limpio
        │     ✓ Branch actualizado
        │
        ├─► Paso 2: Preparar Cambios
        │     Sin cambios pendientes
        │     Commits listos para merge
        │
        ├─► Paso 3: Integración (GitHub)
        │     Creando PR #42...
        │     Usuario elige: (a) Merge ahora
        │     gh pr merge 42 --squash --delete-branch
        │     ✓ Mergeado
        │
        ├─► Paso 4: Cerrar Issue
        │     gh issue close 001
        │     ✓ Issue cerrado
        │
        ├─► Paso 5: Actualizar Changelog
        │     Agregando entrada en [Unreleased]
        │     ✓ CHANGELOG.md actualizado
        │
        ├─► Paso 6: Cleanup Worktree
        │     Eliminando worktree...
        │     Eliminando branch...
        │     Sincronizando dev...
        │     ✓ Cleanup completado
        │
        └─► Paso 7: Resumen Final
              ✅ Issue #001 completado!
              🎉 Feature completada!
              👉 Próximo: /build-feature --issue 002
```

### Pull Request Generado

```markdown
## feat(hero-section): implement VideoBackground component

### Descripción

Implementación del componente VideoBackground para el hero section.
Video de fondo con autoplay, loop y fallback de poster.

### Issue

Closes #001

### Cambios

- `src/components/HeroSection/VideoBackground.tsx` (nuevo)
- `src/components/HeroSection/VideoBackground.test.tsx` (nuevo)
- `src/components/HeroSection/index.ts` (modificado)

### Verificaciones

- [x] Tests pasan (5/5)
- [x] QA aprobado
- [x] Security Gate aprobado
- [x] Accessibility Gate aprobado

### Screenshots

N/A (componente de video)
```

### CHANGELOG.md Actualizado

```markdown
## [Unreleased]

### Added
- VideoBackground component for hero section with autoplay and poster fallback (#001)
```

---

## Resumen Visual

```
/merge --issue 001
    │
    ├─► Paso 0: Verificar Security Gate
    │       │
    │       ├─► Buscar sesión QA
    │       ├─► Leer Security Gate result
    │       └─► ¿APROBADO? → NO → BLOQUEAR
    │                │
    │               YES
    │                │
    ├─► Paso 1: Verificar Estado
    │       │
    │       ├─► Sesión QA aprobada
    │       ├─► Working tree limpio
    │       └─► Branch actualizado
    │
    ├─► Paso 2: Preparar Cambios
    │       │
    │       └─► Commit si hay cambios pendientes
    │
    ├─► Paso 3: Integración
    │       │
    │       ├─► GitHub
    │       │     ├─► gh pr create
    │       │     ├─► ¿Merge ahora?
    │       │     └─► gh pr merge --squash
    │       │
    │       └─► Local
    │             ├─► cd dev/ (worktrees) o git checkout develop
    │             ├─► git merge --no-ff a develop
    │             └─► git branch -d
    │
    ├─► Paso 4: Cerrar Issue
    │       │
    │       ├─► GitHub: gh issue close
    │       └─► Local: mover a done/
    │
    ├─► Paso 5: Actualizar Changelog
    │       │
    │       └─► Agregar entrada en [Unreleased]
    │
    ├─► Paso 6: Cleanup Worktree
    │       │
    │       ├─► git worktree remove
    │       ├─► git branch -d
    │       ├─► Actualizar active-features.json
    │       └─► Sincronizar dev
    │
    └─► Paso 7: Resumen Final
            │
            ├─► Resumen de cambios
            ├─► Documentación actualizada
            ├─► Registro de sesión
            └─► Próximos pasos sugeridos
```

---

## Comparación de Backends

| Aspecto | GitHub | Local |
|---------|--------|-------|
| **Método merge** | PR con squash | merge --no-ff |
| **Cerrar issue** | `gh issue close` | Mover a `done/` |
| **Code review** | Nativo | Manual |
| **Branch cleanup** | `--delete-branch` | `git branch -d` |
| **Historial** | PR preservado | Commits preservados |

---

## Flujo Completo del Framework

```
┌─────────────────────────────────────────────────────────┐
│                    FLUJO COMPLETO                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  /genesis ─────► /brainstorming ─────► /create-issues   │
│      │                │                      │          │
│      │                │                      │          │
│      ▼                ▼                      ▼          │
│  Infraestructura   Diseño              Issues en        │
│  + Agentes         detallado           formato Gherkin  │
│                                              │          │
│                                              ▼          │
│                                    ┌─────────────────┐  │
│                                    │ /build-feature  │  │
│                                    │   (@developer)  │  │
│                                    └────────┬────────┘  │
│                                             │           │
│                                             ▼           │
│                                    ┌─────────────────┐  │
│                                    │      /qa        │  │
│                                    │   (@qa agent)   │  │
│                                    │ Security Gate   │  │
│                                    │ A11y Gate       │  │
│                                    └────────┬────────┘  │
│                                             │           │
│                                    ┌────────┴────────┐  │
│                                    │                 │  │
│                                PASS │               │ FAIL
│                                    │                 │  │
│                                    ▼                 │  │
│                           ┌─────────────┐            │  │
│                           │   /merge    │◄───────────┘  │
│                           │   (final)   │    (corregir) │
│                           └──────┬──────┘               │
│                                  │                      │
│                                  ▼                      │
│                           🎉 COMPLETADO                 │
│                                  │                      │
│                    ┌─────────────┴─────────────┐        │
│                    │                           │        │
│                    ▼                           ▼        │
│            /build-feature              /brainstorming   │
│            (siguiente issue)           (nueva feature)  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### "Security Gate no verificado pero QA pasó"

**Síntoma:** QA aprobó pero merge dice que Security Gate no pasó.

**Solución:**
1. Verificar que la sesión de QA tiene sección "Security Gate"
2. Si falta, re-ejecutar `/qa --issue 001`
3. Verificar formato de la sesión

### "Branch desactualizado con develop"

**Síntoma:** Hay commits nuevos en develop.

**Solución:**
```bash
# Actualizar branch
git fetch origin
git rebase origin/develop

# O merge de develop
git merge origin/develop
```

### "Worktree no se puede eliminar"

**Síntoma:** Error al eliminar worktree.

**Solución:**
```bash
# Verificar que no estás dentro del worktree
pwd

# Forzar eliminación
git worktree remove .worktrees/features/feature-001 --force

# Limpiar referencias huérfanas
git worktree prune
```

### "Issue ya está cerrado"

**Síntoma:** El issue ya fue cerrado previamente.

**Solución:**
1. Verificar si el merge ya se hizo
2. Si es necesario, reabrir y cerrar nuevamente
3. Continuar con los pasos restantes (changelog, cleanup)

---

## Referencias

- Skill Merge: `.claude/skills/merge/SKILL.md`
- Security Gate: `.claude/security/SECURITY-GATE.md`
- Template de Sesión: `.claude/skills/_common/session-template.md`
- Guía QA: `.claude/docs/guides/qa-flow-guide.md`
- Skill Release: `.claude/skills/release/SKILL.md`
