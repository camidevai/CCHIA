---
name: merge
version: 2.0
description: "Integración y cierre de issue. Crea PR (GitHub) o hace merge directo (local), actualiza changelog y cierra el issue."
---

# Merge

## QUICK REFERENCE

### BLOCKING CONDITIONS
> ⛔ Si alguna es TRUE, DETENER inmediatamente

- [ ] QA no aprobado para el issue
- [ ] Sesión QA expirada (>7 días) sin override
- [ ] Security Gate FAILED
- [ ] Accessibility Gate FAILED (nivel A)
- [ ] `merge.lock` activo (otro merge en progreso)
- [ ] Feature branch no sincronizado con develop

### REQUIRED OUTPUTS
> 📦 Archivos que DEBEN existir al finalizar

- [ ] Commit de merge en develop (o PR en GitHub)
- [ ] Issue movido a `done/` (local) o cerrado (GitHub)
- [ ] `CHANGELOG.md` actualizado (si existe)
- [ ] `.claude/sessions/YYYY-MM-DD-merge-{issue}.md`
- [ ] Worktree del feature eliminado (si aplica)

### PHASES OVERVIEW
```
PHASE 0 → PHASE 1 → PHASE 2 → PHASE 3 → PHASE 4 → PHASE 5 → PHASE 6
GATES     VERIFY    PREPARE   MERGE     CLOSE     UPDATE    CLEANUP
   ↓         ↓         ↓         ↓         ↓         ↓         ↓
Security  Estado    Commit    PR/Merge  Issue     Changelog Worktree
+ A11y    + sync    pendiente backend   closed              + session
```

### PARAMETERS
| Parámetro | Descripción | Default |
|-----------|-------------|---------|
| `--issue {N}` | Issue a cerrar | Último QA aprobado |
| `--no-pr` | Merge directo sin PR | Solo local backend |

---

## Overview

Skill final del ciclo de desarrollo. Integra los cambios implementados, cierra el issue y actualiza la documentación de proyecto.

## Parámetros

- `--issue {número}`: Issue a cerrar (opcional, usa el último en QA aprobado)
- `--no-pr`: Hacer merge directo sin PR (solo si backend=local)

## Merge Targets

| Branch type | Merge target | Ejemplo |
|-------------|-------------|---------|
| `feature/*` | `develop` | feature/auth-login → develop |
| `hotfix/*` | `main` + `develop` | hotfix/123-fix → main, luego develop |
| `release/*` | `main` + `develop` | release/v1.2.0 → main, luego develop |

