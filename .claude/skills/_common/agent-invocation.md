# Agent Invocation Standard

## Propósito
Define el método estándar para invocar agentes especializados desde skills.

---

## Método de Invocación

Los agentes se invocan usando el **Task tool** con el parámetro `subagent_type`:

```
Task tool con subagent_type={agent_name}
```

**Formato del prompt:**
```
@{agent} — {descripción breve de la tarea}

Contexto:
- {contexto relevante}

Scope de revisión:
1. {item 1}
2. {item 2}

Output esperado: {formato esperado}
```

---

## Tabla de Invocación por Agente

| Agent | subagent_type | Cuándo invocar | Output esperado |
|-------|---------------|----------------|-----------------|
| @developer | `developer` | Implementación de código | Código funcional + tests |
| @architect | `architect` | Decisiones de diseño | ADR + guidance |
| @qa | `qa` | Validación de calidad | QA Report (PASS/FAIL) |
| @security | `security` | Revisión de seguridad | Security Assessment |
| @ux-accessibility | `ux-accessibility` | Auditoría de accesibilidad | A11y Audit Report |
| @devops | `devops` | Infraestructura/CI-CD | Deployment Plan |
| @api-specialist | `api-specialist` | Diseño de APIs | API Contract |
| @ml-engineer | `ml-engineer` | ML/AI implementation | Model Architecture |
| @mobile | `mobile` | Mobile development | Platform-specific code |
| @performance | `performance` | Optimización | Performance Report |

---

## Template de Invocación

```markdown
@{agent} — {tarea en 5-10 palabras}

Contexto:
- Skill: /{skill_actual}
- Issue: #{número} (si aplica)
- Ambiente: {dev|qa|prod}
- Archivos relevantes: {lista}

Scope de revisión:
1. {Qué debe revisar/hacer}
2. {Qué debe revisar/hacer}
3. {Qué debe revisar/hacer}

Output esperado:
{Descripción del formato y contenido esperado}

Protocolo: RADAR
(el agente seguirá Read → Analyze → Decide → Act → Report)
```

---

## Agentes por Skill

### /qa

| Fase | Agente | Propósito |
|------|--------|-----------|
| 4E.1 | @security | Deep review (STRIDE, OWASP) |
| 4E.2 | @ux-accessibility | Full WCAG audit |

**Ejemplo de invocación en /qa --env qa:**

```
@security — DEEP REVIEW del ambiente qa/

Contexto:
- Ambiente: qa/ (.worktrees/environments/qa/)
- Features incluidos: {lista}
- Tipo de proyecto: {tipo}

Scope de revisión:
1. STRIDE Threat Modeling
2. OWASP Top 10 verification
3. Auth/AuthZ review
4. Secrets management audit
5. Cross-feature attack surface

Output esperado: Security Review Report
```

### /build-feature

| Situación | Agente | Propósito |
|-----------|--------|-----------|
| Decisión arquitectónica | @architect | ADR + guidance |
| UI component | @ux-accessibility | A11y patterns |
| Security concern | @security | Quick assessment |

### /release

| Fase | Agente | Propósito |
|------|--------|-----------|
| Pre-release | @qa | Verificar QA completado |
| Post-release | @devops | Deploy monitoring |

---

## Verificación de Disponibilidad

Antes de invocar un agente especializado, verificar si fue activado en `/genesis`:

```bash
# Verificar si el agente existe
if [ -f ".claude/agents/{agent}.md" ]; then
  # Agente disponible, invocar
else
  # Fallback: usar checklist básico o escalar a usuario
fi
```

**Fallbacks por agente:**

| Agente | Si no disponible |
|--------|------------------|
| @security | Security Gate básico (5 checks) |
| @ux-accessibility | A11y checklist básico |
| @devops | Manual deployment steps |
| @performance | Basic profiling guidance |
| @api-specialist | @architect para API design |

---

## Protocolo RADAR en Invocaciones

Todo agente invocado sigue el protocolo RADAR:

```
R - Read     → Lee el contexto proporcionado
A - Analyze  → Genera alternativas/findings
D - Decide   → Prioriza y decide acciones
A - Act      → Ejecuta análisis/implementación
R - Report   → Devuelve resultado estructurado
```

Ver: `.claude/agents/_common/radar-protocol.md`

---

## Ejemplo Completo

### Invocación de @security desde /qa --env qa

**Prompt:**
```
@security — DEEP REVIEW del ambiente qa/

Contexto:
- Ambiente: qa/ (.worktrees/environments/qa/)
- Features incluidos: auth-login, payments, user-profile
- Tipo de proyecto: Web Application (React + Node.js)
- Sensibilidad: Maneja datos de pago (PCI relevant)

Scope de revisión:
1. STRIDE Threat Modeling del sistema completo
2. OWASP Top 10 verification
3. Auth/AuthZ review (JWT implementation)
4. Secrets management audit
5. Compliance check (PCI-DSS básico)
6. Cross-feature attack surface analysis
7. Dependency supply chain review

Output esperado: Security Review Report estructurado
(formato: .claude/agents/security.md sección 5)
```

**Output esperado:**
```markdown
# Security Review Report

## Resumen Ejecutivo
- Resultado: {PASS|FAIL|CONDITIONAL}
- Findings: {N} CRITICAL, {N} HIGH, {N} MEDIUM, {N} LOW

## STRIDE Analysis
...

## OWASP Top 10
...

## Findings Detallados
...

## Recomendaciones
...
```

---

## Ver también

- **Escalation Matrix**: `.claude/agents/_common/escalation-matrix.md`
- **Context Handoff**: `.claude/agents/_common/context-handoff.md`
- **RADAR Protocol**: `.claude/agents/_common/radar-protocol.md`
