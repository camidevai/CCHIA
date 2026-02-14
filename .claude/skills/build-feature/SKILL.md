---
name: build-feature
version: 2.0
description: "Implementa una feature desde un issue"
---

# Build Feature

## QUICK REFERENCE

### BLOCKING CONDITIONS
> ⛔ Si alguna es TRUE, DETENER inmediatamente

- [ ] No es un repositorio git
- [ ] Merge o rebase en progreso
- [ ] Issue no encontrado
- [ ] Dependencias del issue incompletas

### REQUIRED OUTPUTS
> 📦 Archivos que DEBEN existir al finalizar

- [ ] Código implementando TODOS los ACs
- [ ] `.claude/docs/features/{feature}/implementation.md`
- [ ] `.claude/sessions/YYYY-MM-DD-build-feature-{issue}.md`

### PHASES OVERVIEW
```
VALIDATION → PLANNING → IMPLEMENTATION → DOCUMENTATION
     ↓           ↓             ↓               ↓
  Pre-OK     Plan OK?      All ACs ✓      Files exist
```

### PARAMETERS
- `--issue {número}` - Issue a implementar (REQUERIDO)
- `--agent {nombre}` - Override del agent (default: @developer)
  - Valores válidos: `developer`, `architect`, o agentes especializados activos en `/genesis`
  - Si el agente no existe → ERROR: "Agent @{nombre} no encontrado. Agentes disponibles: {lista}"

> **Invocación de agentes**: Se invocan usando la Task tool con `subagent_type={nombre}`.
> Ejemplo: Task tool con `subagent_type=developer` para @developer.

---

## PHASE 1: VALIDATION

### GATE IN
- [ ] Parámetro `--issue` proporcionado

### MUST DO

1. [ ] **Verificar git repo**
   ```bash
   git rev-parse --is-inside-work-tree
   ```
   Si falla → STOP: "No es repositorio git"

2. [ ] **Verificar no hay operaciones pendientes**
   ```bash
   test ! -f .git/MERGE_HEAD && test ! -d .git/rebase-merge
   ```
   Si falla → STOP: "Merge/rebase en progreso"

3. [ ] **Verificar issue existe y estado**
   - GitHub: `gh issue view {número}`
   - Local: Buscar en `.claude/issues/backlog/` o `.claude/issues/in-progress/`
   - Si no existe → STOP: "Issue #{número} no encontrado"
   - Si está en `.claude/issues/done/` → STOP:
     ```
     ⚠️ Issue #{número} ya está completado.

     Si deseas re-implementar, mueve el issue de done/ a backlog/ primero.
     Si deseas modificar la implementación existente, crea un nuevo issue.
     ```

4. [ ] **Verificar dependencias del issue**
   - Leer campo "Bloqueado por" del issue
   - Verificar que todas las dependencias estén cerradas/completadas
   Si hay dependencias pendientes → STOP con lista de dependencias

5. [ ] **Verificar/Crear worktree** (si habilitado)
   - Si `.worktrees/.meta/config.json` existe:
     - Crear worktree si no existe: `.worktrees/features/feature-{issue}`
     - Actualizar `active-features.json`

6. [ ] **Verificar divergencia con develop** (si worktree existe)
   ```bash
   cd .worktrees/features/feature-{issue}
   git fetch origin develop

   # Usar HEAD real de dev/ si worktrees habilitados (más preciso que origin/develop)
   if [ -d ".worktrees/environments/dev" ]; then
     DEV_HEAD=$(cd .worktrees/environments/dev && git rev-parse HEAD)
     BEHIND=$(git rev-list HEAD..${DEV_HEAD} --count 2>/dev/null || echo "0")
   else
     BEHIND=$(git rev-list HEAD..origin/develop --count)
   fi
   ```
   Si `BEHIND > 0`:
   ```
   ⚠️ Feature está {BEHIND} commits detrás de develop.
   Otros features pueden haberse mergeado desde que creaste este worktree.

   Recomendación: Sincronizar antes de continuar
   👉 /worktree update {nombre}

   ¿Continuar sin sincronizar? [s/N]
   ```

