# QA Standard Mode - Individual Feature QA

> Este archivo contiene las fases 1-5 para QA de features individuales.
> Se carga cuando se ejecuta `/qa --issue N` o `/qa` sin parámetro `--env`.

---

## PHASE 1: CONTEXT

### GATE IN
- [ ] Existe issue en progreso o se especificó `--issue`

### MUST DO

1. [ ] **Identificar issue**
   - Si `--issue` especificado → Usar ese
   - Si no → Buscar último issue en `.claude/issues/in-progress/`
   - Si no hay ninguno → STOP: "No hay issue en progreso"

2. [ ] **Cargar datos del issue**
   - User Story
   - Criterios de Aceptación
   - Definition of Done

3. [ ] **Cargar sesión de build-feature**
   - Leer `.claude/sessions/*-build-feature-{issue}.md`
   - Extraer archivos modificados

4. [ ] **Seleccionar ambiente** (si worktrees habilitados)
   ```
   ¿Dónde ejecutar pruebas?
   a) Worktree de feature (rápido)
   b) Ambiente QA formal (pre-merge)
   ```

### CHECKPOINT
- [ ] Issue identificado
- [ ] ACs cargados
- [ ] Archivos modificados conocidos
- [ ] Ambiente seleccionado

---

## PHASE 2: TESTING

### GATE IN
- [ ] PHASE 1 completada

### MUST DO

1. [ ] **Ejecutar tests**
   Según stack detectado:

   **Algoritmo de detección de stack:**
   ```bash
   # Detección por archivos de configuración:
   if [ -f "package.json" ]; then STACK="node"; fi
   if [ -f "pyproject.toml" ] || [ -f "requirements.txt" ]; then STACK="python"; fi
   if [ -f "go.mod" ]; then STACK="go"; fi
   if [ -f "Cargo.toml" ]; then STACK="rust"; fi

   # Multi-stack: si se detectan múltiples, ejecutar tests de cada uno
   # Si no se detecta stack: WARNING y solicitar configuración manual
   ```

   > **Validación de herramientas**: Si el stack detecta npm pero `npm --version` falla,
   > mostrar: "npm detectado en package.json pero no instalado."

   ```bash
   # Node.js
   npm test

   # Python
   pytest

   # Go
   go test ./...

   # Rust
   cargo test
   ```
   Capturar: pasando, fallando, cobertura

2. [ ] **Ejecutar linting**
   ```bash
   # Node.js
   npm run lint

   # Python
   ruff check .
   ```
   Capturar: errores, warnings

3. [ ] **Ejecutar type checking**
   ```bash
   # TypeScript
   npx tsc --noEmit

   # Python
   mypy .
   ```
   Capturar: errores de tipos

4. [ ] **Registrar resultados**
   ```
   📊 Tests: {n} pasando, {n} fallando, {n}% cobertura
   📝 Linting: {n} errores, {n} warnings
   🔤 Types: {n} errores
   ```

### CHECKPOINT
- [ ] Tests ejecutados
- [ ] Linting ejecutado
- [ ] Types verificados
- [ ] Resultados registrados

### IF FAILS
```
❌ Tests/Linting fallaron

{lista de errores}

¿Intentar corrección automática? (--fix)
```

---

## PHASE 3: VERIFICATION

### GATE IN
- [ ] PHASE 2 completada

### MUST DO

1. [ ] **Verificar CADA AC**
   Para cada Criterio de Aceptación:

   | AC | Verificación | Estado |
   |----|--------------|--------|
   | AC1: {desc} | {archivo:línea o test} | ✓/✗ |
   | AC2: {desc} | {archivo:línea o test} | ✓/✗ |

2. [ ] **Verificar Definition of Done**
   - [ ] Código documentado (si aplica)
   - [ ] Tests incluidos (si aplica)
   - [ ] Sin TODO/FIXME pendientes

3. [ ] **Mostrar estado de ACs**
   ```
   📋 Criterios de Aceptación:

   [✓] AC1: {descripción}
       → Verificado en: {evidencia}

   [✗] AC2: {descripción}
       → No encontrado: {qué falta}
   ```

### CHECKPOINT
- [ ] TODOS los ACs verificados
- [ ] Definition of Done cumplido
- [ ] Resultados documentados

---

## PHASE 4: GATES

> ⛔ **ESTA FASE ES OBLIGATORIA Y NO PUEDE SALTARSE**
> Si Security Gate falla → QA = FAILED (sin excepciones)

### GATE IN
- [ ] PHASE 3 completada

### MUST DO

#### 4.1 SECURITY GATE

> Referencia: `.claude/security/SECURITY-GATE.md`

Ejecutar TODOS los checks:

0. [ ] **Leer excepciones** (si existen)
   - Si `.claude/security/exceptions.yml` existe → cargar excepciones
   - Verificar fechas de expiración: si `expires` < hoy → excepción inválida
   - Excepciones válidas se excluyen de los checks siguientes

1. [ ] **Secrets Detection**
   - Escanear archivos MODIFICADOS
   - Buscar: API keys, tokens, passwords, private keys
   - Resultado: `PASS` | `FAIL`

2. [ ] **Dependency Audit**
   ```bash
   npm audit --audit-level=high  # Node
   pip-audit                      # Python
   cargo audit                    # Rust
   ```
   - Resultado: `PASS` | `FAIL` | `WARNING`

