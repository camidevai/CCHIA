---
name: brainstorming
version: 2.0
description: "Skill de ideación y diseño. Explora la intención del usuario, requisitos y diseño ANTES de planificar implementación. Consulta agentes especializados para enriquecer el diseño. Solo genera documentación, nunca ejecuta código."
---

# Brainstorming Ideas Into Designs

## QUICK REFERENCE

### BLOCKING CONDITIONS
> ⛔ Si alguna es TRUE, DETENER inmediatamente

- [ ] No existe sesión de `/genesis` previa
- [ ] No se puede acceder al proyecto (archivos, git)
- [ ] Usuario rechaza el diseño después de 3 iteraciones

### REQUIRED OUTPUTS
> 📦 Archivos que DEBEN existir al finalizar

**Modo PROYECTO:**
- [ ] `.claude/docs/architecture/001-{proyecto}-arquitectura.md`
- [ ] `.claude/sessions/YYYY-MM-DD-brainstorming-{proyecto}.md`

**Modo FEATURE:**
- [ ] `.claude/docs/features/{feature}/design.md`
- [ ] `.claude/sessions/YYYY-MM-DD-brainstorming-{feature}.md`

### PHASES OVERVIEW
```
PHASE 1 → PHASE 2 → PHASE 3 → PHASE 4 → PHASE 5
CONTEXT   EXPLORE   CONSULT   DESIGN    DOCUMENT
   ↓         ↓         ↓         ↓          ↓
Entender  Preguntas  Agentes   Presentar  Guardar
proyecto   1x1       RADAR     secciones  Write()
```

### AGENT CONSULTATION MATRIX
> 🤖 Señales que activan consulta a agentes durante el diseño

| Señal en el diseño | Agente a consultar | Qué aporta |
|-------------------|-------------------|------------|
| Multi-componente, patrones, data flow, dependencias entre módulos | `@architect` | Decisiones de diseño, ADRs, trade-offs arquitectónicos |
| Pagos, auth, datos sensibles, compliance | `@security` | Arquitectura segura por diseño |
| UI, frontend, formularios, dashboards | `@ux-accessibility` | Patrones accesibles, WCAG |
| Alto tráfico, escala, caching | `@performance` | Diseño escalable |
| API pública, GraphQL, microservicios | `@api-specialist` | Contratos bien diseñados |
| Containers, cloud, CI/CD, deploy | `@devops` | Arquitectura cloud-native |
| ML, AI, modelos, training | `@ml-engineer` | Pipelines de ML |
| Mobile app, React Native, Flutter | `@mobile` | Patrones móviles |

---

## Overview

Help turn ideas into fully formed designs and specs through natural collaborative dialogue.

Start by understanding the current project context, then ask questions one at a time to refine the idea. **Before finalizing**, consult relevant specialized agents to enrich the design with expert knowledge. Once validated, present the design in small sections (200-300 words), checking after each section whether it looks right so far.

## PARAMETERS
- `--mode {proyecto|feature}` - Override de modo (opcional, default: detección automática)
- `--feature {nombre}` - Nombre de la feature a diseñar (modo feature)

---

## Detección Automática de Modo

**ANTES de comenzar, detectar el modo:**

> Si el usuario pasa `--mode {proyecto|feature}`, usar ese modo directamente sin detección automática.

### Verificación

