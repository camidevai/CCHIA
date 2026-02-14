---
name: audit
version: 2.0
description: "Auditoría comprehensiva del framework. Detecta inconsistencias, verifica comunicación agent-skill, y genera backlog de mejoras."
---

# Audit - Framework Quality Audit

## QUICK REFERENCE

### BLOCKING CONDITIONS
> Si alguna es TRUE, la auditoría no puede completarse

- [ ] `.claude/` no existe (no es un proyecto InformatiK-AI)
- [ ] Menos de 50% de componentes core encontrados
- [ ] Error de acceso a filesystem durante auditoría

### REQUIRED OUTPUTS
> Archivos que DEBEN existir al finalizar

- [ ] `.claude/docs/audits/YYYY-MM-DD-audit-report.md`
- [ ] `.claude/docs/audits/YYYY-MM-DD-improvement-backlog.md`
- [ ] `.claude/sessions/YYYY-MM-DD-audit.md`
- [ ] Health Score calculado y comunicado

### PHASES OVERVIEW
```
PHASE 1 → PHASE 2 → PHASE 3 → PHASE 4 → PHASE 5 → PHASE 6 → PHASE 7
INVENTORY  FORMAT    CROSS-REF  QUALITY   COMMS     EFFICIENCY REPORT
    ↓         ↓          ↓         ↓         ↓          ↓         ↓
Existencia Compliance Referencias Claridad  Handoffs   Duplicados Backlog
de archivos v2.0/RADAR cruzadas   ACs       Escalation Token      priorizado
```

### PARAMETERS
| Parámetro | Descripción | Default |
|-----------|-------------|---------|
| `--scope {full\|quick}` | Profundidad de auditoría | `full` |
| `--focus {agents\|skills\|security\|quality\|all}` | Área específica | `all` |
| `--dry-run` | Preview sin escribir reportes | `false` |
| `--fix-suggestions` | Incluir snippets de código para fixes | `true` |

### HEALTH SCORE FORMULA
```
health_score = (
  inventory_complete * 20 +
  format_compliant * 20 +
  cross_refs_valid * 20 +
  instructions_quality * 15 +
  communication_complete * 15 +
  efficiency_score * 10
) / 100

Penalties: CRITICAL -10%, HIGH -3%, MEDIUM -1%
```

### RESULTADO FINAL
| Score | Resultado | Criterio |
|-------|-----------|----------|
| 95-100% | PASSED | No CRITICAL, ≤2 HIGH |
| 80-94% | PARTIAL | No CRITICAL, ≤5 HIGH |
| 60-79% | NEEDS WORK | ≤1 CRITICAL |
| <60% | FAILED | >1 CRITICAL o issues estructurales |

---

## PARAMETER VALIDATION

### Validación de entrada

| Parámetro | Valores válidos | Si inválido |
|-----------|-----------------|-------------|
| `--scope` | `full`, `quick` | ERROR: "Valor inválido. Use: full \| quick" |
| `--focus` | `agents`, `skills`, `security`, `quality`, `all` | ERROR: "Área no reconocida" |
| `--dry-run` | flag sin valor | N/A |
| `--fix-suggestions` | flag sin valor | N/A |

### Detección de modo

