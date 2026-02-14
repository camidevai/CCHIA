# Matriz de Comunicación entre Agents - Auditoría 2026-02-05

## Estado Actual de Contratos

### Contratos Completos (Modelo a seguir)

| Par | Archivo | Contenido | Estado |
|-----|---------|-----------|--------|
| @qa ↔ @security | `security/qa-security-integration.md` | Orden de ejecución, precedencia, formato de invocación, fallbacks | ✅ COMPLETO |

**Este contrato debe servir como modelo para crear los faltantes.**

---

### Contratos Faltantes (Gaps Críticos)

#### Gap 1: @developer ↔ @architect - Feasibility Feedback

**Severidad:** ALTA
**Estado:** NO EXISTE

**Lo que existe:**
- Escalación para NUEVAS decisiones: `"Necesito decisión de arquitectura: {contexto}"`

**Lo que falta:**
- Protocolo para feedback sobre decisiones EXISTENTES
- Formato de "Architecture Feasibility Issue"
- Respuesta esperada de @architect
- Flujo cuando @architect insiste y @developer no puede cumplir

**Propuesta de contrato:**
```markdown
## @developer -> @architect: Feasibility Feedback

**Trigger:** @developer descubre que decisión arquitectónica es impráctica

**Formato de Request:**
## Feasibility Issue

**ADR/Decision Reference:** {número}
**Issue Discovered:** {problema técnico}
**Attempted Workarounds:** {qué se intentó}
**Proposed Alternatives:**
1. {Alternativa A}
2. {Alternativa B}
**Impact if not resolved:** {bloqueo}

**Formato de Response (requerido):**
- ADR amendment, o
- Nuevo ADR, o
- Acknowledgment con workaround aprobado

**SLA:** Antes de continuar implementación
```

---

#### Gap 2: @security ↔ @architect - Security Findings Arquitectónicos

**Severidad:** ALTA
**Estado:** PARCIAL (solo trigger, sin respuesta)

**Lo que existe:**
- Trigger: `"Requiere cambio arquitectónico para seguridad: {razón}"`

**Lo que falta:**
- Formato estructurado de Security Finding
- Mapeo severidad seguridad → prioridad arquitectónica
- Protocolo de respuesta desde @architect
- Manejo de rechazo si cambio es muy costoso

**Propuesta de contrato:**
```markdown
## @security -> @architect: Security-Driven Architecture Change

**Formato de Request:**
## Security-Driven Architecture Change Request

**Finding Reference:** {STRIDE category o OWASP ID}
**Severity:** {CRITICAL | HIGH | MEDIUM}
**Current Architecture Issue:** {qué está mal}
**Attack Vector:** {cómo puede explotarse}
**Required Change:** {qué debe cambiar}
**Proposed Solution:** {sugerencia}

**Formato de Response (requerido):**
**Decision:** {ACCEPT | REJECT | DEFER}
**If ACCEPT:** ADR number y timeline
**If REJECT:** Justificación y documentación de riesgo aceptado
**If DEFER:** Condiciones para re-evaluación
```

---

#### Gap 3: @developer ↔ @ux-accessibility - Consulta UI

**Severidad:** MEDIA
**Estado:** TRIGGERS DEFINIDOS, FORMATO NO

**Lo que existe:**
- Trigger proactivo: "Durante /brainstorming si diseño incluye UI"
- Trigger reactivo: "Componente UI con interacción o formularios"

**Lo que falta:**
- Qué contexto debe proveer @developer
- En qué formato responde @ux-accessibility
- Cómo manejar recomendaciones condicionales

**Propuesta de contrato:**
```markdown
## @developer -> @ux-accessibility: Accessibility Consultation

**Formato de Request:**
## Accessibility Consultation Request

**Component:** {nombre del componente}
**Type:** {form | interactive | data display | modal | navigation}
**User Interactions:** {lista de interacciones}
**Current Implementation:** {snippet o descripción}

**Formato de Response:**
## Accessibility Recommendations

**Status:** {APPROVED | NEEDS_CHANGES | BLOCKED}
**WCAG Level:** {A | AA | AAA}

**Required Changes (if any):**
- [ ] {cambio 1}
- [ ] {cambio 2}

**Recommendations (optional):**
- {mejora sugerida}
```

---

#### Gap 4: @api-specialist ↔ @developer - Validación de Implementación

**Severidad:** MEDIA
**Estado:** NO EXISTE

**Lo que falta:**
- Formato para que @developer reporte que implementó endpoint
- Validación de @api-specialist que implementación cumple contrato
- Feedback si hay discrepancias

**Propuesta de contrato:**
```markdown
## @developer -> @api-specialist: Implementation Review Request

**Formato:**
## API Implementation Ready for Review

**Endpoint:** {method} {path}
**Contract Reference:** {link a spec o ADR}
**Files Modified:** {lista}
**Deviations from Contract:** {si hay}

## @api-specialist Response:

**Status:** {COMPLIANT | DEVIATIONS_FOUND | BLOCKED}
**Issues:** {lista si hay}
**Required Fixes:** {lista si hay}
```