```
SI NO existe `.claude/docs/plans/*-design.md`
   Y NO existe `.claude/docs/architecture/*-arquitectura.md`
   Y existe `.claude/sessions/*-genesis.md`
ENTONCES
   → Modo PROYECTO (primer brainstorming post-genesis)
SINO
   → Modo FEATURE (comportamiento estándar)
```

### Modo PROYECTO (primer brainstorming post-genesis)

Cuando es el primer brainstorming después de `/genesis`:

1. **Alcance ampliado**: No diseñar una feature, sino la arquitectura del sistema
2. **Template expandido**: Incluir ADR inicial, contexto técnico, arquitectura general
3. **Output diferente**: `.claude/docs/architecture/001-{proyecto}-arquitectura.md`

**Preguntas adicionales para modo proyecto:**
- Visión general del sistema
- Módulos principales y sus responsabilidades
- Flujo de datos principal
- Integraciones externas clave
- Consideraciones de seguridad del sistema
- Estrategia de testing global

### Modo FEATURE (estándar)

Comportamiento normal: diseñar una feature específica.

---

## The Process

### PHASE 1: Understanding the idea

- Check out the current project state first (files, docs, recent commits)
- Ask questions one at a time to refine the idea
- Prefer multiple choice questions when possible, but open-ended is fine too
- Only one question per message - if a topic needs more exploration, break it into multiple questions
- Focus on understanding: purpose, constraints, success criteria

### PHASE 2: Exploring approaches

- Propose 2-3 different approaches with trade-offs
- Present options conversationally with your recommendation and reasoning
- Lead with your recommended option and explain why

### PHASE 3: Agent Consultation (CRÍTICA)

> 🤖 **Shift-left**: Detectar problemas de diseño ANTES de implementar

**ANTES de presentar el diseño final, DEBE:**

1. **Detectar señales en el diseño propuesto:**
   ```
   Analizar el diseño draft y buscar:
   - ¿Afecta múltiples componentes, define patrones, data flow? → @architect
   - ¿Maneja datos sensibles, pagos, auth? → @security
   - ¿Tiene UI, formularios, interacción? → @ux-accessibility
   - ¿Espera alto tráfico o necesita escalar? → @performance
   - ¿Expone APIs o consume servicios? → @api-specialist
   - ¿Requiere deployment complejo? → @devops
   - ¿Incluye ML/AI? → @ml-engineer
   - ¿Es mobile app? → @mobile
   ```

2. **Consultar agentes relevantes (solo los detectados):**

   Para cada agente detectado, solicitar:
   ```
   @{agente}: Dado este diseño de {feature}, ¿qué consideraciones
   de {dominio} debería incluir desde el inicio?

   Contexto: {resumen del diseño propuesto}
   ```

2.5. **Fallback si agente no disponible:**

   > Algunos agentes especializados solo se activan durante `/genesis` según el proyecto.
   > @architect y @ux-accessibility son **core agents** (siempre disponibles, N/A fallback).

   | Agente no disponible | Fallback (notas básicas) |
   |---------------------|--------------------------|
   | `@architect` | N/A - siempre disponible (core agent) |
   | `@ux-accessibility` | N/A - siempre disponible (core agent) |
   | `@security` | Checklist básico: autenticación, autorización, validación de input, no hardcodear secrets |
   | `@performance` | Checklist básico: evitar N+1 queries, paginación, índices en queries frecuentes |
   | `@api-specialist` | Checklist básico: RESTful conventions, versionado, error responses consistentes |
   | `@devops` | Checklist básico: configuración via env vars, health checks, logs estructurados |
   | `@ml-engineer` | Escalar a usuario: "Requiere expertise ML no disponible en el proyecto" |
   | `@mobile` | Escalar a usuario: "Requiere expertise mobile no disponible en el proyecto" |

   Si se detecta señal pero agente no está activado:
   ```
   ⚠️ Señal detectada: {señal}
   Agent @{agente} no fue activado en /genesis.
   Usando fallback: {checklist básico o escalar}
   ```
   Documentar en sección "Agents Consulted" con status "Fallback".

3. **Integrar recomendaciones:**
   - Incorporar las recomendaciones al diseño
   - Si hay conflictos entre agentes, documentar trade-off
   - No agregar complejidad innecesaria (YAGNI sigue aplicando)

4. **Mostrar al usuario qué agentes se consultaron:**
   ```
   🤖 Agentes consultados para enriquecer el diseño:
   - @security: {recomendación clave}
   - @ux-accessibility: {recomendación clave}

   Estas consideraciones ya están incorporadas en el diseño.
   ```

**Optimización de rendimiento:**
- Solo consultar agentes cuyas señales se detectaron (no todos)
- Consultas en paralelo cuando sea posible
- Recomendaciones concisas (bullets, no ensayos)

### PHASE 4: Presenting the design

- Once you have agent input integrated, present the design
- Break it into sections of 200-300 words
- Ask after each section whether it looks right so far
- Cover: architecture, components, data flow, error handling, testing
- **Nuevo**: Incluir sección "Consideraciones de {dominio}" por cada agente consultado
- Be ready to go back and clarify if something doesn't make sense

## After the Design

**IMPORTANTE**: Este skill es exclusivamente de planificación.
NO ejecuta ni implementa código.

---

### Documentation

**Output Location:**

- **Modo PROYECTO**: `.claude/docs/architecture/001-{proyecto}-arquitectura.md`
- **Modo FEATURE**: `.claude/docs/features/{feature}/design.md` (used by /create-issues and /build-feature)

**CRITICAL: Use the Write tool explicitly:**

1. Determine the output path based on parameters above
2. Use the Write tool to create the file with the validated design
3. Include all sections: Overview, Approach, Architecture, Components, Data Flow, Error Handling, Testing
4. Use elements-of-style:writing-clearly-and-concisely skill if available
5. Commit the design document to git

**Template Structure (Modo FEATURE):**

```markdown
# Design: {Feature Name}

## Overview

{Brief description and goals}

## Approach

{Chosen approach and rationale}

## Architecture

{High-level architecture decisions}

## Components

{Key components and their responsibilities}

## Data Flow

{How data moves through the system}

## Expert Considerations

> 🤖 Recomendaciones integradas de agentes especializados

{Solo incluir secciones de agentes que fueron consultados}

### Architecture (si @architect fue consultado)
- {Recomendación 1}
- {Recomendación 2}

### Security Considerations (si @security fue consultado)
- {Recomendación 1}
- {Recomendación 2}

### Accessibility & UX (si @ux-accessibility fue consultado)
- {Recomendación 1}
- {Recomendación 2}

### Performance (si @performance fue consultado)
- {Recomendación 1}
- {Recomendación 2}

### API Design (si @api-specialist fue consultado)
- {Recomendación 1}
- {Recomendación 2}

### Infrastructure (si @devops fue consultado)
- {Recomendación 1}
- {Recomendación 2}

## Error Handling

{Error scenarios and handling strategy}

## Testing Strategy

{How this will be tested}

## Agents Consulted

| Agent | Signal Detected | Status | Key Recommendation |
|-------|-----------------|--------|-------------------|
| @{agent} | {signal} | {Consulted \| Fallback} | {1-line summary} |
```

**Template Structure (Modo PROYECTO):**

```markdown
# Arquitectura: {Nombre del Proyecto}

## Contexto del Sistema

{Qué hace el sistema, para quién, qué problema resuelve}
{Referencia al stack elegido en /genesis}

## Visión General

{Descripción de alto nivel de cómo funciona el sistema}

## Decisiones de Arquitectura (ADR Inicial)

### ADR-001: Stack Tecnológico

**Contexto:** {Por qué se eligió este stack}
**Decisión:** {Stack específico con versiones}
**Consecuencias:** {Trade-offs aceptados}

### ADR-002: Arquitectura General

**Contexto:** {Requisitos que influyen la arquitectura}
**Decisión:** {Monolito, microservicios, serverless, etc.}
**Consecuencias:** {Implicaciones de la decisión}

## Componentes del Sistema

| Componente | Responsabilidad | Tecnología |
|------------|-----------------|------------|
| {módulo} | {qué hace} | {tech} |

## Flujo de Datos Principal

{Diagrama o descripción del flujo de datos}

```
[Usuario] → [Frontend] → [API] → [DB]
                           ↓
                      [Servicios Externos]
```

## Integraciones Externas

| Servicio | Propósito | Credenciales |
|----------|-----------|--------------|
| {servicio} | {para qué} | {cómo se manejan} |

## Consideraciones de Seguridad

- **Autenticación:** {estrategia}
- **Autorización:** {modelo de permisos}
- **Datos sensibles:** {cómo se protegen}
- **Secrets:** {cómo se gestionan}

## Estrategia de Testing

| Tipo | Herramientas | Cobertura objetivo |
|------|--------------|-------------------|
| Unit | {framework} | {%} |
| Integration | {framework} | {áreas} |
| E2E | {framework} | {flujos críticos} |

## Estructura de Carpetas Propuesta

```
src/
├── {módulo}/
│   ├── components/
│   ├── services/
│   └── types/
```

## Próximos Pasos

1. {Primera feature a implementar}
2. {Segunda feature}
3. {Tercera feature}
```

**Do NOT skip the Write step** - the design file MUST be created.

---

## Finalización

Después de guardar el documento de diseño:

1. Confirmar que el archivo fue creado exitosamente
2. Mostrar el path del archivo generado
3. Registrar sesión en `.claude/sessions/YYYY-MM-DD-brainstorming-{feature}.md`
4. Output final según modo:

**Modo PROYECTO:**
```
✅ Arquitectura del proyecto definida.

Documento guardado en: `.claude/docs/architecture/001-{proyecto}-arquitectura.md`

📋 Este documento sirve como:
   - Contexto técnico para todos los agentes
   - ADR inicial del proyecto
   - Base para las features a implementar

📍 Progreso del flujo:
   [✓] Génesis
   [✓] Brainstorming (arquitectura) ← completado
   [ ] Brainstorming (features)
   [ ] Crear Issues
   [ ] Build Feature
   [ ] QA + Merge

👉 Próximo paso: /brainstorming para diseñar tu primera feature
```

**Modo FEATURE:**
```
✅ Brainstorming completado.

Documento guardado en: `{output_path}`

🤖 Agentes consultados: {lista o "ninguno (no se detectaron señales)"}
   - @{agente}: {recomendación clave integrada}

📍 Progreso del flujo:
   [✓] Génesis
   [✓] Brainstorming ← completado
   [ ] Crear Issues
   [ ] Build Feature
   [ ] QA + Merge

👉 Próximo paso: /create-issues
```

## Registro de sesión

> Formato base: `.claude/skills/_common/session-template.md`

Crea `.claude/sessions/YYYY-MM-DD-brainstorming-{feature}.md` con campos adicionales:

- **Alternativas consideradas**: Enfoques descartados con razón

## Key Principles

- **One question at a time** - Don't overwhelm with multiple questions
- **Multiple choice preferred** - Easier to answer than open-ended when possible
- **YAGNI ruthlessly** - "You Aren't Gonna Need It". Remove unnecessary features from all designs
- **Explore alternatives** - Always propose 2-3 approaches before settling
- **Shift-left expertise** - Consult specialized agents BEFORE finalizing design
- **Selective consultation** - Only consult agents whose signals are detected (not all)
- **Incremental validation** - Present design in sections, validate each
- **Be flexible** - Go back and clarify when something doesn't make sense

## Performance Notes

La consulta de agentes NO degrada el rendimiento porque:

1. **Consulta selectiva**: Solo agentes cuyas señales se detectan (típicamente 2-4, no 8)
2. **Consultas concisas**: Se pide recomendaciones puntuales, no análisis exhaustivos
3. **Integración inline**: Las recomendaciones se incorporan al diseño, no generan documentos separados
4. **Evita retrabajo**: Detectar problemas en diseño es más barato que rediseñar después de implementar

```
SIN consulta de agentes:
  Diseño (10 min) → Issues → Build → "No es seguro" → Rediseño (30 min) = 40+ min

CON consulta de agentes:
  Diseño (10 min) → Consulta @security (2 min) → Diseño completo → Issues → Build = 12 min
```

---

## FINAL CHECKPOINT

Antes de terminar, verificar:

- [ ] Modo correcto detectado (PROYECTO o FEATURE)
- [ ] Agentes relevantes consultados (o fallback documentado)
- [ ] Documento de diseño creado con Write tool
- [ ] Sesión registrada en `.claude/sessions/`
- [ ] Próximo paso comunicado (`/create-issues` o `/brainstorming` para features)

---

## Ver también

- **Guía**: `.claude/docs/guides/brainstorming-flow-guide.md`
- **Skill siguiente**: `.claude/skills/create-issues/SKILL.md`
- **Validación**: `.claude/validation/VALIDATION.md`
- **Session template**: `.claude/skills/_common/session-template.md` → "/brainstorming"