### CHECKPOINT
- [ ] Git repo válido
- [ ] Sin operaciones git pendientes
- [ ] Issue existe y accesible
- [ ] Sin dependencias bloqueantes
- [ ] Worktree listo (si aplica)

### IF FAILS
```
❌ Pre-check fallido: {código}

Problema: {descripción}
Solución: {pasos para resolver}

El skill no puede continuar.
```

---

## PHASE 2: PLANNING

### GATE IN
- [ ] PHASE 1 completada

### MUST DO

1. [ ] **Cargar issue completo**
   - User Story
   - Criterios de Aceptación (ACs)
   - Definition of Done

2. [ ] **Extraer lista de ACs**
   ```
   AC1: {descripción}
   AC2: {descripción}
   ...
   ```

3. [ ] **Identificar archivos a modificar/crear**
   - Analizar ACs
   - Mapear a archivos del proyecto

4. [ ] **Presentar plan al usuario**
   ```
   📋 Issue #{número}: {título}

   📌 Plan de implementación:
   1. {Paso 1}
   2. {Paso 2}

   🔧 Archivos:
   - {archivo1} (nuevo)
   - {archivo2} (modificar)

   ¿Procedo? (sí/ajustar)
   ```

5. [ ] **Obtener confirmación**
   - Si "ajustar" → Modificar plan según feedback y volver a presentar
     - Máximo 3 iteraciones de ajuste
     - Si después de 3 ajustes no hay acuerdo:
       ```
       ⚠️ Plan no acordado después de 3 iteraciones.
       Opciones:
       a) Continuar con el plan actual
       b) Escalar a @architect para rediseño
       c) Cancelar y volver a /brainstorming
       ```
     - **Flujo por opción:**
       - **a) Continuar con plan actual**: Proceder a Phase 3 con el último plan presentado. Documentar en sesión: "Plan aprobado tras 3 iteraciones sin consenso completo."
       - **b) Escalar a @architect**: Invocar Task tool con `subagent_type=architect` pasando contexto del issue, plan actual y feedback del usuario. El @architect rediseña y retorna nuevo plan. Volver a step 4 con nuevo plan (1 iteración adicional máximo). Si el usuario rechaza el plan del @architect → STOP: "Plan no acordado. Issue #{número} permanece en backlog."
       - **c) Cancelar**: STOP con mensaje: "Build-feature cancelado. Issue #{número} permanece en backlog. Sugerencia: refinar el issue con /brainstorming antes de reintentar."
   - Si "sí" → Continuar

### CHECKPOINT
- [ ] Plan presentado al usuario
- [ ] Confirmación obtenida

---

## PHASE 3: IMPLEMENTATION

### GATE IN
- [ ] PHASE 2 completada con confirmación

### MUST DO

1. [ ] **Mover issue a in-progress**
   - GitHub: `gh issue edit {número} --add-label "in-progress"`
   - Local: Mover archivo a `.claude/issues/in-progress/`

2. [ ] **Invocar @developer**
   ```
   Implementar Issue #{número}: {título}

   User Story: {user story}

   Criterios de Aceptación:
   {lista de ACs}

   Plan acordado:
   {plan de implementación}

   Archivos objetivo:
   {lista de archivos}
   ```

   > **Nota UI/Accesibilidad**: Si el feature incluye componentes de UI (formularios,
   > interacciones, visualización de datos), @developer debe considerar accesibilidad
   > y escalar a @ux-accessibility cuando sea necesario. Ver `developer.md` sección 5
   > (Escalo cuando → Componente UI con interacción o formularios).

3. [ ] **Verificar CADA AC individualmente**
   Para cada AC:
   - [ ] AC1 implementado - Evidencia: {archivo:línea}
   - [ ] AC2 implementado - Evidencia: {archivo:línea}
   - [ ] ...

4. [ ] **Si AC no cumplido** → Iterar con @developer hasta cumplir

### CHECKPOINT
- [ ] TODOS los ACs tienen ✓
- [ ] Código compila/funciona

