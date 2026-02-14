# QA ENV Mode - Integration QA (`--env qa`)

> Este archivo contiene las fases 1E-5E para QA de integración en ambiente qa/.
> Se carga cuando se ejecuta `/qa --env qa`.
> Valida el ambiente qa/ completo, incluyendo análisis profundo via agentes especializados.

---

## PHASE 1E: CONTEXT (ENV MODE)

### GATE IN
- [ ] MODE ROUTER → ENV MODE
- [ ] Prerrequisitos de env mode verificados

### MUST DO

1. [ ] **Leer promotions.json**
   ```bash
   # Extraer última promoción a qa
   cat .worktrees/.meta/promotions.json
   ```
   - Identificar commit promovido
   - Identificar features incluidos
   - Identificar timestamp de promoción
   - **Edge case**: Si `promotions` array está vacío o no tiene entrada con `"to": "qa"`:
     ```
     ⛔ No hay promociones a qa registradas.
     No se han promovido features al ambiente qa/.

     👉 Ejecuta /promote --to qa primero.
     ```

2. [ ] **Cargar features promovidos**
   - Leer issues de `.claude/issues/done/` e `.claude/issues/in-progress/`
   - Filtrar los que están en la lista de features de la promoción
   - Cargar User Stories y ACs de cada uno

3. [ ] **Cargar sesiones QA individuales**
   - Para cada feature promovido: buscar `.claude/sessions/*-qa-{issue}.md`
   - Verificar que todos tienen QA individual APPROVED:
     ```bash
     for ISSUE in ${PROMOTED_FEATURES}; do
       QA_SESSION=$(ls -t .claude/sessions/*-qa-${ISSUE}.md 2>/dev/null | head -1)
       if [ -z "$QA_SESSION" ]; then
         echo "⚠️ Feature ${ISSUE}: Sin sesión QA individual"
         MISSING_QA+=("$ISSUE")
       else
         RESULT=$(grep -m1 "^\*\*\(APPROVED\|FAILED\|CONDITIONAL\)\*\*" "$QA_SESSION" | tr -d '*')
         if [ "$RESULT" != "APPROVED" ]; then
           echo "⚠️ Feature ${ISSUE}: QA individual = ${RESULT:-UNKNOWN}"
           FAILED_QA+=("$ISSUE")
         fi
       fi
     done
     ```
   - Si alguno no tiene QA individual → WARNING
   - Si alguno tiene QA FAILED → WARNING con lista de features afectados

4. [ ] **Detectar tipo de proyecto**
   - Si hay archivos `.tsx`, `.jsx`, `.vue`, `.svelte` → UI presente → habilitar A11y audit
   - Si solo backend/CLI → marcar A11y como "N/A (no UI)"