```
┌─────────────────────────────────────────────────────────────┐
│                     SCOPE CHECK                              │
├─────────────────────────────────────────────────────────────┤
│  ¿--scope quick?                                            │
│       │                                                      │
│       ├── SÍ ──► Ejecutar solo PHASE 1, 2, 7                │
│       │          Skip PHASE 3, 4, 5, 6                      │
│       │                                                      │
│       └── NO ──► Ejecutar todas las fases (1-7)             │
│                                                              │
│  ¿--focus específico?                                       │
│       │                                                      │
│       ├── agents ──► Filtrar checklists a agentes           │
│       ├── skills ──► Filtrar checklists a skills            │
│       ├── security ──► Filtrar a Security Gate + deps       │
│       ├── quality ──► Filtrar a 3 capas de calidad          │
│       └── all ──► Sin filtro (default)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## PHASE 1: INVENTORY
> Verificar existencia de todos los componentes del framework

### GATE IN
- [ ] Directorio `.claude/` existe
- [ ] Es proyecto InformatiK-AI (tiene CLAUDE.md o agentes)

### MUST DO

#### 1.1 Verificar Agentes Core (obligatorios)

| Agente | Path esperado | Check |
|--------|---------------|-------|
| @developer | `.claude/agents/developer.md` | [ ] |
| @architect | `.claude/agents/architect.md` | [ ] |
| @qa | `.claude/agents/qa.md` | [ ] |
| @ux-accessibility | `.claude/agents/ux-accessibility.md` | [ ] |

**Si falta algún agente core:**
```
⚠️ INVENTORY: Agente core faltante
   Falta: @{nombre}
   Path esperado: .claude/agents/{nombre}.md
   Severidad: HIGH
```

#### 1.2 Verificar Agentes Especializados (según proyecto)

| Señal detectada | Agente esperado | Path |
|-----------------|-----------------|------|
| Pagos/PCI/compliance | @security | `.claude/agents/security.md` |
| Docker/K8s/CI-CD | @devops | `.claude/agents/devops.md` |
| AI/ML keywords | @ml-engineer | `.claude/agents/ml-engineer.md` |
| Mobile/RN/Flutter | @mobile | `.claude/agents/mobile.md` |
| GraphQL/microservices | @api-specialist | `.claude/agents/api-specialist.md` |
| Performance crítico | @performance | `.claude/agents/performance.md` |

**Detección de señales:**
```bash
# Buscar en CLAUDE.md, package.json, requirements.txt
grep -rli "payment\|pci\|compliance\|gdpr" . --include="*.md" --include="*.json"
grep -rli "docker\|kubernetes\|k8s\|github.actions\|gitlab-ci" . --include="*.yml" --include="*.yaml"
grep -rli "tensorflow\|pytorch\|sklearn\|machine.learning" . --include="*.py" --include="*.md"
grep -rli "react.native\|flutter\|expo\|ios\|android" . --include="*.json" --include="*.md"
grep -rli "graphql\|microservice\|api.gateway" . --include="*.md" --include="*.ts"
```

#### 1.3 Verificar Skills (esperados según CLAUDE.md)

| Skill | Path | Categoría |
|-------|------|-----------|
| genesis | `.claude/skills/genesis/SKILL.md` | Core |
| brainstorming | `.claude/skills/brainstorming/SKILL.md` | Core |
| create-issues | `.claude/skills/create-issues/SKILL.md` | Core |
| build-feature | `.claude/skills/build-feature/SKILL.md` | Core |
| qa | `.claude/skills/qa/SKILL.md` | Core |
| merge | `.claude/skills/merge/SKILL.md` | Core |
| promote | `.claude/skills/promote/SKILL.md` | Core |
| release | `.claude/skills/release/SKILL.md` | Core |
| worktree | `.claude/skills/worktree/SKILL.md` | Core |

#### 1.4 Verificar Infraestructura de Calidad

| Componente | Path | Check |
|------------|------|-------|
| Security Gate | `.claude/security/SECURITY-GATE.md` | [ ] |
| Validation Layer | `.claude/validation/VALIDATION.md` | [ ] |
| Knowledge Base | `.claude/knowledge/` (directorio) | [ ] |
| Rules | `.claude/rules/` (directorio) | [ ] |
| RADAR Protocol | `.claude/agents/_common/radar-protocol.md` | [ ] |
| Session Template | `.claude/skills/_common/session-template.md` | [ ] |
| Escalation Matrix | `.claude/agents/_common/escalation-matrix.md` | [ ] |

#### 1.5 Verificar Directorios Requeridos

| Directorio | Propósito | Check |
|------------|-----------|-------|
| `.claude/agents/` | Definiciones de agentes | [ ] |
| `.claude/skills/` | Definiciones de skills | [ ] |
| `.claude/rules/` | Reglas de código/arquitectura | [ ] |
| `.claude/docs/` | Documentación (ADRs, guides) | [ ] |
| `.claude/sessions/` | Registro de ejecuciones | [ ] |
| `.claude/issues/` | Sistema de issues local | [ ] |
| `.claude/knowledge/` | Base de conocimiento | [ ] |
| `.claude/validation/` | Capa de validación | [ ] |
| `.claude/security/` | Gate de seguridad | [ ] |

### CHECKPOINT
- [ ] Conteo de componentes encontrados vs esperados
- [ ] Lista de componentes faltantes con severidad
- [ ] `inventory_score` calculado (encontrados/esperados * 100)

### IF FAILS
```
⛔ INVENTORY CRÍTICO
   Componentes encontrados: {N}/{total}
   Faltantes críticos: {lista}

   El framework no está correctamente configurado.
   👉 Ejecuta /genesis para inicializar la infraestructura.
