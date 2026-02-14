# Load Index

<!-- PURPOSE: This file documents which resources (skills, agents, knowledge) are loaded
     in each execution context. It serves as a reference for token budget optimization,
     ensuring that only the necessary files are loaded when a skill or agent is invoked.
     Update this file when adding new skills, agents, or knowledge resources. -->

Documentacion de que recursos se cargan en cada contexto para optimizacion de tokens.

---

## Carga base (siempre)

| Recurso | Tokens aprox | Notas |
|---------|--------------|-------|
| `CLAUDE.md` | ~800 | Configuración raíz |
| `rules/*.md` | ~600 | Reglas de código/commits/git |

---

## Carga por skill

| Skill | Recursos cargados | Tokens aprox |
|-------|-------------------|--------------|
| `/genesis` | validation/, security/, knowledge/, agents/templates/ | ~2500 |
| `/brainstorming` | docs/plans/ | ~200 |
| `/create-issues` | docs/features/, issues/ | ~300 |
| `/build-feature` | validation/, agents/developer | ~1200 |
| `/qa` | security/SECURITY-GATE, validation/ | ~800 |
| `/merge` | (verifica sesión QA existente) | ~400 |
| `/promote` | promote/SKILL.md, promotions.json, qa sessions | ~350 |
| `/release` | release/SKILL.md, promotions.json, qa-env sessions, CHANGELOG.md | ~400 |
| `/worktree` | (self-contained) | ~200 |

---

## Carga por agent

| Agent | Invocado por | Recursos adicionales |
|-------|--------------|---------------------|
| @developer | /build-feature | knowledge/_inject/*, patterns del proyecto |
| @architect | /genesis, decisiones | knowledge/universal/*, ADRs |
| @qa | /qa | security/SECURITY-GATE |
| @security | bajo demanda | knowledge/*/security.md |
| @ux-accessibility | /qa, /qa --env qa | knowledge/universal/accessibility.md |
| @devops | bajo demanda | knowledge/domain/infrastructure.md |
| @api-specialist | bajo demanda | knowledge/universal/api-design.md |
| @ml-engineer | bajo demanda | knowledge/domain/ml-patterns.md |
| @mobile | bajo demanda | - |
| @performance | bajo demanda | knowledge/universal/performance.md |

---

## Knowledge: Versiones

| Contexto | Versión a usar | Path |
|----------|----------------|------|
| Inyección en agent | Slim | `knowledge/_inject/*.md` |
| Consulta profunda | Completa | `knowledge/universal/*.md` o `stacks/*/*.md` |
| Referencia en docs | Link a completa | - |

### Knowledge Version por Agente

| Agente | Versión | Fuente |
|--------|---------|--------|
| @developer | slim | `knowledge/_inject/testing-essentials.md`, `knowledge/_inject/security-essentials.md` |
| @architect | slim + full (api-design) | `knowledge/_inject/` + `knowledge/universal/api-design.md` |
| @qa | slim | `knowledge/_inject/testing-essentials.md` |
| @ux-accessibility | full | `knowledge/universal/accessibility.md` |
| @security | full | `knowledge/universal/security.md` + `knowledge/domain/compliance.md` |
| Otros especializados | slim + domain | `knowledge/_inject/` + `knowledge/domain/` relevante |

---

## Optimización de carga

### Principios

1. **Lazy loading**: Solo cargar cuando se necesita
2. **Referencias > Duplicación**: Apuntar a archivos, no copiar contenido
3. **Versiones slim**: Usar `_inject/` para agents
4. **Session reuse**: Verificar sesiones existentes antes de re-ejecutar

### Señales de sobrecarga

- Skill/agent con >2000 tokens de contexto propio
- Mismo contenido en múltiples archivos
- Knowledge completo inyectado cuando slim bastaría

---

## Dependencias entre skills

```
/genesis
    │
    ├─► /brainstorming
    │       │
    │       └─► /create-issues
    │               │
    │               └─► /build-feature
    │                       │
    │                       └─► /qa
    │                               │
    │                               └─► /merge
    │                                       │
    │                                       └─► /promote --to qa
    │                                               │
    │                                               └─► /qa --env qa
    │                                                       │
    │                                                       └─► /release
    │                                                               │
    │                                                               └─► auto /promote --to prod
    │
    └─► /worktree (independiente, se integra con build/merge/qa/promote)
```

---

## Cómo actualizar este índice

1. Al agregar nuevo skill/agent, documentar aquí
2. Al mover/eliminar recursos, actualizar paths
3. Revisar tokens aproximados periódicamente