5. [ ] **Posicionarse en qa/**
   ```bash
   cd .worktrees/environments/qa
   ```

6. [ ] **Verificar sincronización de qa/**
   - Comparar HEAD de qa/ con commit de la promoción
   - Si diverge → WARNING: "qa/ desincronizado, sugiere /promote --to qa"

### CHECKPOINT
- [ ] Promoción identificada
- [ ] Features cargados
- [ ] Sesiones QA individuales verificadas
- [ ] Tipo de proyecto detectado
- [ ] Posicionado en qa/

---

## PHASE 2E: TESTING (ENV MODE)

> A diferencia del modo standard (tests de un issue), ejecuta suite COMPLETA.

### GATE IN
- [ ] PHASE 1E completada

### MUST DO

1. [ ] **Instalar dependencias en qa/**
   ```bash
   cd .worktrees/environments/qa
   npm install 2>/dev/null || pip install -r requirements.txt 2>/dev/null
   ```

2. [ ] **Unit tests completos**
   ```bash
   # Node.js
   npm test

   # Python
   pytest -m "not integration and not e2e"

   # Go
   go test ./...

   # Rust
   cargo test
   ```
   Capturar: total, pasando, fallando, cobertura

3. [ ] **Integration tests**
   ```bash
   # Node.js
   npm run test:integration 2>/dev/null || npx jest --testPathPattern="integration"

   # Python
   pytest -m integration
   ```
   Capturar: total, pasando, fallando, cobertura

4. [ ] **E2E tests**
   ```bash
   # Node.js
   npm run test:e2e 2>/dev/null || npx jest --testPathPattern="e2e"

   # Python
   pytest -m e2e
   ```
   Capturar: total, pasando, fallando

5. [ ] **Linting full codebase**
   ```bash
   # Node.js
   npm run lint

   # Python
   ruff check .
   ```

6. [ ] **Type checking full codebase**
   ```bash
   # TypeScript
   npx tsc --noEmit

   # Python
   mypy .
   ```

7. [ ] **Registrar resultados por suite**
   ```
   📊 Full Test Suite Results:

   | Suite       | Total | Pass | Fail | Coverage |
   |-------------|-------|------|------|----------|
   | Unit        | {n}   | {n}  | {n}  | {n}%     |
   | Integration | {n}   | {n}  | {n}  | {n}%     |
   | E2E         | {n}   | {n}  | {n}  | -        |
   | TOTAL       | {n}   | {n}  | {n}  | {n}%     |

   📝 Linting: {n} errores, {n} warnings
   🔤 Types: {n} errores
   ```

### CHECKPOINT
- [ ] Unit tests ejecutados
- [ ] Integration tests ejecutados
- [ ] E2E tests ejecutados
- [ ] Linting ejecutado
- [ ] Types verificados
- [ ] Resultados registrados por suite

### IF SUITE EMPTY
```
⚠️ No se encontraron tests de {suite}

Esto no bloquea QA pero el resultado será CONDITIONAL como mínimo.
Se recomienda agregar tests de integración/e2e antes del release.
```

### IF FAILS
```
❌ Test suite fallando

Suite: {suite}
Fallos: {n}
Detalle:
  - {test name}: {error}

Nota: --fix no está disponible en ENV MODE.
Corrija en develop → /promote --to qa → /qa --env qa
```

---

## PHASE 3E: VERIFICATION (ENV MODE)

### GATE IN
- [ ] PHASE 2E completada

### MUST DO

1. [ ] **Cross-feature integration check**

   | Check | Método | Estado |
   |-------|--------|--------|
   | Conflictos de rutas | Buscar rutas duplicadas en router/config | {PASS\|FAIL} |
   | Componentes duplicados | Buscar exports duplicados | {PASS\|FAIL} |
   | Estado compartido | Verificar no hay conflictos en stores/context | {PASS\|FAIL} |
   | Versiones de dependencias | Verificar no hay conflictos en package.json/requirements | {PASS\|FAIL} |

2. [ ] **Resumen de ACs consolidados**
   - Confirmar que TODOS los ACs de TODOS los features se verificaron en QA individual
   ```
   📋 ACs Consolidados:

   Feature 001-auth-login:
   [✓] AC1: Login form renders → Verificado en QA individual
   [✓] AC2: Validates email → Verificado en QA individual

   Feature 002-payments:
   [✓] AC1: Payment form → Verificado en QA individual

   Total: {n}/{n} ACs verificados
   ```

3. [ ] **Regression check**
   - Verificar que features que pasaron QA individual siguen funcionando integrados
   - Ejecutar tests específicos de cada feature en el ambiente qa/ integrado
   - Si algún test que pasaba antes ahora falla → regression detectada

4. [ ] **Build verification**
   ```bash
   # Node.js
   npm run build

   # Python
   python -m py_compile {main_files}

   # Go
   go build ./...

   # Rust
   cargo build
   ```
   Resultado: `BUILD: {PASS|FAIL}`

### AC Consolidation Algorithm

**Función:** `consolidateACs(promotionsFile, sessionsDir)`

```
PASO 1: EXTRACT
  - Leer promotions.json → features[] promovidos a qa
  - Para cada feature:
    - Leer sesión QA individual: sessions/*-qa-{issue}.md
    - Extraer lista de ACs del issue original
    - Extraer estado de verificación de cada AC

PASO 2: DEDUPLICATE
  - Identificar ACs compartidos entre features (por subject)
  - Marcar ACs duplicados con ref a feature que lo verificó primero
  - Mantener solo una instancia por AC único

PASO 3: VERIFY COVERAGE
  - Total ACs únicos = sum(ACs por feature) - duplicados
  - Verificados = ACs con estado ✓ en sesión QA individual
  - Coverage = Verificados / Total * 100
  - Si Coverage < 100% → listar ACs no verificados

PASO 4: BUILD CONSOLIDATED VIEW
  - Agrupar por feature
  - Mostrar estado de cada AC
  - Incluir referencia a sesión QA donde se verificó

PASO 5: REPORT
  - Si Coverage = 100% → PASS
  - Si Coverage < 100% → FAIL con lista de ACs faltantes
```

**Failure Conditions:**

| Condición | Resultado | Acción |
|-----------|-----------|--------|
| Feature sin sesión QA | **FAIL** | Listar features sin QA |
| AC sin verificación | **FAIL** | Listar ACs no verificados |
| Sesión QA con resultado FAILED | **WARN** | Listar y evaluar si bloquea |
| Sesión QA con resultado CONDITIONAL | **WARN** | Listar condiciones |
| Coverage 100% | **PASS** | Continuar |

### CHECKPOINT
- [ ] Cross-feature integration verificada
- [ ] ACs consolidados
- [ ] Regression check completado
- [ ] Build verificado

---

## PHASE 4E: GATES (ENV MODE)

> ⛔ **ESTA FASE ES OBLIGATORIA Y NO PUEDE SALTARSE**
> Invoca agentes especializados via protocolo RADAR para análisis profundo.

### GATE IN
- [ ] PHASE 3E completada

### MUST DO

#### 4E.1 SECURITY GATE + @security DEEP REVIEW

**Paso 1: Security Gate básico (codebase COMPLETO en qa/)**

Ejecutar los 5 checks standard sobre TODA la codebase:

1. [ ] **Secrets Detection** — Escanear TODOS los archivos en qa/
2. [ ] **Dependency Audit** — `npm audit` / `pip-audit` / `cargo audit`
3. [ ] **Code Patterns** — SQL injection, XSS, eval en todo el código
4. [ ] **File Size Check** — Archivos grandes en todo el repo
5. [ ] **Sensitive Files** — .env, *.pem, *.key en todo el repo

**SECURITY GATE BÁSICO:**
```
╔════════════════════════════════════════════════════════════╗
║              🔒 SECURITY GATE (Full Codebase)              ║
╠════════════════════════════════════════════════════════════╣
║  Secrets Detection     {✅|⛔}                              ║
║  Dependency Audit      {✅|⚠️|⛔}                           ║
║  Code Patterns         {✅|⛔}                              ║
║  File Size             {✅|⚠️|⛔}                           ║
║  Sensitive Files       {✅|⛔}                              ║
╠════════════════════════════════════════════════════════════╣
║  RESULTADO: {PASS|FAIL}                                    ║
╚════════════════════════════════════════════════════════════╝
```

**Paso 2: Invocar @security para revisión profunda**

> Si @security no fue activado en `/genesis` → fallback a checks básicos con warning:
> "⚠️ @security no disponible. Solo se ejecutaron checks básicos."

Si @security está disponible, invocar con protocolo RADAR:

```
@security — DEEP REVIEW del ambiente qa/

Contexto:
- Ambiente: qa/ (.worktrees/environments/qa/)
- Features incluidos: {lista}
- Tipo de proyecto: {tipo}

Scope de revisión:
1. STRIDE Threat Modeling del sistema completo
2. OWASP Top 10 verification
3. Auth/AuthZ review
4. Secrets management audit
5. Compliance check
6. Cross-feature attack surface analysis
7. Dependency supply chain review

Output esperado: Security Review Report
```

**Blocking logic:**
| Resultado | Acción |
|-----------|--------|
| Basic checks FAIL | → **BLOCKED** |
| @security CRITICAL findings | → **BLOCKED** |
| @security HIGH sin mitigación | → **BLOCKED** |
| @security solo MEDIUM/LOW | → **PASS** con warnings |

#### 4E.2 ACCESSIBILITY GATE + @ux-accessibility FULL AUDIT

> **Solo si el proyecto tiene UI** (detectado en Phase 1E)
> Si no hay UI → "Accessibility Gate: N/A (no UI)"

**Paso 1: Accessibility Gate básico (codebase COMPLETO en qa/)**

1. [ ] **Estructura/Semántica** — HTML semántico en todos los componentes
2. [ ] **Navegación Teclado** — Todos los interactivos focuseables
3. [ ] **Formularios** — Todos los inputs con labels
4. [ ] **ARIA** — Todos los modales, estados dinámicos

**ACCESSIBILITY GATE BÁSICO:**
```
╔════════════════════════════════════════════════════════════╗
║           ♿ ACCESSIBILITY GATE (Full Codebase)             ║
╠════════════════════════════════════════════════════════════╣
║  Estructura/Semántica    {✅|⛔}                            ║
║  Navegación Teclado      {✅|⛔}                            ║
║  Formularios             {✅|⛔}                            ║
║  ARIA                    {✅|⚠️|⛔}                         ║
╠════════════════════════════════════════════════════════════╣
║  RESULTADO: {PASS|FAIL|WARNING}                            ║
╚════════════════════════════════════════════════════════════╝
```

**Paso 2: Invocar @ux-accessibility para audit WCAG completo**

> Si @ux-accessibility no fue activado en `/genesis` → fallback a checks básicos con warning:
> "⚠️ @ux-accessibility no disponible. Solo se ejecutaron checks básicos."

Si @ux-accessibility está disponible, invocar con protocolo RADAR:

```
@ux-accessibility — FULL WCAG AUDIT del ambiente qa/

Contexto:
- Ambiente: qa/ (.worktrees/environments/qa/)
- Features incluidos: {lista}
- Nivel objetivo: {A|AA} (según proyecto)

Scope de revisión:
1. Checklist completo (Structure, Keyboard, Images, Forms, Color, Dynamic)
2. Cross-feature UX consistency
3. Accessibility Audit Report

Output esperado: Accessibility Audit Report
```

**Blocking logic:**
| Resultado | Acción |
|-----------|--------|
| WCAG A violations | → **BLOCKED** |
| Solo WCAG AA | → **CONDITIONAL** |
| Solo AAA/UX | → **PASS** con notas |

### CHECKPOINT
- [ ] Security Gate básico ejecutado (full codebase)
- [ ] @security deep review ejecutado (o fallback documentado)
- [ ] Accessibility Gate básico ejecutado (si UI)
- [ ] @ux-accessibility full audit ejecutado (si UI, o fallback documentado)
- [ ] Resultados y blocking logic aplicados

---

## PHASE 5E: DECISION (ENV MODE)

### GATE IN
- [ ] PHASE 4E completada

### MUST DO

1. [ ] **Consolidar resultados**

   Fuentes:
   - Phase 2E: Full test suite results
   - Phase 3E: Cross-feature integration, regression, build
   - Phase 4E: Security Gate + @security, A11y Gate + @ux-accessibility

2. [ ] **Calcular resultado final**

   | Condición | Resultado |
   |-----------|-----------|
   | Security Gate básico = FAIL | **FAILED** |
   | @security CRITICAL o HIGH sin mitigación | **FAILED** |
   | A11y Gate WCAG A violations | **FAILED** |
   | Full test suite con fallos críticos | **FAILED** |
   | Cross-feature integration FAIL | **FAILED** |
   | Build FAIL | **FAILED** |
   | @security solo MEDIUM/LOW | **CONDITIONAL** |
   | A11y Gate solo WCAG AA | **CONDITIONAL** |
   | Test suite vacía (sin integration/e2e) | **CONDITIONAL** |
   | Features sin QA individual | **CONDITIONAL** |
   | Todo OK | **APPROVED** |

3. [ ] **Mostrar resultado consolidado**

   **Si APPROVED:**
   ```
   ╔════════════════════════════════════════════════════════════╗
   ║              ✅ QA ENV APROBADO                             ║
   ╠════════════════════════════════════════════════════════════╣
   ║  Full Test Suite:        ✅ {n}/{n} pasando                ║
   ║  Cross-Feature:          ✅ Sin conflictos                 ║
   ║  Build:                  ✅ PASS                           ║
   ║  Security Gate:          ✅ PASS                           ║
   ║  @security Deep Review:  ✅ Sin findings críticos          ║
   ║  Accessibility Gate:     ✅ PASS                           ║
   ║  @ux-accessibility Audit:✅ Sin violaciones A              ║
   ╠════════════════════════════════════════════════════════════╣
   ║  Features validados: {n}                                   ║
   ║  👉 Próximo paso: /release                                 ║
   ╚════════════════════════════════════════════════════════════╝
   ```

   **Si FAILED:**
   ```
   ╔════════════════════════════════════════════════════════════╗
   ║              ❌ QA ENV FALLIDO                              ║
   ╠════════════════════════════════════════════════════════════╣
   ║  {Razón principal del fallo}                               ║
   ╠════════════════════════════════════════════════════════════╣
   ║  Blocking issues:                                          ║
   ║  1. {issue bloqueante}                                     ║
   ╠════════════════════════════════════════════════════════════╣
   ║  Acciones requeridas:                                      ║
   ║  1. Corregir en develop                                    ║
   ║  2. /promote --to qa                                       ║
   ║  3. /qa --env qa                                           ║
   ╠════════════════════════════════════════════════════════════╣
   ║  --fix no disponible en ENV MODE.                           ║
   ║  Siga el ciclo: develop → promote → qa --env qa             ║
   ╚════════════════════════════════════════════════════════════╝
   ```

   **Si CONDITIONAL:**
   ```
   ╔════════════════════════════════════════════════════════════╗
   ║              ⚠️ QA ENV CONDICIONAL                         ║
   ╠════════════════════════════════════════════════════════════╣
   ║  Conditions:                                               ║
   ║  1. {condición y riesgo}                                   ║
   ╠════════════════════════════════════════════════════════════╣
   ║  El release puede continuar aceptando estos riesgos.       ║
   ║  👉 Próximo paso: /release (documentará condiciones)       ║
   ╚════════════════════════════════════════════════════════════╝
   ```

4. [ ] **Crear sesión**
   Archivo: `.claude/sessions/YYYY-MM-DD-qa-env-qa.md`
   (Ver formato en REFERENCE.md)

5. [ ] **Si FAILED**
   - **IMPORTANTE**: ENV MODE no soporta `--fix` directo
   - Las correcciones requieren ciclo completo:
     1. Corregir en develop (via /build-feature o edición directa)
     2. `/promote --to qa` (re-sincronizar qa/ con develop corregido)
     3. `/qa --env qa` (re-validar el ambiente completo)
   - El flag `--fix` es ignorado en ENV MODE con warning:
     ```
     ⚠️ --fix no es compatible con ENV MODE.
     ENV MODE valida el estado actual de qa/.
     Las correcciones deben seguir el ciclo completo:
     develop → /promote --to qa → /qa --env qa
     ```

6. [ ] **Comunicar próximo paso**
   - APPROVED → `/release`
   - FAILED → Corregir en develop → `/promote --to qa` → `/qa --env qa`
   - CONDITIONAL → `/release` (documentará condiciones)

### CHECKPOINT
- [ ] Resultado consolidado calculado
- [ ] Resultado mostrado
- [ ] Sesión creada
- [ ] Próximo paso comunicado

---

## FINAL CHECKPOINT (ENV MODE)

Antes de terminar en env mode, verificar:

- [ ] Full test suite ejecutada (unit + integration + e2e)
- [ ] Cross-feature integration verificada
- [ ] Security Gate básico ejecutado (OBLIGATORIO)
- [ ] @security deep review ejecutado (o fallback documentado)
- [ ] Accessibility Gate ejecutado (si UI)
- [ ] @ux-accessibility full audit ejecutado (si UI, o fallback documentado)
- [ ] Resultado claro: APPROVED | FAILED | CONDITIONAL
- [ ] `.claude/sessions/YYYY-MM-DD-qa-env-qa.md` existe
- [ ] Próximo paso comunicado (/release si APPROVED)
