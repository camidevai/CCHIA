# Guía Completa: Flujo de /qa

> Documentación detallada del proceso de Quality Assurance del framework InformatiK-AI.

## Índice

- [Visión General](#visión-general)
- [Parámetros](#parámetros)
- [Paso 1: Identificar Contexto](#paso-1-identificar-contexto)
- [Paso 1.5: Seleccionar Ambiente](#paso-15-seleccionar-ambiente-de-pruebas)
- [Paso 2: Ejecutar Tests](#paso-2-ejecutar-tests)
- [Paso 3: Análisis Estático](#paso-3-análisis-estático)
- [Paso 4: Verificación de ACs](#paso-4-verificación-de-acs)
- [Paso 5: Reporte de Calidad](#paso-5-reporte-de-calidad)
- [Paso 5.5: Security Gate](#paso-55-security-gate-obligatorio)
- [Paso 5.6: Accessibility Gate](#paso-56-accessibility-gate)
- [Paso 6: Decisión Final](#paso-6-decisión-final)
- [ENV MODE: QA de Integración](#env-mode-qa-de-integración-qa---env-qa)
- [Agent @qa](#agent-qa)
- [Iteración y Corrección](#iteración-y-corrección)
- [Ejemplo Práctico](#ejemplo-práctico-videobackground)
- [Resumen Visual](#resumen-visual)

---

## Visión General

El skill `/qa` es el **guardián de calidad** del framework. Verifica que el código implementado cumple todos los estándares antes de permitir el merge. Ejecuta tests, análisis estático, Security Gate y Accessibility Gate.

### Características Principales

| Aspecto | Descripción |
|---------|-------------|
| **Input** | Issue implementado por /build-feature |
| **Ejecutor** | Agent @qa con protocolo RADAR |
| **Gates Obligatorios** | Security Gate + Accessibility Gate (si UI) |
| **Output** | Reporte de QA (APROBADO/RECHAZADO) |

### Ubicación en el Flujo

```
[✓] /genesis        → Infraestructura del proyecto
[✓] /brainstorming  → Diseño de la feature
[✓] /create-issues  → Issues accionables
[✓] /build-feature  → Código implementado
[→] /qa             ← ESTÁS AQUÍ
[ ] /merge          → Integración
```

### Flujo de Gates

```
Inicio QA
    │
    ├─► Tests & Linting
    │       │
    │       ▼
    ├─► Security Gate ──► ¿PASS? ──► NO ──► RECHAZO
    │                        │
    │                       YES
    │                        │
    ├─► Accessibility Gate ► ¿PASS? ──► NO ──► RECHAZO
    │   (si UI)                 │
    │                          YES
    │                           │
    └─► Verificar ACs ──────────┴──► APROBADO
```

---

## Parámetros

| Parámetro | Requerido | Descripción | Ejemplo |
|-----------|-----------|-------------|---------|
| `--issue {número}` | ❌ | Issue a validar (usa el último en progreso) | `--issue 001` |
| `--fix` | ❌ | Intentar corregir errores automáticamente | `--fix` |
| `--env {qa}` | ❌ | Ejecutar en ambiente QA formal | `--env qa` |

### Ejemplos de Uso

```bash
# Básico (usa issue en progreso)
/qa

# Issue específico
/qa --issue 001

# Con corrección automática
/qa --issue 001 --fix

# En ambiente QA formal
/qa --issue 001 --env qa
```

---

## Paso 1: Identificar Contexto

### Búsqueda del Issue

Si no se especifica issue, busca el más reciente en progreso:

```bash
# Buscar en in-progress
ls -t .claude/issues/in-progress/*.md | head -1
```

### Carga de Información

| Fuente | Información |
|--------|-------------|
| Issue | User Story, ACs, DoD |
| Sesión build-feature | Archivos modificados |
| Proyecto | Configuración de tests |

```
📋 Cargando contexto para QA...

Issue: #001 - Crear componente VideoBackground
Archivos modificados:
  - src/components/HeroSection/VideoBackground.tsx
  - src/components/HeroSection/VideoBackground.test.tsx
  - src/components/HeroSection/index.ts

Stack detectado: React + TypeScript + Vitest
```

---

## Paso 1.5: Seleccionar Ambiente de Pruebas

### Si Worktrees Están Habilitados

```
¿Dónde deseas ejecutar las pruebas?

a) Worktree de feature (rápido)
   → Prueba cambios en aislamiento
   → Ideal para desarrollo iterativo

b) Ambiente QA formal
   → Sincroniza ambiente QA con develop + cambios
   → Simula entorno de pre-producción
   → Recomendado antes de merge
```

### Opción A: Worktree de Feature

```bash
cd .worktrees/features/feature-001-video-background
# Ejecutar tests aquí
npm test
```

**Ventajas:**
- Rápido
- Cambios aislados
- Ideal para iteración

### Opción B: Ambiente QA Formal

```bash
# Sincronizar QA con develop
cd .worktrees/environments/qa
git fetch origin develop
git reset --hard origin/develop

# Merge del feature branch para probar
git merge feature/001-video-background --no-commit

# Ejecutar tests
npm test

# Si OK, limpiar para próxima prueba
git reset --hard origin/develop
```

**Ventajas:**
- Simula pre-producción
- Detecta conflictos con develop
- Recomendado antes de merge final

### Resultado

```
🧪 Ambiente de pruebas: Worktree feature-001-video-background
   Path: .worktrees/features/feature-001-video-background
```

---

## Paso 2: Ejecutar Tests

### Detección de Stack

| Archivo | Stack | Comando |
|---------|-------|---------|
| `package.json` + vitest | Vitest | `npx vitest run` |
| `package.json` + jest | Jest | `npm test` |
| `requirements.txt` | Python | `pytest` |
| `go.mod` | Go | `go test ./...` |
| `Cargo.toml` | Rust | `cargo test` |

### Ejecución

```bash
# JavaScript/TypeScript (Vitest)
npx vitest run --reporter=verbose

# JavaScript/TypeScript (Jest)
npm test -- --coverage

# Python
pytest --cov=src -v

# Go
go test ./... -v -cover

# Rust
cargo test -- --nocapture
```

### Captura de Resultados

```
📊 Resultados de Tests:

Tests ejecutados: 12
  ✓ Pasando: 11
  ✗ Fallando: 1
  ◌ Cobertura: 87%

Tiempo: 2.3s

Test fallando:
  ✗ VideoBackground.test.tsx > should apply custom className
    Expected: "custom-class"
    Received: undefined
```

---

## Paso 3: Análisis Estático

### Linting

```bash
# ESLint (JavaScript/TypeScript)
npm run lint
# o
npx eslint src/ --format=stylish

# Ruff (Python)
ruff check .

# golangci-lint (Go)
golangci-lint run

# Clippy (Rust)
cargo clippy
```

### Type Checking

```bash
# TypeScript
npx tsc --noEmit

# Python (mypy)
mypy src/

# Python (pyright)
pyright
```

### Resultados

```
📝 Análisis Estático:

Linting:
  ✓ Sin errores
  ⚠ 2 warnings (no-unused-vars)

Types:
  ✓ Sin errores de tipos
```

---

## Paso 4: Verificación de ACs

### Proceso de Verificación

Para cada Criterio de Aceptación:

1. Buscar evidencia en código
2. Buscar test que lo valide
3. Marcar como verificado o pendiente

### Output

```
📋 Verificando Criterios de Aceptación:

[✓] AC1: Acepta props: src, poster, className
    → Verificado en: VideoBackground.tsx:5-9
    → Test: "renders with required props"

[✓] AC2: Video tiene atributos: autoplay, loop, muted, playsinline
    → Verificado en: VideoBackground.tsx:15
    → Test: "renders video with correct attributes"

[✓] AC3: Video cubre 100% con object-fit: cover
    → Verificado en: Tailwind classes línea 14

[✓] AC4: Poster se muestra mientras carga
    → Verificado en: prop poster línea 16

[✓] AC5: Componente es accesible (aria-hidden="true")
    → Verificado en: VideoBackground.tsx:14
    → Test: "is accessible as decorative element"

Resultado: 5/5 ACs verificados ✓
```

### Si Falta un AC

```
[✗] AC3: Video cubre 100% con object-fit: cover
    → No encontrado en código
    → Falta: Agregar clase object-cover al video element

Resultado: 4/5 ACs verificados ✗
```

---

## Paso 5: Reporte de Calidad

### Reporte Intermedio

```
🔍 Reporte de QA - Issue #001

📊 Tests:
   ✓ 11 tests pasando
   ✗ 1 test fallando
   ◌ 87% cobertura

📝 Linting:
   ✓ Sin errores
   ⚠ 2 warnings

🔤 Types:
   ✓ Sin errores

📋 Criterios de Aceptación:
   ✓ 5/5 verificados

Continuando con Security Gate...
```

---

## Paso 5.5: Security Gate (OBLIGATORIO)

### Importancia

El Security Gate es **OBLIGATORIO** y se ejecuta **ANTES** de la decisión final. Si falla, QA se rechaza automáticamente, independientemente de que los tests pasen.

### Checks del Security Gate

#### 1. Secrets Detection

Escanea archivos **MODIFICADOS** buscando:

| Patrón | Descripción |
|--------|-------------|
| `api[_-]?key` | API keys |
| `secret` | Secrets |
| `password` | Passwords |
| `token` | Tokens |
| `-----BEGIN.*PRIVATE KEY-----` | Private keys |
| `postgres://.*:.*@` | Database URLs |

```bash
# Comando de ejemplo
grep -rE "(api[_-]?key|secret|password|token)\s*[:=]" \
  --include="*.ts" --include="*.tsx" --include="*.js"
```

#### 2. Dependency Audit

```bash
# Node.js
npm audit --audit-level=high

# Python
pip-audit

# Rust
cargo audit

# Go
govulncheck ./...
```

| Severidad | Acción |
|-----------|--------|
| Critical | BLOQUEANTE |
| High | BLOQUEANTE |
| Medium | WARNING |
| Low | Nota |

#### 3. Code Patterns

| Patrón | Riesgo | Buscar |
|--------|--------|--------|
| SQL concatenado | SQL Injection | `"SELECT.*" + ` |
| `eval()` con input | Code Injection | `eval(` |
| `innerHTML =` | XSS | `innerHTML\s*=` |
| `dangerouslySetInnerHTML` | XSS | Sin sanitización |

```bash
# Buscar patrones peligrosos
grep -rE "innerHTML\s*=" --include="*.tsx"
grep -rE "eval\(" --include="*.ts"
grep -rE "dangerouslySetInnerHTML" --include="*.tsx"
```

#### 4. File Size Check

| Tamaño | Resultado |
|--------|-----------|
| < 1MB | OK |
| 1MB - 10MB | WARNING |
| > 10MB | BLOQUEANTE |

#### 5. Sensitive Files

Archivos que **NUNCA** deben estar en stage:

```
.env
.env.*
*.pem
*.key
*.p12
credentials.json
secrets.yaml
```

### Resultado: Security Gate APROBADO

```
╔══════════════════════════════════════════════════════════════╗
║                    🔒 SECURITY GATE                          ║
╠══════════════════════════════════════════════════════════════╣
║  Estado: ✅ APROBADO                                         ║
╠══════════════════════════════════════════════════════════════╣
║  Secrets Detection     ✅ Sin secrets detectados             ║
║  Dependency Audit      ✅ Sin vulnerabilidades críticas      ║
║  Code Patterns         ✅ Sin patrones peligrosos            ║
║  File Size             ✅ Todos los archivos OK              ║
║  Sensitive Files       ✅ Sin archivos sensibles             ║
╚══════════════════════════════════════════════════════════════╝
```

### Resultado: Security Gate BLOQUEADO

```
╔══════════════════════════════════════════════════════════════╗
║                    🔒 SECURITY GATE                          ║
╠══════════════════════════════════════════════════════════════╣
║  Estado: ⛔ BLOQUEADO                                        ║
╠══════════════════════════════════════════════════════════════╣
║  Secrets Detection     ⛔ FALLO                              ║
║  ├─ src/config/api.ts:12                                     ║
║  └─ Detectado: API_KEY hardcodeada                           ║
║                                                              ║
║  Dependency Audit      ⛔ FALLO                              ║
║  ├─ lodash@4.17.20                                           ║
║  └─ CVE-2021-23337 (HIGH)                                    ║
╠══════════════════════════════════════════════════════════════╣
║  ⛔ MERGE BLOQUEADO hasta resolver problemas de seguridad    ║
║                                                              ║
║  Acciones requeridas:                                        ║
║  1. Mover API_KEY a variable de entorno                      ║
║  2. Actualizar lodash: npm update lodash                     ║
║                                                              ║
║  Ejecutar /qa de nuevo después de corregir.                  ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Paso 5.6: Accessibility Gate

### Cuándo Aplica

Se ejecuta **si el proyecto tiene UI** (detecta archivos `.tsx`, `.jsx`, `.vue`, `.svelte`).

### Checklist de Accesibilidad

#### 1. Estructura y Semántica

| Verificación | Criterio WCAG |
|--------------|---------------|
| HTML semántico (header, nav, main, footer) | 1.3.1 (A) |
| Headings en orden lógico (h1 → h2 → h3) | 1.3.1 (A) |
| Landmarks identifican regiones | 1.3.1 (A) |
| Listas usan ul/ol/dl apropiadamente | 1.3.1 (A) |

#### 2. Navegación por Teclado

| Verificación | Criterio WCAG |
|--------------|---------------|
| Todos los interactivos son focuseables | 2.1.1 (A) |
| Orden de tab es lógico | 2.4.3 (A) |
| Focus visible en todos los estados | 2.4.7 (AA) |
| No hay trampas de focus | 2.1.2 (A) |

#### 3. Formularios

| Verificación | Criterio WCAG |
|--------------|---------------|
| Inputs tienen labels asociados | 1.3.1 (A) |
| Errores identifican el campo | 3.3.1 (A) |
| Required indicado visualmente y con aria | 3.3.2 (A) |

#### 4. Imágenes y Media

| Verificación | Criterio WCAG |
|--------------|---------------|
| Imágenes informativas tienen alt | 1.1.1 (A) |
| Imágenes decorativas tienen alt="" | 1.1.1 (A) |
| Videos tienen captions | 1.2.2 (A) |

#### 5. ARIA en Componentes Dinámicos

| Verificación | Criterio WCAG |
|--------------|---------------|
| Modales con focus management | 2.4.3 (A) |
| Estados comunicados (aria-expanded) | 4.1.2 (A) |
| Live regions para contenido dinámico | 4.1.3 (AA) |

#### 6. Contraste

```
WCAG AA:
├─ Texto normal: ratio ≥ 4.5:1
├─ Texto grande (18px bold / 24px): ratio ≥ 3:1
└─ Componentes UI: ratio ≥ 3:1
```

### Resultado: Accessibility Gate APROBADO

```
╔══════════════════════════════════════════════════════════════╗
║                 ♿ ACCESSIBILITY GATE                         ║
╠══════════════════════════════════════════════════════════════╣
║  Estado: ✅ APROBADO                                         ║
╠══════════════════════════════════════════════════════════════╣
║  Estructura/Semántica    ✅ HTML semántico correcto          ║
║  Navegación Teclado      ✅ Todos los elementos accesibles   ║
║  Formularios             ✅ Labels y errores correctos       ║
║  Imágenes/Media          ✅ Alt text apropiado               ║
║  ARIA                    ✅ Roles y estados correctos        ║
║  Contraste               ✅ Ratios cumplen WCAG AA           ║
╚══════════════════════════════════════════════════════════════╝
```

### Resultado: Accessibility Gate BLOQUEADO (Nivel A)

```
╔══════════════════════════════════════════════════════════════╗
║                 ♿ ACCESSIBILITY GATE                         ║
╠══════════════════════════════════════════════════════════════╣
║  Estado: ⛔ BLOQUEADO                                        ║
╠══════════════════════════════════════════════════════════════╣
║  Navegación Teclado      ⛔ FALLO                            ║
║  ├─ VideoBackground.tsx: <div onClick> no accesible          ║
║  └─ WCAG 2.1.1 (Nivel A) - BLOQUEANTE                        ║
╠══════════════════════════════════════════════════════════════╣
║  ⛔ MERGE BLOQUEADO hasta resolver problemas de a11y         ║
║                                                              ║
║  Acciones requeridas:                                        ║
║  1. Cambiar <div onClick> por <button>                       ║
║  2. O agregar role="button" tabindex="0" onKeyDown           ║
║                                                              ║
║  Para dudas, invocar @ux-accessibility                       ║
║  Ejecutar /qa de nuevo después de corregir.                  ║
╚══════════════════════════════════════════════════════════════╝
```

### Resultado: Accessibility Gate CONDICIONAL (Nivel AA)

```
╔══════════════════════════════════════════════════════════════╗
║                 ♿ ACCESSIBILITY GATE                         ║
╠══════════════════════════════════════════════════════════════╣
║  Estado: ⚠️ CONDICIONAL                                      ║
╠══════════════════════════════════════════════════════════════╣
║  Contraste               ⚠️ WARNING                          ║
║  ├─ HeroContent.tsx:23: ratio 4.2:1 (requiere 4.5:1)        ║
║  └─ WCAG 1.4.3 (Nivel AA) - Importante pero no bloqueante   ║
╠══════════════════════════════════════════════════════════════╣
║  ⚠️ Puede proceder a merge, pero se recomienda corregir     ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Paso 6: Decisión Final

### Matriz de Decisión

| Tests | Linting | Security | A11y | ACs | Resultado |
|-------|---------|----------|------|-----|-----------|
| ✅ | ✅ | ✅ | ✅ | ✅ | **APROBADO** |
| ✅ | ✅ | ✅ | ⚠️ | ✅ | **CONDICIONAL** |
| ✅ | ✅ | ⛔ | - | - | **RECHAZADO** |
| ✅ | ✅ | ✅ | ⛔ | - | **RECHAZADO** |
| ⛔ | - | - | - | - | **RECHAZADO** |

### QA APROBADO

```
✅ QA Aprobado

Todos los tests pasan, sin errores de linting ni types,
todos los Criterios de Aceptación están verificados,
Security Gate y Accessibility Gate han sido superados.

🧪 Probado en: Worktree feature-001-video-background
🔒 Security Gate: APROBADO
♿ Accessibility Gate: APROBADO

📊 Resumen:
   Tests: 12/12 pasando (87% cobertura)
   Linting: 0 errores, 2 warnings
   Types: 0 errores
   ACs: 5/5 verificados

📍 Progreso del flujo:
   [✓] Génesis
   [✓] Brainstorming
   [✓] Crear Issues
   [✓] Build Feature
   [✓] QA ← aprobado
   [ ] Merge

👉 Próximo paso: /merge --issue 001
```

### QA RECHAZADO

```
❌ QA Rechazado

Se encontraron los siguientes problemas:

🔴 Bloqueantes:

1. Security Gate:
   - src/config/api.ts:12: API_KEY hardcodeada

2. Test fallando:
   - VideoBackground.test.tsx:45
     "should apply custom className"
     Expected: "custom-class"
     Received: undefined

🟡 Warnings:

1. Linting:
   - src/components/HeroSection/index.ts:3
     'VideoBackground' is defined but never used

📋 ACs pendientes:
   - AC3: Video cubre 100% con object-fit: cover
     → Falta clase object-cover

¿Deseas que intente corregirlos? (sí/no)
```

---

## ENV MODE: QA de Integración (`/qa --env qa`)

### Cuándo Usar

El modo ENV se ejecuta **después** de `/promote --to qa` y **antes** de `/release`. Valida la integración de todos los features promovidos al ambiente qa/ como un conjunto.

```
/build-feature → /qa → /merge  (por cada feature, standard mode)
         │
         ▼
/promote --to qa  (sincronizar qa/ con develop)
         │
         ▼
/qa --env qa  ← ENV MODE (validación formal de integración)
         │
         ▼
/release  (gated por resultado de qa-env)
```

### Prerrequisitos

| Requisito | Verificación |
|-----------|--------------|
| Sistema worktrees inicializado | `.worktrees/.meta/config.json` existe |
| Ambiente qa/ existe | `.worktrees/environments/qa/` existe |
| Promoción reciente | `promotions.json` tiene entrada para qa |
| Tests ejecutables en qa/ | Stack detectado, herramientas instaladas |

### Fases 1E-5E (Resumen)

El SKILL.md de /qa contiene las fases detalladas. Aquí el resumen:

| Fase | Descripción | Diferencia vs Standard |
|------|-------------|----------------------|
| **1E** | Contexto de integración | Lee promotions.json, identifica TODOS los features promovidos |
| **2E** | Full test suite | Ejecuta tests COMPLETOS en qa/, no solo del feature |
| **3E** | Cross-feature integration | Verifica que features no colisionan entre sí |
| **4E** | @security deep review | Invoca @security (STRIDE + OWASP + Compliance), no solo Security Gate básico |
| **5E** | @ux-accessibility full audit | Invoca @ux-accessibility checklist completo + cross-feature UX consistency |

### Invocación de Agentes

| Agente | Standard `/qa` | ENV `/qa --env qa` |
|--------|---------------|-------------------|
| @security | No invocado (Security Gate básico) | Invocado: deep review STRIDE + OWASP |
| @ux-accessibility | No invocado (Accessibility Gate básico) | Invocado: full WCAG audit |

Los agentes siguen protocolo RADAR. Si no están disponibles, fallback a checks básicos.

### Resultado y Gate para /release

| Resultado | Efecto en /release |
|-----------|-------------------|
| PASSED | Release puede proceder |
| CONDITIONAL | Release con warning |
| FAILED | Release bloqueado |
| NOT RUN | Release con warning |

### Sesión Generada

Archivo: `.claude/sessions/YYYY-MM-DD-qa-env-qa.md`

> Referencia completa: `.claude/skills/qa/SKILL.md` (secciones MODE ROUTER y Phases 1E-5E)

---

## Agent @qa

### Identidad y Propósito

| Responsable de | NO responsable de |
|----------------|-------------------|
| Verificar ACs se cumplen | Implementar código |
| Ejecutar suite de tests | Decisiones arquitectónicas |
| Análisis estático | Definir políticas de seguridad |
| Ejecutar Security Gate | Inventar requisitos adicionales |
| Aprobar/rechazar para merge | |

### Protocolo RADAR Aplicado

| Fase | Acción del @qa |
|------|----------------|
| **Read** | Lee issue, ACs, código implementado |
| **Analyze** | Determina qué verificar y cómo |
| **Decide** | Establece criterios de pass/fail |
| **Act** | Ejecuta Security Gate PRIMERO, luego tests |
| **Report** | Genera reporte estructurado |

### Criterios de Decisión

| Categoría | PASS | FAIL |
|-----------|------|------|
| ACs | Todos cumplidos | Cualquiera falta |
| Tests | Todos pasan | Cualquiera falla |
| Security Gate | Aprobado | Cualquier blocker |
| A11y (Nivel A) | Aprobado | Cualquier violación |
| Linting | Sin errores críticos | Errores críticos |

### Niveles de Severidad

| Nivel | Impacto | Acción |
|-------|---------|--------|
| **Blocker** | Impide aprobación | RECHAZAR QA |
| **Major** | Debe corregirse | Aprobar con condiciones |
| **Minor** | Nice to have | Nota en reporte |

### Restricciones Absolutas

**NUNCA:**
- Aprueba con bloqueantes pendientes
- Aprueba si Security Gate falla
- Aprueba si A11y Gate falla (nivel A)
- Inventa requisitos adicionales a los ACs
- Es perfeccionista sin justificación
- Omite el Security Gate

**SIEMPRE:**
- Ejecuta Security Gate primero
- Verifica cada AC con evidencia
- Documenta su razonamiento
- Clasifica problemas por severidad
- Sugiere cómo corregir problemas
- Genera reporte estructurado

---

## Iteración y Corrección

### Flujo de Corrección

```
QA Falla
    │
    ├─► Usuario: "Sí, intenta corregir"
    │       │
    │       ├─► Invocar @developer
    │       ├─► Aplicar correcciones
    │       └─► Re-ejecutar /qa
    │
    └─► Usuario: "No"
            │
            └─► Finalizar con lista de errores
```

### Límite de Iteraciones

- **Máximo 3 iteraciones automáticas**
- Si persisten errores después de 3 intentos → intervención manual

```
⚠️ Límite de iteraciones alcanzado

Se han realizado 3 intentos de corrección automática.
Los siguientes problemas persisten:

  - Test "should apply className" sigue fallando

Se requiere intervención manual.
```

### Correcciones Automáticas Soportadas

| Problema | Corrección Automática |
|----------|----------------------|
| Unused imports | Eliminar imports |
| Missing semicolons | Agregar semicolons |
| Formatting issues | Ejecutar prettier |
| Simple type errors | Agregar tipos faltantes |

| Problema | Requiere Intervención |
|----------|----------------------|
| Lógica incorrecta | Manual |
| Tests con asserts incorrectos | Manual |
| Vulnerabilidades de seguridad | Manual |
| Problemas de arquitectura | Manual |

---

## Ejemplo Práctico: VideoBackground

### Contexto

Issue #001 implementado, ejecutando QA.

### Flujo Completo

```
/qa --issue 001
        │
        ├─► Paso 1: Identificar Contexto
        │     Issue: #001 - VideoBackground
        │     Archivos: 3 modificados
        │     Stack: React + Vitest
        │
        ├─► Paso 1.5: Seleccionar Ambiente
        │     Usuario elige: (a) Worktree feature
        │
        ├─► Paso 2: Ejecutar Tests
        │     npx vitest run
        │     ✓ 5/5 tests pasando
        │     ◌ 92% cobertura
        │
        ├─► Paso 3: Análisis Estático
        │     ESLint: ✓ 0 errores
        │     TypeScript: ✓ 0 errores
        │
        ├─► Paso 4: Verificación de ACs
        │     ✓ 5/5 ACs verificados
        │
        ├─► Paso 5.5: Security Gate
        │     ┌─────────────────────────┐
        │     │ 🔒 SECURITY GATE        │
        │     │ Estado: ✅ APROBADO     │
        │     └─────────────────────────┘
        │
        ├─► Paso 5.6: Accessibility Gate
        │     ┌─────────────────────────┐
        │     │ ♿ ACCESSIBILITY GATE   │
        │     │ Estado: ✅ APROBADO     │
        │     │ aria-hidden correcto    │
        │     └─────────────────────────┘
        │
        └─► Paso 6: Decisión
              ✅ QA APROBADO
              👉 Próximo: /merge --issue 001
```

### Reporte Generado

```markdown
## Verificación QA completada

### Issue: #001 - Crear componente VideoBackground
### Resultado: ✅ APROBADO

### Security Gate: ✅ APROBADO
- Secrets Detection: Sin secrets
- Dependency Audit: Sin vulnerabilidades
- Code Patterns: Sin patrones peligrosos

### Accessibility Gate: ✅ APROBADO
- aria-hidden="true" correcto para video decorativo
- Sin interactivos que requieran teclado

### Verificaciones
| Categoría | Estado | Detalles |
|-----------|--------|----------|
| Tests | ✅ PASS | 5/5 pasando, 92% cobertura |
| Linting | ✅ PASS | 0 errores |
| Types | ✅ PASS | 0 errores |
| ACs | ✅ PASS | 5/5 verificados |

### Criterios de Aceptación
- [x] AC1: Acepta props: src, poster, className
      → VideoBackground.tsx:5-9
- [x] AC2: Video tiene autoplay, loop, muted, playsinline
      → VideoBackground.tsx:15
- [x] AC3: Video cubre 100% con object-fit: cover
      → Tailwind: object-cover w-full h-full
- [x] AC4: Poster se muestra mientras carga
      → prop poster en video element
- [x] AC5: Componente es accesible
      → aria-hidden="true"

### Próximo paso
/merge --issue 001
```

### Registro de Sesión

```markdown
# Sesión: QA - Issue #001
Fecha: 2026-01-28T17:00:00
Skill: /qa

## Resumen
QA aprobado para Issue #001 - VideoBackground component.

## Ambiente de pruebas
- Tipo: Worktree feature
- Path: .worktrees/features/feature-001-video-background

## Resultados de tests
- Total: 5
- Pasando: 5
- Fallando: 0
- Cobertura: 92%

## Análisis estático
- Linting: 0 errores
- Types: 0 errores

## Security Gate
- Resultado: APROBADO
- Secrets Detection: ✅
- Dependency Audit: ✅
- Code Patterns: ✅

## Accessibility Gate
- Resultado: APROBADO
- Estructura: ✅
- ARIA: ✅ (aria-hidden correcto)

## Criterios de Aceptación
| AC | Estado | Evidencia |
|----|--------|-----------|
| Props | ✅ | VideoBackground.tsx:5-9 |
| Video attrs | ✅ | VideoBackground.tsx:15 |
| object-fit | ✅ | Tailwind classes |
| Poster | ✅ | prop poster |
| Accesible | ✅ | aria-hidden="true" |

## Próximo paso sugerido
/merge --issue 001
```

---

## Resumen Visual

```
/qa --issue 001
    │
    ├─► Paso 1: Identificar Contexto
    │       │
    │       ├─► Cargar issue
    │       ├─► Cargar archivos modificados
    │       └─► Detectar stack
    │
    ├─► Paso 1.5: Seleccionar Ambiente
    │       │
    │       ├─► (a) Worktree feature
    │       └─► (b) Ambiente QA formal
    │
    ├─► Paso 2: Ejecutar Tests
    │       │
    │       └─► vitest/jest/pytest/go test
    │
    ├─► Paso 3: Análisis Estático
    │       │
    │       ├─► Linting (eslint/ruff)
    │       └─► Types (tsc/mypy)
    │
    ├─► Paso 4: Verificar ACs
    │       │
    │       └─► Cada AC con evidencia
    │
    ├─► Paso 5: Reporte Intermedio
    │
    ├─► Paso 5.5: Security Gate (OBLIGATORIO)
    │       │
    │       ├─► Secrets Detection
    │       ├─► Dependency Audit
    │       ├─► Code Patterns
    │       ├─► File Size
    │       └─► Sensitive Files
    │
    ├─► Paso 5.6: Accessibility Gate (si UI)
    │       │
    │       ├─► Estructura/Semántica
    │       ├─► Navegación Teclado
    │       ├─► Formularios
    │       ├─► Imágenes/Media
    │       ├─► ARIA
    │       └─► Contraste
    │
    └─► Paso 6: Decisión Final
            │
            ├─► Todo OK → APROBADO → /merge
            │
            └─► Errores → RECHAZADO
                    │
                    ├─► ¿Corregir? Sí → @developer → /qa
                    └─► ¿Corregir? No → Fin
```

---

## Validaciones por Stack

### React/Next.js

| Check | Herramienta |
|-------|-------------|
| Tests | Vitest / Jest + RTL |
| Linting | ESLint + eslint-plugin-react |
| Types | TypeScript |
| A11y | eslint-plugin-jsx-a11y |

### API/Backend (Node.js)

| Check | Herramienta |
|-------|-------------|
| Tests | Jest / Vitest + Supertest |
| Linting | ESLint |
| Types | TypeScript |
| Security | npm audit |

### Python

| Check | Herramienta |
|-------|-------------|
| Tests | pytest |
| Linting | Ruff |
| Types | mypy / pyright |
| Security | pip-audit |

---

## Troubleshooting

### "Security Gate falla pero es falso positivo"

**Síntoma:** Detecta "secret" en código que no es realmente un secret.

**Solución:**
1. Agregar comentario `// nosec` o `# nosec`
2. Documentar en sesión la excepción
3. Verificar manualmente que no es un secret real

### "Test pasa localmente pero falla en QA"

**Síntoma:** Inconsistencia entre ambientes.

**Solución:**
1. Verificar que ambos usan mismo Node/Python version
2. Limpiar cache: `npm ci` o `pip install -r requirements.txt`
3. Usar ambiente QA formal para consistencia

### "Accessibility Gate bloquea pero no hay UI visible"

**Síntoma:** Componente es decorativo pero marcado como error.

**Solución:**
1. Agregar `aria-hidden="true"` a elementos decorativos
2. O usar `role="presentation"`
3. Documentar en issue que es intencional

### "QA aprueba pero /merge detecta problemas"

**Síntoma:** Inconsistencia entre QA y merge.

**Solución:**
1. Verificar que QA usó ambiente correcto
2. Re-ejecutar `/qa --env qa` antes de merge
3. Verificar que no hubo cambios entre QA y merge

---

## Referencias

- Skill QA: `.claude/skills/qa/SKILL.md`
- Agent QA: `.claude/agents/qa.md`
- Security Gate: `.claude/security/SECURITY-GATE.md`
- Agent UX-Accessibility: `.claude/agents/ux-accessibility.md`
- Template de Sesión: `.claude/skills/_common/session-template.md`
- Guía Build Feature: `.claude/docs/guides/build-feature-flow-guide.md`
- Siguiente Skill: `.claude/skills/merge/SKILL.md`