```

---

## PHASE 2: FORMAT COMPLIANCE
> Validar que componentes siguen templates v2.0 y RADAR

### GATE IN
- [ ] PHASE 1 completada
- [ ] Al menos 50% de componentes encontrados

### MUST DO

#### 2.1 Validar Skills siguen v2.0

**Template v2.0 requerido:**
```markdown
---
name: {skill}
version: 2.0
description: "{descripción}"
---

# {Nombre}

## QUICK REFERENCE
### BLOCKING CONDITIONS
### REQUIRED OUTPUTS
### PHASES OVERVIEW
### PARAMETERS

## PHASE N: {NOMBRE}
### GATE IN
### MUST DO
### CHECKPOINT
### IF FAILS

## FINAL CHECKPOINT
## Ver también
```

**Checklist por skill:**
- [ ] Tiene frontmatter YAML (name, version, description)
- [ ] `version: 2.0` presente
- [ ] Sección QUICK REFERENCE existe
- [ ] BLOCKING CONDITIONS definidas
- [ ] REQUIRED OUTPUTS definidos
- [ ] PHASES OVERVIEW con diagrama
- [ ] Cada PHASE tiene GATE IN, MUST DO, CHECKPOINT
- [ ] FINAL CHECKPOINT existe
- [ ] "Ver también" con referencias

**Si skill no cumple v2.0:**
```
⚠️ FORMAT: Skill no sigue v2.0
   Skill: {nombre}
   Faltante: {sección}
   Severidad: MEDIUM
   Fix: Agregar sección {sección} siguiendo template
```

#### 2.2 Validar Agentes siguen RADAR

**Estructura RADAR requerida:**
```markdown
# @{nombre}

## Rol
## Responsabilidades
## Protocolo RADAR
## Triggers de activación
## Handoff protocol
## Outputs esperados
```

**Checklist por agente:**
- [ ] Tiene sección "Rol" clara
- [ ] Responsabilidades definidas
- [ ] Mención explícita de RADAR
- [ ] Triggers de activación listados
- [ ] Handoff protocol definido
- [ ] Outputs esperados documentados

#### 2.3 Validar Rules

**Estructura requerida:**
```markdown
# {Título}

## Aplica a
## Reglas
## Ejemplos
### Correcto
### Incorrecto
## Razón
## Cuándo romper las reglas
```

**Checklist por rule:**
- [ ] "Aplica a" define scope
- [ ] Reglas son específicas y verificables
- [ ] Ejemplos de correcto e incorrecto
- [ ] "Razón" explica el porqué
- [ ] "Cuándo romper" documenta excepciones

### CHECKPOINT
- [ ] Lista de skills no-compliant con detalle
- [ ] Lista de agentes no-compliant con detalle
- [ ] `format_score` calculado

### IF FAILS
```
⚠️ FORMAT: Componentes no siguen estándar
   Skills no-v2.0: {lista}
   Agentes sin RADAR: {lista}

   👉 Revisar templates en:
      - Skills: .claude/skills/_common/skill-template-v2.md
      - Agentes: .claude/agents/templates/
