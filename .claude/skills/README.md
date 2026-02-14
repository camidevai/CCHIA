# Skills Catalog

## Overview

Skills son procesos documentados en archivos markdown que definen flujos de trabajo.
Cada skill tiene un SKILL.md con fases, gates, checkpoints y outputs.

---

## Skills del Framework

### Flujo Principal

| # | Skill | Comando | Versión | Descripción |
|---|-------|---------|---------|-------------|
| 1 | Genesis | `/genesis` | 2.0 | Discovery inicial, genera infraestructura completa |
| 2 | Brainstorming | `/brainstorming` | 2.0 | Ideación y diseño de features |
| 3 | Create Issues | `/create-issues` | 2.0 | Crea issues en formato Gherkin |
| 4 | Build Feature | `/build-feature` | 2.0 | Implementa una feature desde un issue |
| 5 | QA | `/qa` | 2.0 | Testing, Security Gate, Accessibility Gate |
| 6 | Merge | `/merge` | 2.0 | Integración, PR/merge, cleanup, cierre de issue |
| 7 | Promote | `/promote` | 2.0 | Gate de promoción entre ambientes |
| 8 | Release | `/release` | 2.0 | Releases con SemVer, changelog, GitFlow |

### Soporte

| Skill | Comando | Versión | Descripción |
|-------|---------|---------|-------------|
| Worktree | `/worktree` | 2.0 | Git Worktrees para desarrollo aislado |

### Skills de Proyecto (generados en /genesis)

| Skill | Comando | Descripción |
|-------|---------|-------------|
| React Best Practices | `/react-best-practices` | Code review, patterns, component generation |
| Generate Component | `/generate-component` | Genera componentes según patrones del proyecto |
| Create Endpoint | `/create-endpoint` | Genera endpoints de API según stack |
| Add Test | `/add-test` | Genera tests para un módulo existente |

---

## Estructura de un Skill

```
skills/{nombre}/
├── SKILL.md          # Definición principal con fases y gates
└── README.md         # Documentación adicional (opcional)
```

### Anatomía de SKILL.md

```yaml
---
name: {nombre}
version: 2.0
description: "{descripción}"
---
```

Secciones estándar:
1. **QUICK REFERENCE** — Blocking conditions, required outputs, phases overview
2. **PARAMETERS** — Parámetros aceptados con validación
3. **PHASES** — Fases con GATE IN, MUST DO, CHECKPOINT, IF FAILS
4. **FINAL CHECKPOINT** — Verificación antes de terminar
5. **REFERENCE** — Formatos de sesión, información adicional

---

## Convenciones

### Session files
- Formato: `YYYY-MM-DD-{skill}-{contexto}.md`
- Ubicación: `.claude/sessions/`
- Template: `.claude/skills/_common/session-template.md`

### Parámetros
- Formato: `--param value` (con espacio, no `=`)
- Requeridos se marcan como REQUERIDO
- Valores se validan antes de ejecutar

---

## Structural Exceptions

Algunos skills no siguen la estructura estándar de fases (PHASE 1 → PHASE N) por diseño:

### `/worktree` - Estructura basada en comandos

El skill worktree usa una estructura basada en **comandos discretos** en lugar de fases secuenciales.

**Razón:** Los comandos de worktree (`init`, `create`, `list`, `delete`, etc.) son operaciones independientes que el usuario ejecuta según necesidad, no un flujo secuencial. No tiene sentido estructurar "init → create → delete" como fases cuando el usuario puede ejecutar cualquier comando en cualquier momento.

**Estructura:**
```
QUICK REFERENCE
├── BLOCKING CONDITIONS (por comando)
├── REQUIRED OUTPUTS (por comando)
└── COMMANDS OVERVIEW (diagrama de comandos)

{Comando 1}
├── Prerrequisitos
├── Proceso
└── Output

{Comando 2}
...

FINAL CHECKPOINT (por comando)
```

Este skill aún incluye QUICK REFERENCE, BLOCKING CONDITIONS, y FINAL CHECKPOINT, pero organizados por comando en lugar de por fase.

---

## Audit Schedule

### Frecuencia recomendada

| Trigger | Acción |
|---------|--------|
| Post-release | Audit rápido de skills modificados |
| Cambios significativos | Audit completo |
| Mensual | Revisión de skills README vs realidad |

### Checklist de audit rápido

- [ ] Todos los skills tienen `version: 2.0` en frontmatter
- [ ] Todos los skills tienen `## QUICK REFERENCE` con:
  - [ ] `### BLOCKING CONDITIONS`
  - [ ] `### REQUIRED OUTPUTS`
  - [ ] `### PHASES OVERVIEW` (o `### COMMANDS OVERVIEW`)
- [ ] Todos los skills tienen `## FINAL CHECKPOINT`
- [ ] Agentes tienen `## Framework de Decisión` con tabla de decisiones autónomas

### Ubicación de backlog de mejoras

Registrar issues de audit en: `.claude/issues/backlog/` con label `audit`

---

## Ver también

- [Guía general](../docs/guides/README.md) — Flujo completo de desarrollo
- [Agentes](../agents/README.md) — Catálogo de agentes
- [Validación](../validation/VALIDATION.md) — Pre-checks por skill
- [Security Gate](../security/SECURITY-GATE.md) — Gate de seguridad
