# InformatiK-AI Framework - Guía General

> Índice completo de guías y documentación del framework de Fábrica de Software.

## Índice

- [Visión General del Framework](#visión-general-del-framework)
- [Flujo Completo de Desarrollo](#flujo-completo-de-desarrollo)
- [Guías por Skill](#guías-por-skill)
- [Guías por Fase](#guías-por-fase)
- [Agentes del Sistema](#agentes-del-sistema)
- [Sistema de Calidad](#sistema-de-calidad)
- [Referencia Rápida](#referencia-rápida)
- [Comenzar un Proyecto](#comenzar-un-proyecto)

---

## Visión General del Framework

InformatiK-AI es una **Fábrica de Software** que genera automáticamente toda la infraestructura de Claude Code basándose en la idea de negocio del usuario.

### Principios Fundamentales

| Principio | Descripción |
|-----------|-------------|
| **Validación incremental** | Cada pieza se presenta al usuario antes de crearse |
| **Carga bajo demanda** | Solo se cargan agents/skills cuando se invocan |
| **Flujo guiado** | Sugiere siguiente paso, usuario decide |
| **Trazabilidad total** | Todo queda documentado en sessions |
| **Agnóstico de herramientas** | Skills se adaptan según configuración |
| **Calidad embebida** | Validación y seguridad integradas |
| **Agentes inteligentes** | Protocolo RADAR - razonan antes de actuar |

### Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                     INFORMATIK-AI FRAMEWORK                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │    SKILLS    │  │    AGENTS    │  │    RULES     │           │
│  │              │  │              │  │              │           │
│  │  /genesis    │  │  @developer  │  │  code-style  │           │
│  │  /brainstorm │  │  @architect  │  │  commits     │           │
│  │  /create-... │  │  @qa         │  │  git-protect │           │
│  │  /build-...  │  │  @security   │  │  react       │           │
│  │  /qa         │  │  @devops     │  │  ...         │           │
│  │  /merge      │  │  ...         │  │              │           │
│  │  /release    │  │              │  │              │           │
│  │  /worktree   │  │              │  │              │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│          │                 │                 │                   │
│          └─────────────────┼─────────────────┘                   │
│                            │                                     │
│                   ┌────────▼────────┐                            │
│                   │  KNOWLEDGE BASE │                            │
│                   │                 │                            │
│                   │  universal/     │                            │
│                   │  stacks/        │                            │
│                   │  domain/        │                            │
│                   └─────────────────┘                            │
│                            │                                     │
│          ┌─────────────────┼─────────────────┐                   │
│          │                 │                 │                   │
│  ┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐           │
│  │  VALIDATION  │  │   SECURITY   │  │   SESSIONS   │           │
│  │    LAYER     │  │     GATE     │  │   TRACKING   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Flujo Completo de Desarrollo

### Diagrama del Flujo

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                        FLUJO DE DESARROLLO                                 ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  ┌─────────────────────────────────────────────────────────────────────┐  ║
║  │                      FASE 1: INICIALIZACIÓN                          │  ║
║  │                                                                      │  ║
║  │    /genesis ──────────────────────────────────────────────────────►  │  ║
║  │         │                                                            │  ║
║  │         ├─► Discovery (5 preguntas)                                  │  ║
║  │         ├─► Detección de agentes                                     │  ║
║  │         ├─► Knowledge injection                                      │  ║
║  │         ├─► Generación de infraestructura                            │  ║
║  │         └─► CLAUDE.md + Agents + Skills + Rules                      │  ║
║  │                                                                      │  ║
║  └─────────────────────────────────────────────────────────────────────┘  ║
║                                    │                                       ║
║                                    ▼                                       ║
║  ┌─────────────────────────────────────────────────────────────────────┐  ║
║  │                      FASE 2: PLANIFICACIÓN                           │  ║
║  │                                                                      │  ║
║  │    /brainstorming ───────────► /create-issues                        │  ║
║  │         │                            │                               │  ║
║  │         ├─► Preguntas una a una      ├─► Cargar diseño               │  ║
║  │         ├─► Explorar enfoques        ├─► Generar issues Gherkin      │  ║
║  │         ├─► Presentar diseño         ├─► Validar uno a uno           │  ║
║  │         └─► Documento de diseño      └─► Issues en backlog           │  ║
║  │                                                                      │  ║
║  └─────────────────────────────────────────────────────────────────────┘  ║
║                                    │                                       ║
║                                    ▼                                       ║
║  ┌─────────────────────────────────────────────────────────────────────┐  ║
║  │                      FASE 3: IMPLEMENTACIÓN                          │  ║
║  │                                                    ┌───────────┐     │  ║
║  │    /build-feature ─────► /qa ─────► /merge        │  REPETIR  │     │  ║
║  │         │                  │           │          │  POR CADA │     │  ║
║  │         │                  │           │          │   ISSUE   │     │  ║
║  │         ▼                  ▼           ▼          └─────┬─────┘     │  ║
║  │    @developer         Security    PR/Merge              │           │  ║
║  │    implementa         Gate +      + Cleanup             │           │  ║
║  │    con RADAR          A11y Gate   + Changelog ◄─────────┘           │  ║
║  │                                                                      │  ║
║  └─────────────────────────────────────────────────────────────────────┘  ║
║                                    │                                       ║
║                                    ▼                                       ║
║  ┌─────────────────────────────────────────────────────────────────────┐  ║
║  │                      FASE 4: INTEGRACIÓN                            │  ║
║  │                                                                      │  ║
║  │    /promote --to qa ──────► /qa --env qa                            │  ║
║  │         │                        │                                   │  ║
║  │         ├─► Verificar QA         ├─► Full test suite                │  ║
║  │         ├─► Sync qa/             ├─► @security deep review          │  ║
║  │         └─► Registrar            └─► @ux-accessibility audit        │  ║
║  │                                                                      │  ║
║  └─────────────────────────────────────────────────────────────────────┘  ║
║                                    │                                       ║
║                                    ▼                                       ║
║  ┌─────────────────────────────────────────────────────────────────────┐  ║
║  │                      FASE 5: RELEASE                                 │  ║
║  │                                                                      │  ║
║  │    /release ─────────────────────────────────────────────────────►   │  ║
║  │         │                                                            │  ║
║  │         ├─► Analizar commits (conventional)                          │  ║
║  │         ├─► Calcular versión (SemVer)                                │  ║
║  │         ├─► Generar changelog                                        │  ║
║  │         ├─► GitFlow (release branch, tags)                           │  ║
║  │         └─► Publicar + auto /promote --to prod                      │  ║
║  │                                                                      │  ║
║  └─────────────────────────────────────────────────────────────────────┘  ║
║                                                                            ║
║  ┌─────────────────────────────────────────────────────────────────────┐  ║
║  │                      SOPORTE: WORKTREES                              │  ║
║  │                                                                      │  ║
║  │    /worktree ────────────────────────────────────────────────────►   │  ║
║  │         │                                                            │  ║
║  │         ├─► Ambientes permanentes (dev, qa, prod)                    │  ║
║  │         ├─► Features aislados                                        │  ║
║  │         └─► Integración con GitFlow                                  │  ║
║  │                                                                      │  ║
║  └─────────────────────────────────────────────────────────────────────┘  ║
║                                                                            ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

### Flujo Simplificado

```
/genesis → /brainstorming → /create-issues → /build-feature → /qa → /merge
    │                                              ▲                    │
    │                                              └────────────────────┘
    │                                                (repetir por issue)
    │
    └──► /promote --to qa → /qa --env qa → /release → auto /promote --to prod
    │
    └─► /worktree (soporte para desarrollo aislado)
```

---

## Guías por Skill

### Flujo Principal

| # | Skill | Guía | Descripción |
|---|-------|------|-------------|
| 1 | `/genesis` | [genesis-flow-guide.md](./genesis-flow-guide.md) | Inicialización del proyecto, discovery, generación de infraestructura |
| 2 | `/brainstorming` | [brainstorming-flow-guide.md](./brainstorming-flow-guide.md) | Diseño colaborativo de features, exploración de enfoques |
| 3 | `/create-issues` | [create-issues-flow-guide.md](./create-issues-flow-guide.md) | Creación de issues en formato Gherkin con ACs |
| 4 | `/build-feature` | [build-feature-flow-guide.md](./build-feature-flow-guide.md) | Implementación con @developer y protocolo RADAR |
| 5 | `/qa` | [qa-flow-guide.md](./qa-flow-guide.md) | Testing, Security Gate, Accessibility Gate |
| 6 | `/merge` | [merge-flow-guide.md](./merge-flow-guide.md) | Integración, PR, cleanup, cierre de issue |
| 7 | `/promote` | [promotion-flow-guide.md](./promotion-flow-guide.md) | Gate de promoción entre ambientes |
| 8 | `/release` | [release-flow-guide.md](./release-flow-guide.md) | Releases con SemVer, changelog, GitFlow |

### Soporte

| Skill | Guía | Descripción |
|-------|------|-------------|
| `/worktree` | [worktree-flow-guide.md](./worktree-flow-guide.md) | Git Worktrees para desarrollo aislado |

### Referencia

| Guía | Descripción |
|------|-------------|
| [troubleshooting-guide.md](./troubleshooting-guide.md) | Soluciones a problemas comunes (worktrees, merge, QA, release, git) |

---

## Guías por Fase

### Fase 1: Inicialización (Una vez por proyecto)

```
┌────────────────────────────────────────────────────────┐
│  /genesis                                              │
│                                                        │
│  Input:  Idea de negocio                               │
│  Output: CLAUDE.md + Agents + Skills + Rules + Hooks   │
│                                                        │
│  Guía: genesis-flow-guide.md                           │
└────────────────────────────────────────────────────────┘
```

**Contenido de la guía:**
- 5 fases del discovery
- Detección dinámica de agentes
- Knowledge injection
- Generación con validación
- Git Worktrees opcional

---

### Fase 2: Planificación (Por cada feature)

```
┌────────────────────────────────────────────────────────┐
│  /brainstorming ──────────────► /create-issues         │
│                                                        │
│  Input:  Idea de feature                               │
│  Output: Documento de diseño    Issues en backlog      │
│                                                        │
│  Guías: brainstorming-flow-guide.md                    │
│         create-issues-flow-guide.md                    │
└────────────────────────────────────────────────────────┘
```

**Contenido de las guías:**

| Guía | Temas principales |
|------|-------------------|
| brainstorming | Preguntas una a una, explorar enfoques, diseño incremental |
| create-issues | Formato Gherkin, User Stories, ACs, dependencias |

---

### Fase 3: Implementación (Por cada issue)

```
┌────────────────────────────────────────────────────────┐
│  /build-feature ───► /qa ───► /merge                   │
│                                                        │
│  Input:  Issue #                                       │
│  Output: Código       QA Report   PR/Merge             │
│          + Tests      + Gates     + Cleanup            │
│                                                        │
│  Guías: build-feature-flow-guide.md                    │
│         qa-flow-guide.md                               │
│         merge-flow-guide.md                            │
└────────────────────────────────────────────────────────┘
```

**Contenido de las guías:**

| Guía | Temas principales |
|------|-------------------|
| build-feature | Pre-checks, @developer, protocolo RADAR, ACs |
| qa | Tests, Security Gate, Accessibility Gate, iteración |
| merge | Verificación, PR/merge, changelog, cleanup worktree |

---

### Fase 4: Integración (Pre-release)

```
┌────────────────────────────────────────────────────────┐
│  /promote --to qa ─────────► /qa --env qa              │
│                                                        │
│  Input:  develop listo        qa/ sincronizado         │
│  Output: qa/ sincronizado     QA formal validado       │
│                                (full suite, @security, │
│                                 @ux-accessibility)     │
│                                                        │
│  Guías: promotion-flow-guide.md                        │
│         qa-flow-guide.md (ENV MODE)                    │
└────────────────────────────────────────────────────────┘
```

**Contenido de las guías:**

| Guía | Temas principales |
|------|-------------------|
| promotion | Gate de calidad, sincronización de ambientes, verificaciones |
| qa (ENV MODE) | Full test suite, cross-feature integration, @security deep review, @ux-accessibility audit |

---

### Fase 5: Release (Cuando hay suficientes cambios)

```
┌────────────────────────────────────────────────────────┐
│  /release                                              │
│                                                        │
│  Input:  Commits desde último tag + QA ENV aprobado    │
│  Output: Nueva versión + Changelog + GitHub Release    │
│          + auto /promote --to prod                     │
│                                                        │
│  Guía: release-flow-guide.md                           │
└────────────────────────────────────────────────────────┘
```

**Contenido de la guía:**
- Análisis de conventional commits
- Cálculo de versión SemVer
- Generación de changelog
- GitFlow completo
- Publicación y rollback

---

### Soporte: Worktrees

```
┌────────────────────────────────────────────────────────┐
│  /worktree                                             │
│                                                        │
│  Comandos: init, create, list, switch, delete,         │
│            cleanup, env sync, status                   │
│                                                        │
│  Guía: worktree-flow-guide.md                          │
└────────────────────────────────────────────────────────┘
```

**Contenido de la guía:**
- 8 comandos detallados
- Ambientes permanentes (dev, qa, prod)
- Features temporales
- Integración con GitFlow
- Integración con otros skills

---

## Agentes del Sistema

### Agentes Core (Siempre disponibles)

| Agente | Rol | Invocado por |
|--------|-----|--------------|
| `@developer` | Implementación de código | /build-feature |
| `@architect` | Decisiones de diseño, ADRs | /brainstorming, consultas |
| `@qa` | Testing, Security Gate | /qa |
| `@ux-accessibility` | WCAG, ARIA, usabilidad | /qa (UI), consultas |

### Agentes Especializados (Según proyecto)

| Agente | Se activa cuando | Responsabilidades |
|--------|------------------|-------------------|
| `@security` | Pagos, datos sensibles, compliance | Threat modeling, security review |
| `@devops` | Docker, K8s, cloud, CI/CD | Pipelines, containers, deployment |
| `@api-specialist` | GraphQL, APIs públicas, microservices | Contratos, versionado, rate limiting |
| `@ml-engineer` | AI/ML en el dominio | Model architecture, MLOps |
| `@mobile` | React Native, Flutter | Platform-specific, performance móvil |
| `@performance` | Alto tráfico, latencia crítica | Profiling, caching, optimization |

### Protocolo RADAR

Todos los agentes implementan el protocolo RADAR:

```
R - Read     → Leer contexto completo antes de actuar
A - Analyze  → Generar 2-3 alternativas viables
D - Decide   → Elegir con justificación documentada
A - Act      → Ejecutar con verificación incremental
R - Report   → Comunicar resultado con razonamiento
```

---

## Sistema de Calidad

### 3 Capas de Calidad

```
┌─────────────────────────────────────────────────────────┐
│                 CAPA 1: KNOWLEDGE BASE                   │
│                                                          │
│  .claude/knowledge/                                      │
│  ├── universal/   (security, testing, observability)    │
│  ├── stacks/      (react/patterns, node/security)       │
│  └── domain/      (compliance, infrastructure)          │
│                                                          │
│  → Inyectado en agents durante /genesis                  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 CAPA 2: VALIDATION LAYER                 │
│                                                          │
│  .claude/validation/                                     │
│  ├── pre-checks/  (git, tools, files)                   │
│  ├── error-handling/  (patterns, messages)              │
│  └── recovery/    (procedures, rollback)                │
│                                                          │
│  → Ejecutado en cada skill                               │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 CAPA 3: SECURITY GATE                    │
│                                                          │
│  .claude/security/                                       │
│  ├── SECURITY-GATE.md                                   │
│  └── checks/  (secrets, dependencies)                   │
│                                                          │
│  Checks:                                                 │
│  ├── Secrets Detection                                  │
│  ├── Dependency Audit                                   │
│  ├── Code Patterns (SQL injection, XSS)                 │
│  ├── File Size                                          │
│  └── Sensitive Files                                    │
│                                                          │
│  → OBLIGATORIO en /qa, verificado en /merge             │
└─────────────────────────────────────────────────────────┘
```

### Gates Obligatorios

| Gate | Ejecutado en | Bloquea |
|------|--------------|---------|
| Security Gate | /qa | /merge si falla |
| Accessibility Gate | /qa (si UI) | /merge si falla (nivel A) |

---

## Referencia Rápida

### Comandos por Fase

```bash
# FASE 1: Inicialización
/genesis

# FASE 2: Planificación
/brainstorming
/create-issues --feature {nombre}

# FASE 3: Implementación (repetir por issue)
/build-feature --issue {número}
/qa --issue {número}
/merge --issue {número}

# FASE 4: Integración
/promote --to qa
/qa --env qa

# FASE 5: Release
/release

# SOPORTE: Worktrees
/worktree init
/worktree create {nombre}
/worktree update {nombre}
/worktree list
/worktree status
/worktree delete {nombre}
/worktree env sync {dev|qa|prod}
```

### Parámetros Comunes

| Skill | Parámetros principales |
|-------|------------------------|
| `/genesis` | (interactivo) |
| `/brainstorming` | `--mode`, `--feature` |
| `/create-issues` | `--feature`, `--backend` |
| `/build-feature` | `--issue`, `--agent` |
| `/qa` | `--issue`, `--fix`, `--env` |
| `/merge` | `--issue`, `--no-pr` |
| `/release` | `--type`, `--dry-run`, `--pre` |
| `/worktree` | `init`, `create`, `list`, etc. |

### Ubicaciones Clave

```
proyecto/
├── CLAUDE.md                    # Documentación principal
├── .claude/
│   ├── agents/                  # Agentes especializados
│   ├── skills/                  # Definiciones de skills
│   ├── rules/                   # Reglas de código
│   ├── knowledge/               # Base de conocimiento
│   ├── validation/              # Capa de validación
│   ├── security/                # Security Gate
│   ├── docs/                    # ADRs, designs, guides
│   ├── sessions/                # Registro de ejecuciones
│   └── issues/                  # Sistema de issues local
├── .worktrees/                  # Git Worktrees (opcional)
│   ├── environments/            # dev, qa, prod
│   └── features/                # Worktrees temporales
└── CHANGELOG.md                 # Historial de cambios
```

---

## Comenzar un Proyecto

### Paso 1: Ejecutar Genesis

```bash
/genesis
```

Responde las 5 preguntas de discovery:
1. Idea de negocio
2. Tipo de producto
3. Prioridades
4. Stack tecnológico
5. Contexto del proyecto

### Paso 2: Diseñar Primera Feature

```bash
/brainstorming
```

Describe tu primera feature y responde las preguntas.

### Paso 3: Crear Issues

```bash
/create-issues --feature {nombre}
```

Valida cada issue uno a uno.

### Paso 4: Implementar

```bash
/build-feature --issue 001
/qa --issue 001
/merge --issue 001
```

Repetir para cada issue.

### Paso 5: Release

```bash
/release
```

Cuando tengas suficientes cambios para una versión.

---

## Recursos Adicionales

### Documentación Interna

| Recurso | Ubicación |
|---------|-----------|
| Protocolo RADAR | `.claude/agents/_common/radar-protocol.md` |
| Catálogo de Agentes | `.claude/agents/README.md` |
| Security Gate | `.claude/security/SECURITY-GATE.md` |
| Troubleshooting | `.claude/docs/guides/troubleshooting-guide.md` |
| Template de Sesión | `.claude/skills/_common/session-template.md` |
| Template de Issue | `.claude/issues/TEMPLATE.md` |

### Reglas del Proyecto

| Regla | Ubicación |
|-------|-----------|
| Estilo de código | `.claude/rules/code-style.md` |
| Arquitectura | `.claude/rules/architecture.md` |
| Commits | `.claude/rules/commits.md` |
| Git Protection | `.claude/rules/git-protection.md` |
| Git Worktrees | `.claude/rules/git-worktrees.md` |

### Referencias Externas

| Recurso | URL |
|---------|-----|
| Semantic Versioning | https://semver.org/ |
| Conventional Commits | https://conventionalcommits.org/ |
| Keep a Changelog | https://keepachangelog.com/ |
| GitFlow | https://nvie.com/posts/a-successful-git-branching-model/ |
| WCAG | https://www.w3.org/WAI/WCAG21/quickref/ |

---

## Mapa de Navegación

```
                    README.md (este archivo)
                           │
           ┌───────────────┼───────────────┬──────────────┐
           │               │               │              │
           ▼               ▼               ▼              ▼
    INICIALIZACIÓN    DESARROLLO       SOPORTE       REFERENCIA
           │               │               │              │
           ▼               ▼               ▼              ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐  ┌──────────────┐
    │ genesis  │    │ brain-   │    │ worktree │  │ trouble-     │
    │   guide  │    │ storming │    │   guide  │  │ shooting     │
    └──────────┘    │   guide  │    └──────────┘  │   guide      │
                    └────┬─────┘                  └──────────────┘
                         │
                         ▼
                    ┌──────────┐
                    │ create-  │
                    │  issues  │
                    │   guide  │
                    └────┬─────┘
                         │
           ┌─────────────┼─────────────┐
           │             │             │
           ▼             ▼             ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │  build-  │  │    qa    │  │  merge   │
    │ feature  │─►│   guide  │─►│  guide   │
    │   guide  │  │          │  │          │
    └──────────┘  └──────────┘  └──────────┘
                                     │
                                     ▼
                              ┌──────────┐
                              │ release  │
                              │   guide  │
                              └──────────┘
```

---

## Glosario de Terminología

| Término | Definición | Uso correcto |
|---------|-----------|--------------|
| **Feature** | Entregable cohesivo de funcionalidad, mapeado 1:1 con un issue | "feature/auth-login" |
| **Worktree** | Directorio Git adicional con su propio working tree | "crear un worktree para el feature" |
| **Ambiente/Environment** | Worktree permanente (dev, qa, prod) que simula un entorno de despliegue | "promover a ambiente qa" |
| **Security Gate** | Conjunto de 5 checks de seguridad obligatorios (secrets, dependencies, code patterns, file size, sensitive files) | "Security Gate pasó/falló" |
| **Deep review** | Análisis profundo via @security usando STRIDE + OWASP + Compliance | "deep review de @security" |
| **Feature slice** | Sinónimo de feature — un entregable cohesivo | Preferir "feature" |
| **Skill** | Proceso documentado en SKILL.md que define un flujo de trabajo | "/qa es un skill" |
| **Agent** | Especialista IA con protocolo RADAR que asiste en un dominio | "@developer es un agent" |
| **Session** | Archivo de registro en `.claude/sessions/` que documenta la ejecución de un skill | "sesión de QA" |
| **Gate** | Punto de verificación obligatorio que puede bloquear el flujo | "Security Gate, Accessibility Gate" |
| **Promote** | Sincronizar código de un ambiente a otro con verificaciones | "/promote --to qa" |

### Convención de parámetros en ejemplos

Formato estándar: `/skill --param value` (con espacio, NO `--param=value`)

---

---

## Audit Schedule

### Cuándo ejecutar audits

| Trigger | Tipo de audit | Scope |
|---------|---------------|-------|
| Post-release | Rápido | Skills modificados en el release |
| Cambios estructurales | Completo | Todos los skills y agents |
| Mensual | Consistencia | README vs archivos reales |

### Checklist de audit rápido

```
Skills v2.0 Compliance:
- [ ] Frontmatter: version: 2.0
- [ ] QUICK REFERENCE section presente
- [ ] BLOCKING CONDITIONS con checkboxes
- [ ] REQUIRED OUTPUTS con paths concretos
- [ ] PHASES OVERVIEW con diagrama
- [ ] FINAL CHECKPOINT section presente

Agents Framework de Decisión:
- [ ] Tabla "Decido autónomamente cuando"
- [ ] Tabla "Escalo cuando"
- [ ] Referencia a framework-decision.md
```

### Herramienta de verificación

```bash
# Verificar skills con v2.0
grep -l "version: 2.0" .claude/skills/*/SKILL.md | wc -l

# Verificar QUICK REFERENCE
grep -l "## QUICK REFERENCE" .claude/skills/*/SKILL.md | wc -l

# Verificar Framework de Decisión en agents
grep -l "Framework de Decisión" .claude/agents/*.md | wc -l
```

### Ubicación de mejoras

Registrar issues de audit en: `.claude/issues/backlog/` con formato:
- Filename: `AUDIT-{NNN}-{slug}.md`
- Label: `audit`
- Prioridad: HIGH | MEDIUM | LOW

---

*Última actualización: 2026-02-05*
*Versión del framework: 11.0*