```

---

## PHASE 3: CROSS-REFERENCE VALIDATION
> Verificar que referencias entre documentos son válidas

### GATE IN
- [ ] PHASE 2 completada
- [ ] Modo no es `quick`

### MUST DO

#### 3.1 Extraer todas las referencias

**Patrones a buscar:**
```regex
# Referencias a archivos
\.claude/[a-zA-Z0-9/_-]+\.(md|json|yaml)

# Referencias a skills
/[a-z-]+(\s+--[a-z]+)?

# Referencias a agentes
@[a-z-]+

# Referencias a reglas
rules/[a-z-]+\.md

# Referencias "Ver también"
Ver también:.*
```

#### 3.2 Validar referencias de Skills

Para cada skill, verificar:
- [ ] "Skill anterior" existe y es correcto en flujo
- [ ] "Skill siguiente" existe y es correcto en flujo
- [ ] Referencias a agentes (@nombre) tienen definición
- [ ] Referencias a rules existen
- [ ] Referencias a validation/security existen

**Flujo esperado:**
```
genesis → brainstorming → create-issues → build-feature → qa → merge → promote → release
```

#### 3.3 Validar referencias de Agentes

Para cada agente, verificar:
- [ ] Referencias a otros agentes existen
- [ ] Referencias a knowledge base existen
- [ ] Referencias a validation layer existen
- [ ] Escalation targets existen

#### 3.4 Detectar referencias huérfanas

```bash
# Buscar archivos referenciados que no existen
for ref in $(grep -rhoP '\.claude/[a-zA-Z0-9/_-]+\.md' .claude/); do
  if [ ! -f "$ref" ]; then
    echo "ORPHAN: $ref"
  fi
done
```

#### 3.5 Detectar archivos sin referencias

```bash
# Archivos que existen pero no son referenciados
# Potencialmente obsoletos o mal integrados
```

### CHECKPOINT
- [ ] Lista de referencias rotas con source → target
- [ ] Lista de archivos huérfanos (sin referencias entrantes)
- [ ] `cross_refs_score` calculado

### IF FAILS
```
⚠️ CROSS-REF: Referencias inválidas detectadas
   Referencias rotas: {N}
   Archivos huérfanos: {N}

   Detalle en reporte completo.
```

---

## PHASE 4: INSTRUCTION QUALITY
> Evaluar claridad y verificabilidad de instrucciones

### GATE IN
- [ ] PHASE 3 completada (o PHASE 2 si `--scope quick`)
- [ ] Modo no es `quick`

### MUST DO

#### 4.1 Evaluar BLOCKING CONDITIONS

**Criterios de calidad:**
- [ ] Son verificables programáticamente (sí/no claro)
- [ ] No son ambiguas ("código limpio" es ambiguo)
- [ ] Tienen criterio de éxito medible
- [ ] Cubren casos de fallo principales

**Ejemplos de buena blocking condition:**
```markdown
✅ "Security Gate FAILED"
✅ "Tests críticos fallando"
✅ "No existe entrada en promotions.json"