---

### Matriz de Escalación Actualizada (Bidireccional)

| Origen | Destino | Request Format | Response Format | SLA |
|--------|---------|----------------|-----------------|-----|
| @developer | @architect | "Necesito decisión..." | ADR o inline decision | Antes de continuar |
| @developer | @architect | Feasibility Issue | ADR amendment o rechazo | Antes de continuar |
| @architect | @developer | Architecture Decision | Acknowledgment | Inmediato |
| @security | @architect | Security Finding | ACCEPT/REJECT/DEFER + doc | Antes de siguiente fase |
| @architect | @security | Trade-off question | Risk assessment | Inmediato |
| @developer | @ux-accessibility | Consultation Request | Recommendations | Antes de commit |
| @ux-accessibility | @developer | WCAG A violation | Fix required | Bloquea merge |
| @developer | @api-specialist | Implementation Review | Compliance check | Antes de PR |
| @api-specialist | @developer | Contract clarification | Updated spec | Inmediato |
| @qa | @security | Deep review request | Security report | Antes de release |
| @security | @qa | Critical finding | QA REJECTED | Inmediato |

---

### Fallbacks Completos (Verificados)

| Agent No Disponible | Fallback | Verificación |
|---------------------|----------|--------------|
| @security | Checklist básico OWASP Top 3 + warning al usuario | ✅ Documentado en escalation-matrix y brainstorming |
| @devops | Escalar a @architect para decisión de infra básica | ✅ Documentado |
| @performance | Escalar a @architect para evaluación de trade-offs | ✅ Documentado |
| @api-specialist | Escalar a @architect para diseño de API | ✅ Documentado |
| @ml-engineer | Escalar a usuario con documentación técnica | ✅ Documentado |
| @mobile | Escalar a @developer con guías de platform | ✅ Documentado |
| @ux-accessibility | Checklist básico WCAG A + warning al usuario | ✅ Documentado en brainstorming |

---

### Formato Estándar de Context Handoff (Propuesto)

```markdown
# Context Handoff Standard

## Campos Obligatorios (TODOS los handoffs)

### Origin
- **Agent:** @{agent}
- **Skill:** {skill que generó esto}
- **Issue/Reference:** #{número} o {referencia ADR/Doc}
- **Timestamp:** {ISO}

### State
- **Current Phase:** {fase en workflow}
- **Status:** {COMPLETE | BLOCKED | NEEDS_INPUT}
- **Blocking Reason:** {si bloqueado}

### Artifacts
- **Created:** {lista de archivos creados}
- **Modified:** {lista de archivos modificados}
- **Documentation:** {path a docs relevantes}

### For Next Agent
- **Expected Action:** {qué debe hacer el siguiente agente}
- **Critical Context:** {información que DEBE conocer}
- **Constraints:** {limitaciones o decisiones que no pueden cambiarse}
```

---

### Campos Obligatorios en RADAR Report por Agente Receptor

| Para Agent | Campos Obligatorios |
|------------|---------------------|
| @developer | Files to modify, Patterns to follow, Constraints |
| @architect | Feasibility concerns, Trade-offs discovered |
| @security | Sensitive data handled (si/no), Auth/authz changes (si/no) |
| @qa | Test scenarios, Edge cases |
| @ux-accessibility | Components with UI, Interaction patterns |

---

## Acciones Requeridas

### Prioridad 1 (Crear inmediatamente)

1. **Crear archivo:** `.claude/agents/_common/context-handoff.md`
   - Contenido: Formato estándar propuesto arriba

2. **Crear directorio:** `.claude/agents/_common/contracts/`
   - Archivo: `developer-architect.md` (feasibility)
   - Archivo: `security-architect.md` (findings)
   - Archivo: `developer-ux.md` (consulta UI)

3. **Actualizar:** `.claude/agents/_common/escalation-matrix.md`
   - Agregar columnas: Response Format, SLA
   - Convertir en tabla bidireccional

### Prioridad 2 (Siguiente sprint)

4. **Actualizar:** `.claude/agents/_common/radar-protocol.md`
   - Agregar sección "Campos obligatorios por agente receptor"
   - Extender template de Report phase

5. **Crear archivo:** `.claude/agents/_common/contracts/api-developer.md`
   - Contrato de validación de implementación

---

## Métricas de Éxito

| Métrica | Actual | Objetivo |
|---------|--------|----------|
| Contratos completos | 1 | 5 |
| Pares con formato bidireccional | 0 | 10 |
| Context handoff estandarizado | No | Sí |
| Campos obligatorios por receptor | 0 | 5 agentes |

---

*Matriz generada como parte de la auditoría del 2026-02-05*