### IF FAILS
```
❌ AC no cumplido: {AC}

Estado actual: {descripción}
Faltante: {qué falta}

Iterando con @developer...
```

---

## PHASE 4: DOCUMENTATION

### GATE IN
- [ ] PHASE 3 completada (todos los ACs ✓)

### MUST DO

1. [ ] **Crear documentation de feature**
   Archivo: `.claude/docs/features/{feature}/implementation.md`
   ```markdown
   # Implementación: {Feature}

   ## Issue
   #{número}: {título}

   ## Decisiones técnicas
   - {Decisión 1}: {Razón}

   ## Archivos modificados
   | Archivo | Cambio |
   |---------|--------|
   | {path} | {descripción} |

   ## Patrones utilizados
   - {Patrón}: {dónde se usó}
   ```

2. [ ] **Crear sesión**
   Archivo: `.claude/sessions/YYYY-MM-DD-build-feature-{issue}.md`
   (Ver formato en REFERENCE)

3. [ ] **Mostrar resumen final**
   ```
   ✅ Issue #{número} implementado.

   📁 Archivos modificados:
      - {archivo1}
      - {archivo2}

   📝 Documentación:
      .claude/docs/features/{feature}/implementation.md

   👉 Próximo paso: /qa
   ```

### CHECKPOINT
- [ ] `implementation.md` existe
- [ ] Sesión existe
- [ ] Resumen mostrado

---

## FINAL CHECKPOINT

Antes de terminar, verificar:

- [ ] TODOS los ACs implementados
- [ ] `.claude/docs/features/{feature}/implementation.md` existe
- [ ] `.claude/sessions/YYYY-MM-DD-build-feature-{issue}.md` existe
- [ ] Próximo paso comunicado al usuario

---

## REFERENCE

### Formato de Sesión

```markdown
# Sesión: Build Feature - Issue #{número}
Fecha: {ISO timestamp}
Skill: /build-feature

## Resumen
Implementación de issue #{número} - {título}

## Decisiones tomadas
- {Decisión}: {Razón}

## Trade-offs considerados
- {Alternativa descartada}: {Por qué}

## ACs verificados
| AC | Estado | Evidencia |
|----|--------|-----------|
| AC1 | ✓ | {archivo:línea} |

## Archivos modificados
- `{path}` ({nuevo|modificado})

## Worktree (si aplica)
- Path: {path}
- Branch: {branch}

## Próximo paso sugerido
/qa --issue {número}
```

### Interacción con @developer

El agent @developer tiene acceso a:
- Stack del proyecto
- Arquitectura acordada
- Convenciones de código
- Skills de proyecto disponibles
- Escalation rules (incluyendo @ux-accessibility para UI)

Decisiones del agent:
- **Trabajo directo**: Cambios simples
- **Skill de proyecto**: Patrones repetitivos
- **Escalación a @ux-accessibility**: Componentes UI con interacción o formularios

### Worktrees

Si worktrees habilitados (`.worktrees/.meta/config.json` existe):
```bash
# Operación atómica: crear branch y worktree sin cambiar HEAD del repo principal
git fetch origin develop
git worktree add -b feature/{issue}-{slug} .worktrees/features/feature-{issue} origin/develop
```
> **Importante**: Usar `git worktree add -b` en vez de `git checkout -b` + `git worktree add` para evitar race conditions cuando se crean múltiples features simultáneamente.

### Backends de Issues

**GitHub:**
```bash
gh issue view {número} --json title,body,labels
gh issue edit {número} --add-label "in-progress"
```

**Local:**
- Backlog: `.claude/issues/backlog/{número}-*.md`
- In progress: `.claude/issues/in-progress/{número}-*.md`

---

## Ver también

- **Guía**: `.claude/docs/guides/build-feature-flow-guide.md`
- **Siguiente skill**: `.claude/skills/qa/SKILL.md`
- **Validación**: `.claude/validation/VALIDATION.md` → "Checklist: /build-feature"
- **Session template**: `.claude/skills/_common/session-template.md` → "/build-feature"
- **Rules**: `.claude/rules/code-style.md`, `.claude/rules/commits.md`