❌ "Código de mala calidad"
❌ "Performance insuficiente" (sin métrica)
❌ "Requiere revisión" (subjetivo)
```

#### 4.2 Evaluar REQUIRED OUTPUTS

**Criterios de calidad:**
- [ ] Path exacto especificado
- [ ] Formato de archivo claro
- [ ] Contenido mínimo definido
- [ ] Verificable con ls/cat

#### 4.3 Evaluar Acceptance Criteria en Issues

Si sistema de issues local activo:
- [ ] ACs siguen formato Given/When/Then
- [ ] ACs son específicos y testeables
- [ ] No hay ACs ambiguos

#### 4.4 Evaluar instrucciones de agentes

**Criterios:**
- [ ] Triggers son específicos (no "cuando sea necesario")
- [ ] Outputs tienen formato definido
- [ ] Handoffs tienen destinatario claro
- [ ] No hay instrucciones contradictorias

### CHECKPOINT
- [ ] Lista de instrucciones ambiguas con ubicación
- [ ] Lista de blocking conditions no verificables
- [ ] `instructions_quality_score` calculado

### IF FAILS
```
⚠️ QUALITY: Instrucciones ambiguas detectadas
   Blocking conditions vagas: {N}
   Outputs sin formato: {N}
   ACs no testeables: {N}

   👉 Reescribir siguiendo criterios de verificabilidad.
```

---

## PHASE 5: COMMUNICATION VALIDATION
> Verificar protocolos de comunicación agent-skill

### GATE IN
- [ ] PHASE 4 completada
- [ ] Modo no es `quick`
- [ ] `--focus` es `all`, `agents`, o no especificado

### MUST DO

#### 5.1 Validar Escalation Matrix

**Verificar existencia y completitud:**
```markdown
# Escalation Matrix esperada

| Desde | Hacia | Trigger | Información requerida |
|-------|-------|---------|----------------------|
| @developer | @architect | Decisión arquitectónica | Contexto, alternativas |
| @developer | @security | Código sensible | Código, threat model |
| @qa | @security | Vulnerabilidad detectada | Finding, severidad |
| @architect | @security | Diseño con implicaciones | ADR draft, risks |
```

**Checklist:**
- [ ] Matriz existe en `.claude/agents/_common/escalation-matrix.md`
- [ ] Todos los agentes core están representados
- [ ] Triggers son específicos
- [ ] Información requerida está definida

#### 5.2 Validar Handoff Protocol

Para cada agente, verificar:
- [ ] Tiene sección "Handoff protocol" o "Return context"
- [ ] Define qué información pasa al siguiente
- [ ] Define formato de la información
- [ ] Define timeout o fallback

**Issue conocido: Return context sin timeout**
```
⚠️ COMMUNICATION: Handoff sin fallback
   Agente: @{nombre}
   Issue: No define qué hacer si receptor no responde
   Severidad: HIGH
   Fix: Agregar "Si no hay respuesta en X, entonces Y"
```

#### 5.3 Validar Invocación de Agentes desde Skills

Para cada skill que invoca agentes:
- [ ] Usa Task tool explícitamente (no invocación implícita)
- [ ] Especifica `subagent_type` correcto
- [ ] Define qué información pasar al agente
- [ ] Define qué esperar del agente

**Issue conocido: Invocación sin Task tool**
```
⚠️ COMMUNICATION: Invocación de agente implícita
   Skill: {nombre}
   Línea: "Consulta a @security para..."
   Issue: No especifica cómo invocar (Task tool)
   Severidad: HIGH
   Fix: Usar Task tool con subagent_type="security"
```

#### 5.4 Validar Colaboración Multi-Agente

Escenarios de colaboración documentados:
- [ ] QA + Security en Security Gate
- [ ] Architect + Developer en diseño
- [ ] QA + UX-Accessibility en validación UI

**Para cada colaboración:**
- [ ] Roles están claros (quién lidera)
- [ ] Secuencia definida (quién primero)
- [ ] Conflicto resolution documentado

### CHECKPOINT
- [ ] Escalation matrix completa: Sí/No
- [ ] Handoffs con fallback: N/total
- [ ] Invocaciones con Task tool: N/total
- [ ] `communication_score` calculado

### IF FAILS
```
⚠️ COMMUNICATION: Protocolos incompletos
   Escalations sin definir: {N}
   Handoffs sin fallback: {N}
   Invocaciones implícitas: {N}

   👉 Revisar .claude/agents/_common/escalation-matrix.md