> **Regla**: Features SIEMPRE van a develop, NUNCA directo a main.
> Solo release/* y hotfix/* van a main.

## Prerrequisitos

Antes de ejecutar:
1. Issue debe estar en estado "in-progress"
2. QA debe haber aprobado (verificar sesión de QA)
3. **Security Gate debe haber pasado** (verificar en sesión de QA)
4. **Accessibility Gate debe haber pasado** (si proyecto tiene UI, verificar en sesión de QA)

Si no se cumplen:
```
⚠️ No se puede hacer merge:
   - QA no aprobado para issue #{número}

👉 Ejecuta /qa primero
```

## Proceso

### 0. Verificar Security Gate (OBLIGATORIO)

> Referencia: `.claude/security/SECURITY-GATE.md`

1. Buscar última sesión de QA: `.claude/sessions/YYYY-MM-DD-qa-{issue}.md`
2. Verificar sección "## Security Gate" → Resultado = "APROBADO"
3. Si no pasó → Bloquear merge, ejecutar `/qa` primero
4. Si pasó → Mostrar `🔒 Security Gate: VERIFICADO` y continuar

### 0.0.5. Verificar Antigüedad de QA (QA Expiration)

> Las sesiones de QA tienen una validez máxima de **7 días**.

```bash
# Extraer fecha de la sesión de QA
QA_SESSION=$(ls -t .claude/sessions/*-qa-${ISSUE}.md 2>/dev/null | head -1)

if [ -z "$QA_SESSION" ]; then
  echo "⛔ No se encontró sesión de QA para issue #${ISSUE}"
  exit 1
fi

# Extraer fecha del nombre del archivo (formato: YYYY-MM-DD-qa-{issue}.md)
QA_DATE=$(basename "$QA_SESSION" | grep -oP '^\d{4}-\d{2}-\d{2}')
TODAY=$(date +%Y-%m-%d)

# Calcular diferencia en días
QA_EPOCH=$(date -d "$QA_DATE" +%s)
TODAY_EPOCH=$(date -d "$TODAY" +%s)
DAYS_OLD=$(( (TODAY_EPOCH - QA_EPOCH) / 86400 ))
```

**Evaluación de antigüedad:**

| Antigüedad | Estado | Acción |
|------------|--------|--------|
| ≤ 7 días | ✅ Válido | Continuar |
| > 7 días | ⚠️ Expirado | Ver opciones abajo |

**Si QA expirado (> 7 días):**

```
⚠️ QA EXPIRADO

La sesión de QA tiene ${DAYS_OLD} días de antigüedad.
Sesión: ${QA_SESSION}
Fecha: ${QA_DATE}

El código puede haber cambiado desde la última validación.
Por seguridad, se requiere re-validación.

Opciones:
  a) Re-ejecutar /qa (recomendado)
     → Ejecuta: /qa --issue ${ISSUE}

  b) Override documentado (solo si no hubo cambios)
     → Requiere justificación escrita
     → Se documenta en sesión de merge

¿Qué deseas hacer? [a/b]
```

**Si elige override (opción b):**

```bash
# Solicitar justificación
echo "Justificación requerida para override de QA expirado:"
read JUSTIFICATION

# Documentar en sesión de merge
# ## QA Expiration Override
# **Sesión QA:** ${QA_SESSION}
# **Antigüedad:** ${DAYS_OLD} días
# **Justificación:** ${JUSTIFICATION}
# **Fecha override:** ${TODAY}
```

**Razón de los 7 días:**
- El código puede haber cambiado en el feature branch
- Dependencias pueden tener nuevas vulnerabilidades
- Otros features mergeados pueden causar conflictos
- El contexto del QA puede ya no ser válido

### 0.1. Verificar Accessibility Gate (si proyecto tiene UI)

> Solo aplica si el proyecto tiene componentes de UI (detectado en /genesis).

1. Buscar sección "## Accessibility Gate" en sesión de QA
2. Evaluar resultado:
   - **PASS** → Mostrar `♿ Accessibility Gate: VERIFICADO` y continuar
   - **WARNING (nivel AA)** → Mostrar warning y continuar:
     ```
     ⚠️ Accessibility Gate: PASS con warnings (nivel AA)
     {lista de warnings}
     El merge puede continuar, pero considere resolver en próximo sprint.
     ```
   - **FAIL (nivel A)** → Bloquear merge:
     ```
     ⛔ Accessibility Gate: BLOQUEADO
     Violaciones de WCAG nivel A detectadas.

     Ejecuta /qa primero para ver detalles y resolver.
     ```
   - **No existe sección** → N/A (proyecto sin UI), continuar

### 0.5. Adquirir lock de merge (si worktrees habilitados)

> **Protección contra merges simultáneos**: Dos merges concurrentes sobre el mismo directorio causan corrupción porque ambos intentan `git merge` en el mismo working tree (dev/ worktree o repo principal).

1. Verificar archivo `.worktrees/.meta/merge.lock`
2. Si existe y tiene menos de 10 minutos → **STOP**:
   ```
   ⛔ Merge en progreso para {feature_en_lock}.
   Iniciado hace {minutos} minutos.

   Espera a que termine o elimina el lock si es stale:
   rm .worktrees/.meta/merge.lock
   ```
3. Si existe y tiene más de 10 minutos → Ejecutar algoritmo de detección stale
   (ver `.claude/rules/git-worktrees.md` regla 9 para algoritmo completo con verificación PID)
4. Crear lock con contenido:
   ```json
   {
     "pid": {process_id},
     "timestamp": "{ISO timestamp}",
     "operation": "merge",
     "branch": "{feature_branch}",
     "target": "develop"
   }
   ```
5. El lock protege TODO el flujo: pull → merge → push → cleanup
6. Al finalizar (éxito o fallo) → **Eliminar lock siempre**

### 1. Verificar estado

Confirma que:
- [ ] Existe sesión de QA aprobada reciente
- [ ] No hay cambios sin commit
- [ ] Branch está actualizado con develop
- [ ] Feature tiene los últimos cambios de develop (check de divergencia)

```bash
git status
git fetch origin
git log origin/develop..HEAD
```

**Check de divergencia con develop (OBLIGATORIO):**
```bash
# Verificar que el feature tiene los últimos cambios de develop
BEHIND=$(git rev-list HEAD..origin/develop --count)
if [ "$BEHIND" -gt 0 ]; then
  echo "⚠️ Feature está $BEHIND commits detrás de develop"
fi
```

Si el feature está detrás de develop:
```
⛔ Feature branch no está actualizado con develop.
   {BEHIND} commits de develop no están incorporados.

   La sincronización es OBLIGATORIA antes de merge para
   evitar conflictos y divergencia en develop.

   Ejecuta primero: /worktree update {nombre}
   O manualmente:
     cd .worktrees/features/{tipo}-{nombre}
     git fetch origin develop
     git merge origin/develop --no-ff -m "chore: sync with develop"

   El merge NO continuará hasta que el feature esté sincronizado.
```
> Este check es obligatorio para desarrollo paralelo. Si otro feature ya se mergeó a develop, este feature necesita esos cambios antes de mergear.

### 2. Preparar cambios

Si hay cambios sin commit:
```bash
# Mostrar archivos modificados para revisión
git status --short

# Stage SOLO los archivos relevantes al feature (NUNCA usar git add -A)
# Verificar que no se incluyan secrets, archivos temporales o archivos de otros worktrees
git add {archivos_del_feature}

git commit -m "feat({feature}): implement issue #{número}

{descripción breve de los cambios}

Closes #{número}"
```
> **Importante**: No usar `git add -A` ni `git add .` ya que pueden incluir archivos no deseados (secrets, temporales, archivos de configuración local). Siempre hacer staging explícito de los archivos relevantes al feature.

### 3. Según backend

#### GitHub: Crear PR

```bash
gh pr create \
  --title "feat({feature}): {título del issue}" \
  --body "## Descripción
{Resumen de los cambios}

## Issue
Closes #{número}

## Cambios
{Lista de archivos modificados}

## Tests
- [x] Tests pasan
- [x] QA aprobado

## Screenshots (si aplica)
{Capturas si hay cambios visuales}"
```

Presenta el PR creado:
```
📝 PR creado: #{pr_número}
   URL: {url del PR}

¿Deseas hacer merge ahora o esperar review?
a) Merge ahora (si tienes permisos)
b) Esperar review
```

Si elige merge:
```bash
gh pr merge {pr_número} --squash --delete-branch
```

#### Local: Merge directo

**Si worktrees están habilitados** (merge se ejecuta dentro de dev/):
```bash
# El merge se ejecuta en el dev worktree (develop ya está checked out ahí)
cd .worktrees/environments/dev

# Stash cambios exploratorios si existen
CHANGES=$(git status --porcelain)
if [ -n "$CHANGES" ]; then
  git stash push -m "auto-stash before merge $(date -Iseconds)"
  echo "⚠️ Cambios en dev/ guardados en stash"
fi

git pull origin develop                    # CRÍTICO: traer merges anteriores
git merge {branch} --no-ff -m "feat({feature}): implement issue #{número}"
git push origin develop                    # CRÍTICO: publicar inmediatamente

cd {repo_principal}
git branch -d {branch}
```

> **¿Por qué en dev/ y no en el repo principal?** Cuando worktrees están habilitados, el branch `develop` está checked out en `.worktrees/environments/dev/`. Git no permite hacer checkout de un branch que ya está en uso por otro worktree (`fatal: 'develop' is already checked out at...`). Ejecutar el merge dentro de dev/ evita este conflicto y mantiene el repo principal siempre en `main`.

**Si worktrees NO están habilitados** (merge en repo principal):
```bash
# Primero: sincronizar feature branch con develop
git checkout {branch}
git fetch origin develop
git merge origin/develop --no-ff -m "chore: sync with develop"

# Luego: merge a develop
git checkout develop
git pull origin develop                    # CRÍTICO: traer merges anteriores
git merge {branch} --no-ff -m "feat({feature}): implement issue #{número}"
git push origin develop                    # CRÍTICO: publicar inmediatamente
git branch -d {branch}
```

> **Importante**: El `git pull` antes del merge es obligatorio para incorporar merges previos de otros features. El `git push` después del merge es obligatorio para que futuros merges puedan traer estos cambios. Sin estos pasos, features paralelos causan divergencia en develop.

### 4. Cerrar issue

#### GitHub
```bash
gh issue close {número} --comment "Implementado en PR #{pr_número}"
```

#### Local
Mueve archivo de `in-progress/` a `done/`:
- Actualiza `status: done`
- Agrega `closed: {fecha}`
- Agrega `implemented_in: {commit_hash}`

### 5. Actualizar changelog

Si existe `CHANGELOG.md`, agregar entrada:

```markdown
## [Unreleased]

### Added
- {Descripción de la feature} (#{número})
```

Si no existe, preguntar si crear:
```
No se encontró CHANGELOG.md. ¿Deseas crearlo? (sí/no)
```

### 6. Cleanup de Worktree (si aplica)

Si worktrees están habilitados y existe worktree para este issue:

```bash
# Verificar que estamos en el repo principal, no en el worktree
cd {repo_principal}

# Eliminar worktree
git worktree remove .worktrees/features/feature-{issue}-{slug} --force

# Eliminar branch local (ya mergeado)
git branch -d feature/{issue}-{slug}
```

Actualizar `active-features.json`:
- Remover entrada del feature
- Actualizar `lastUpdated`

Sincronizar ambiente dev:
```bash
# Si el merge se ejecutó dentro de dev/ (worktrees habilitados):
#   → dev/ ya está actualizado, no necesita sync separado.
#   → Solo verificar estado:
cd .worktrees/environments/dev
echo "dev/ sincronizado (merge ejecutado aquí)"

# Si el merge se ejecutó en el repo principal (sin worktrees):
#   → dev/ necesita sync completo:
cd .worktrees/environments/dev
CHANGES=$(git status --porcelain)
if [ -n "$CHANGES" ]; then
  git stash push -m "auto-stash before merge sync $(date -Iseconds)"
  echo "⚠️ Cambios en dev/ guardados en stash"
fi
git fetch origin develop
git reset --hard origin/develop
```

### 6.0. Liberar lock de merge (SIEMPRE)

> Este paso se ejecuta SIEMPRE, tanto en éxito como en fallo.

```bash
# Liberar lock de merge (éxito o fallo)
if [ -f ".worktrees/.meta/merge.lock" ]; then
  rm .worktrees/.meta/merge.lock
  echo "Lock de merge liberado"
fi
```

> **IMPORTANTE**: Si el merge falla en cualquier paso, el lock DEBE liberarse antes de salir.
> El flujo protegido (sección "Manejo de Fallos") ya incluye esto en "SIEMPRE (éxito o fallo)".

Informar:
```
🧹 Cleanup completado:
   - Worktree eliminado: feature-{issue}-{slug}
   - Branch eliminado: feature/{issue}-{slug}
   - Ambiente dev sincronizado
```

### 6.1. Detectar estado de QA ambiente (Auto-sync Check)

Después del merge, verificar diferencias entre ambientes:

```bash
# Obtener commits de develop adelante de qa
cd .worktrees/environments/qa
QA_COMMIT=$(git rev-parse HEAD)
cd {repo_principal}
DEVELOP_COMMIT=$(git rev-parse develop)

COMMITS_AHEAD=$(git rev-list ${QA_COMMIT}..${DEVELOP_COMMIT} --count)
```

Si hay diferencias, mostrar aviso:

```
📊 Estado de ambientes post-merge:

   dev/    → develop  [sincronizado ✓]
   qa/     → develop  [${COMMITS_AHEAD} commits atrás]

💡 El ambiente qa/ tiene ${COMMITS_AHEAD} commits pendientes de promoción.

👉 Cuando estés listo para pruebas formales:
   1. /promote --to qa (sincronizar qa/ con develop)
   2. /qa --env qa (validación formal de integración)
```

Actualizar `promotions.json` con timestamp de sync de dev:

```bash
# Actualizar lastSync.dev en .worktrees/.meta/promotions.json
```

### 7. Resumen final

```
✅ Issue #{número} completado y mergeado.

📋 Resumen:
   Issue: #{número} - {título}
   PR: #{pr_número} (si aplica)
   Commit: {hash corto}
   Branch: {eliminada|main}

📁 Archivos finales:
   - {archivo1}
   - {archivo2}

📝 Documentación actualizada:
   - CHANGELOG.md
   - .claude/docs/features/{feature}/

🧹 Worktree: {limpiado | no aplica}
   - Worktree eliminado
   - Branch feature eliminado
   - Ambiente dev sincronizado

📊 Estado de ambientes:
   dev/  → develop  [sincronizado ✓]
   qa/   → develop  [{N} commits atrás]

📍 Progreso del flujo:
   [✓] Génesis
   [✓] Brainstorming
   [✓] Crear Issues
   [✓] Build Feature
   [✓] QA + Merge ← completado

🎉 Feature completada!

👉 Próximos pasos:
   - /promote --to qa (promover features aprobados a QA)
   - /build-feature --issue {siguiente} (si hay más issues)
   - /brainstorming (para nueva feature)
```

### 8. Registro de sesión

> Formato base: `.claude/skills/_common/session-template.md`

Crea `.claude/sessions/YYYY-MM-DD-merge-{issue}.md` con campos adicionales:

- **Detalles de integración**: Método, PR, Commit, Branch
- **Security Gate**: Verificado, sesión QA referenciada
- **Accessibility Gate**: Verificado \| N/A (sin UI), sesión QA referenciada
- **Worktree cleanup**: Path, estado, sincronización dev
- **Cambios incluidos**: Resumen
- **Documentación actualizada**: Lista de archivos
- **Issue cerrado**: Estados y fecha

## Manejo de conflictos

Si hay conflictos de merge:

```
⚠️ Conflictos detectados en:
   - {archivo1}
   - {archivo2}

Opciones:
a) Resolver automáticamente (intentar)
b) Mostrar conflictos para resolver manualmente
c) Abortar merge
```

Si elige resolver automáticamente:
1. Analizar los conflictos
2. Proponer resolución
3. Mostrar diff para aprobación
4. Aplicar y continuar

## Manejo de Fallos y Rollback

### Principio: No destruir en caso de fallo

Si el merge falla a mitad del proceso, **NO eliminar worktree ni branch**. Solo hacer cleanup en caso de éxito completo.

### Flujo protegido (try-catch conceptual)

```
INTENTAR:
  1. Adquirir lock
  2. cd .worktrees/environments/dev  (si worktrees habilitados)
     O git checkout develop          (si sin worktrees)
  3. git pull origin develop
  4. git merge {branch} --no-ff
  5. git push origin develop
  6. cd {repo_principal}
  7. Cleanup worktree + branch
  8. Actualizar metadata

SI FALLO EN PASO 3-4 (merge):
  - git merge --abort (si hay conflicto)
  - cd {repo_principal} (volver al repo principal)
  - NO eliminar worktree
  - NO eliminar branch
  - Informar al usuario qué paso falló
  - Sugerir resolución manual

SI FALLO EN PASO 5 (push):
  - El merge local fue exitoso pero no se pudo publicar
  - cd {repo_principal} (volver al repo principal)
  - NO eliminar worktree (puede necesitar re-push)
  - Informar: "Merge local exitoso pero push falló"
  - Sugerir: cd .worktrees/environments/dev && git push origin develop

SIEMPRE (éxito o fallo):
  - Liberar lock de merge: `rm .worktrees/.meta/merge.lock`
  - Registrar sesión con estado final
```

### Rollback post-merge exitoso

Si algo sale mal **después** del merge exitoso:

```bash
# Revertir último commit en develop (NO usar reset --hard)
# Si worktrees habilitados: operar en dev/
cd .worktrees/environments/dev
# Si sin worktrees: git checkout develop
git revert HEAD --no-edit
git push origin develop

# Reabrir issue si aplica
gh issue reopen {número}
```

### Estado inconsistente: worktree eliminado pero merge fallido

Si el worktree fue eliminado prematuramente:
```bash
# Recrear worktree desde el branch (si aún existe)
git worktree add .worktrees/features/{tipo}-{nombre} {branch}

# Si el branch fue eliminado, recuperar de reflog
git reflog show --all | grep {branch}
git checkout -b {branch} {commit_hash}
```

Documentar en sesión el rollback y razón.

## Principios

- **Security Gate verificado**: No merge sin Security Gate aprobado
- **Accessibility Gate verificado (si UI)**: No merge con violaciones WCAG nivel A
- **QA primero**: No merge sin QA aprobado
- **Changelog actualizado**: Documentar cada cambio
- **Issues cerrados**: No dejar issues huérfanos
- **Sesiones completas**: Registrar todo el proceso
- **Sugerir siguiente**: Mantener el flujo activo

## Integración con Sistema de Calidad

Este skill verifica:
1. **Security Gate pasó** en última sesión de /qa
2. **Accessibility Gate pasó** (si proyecto tiene UI) - violaciones nivel A bloquean
3. No permite bypass del Security Gate ni Accessibility Gate
4. Documenta verificación de ambos gates en sesión de merge

Referencia: `.claude/security/SECURITY-GATE.md`, `.claude/agents/ux-accessibility.md`

## Integración con Sistema de Worktrees

Cuando worktrees están habilitados, el skill:

1. **Auto-sync dev/**: Sincroniza el ambiente dev/ con develop tras el merge
2. **Detecta diferencias**: Calcula commits pendientes entre dev/ y qa/
3. **Sugiere promoción**: Recomienda `/promote --to qa` cuando hay features listos
4. **Actualiza metadata**: Registra timestamp de sincronización en `promotions.json`

| Acción | Comportamiento |
|--------|----------------|
| Post-merge | Auto-sync de `.worktrees/environments/dev/` |
| Detección | Compara commits entre qa/ y develop |
| Sugerencia | Muestra comando `/promote --to qa` si hay diferencias |
| Registro | Actualiza `lastSync.dev` en `promotions.json` |

Referencia: `.claude/skills/promote/SKILL.md`

---

## FINAL CHECKPOINT

Antes de terminar, verificar:

- [ ] Security Gate verificado (OBLIGATORIO)
- [ ] Accessibility Gate verificado (si UI)
- [ ] Merge completado (PR o directo)
- [ ] Issue cerrado y movido a `done/`
- [ ] CHANGELOG actualizado
- [ ] Worktree eliminado (si aplica)
- [ ] Lock de merge liberado
- [ ] Sesión registrada en `.claude/sessions/`
- [ ] Próximo paso comunicado (`/promote --to qa` o `/build-feature`)

---

## Ver también

- **Guía**: `.claude/docs/guides/merge-flow-guide.md`
- **Skill anterior**: `.claude/skills/qa/SKILL.md`
- **Skill siguiente**: `.claude/skills/promote/SKILL.md` (para promoción a qa)
- **Security Gate**: `.claude/security/SECURITY-GATE.md`
- **Validación**: `.claude/validation/VALIDATION.md` → "Checklist: /merge"
- **Session template**: `.claude/skills/_common/session-template.md` → "/merge"
- **Git rules**: `.claude/rules/git-protection.md`, `.claude/rules/git-worktrees.md`
