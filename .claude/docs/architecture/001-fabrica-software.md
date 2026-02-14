# ADR-001: Arquitectura de la Fábrica de Software

## Estado
Aceptado

## Contexto

Se necesita un sistema que genere automáticamente la infraestructura de Claude Code (CLAUDE.md, Agents, Skills, Rules, Hooks) basándose en la idea de negocio del usuario, optimizado para máxima calidad y eficiencia en tokens.

## Decisión

Implementar una "Fábrica de Software" con dos tipos de skills:

### Skills de Flujo (templates estándar)
- `/genesis`: Discovery inicial y generación de infraestructura
- `/brainstorming`: Ideación y diseño de features
- `/create-issues`: Creación de issues estructurados
- `/build-feature`: Implementación desde issues
- `/qa`: Testing y validación
- `/merge`: Integración y cierre

### Skills de Proyecto (generados)
- 100% personalizados al stack elegido
- Generados durante `/genesis`
- Ejemplos: `/generate-component`, `/create-endpoint`, `/add-test`

### Agents especializados (~200 líneas cada uno)
- `@developer`: Implementación de código
- `@architect`: Decisiones de diseño
- `@qa`: Aseguramiento de calidad

## Consecuencias

### Positivas
- **Validación incremental**: Usuario aprueba cada pieza antes de crear
- **Carga bajo demanda**: Solo se cargan skills/agents cuando se invocan
- **Trazabilidad**: Todo queda documentado en docs y sessions
- **Agnóstico**: Skills se adaptan según configuración (GitHub/local)
- **Eficiencia en tokens**: Agents ligeros, sin cargar todo en contexto

### Negativas
- Requiere seguir el flujo propuesto para máximo beneficio
- Curva de aprendizaje inicial para entender el sistema

## Alternativas consideradas

### 1. Monolito: Un solo skill que hace todo
- Rechazado: Demasiado contexto, difícil de mantener

### 2. Sin agents: Solo skills
- Rechazado: Los agents proveen conocimiento persistente del proyecto

### 3. Agents grandes (~500+ líneas)
- Rechazado: Ineficiente en tokens, difícil de mantener

## Estructura de carpetas

```
.claude/
├── agents/           # Agents especializados
├── skills/
│   ├── flujo/       # Skills de flujo
│   └── proyecto/    # Skills de proyecto
├── rules/           # Reglas de código
├── docs/
│   ├── architecture/ # ADRs
│   └── features/    # Diseño por feature
├── sessions/        # Registro de ejecuciones
└── issues/          # Sistema de issues local
```

## Referencias

- Plan original: `.claude/docs/plans/fabrica-software-design.md`