```

---

## PHASE 6: EFFICIENCY ANALYSIS
> Detectar duplicaciones, optimizar token budget

### GATE IN
- [ ] PHASE 5 completada
- [ ] Modo no es `quick`

### MUST DO

#### 6.1 Detectar Duplicación de Contenido

**Áreas de duplicación común:**
- Security Gate descrito en múltiples lugares
- Validaciones repetidas entre skills
- Instrucciones RADAR duplicadas en agentes
- Templates copiados sin referencia central

**Detección:**
```bash
# Buscar bloques de texto similares (>50 caracteres)
# Herramientas: simhash, diff, fdupes para contenido
```

**Si duplicación detectada:**
```
⚠️ EFFICIENCY: Contenido duplicado
   Contenido: "{primeras palabras}..."
   Ubicaciones:
     - {archivo1}:{línea}
     - {archivo2}:{línea}
   Severidad: MEDIUM
   Fix: Centralizar en archivo común y referenciar
```

#### 6.2 Analizar Token Budget

**Estimación de tokens por componente:**
```
# Aproximación: 1 token ≈ 4 caracteres
for file in .claude/**/*.md; do
  chars=$(wc -c < "$file")
  tokens=$((chars / 4))
  echo "$file: ~$tokens tokens"
done
```

**Umbrales de alerta:**
| Componente | Umbral warning | Umbral error |
|------------|----------------|--------------|
| Skill SKILL.md | 2000 tokens | 5000 tokens |
| Agent .md | 1500 tokens | 3000 tokens |
| Rule .md | 500 tokens | 1000 tokens |
| CLAUDE.md | 3000 tokens | 6000 tokens |

#### 6.3 Detectar Contenido Huérfano

Archivos que:
- No son referenciados desde ningún otro archivo
- No tienen uso aparente
- Pueden ser obsoletos

#### 6.4 Evaluar Carga Bajo Demanda

**Verificar que skills usan carga modular:**
- [ ] Skills grandes divididos en archivos (SKILL.md, REFERENCE.md, etc.)
- [ ] Agentes no cargan knowledge completo, solo _inject/
- [ ] Rules son pequeñas y específicas

### CHECKPOINT
- [ ] Lista de duplicaciones con sugerencia de consolidación
- [ ] Lista de archivos sobre umbral de tokens
- [ ] Lista de contenido huérfano
- [ ] `efficiency_score` calculado

### IF FAILS
```
⚠️ EFFICIENCY: Optimizaciones posibles
   Duplicaciones: {N} bloques
   Archivos sobre umbral: {N}
   Contenido huérfano: {N}

   👉 Ver backlog para tareas de optimización.
```

---

## PHASE 7: REPORT GENERATION
> Generar reporte final y backlog priorizado

### GATE IN
- [ ] Todas las fases anteriores completadas (o 1,2 si `quick`)
- [ ] `--dry-run` es false

### MUST DO

#### 7.1 Calcular Health Score Final

```
inventory_score = (componentes_encontrados / componentes_esperados) * 100
format_score = (componentes_compliant / componentes_total) * 100
cross_refs_score = (refs_válidas / refs_total) * 100
instructions_quality_score = (instrucciones_claras / instrucciones_total) * 100
communication_score = (protocolos_completos / protocolos_total) * 100
efficiency_score = 100 - (duplicaciones * 5) - (sobre_umbral * 3)

base_score = (
  inventory_score * 0.20 +
  format_score * 0.20 +
  cross_refs_score * 0.20 +
  instructions_quality_score * 0.15 +
  communication_score * 0.15 +
  efficiency_score * 0.10
)

# Aplicar penalties
penalties = (critical_count * 10) + (high_count * 3) + (medium_count * 1)
final_score = max(0, base_score - penalties)
```

#### 7.2 Generar Reporte de Auditoría

**Path:** `.claude/docs/audits/YYYY-MM-DD-audit-report.md`

**Contenido:**
```markdown
# Audit Report - {fecha}