3. [ ] **Code Patterns**
   - SQL concatenado → SQL injection
   - eval() con input → code injection
   - dangerouslySetInnerHTML sin sanitizar → XSS
   - Resultado: `PASS` | `FAIL`

4. [ ] **File Size Check**
   - >1MB → WARNING
   - >10MB → FAIL
   - Resultado: `PASS` | `WARNING` | `FAIL`

5. [ ] **Sensitive Files**
   - .env, *.pem, *.key en stage → FAIL
   - Resultado: `PASS` | `FAIL`

**SECURITY GATE RESULT:**
```
╔════════════════════════════════════════════════════════════╗
║                    🔒 SECURITY GATE                         ║
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

#### 4.2 ACCESSIBILITY GATE (si proyecto tiene UI)

Ejecutar TODOS los checks:

1. [ ] **Estructura/Semántica**
   - HTML semántico (header, nav, main, footer)
   - Headings en orden (h1→h2→h3)
   - Resultado: `PASS` | `FAIL`

2. [ ] **Navegación Teclado**
   - Interactivos son focuseables
   - Tab order lógico
   - Focus visible
   - Resultado: `PASS` | `FAIL`

3. [ ] **Formularios**
   - Inputs tienen labels
   - Errores identifican campo
   - Required indicado
   - Resultado: `PASS` | `FAIL`

4. [ ] **ARIA**
   - Modales con focus management
   - Estados comunicados (aria-expanded)
   - Live regions para contenido dinámico
   - Resultado: `PASS` | `FAIL` | `WARNING`

**ACCESSIBILITY GATE RESULT:**
```
╔════════════════════════════════════════════════════════════╗
║                 ♿ ACCESSIBILITY GATE                        ║
╠════════════════════════════════════════════════════════════╣
║  Estructura/Semántica    {✅|⛔}                            ║
║  Navegación Teclado      {✅|⛔}                            ║
║  Formularios             {✅|⛔}                            ║
║  ARIA                    {✅|⚠️|⛔}                         ║
╠════════════════════════════════════════════════════════════╣
║  RESULTADO: {PASS|FAIL|WARNING}                            ║
╚════════════════════════════════════════════════════════════╝
```

### CHECKPOINT
- [ ] Security Gate ejecutado
- [ ] Security Gate resultado registrado
- [ ] Accessibility Gate ejecutado (si UI)
- [ ] Accessibility Gate resultado registrado

### IF SECURITY GATE FAILS
```
⛔ SECURITY GATE BLOQUEADO

{detalles del problema}

Acciones requeridas:
1. {acción correctiva}

QA RESULTADO = FAILED
Ejecutar /qa de nuevo después de corregir.
```

---

## PHASE 5: DECISION

### GATE IN
- [ ] PHASE 4 completada

### MUST DO

1. [ ] **Calcular resultado final**

   | Condición | Resultado |
   |-----------|-----------|
   | Security Gate = FAIL | **FAILED** |
   | A11y Gate = FAIL (nivel A) | **FAILED** |
   | Tests críticos fallan | **FAILED** |
   | ACs no verificados | **FAILED** |
   | A11y Gate = WARNING | **CONDITIONAL** |
   | Todo OK | **APPROVED** |

2. [ ] **Mostrar resultado**

   **Si APPROVED:**
   ```
   ╔════════════════════════════════════════════════════════════╗
   ║                    ✅ QA APROBADO                          ║
   ╠════════════════════════════════════════════════════════════╣
   ║  Tests:              ✅ {n}/{n} pasando                    ║
   ║  Linting:            ✅ Sin errores                        ║
   ║  ACs:                ✅ {n}/{n} verificados                ║
   ║  Security Gate:      ✅ PASS                               ║
   ║  Accessibility Gate: ✅ PASS                               ║
   ╠════════════════════════════════════════════════════════════╣
   ║  👉 Próximo paso: /merge                                   ║
   ╚════════════════════════════════════════════════════════════╝
   ```

   **Si FAILED:**
   ```
   ╔════════════════════════════════════════════════════════════╗
   ║                    ❌ QA FALLIDO                           ║
   ╠════════════════════════════════════════════════════════════╣
   ║  {Razón principal del fallo}                               ║
   ╠════════════════════════════════════════════════════════════╣
   ║  Acciones requeridas:                                      ║
   ║  1. {acción}                                               ║
   ║  2. {acción}                                               ║
   ╠════════════════════════════════════════════════════════════╣
   ║  ¿Intentar corrección automática? (sí/no)                  ║
   ╚════════════════════════════════════════════════════════════╝
   ```

3. [ ] **Crear sesión**
   Archivo: `.claude/sessions/YYYY-MM-DD-qa-{issue}.md`
   (Ver formato en REFERENCE.md)

### CHECKPOINT
- [ ] Resultado calculado
- [ ] Resultado mostrado
- [ ] Sesión creada
- [ ] Próximo paso comunicado

---

## FINAL CHECKPOINT

Antes de terminar, verificar:

- [ ] Security Gate ejecutado (OBLIGATORIO)
- [ ] Accessibility Gate ejecutado (si UI)
- [ ] Resultado claro: APPROVED | FAILED | CONDITIONAL
- [ ] `.claude/sessions/YYYY-MM-DD-qa-{issue}.md` existe
- [ ] Próximo paso comunicado