## Executive Summary
- **Health Score:** {score}%
- **Resultado:** {PASSED|PARTIAL|NEEDS WORK|FAILED}
- **Issues encontrados:** {N} CRITICAL, {N} HIGH, {N} MEDIUM, {N} LOW

## Scores por Área
| Área | Score | Estado |
|------|-------|--------|
| Inventory | {N}% | {emoji} |
| Format Compliance | {N}% | {emoji} |
| Cross-References | {N}% | {emoji} |
| Instruction Quality | {N}% | {emoji} |
| Communication | {N}% | {emoji} |
| Efficiency | {N}% | {emoji} |

## Issues por Severidad

### CRITICAL
{lista de issues críticos}

### HIGH
{lista de issues altos}

### MEDIUM
{lista de issues medios}

### LOW
{lista de issues bajos}

## Recomendaciones Inmediatas
1. {recomendación 1}
2. {recomendación 2}

## Métricas Detalladas
{tablas con métricas de cada fase}
```

#### 7.3 Generar Backlog de Mejoras

**Path:** `.claude/docs/audits/YYYY-MM-DD-improvement-backlog.md`

**Contenido:**
```markdown
# Improvement Backlog - {fecha}

## Prioridad 1: CRITICAL (resolver inmediatamente)
| # | Issue | Ubicación | Fix sugerido |
|---|-------|-----------|--------------|
| 1 | {issue} | {path:line} | {fix} |

## Prioridad 2: HIGH (resolver esta semana)
| # | Issue | Ubicación | Fix sugerido |
|---|-------|-----------|--------------|

## Prioridad 3: MEDIUM (resolver este sprint)
| # | Issue | Ubicación | Fix sugerido |
|---|-------|-----------|--------------|

## Prioridad 4: LOW (backlog)
| # | Issue | Ubicación | Fix sugerido |
|---|-------|-----------|--------------|

## Tareas de Consolidación
{lista de duplicaciones a consolidar}

## Archivos a Revisar
{lista de archivos huérfanos o sobre umbral}
```

#### 7.4 Crear Sesión de Auditoría

**Path:** `.claude/sessions/YYYY-MM-DD-audit.md`

Usando template de sesión con campos:
- Scope ejecutado
- Focus aplicado
- Duración de auditoría
- Health score
- Issues encontrados por severidad
- Archivos generados

### CHECKPOINT
- [ ] Reporte generado en `.claude/docs/audits/`
- [ ] Backlog generado en `.claude/docs/audits/`
- [ ] Sesión creada en `.claude/sessions/`
- [ ] Health score comunicado al usuario

### IF FAILS
```
⚠️ REPORT: No se pudo generar reporte
   Causa: {razón}

   👉 Verificar permisos de escritura en .claude/docs/
```

---

## FINAL CHECKPOINT

Antes de terminar, verificar:

- [ ] Todas las fases ejecutadas según `--scope`
- [ ] Health score calculado correctamente
- [ ] Reporte principal generado (si no `--dry-run`)
- [ ] Backlog priorizado generado (si no `--dry-run`)
- [ ] Sesión registrada
- [ ] Resultado comunicado: `PASSED` | `PARTIAL` | `NEEDS WORK` | `FAILED`

**Output final:**
```
🔍 Auditoría Completada

📊 Health Score: {score}%
📋 Resultado: {resultado}

📈 Resumen:
   - CRITICAL: {N}
   - HIGH: {N}
   - MEDIUM: {N}
   - LOW: {N}

📁 Archivos generados:
   - .claude/docs/audits/{fecha}-audit-report.md
   - .claude/docs/audits/{fecha}-improvement-backlog.md
   - .claude/sessions/{fecha}-audit.md

👉 Próximos pasos:
   {si CRITICAL} → Resolver issues críticos antes de continuar desarrollo
   {si HIGH} → Revisar backlog y priorizar fixes
   {si PASSED} → Framework en buen estado, continuar con flujo normal
```

---

## REFERENCE

### Severidades

| Severidad | Criterio | Impacto |
|-----------|----------|---------|
| CRITICAL | Bloquea funcionamiento del framework | -10% score |
| HIGH | Causa comportamiento incorrecto o inseguro | -3% score |
| MEDIUM | Reduce calidad o mantenibilidad | -1% score |
| LOW | Mejora cosmética o de documentación | -0% score |

### Issues Conocidos (Baseline)

Los siguientes issues fueron identificados durante la exploración inicial y sirven como baseline:

#### En Agentes (8 issues)
1. [MEDIUM] Orquestación en `/qa --env qa` poco clara
2. [MEDIUM] Knowledge injection timing no especificado
3. [HIGH] Security Gate ownership ambiguo (@qa vs @security)
4. [LOW] Colaboración N-way no documentada
5. [HIGH] Return context sin timeout/fallback
6. [LOW] Nomenclatura ADR inconsistente (id vs número)
7. [MEDIUM] Logging de decisiones sin ubicación clara
8. [MEDIUM] Validation layer integration no clara

#### En Skills (9 issues)
1. [HIGH] Agent invocation sin especificar Task tool
2. [MEDIUM] QA Security Gate duplicado (basic vs deep)
3. [HIGH] Release sin validación explícita de qa --env qa
4. [MEDIUM] --agent validado tardíamente en /build-feature
5. [HIGH] merge.lock no documentado en /merge
6. [LOW] Session enum values inconsistentes
7. [LOW] Falta validación de --backend en /create-issues
8. [LOW] QA expiración (7 días) hardcoded
9. [MEDIUM] react-best-practices no sigue v2.0

#### En Calidad (7 issues)
1. [MEDIUM] Duplicación de severidades en dependencias
2. [MEDIUM] Code patterns sin centralización
3. [MEDIUM] Error handling ↔ Security desacoplado
4. [HIGH] Recovery procedures incompletas
5. [MEDIUM] Knowledge versions sin sync automático
6. [LOW] Métricas no centralizadas
7. [HIGH] Security Gate bypass sin auditoría

### Patrones de Detección

```bash
# Detectar skills sin v2.0
grep -L "version: 2.0" .claude/skills/*/SKILL.md

# Detectar agentes sin RADAR
grep -L "RADAR\|Protocolo RADAR" .claude/agents/*.md

# Detectar referencias rotas
grep -rhoP '\.claude/[^\s\)]+\.md' .claude/ | sort -u | while read f; do
  [ ! -f "$f" ] && echo "BROKEN: $f"
done

# Detectar invocaciones implícitas de agentes
grep -rn "@[a-z-]+" .claude/skills/ | grep -v "subagent_type"

# Detectar blocking conditions ambiguas
grep -rn "BLOCKING" .claude/skills/ -A5 | grep -E "bueno|malo|limpio|adecuado"
```

### Comandos Útiles Post-Auditoría

```bash
# Ver último reporte
cat .claude/docs/audits/$(ls -t .claude/docs/audits/*-audit-report.md | head -1)

# Ver backlog actual
cat .claude/docs/audits/$(ls -t .claude/docs/audits/*-improvement-backlog.md | head -1)

# Contar issues por severidad en backlog
grep -c "CRITICAL\|HIGH\|MEDIUM\|LOW" .claude/docs/audits/*-backlog.md
```

---

## Ver también

- **CLAUDE.md**: Documentación principal del framework
- **Validación**: `.claude/validation/VALIDATION.md`
- **Security Gate**: `.claude/security/SECURITY-GATE.md`
- **RADAR Protocol**: `.claude/agents/_common/radar-protocol.md`
- **Escalation Matrix**: `.claude/agents/_common/escalation-matrix.md`
- **Session Template**: `.claude/skills/_common/session-template.md`
