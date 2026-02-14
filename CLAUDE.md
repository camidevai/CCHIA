# CCHIA - Cámara Chilena de Inteligencia Artificial

## Índice Rápido

- [Descripción del Proyecto](#descripción-del-proyecto)
- [Funcionalidades Clave](#funcionalidades-clave)
- [Stack Tecnológico](#stack-tecnológico)
- [Equipo de Agentes Activo](#equipo-de-agentes-activo)
- [Principios](#principios)
- [Flujo de desarrollo](#flujo-de-desarrollo)
- [Skills disponibles](#skills-disponibles)
- [Sistema de Agentes](#sistema-de-agentes)
- [Convenciones del Proyecto](#convenciones-del-proyecto)
- [Sistema de Calidad](#sistema-de-calidad-3-capas)
- [Inicio rápido](#inicio-rápido)

---

## Descripción del Proyecto

Portal web de comunidad para la **Cámara Chilena de Inteligencia Artificial (CCHIA)**. Una plataforma auto-administrable que conecta profesionales, empresas y entusiastas del ecosistema de IA en Chile.

**Objetivo**: Crear un hub digital que posicione a CCHIA como referente en IA, con contenido de valor, eventos y herramientas para la comunidad.

---

## Funcionalidades Clave

| Feature | Descripción | Prioridad |
|---------|-------------|-----------|
| **Blog/CMS** | Sistema de publicación con SEO optimizado, categorías, autores | Alta |
| **Sistema de Roles** | Admin, Editor, Viewer con permisos granulares (Supabase RLS) | Alta |
| **Eventos Dinámicos** | Calendario conectado a BD, inscripciones, recordatorios | Alta |
| **WCAG AA+ Compliance** | Accesibilidad estricta en todos los componentes | Alta |
| **SEO Técnico** | Meta tags, JSON-LD, sitemap, Core Web Vitals optimizados | Alta |

---

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS |
| Animaciones | Framer Motion |
| Backend/Auth | Supabase (PostgreSQL + Auth + RLS) |
| Hosting | Por definir |

---

## Equipo de Agentes Activo

### Core (siempre disponibles)

| Agent | Rol en CCHIA |
|-------|--------------|
| `@developer` | Implementación de features, tests, patrones React |
| `@architect` | Decisiones de diseño, ADRs, estructura del proyecto |
| `@qa` | Testing, Security Gate, validación de criterios |
| `@ux-accessibility` | WCAG AA+ compliance, ARIA, navegación por teclado |

### Especializados (activados para CCHIA)

| Agent | Rol en CCHIA | Razón de activación |
|-------|--------------|---------------------|
| `@security` | Sistema de roles, RLS, protección de rutas | Auth + Roles + Datos de usuarios |
| `@api-specialist` | APIs Supabase, esquema Blog, eventos | Blog CMS + Eventos dinámicos |
| `@performance` | SEO técnico, Core Web Vitals, lazy loading | Prioridad SEO/Performance |

---

## Principios

1. **Validación incremental**: Cada pieza se presenta al usuario antes de crearse
2. **Carga bajo demanda**: Solo se cargan agents/skills cuando se invocan
3. **Flujo guiado**: Sugiere siguiente paso, usuario decide
4. **Trazabilidad total**: Todo queda documentado en docs y sessions
5. **Agnóstico de herramientas**: Skills se adaptan según configuración
6. **Calidad embebida**: Validación y seguridad integradas en el flujo
7. **Agentes inteligentes**: Protocolo RADAR - razonan antes de actuar
8. **Detección dinámica**: Solo se crean los agentes necesarios para el proyecto

## Configuración del proyecto

```yaml
issues:
  backend: local  # local | github
  repo: null      # owner/repo si es github
```

## Flujo de desarrollo

| Fase | Comando | Resultado |
|------|---------|-----------|
| 1. Génesis | `/genesis` | CLAUDE.md + Agents + Skills + Rules |
| 2. Planificación | `/brainstorming` → `/create-issues` | Diseño + Issues Gherkin |
| 3. Ejecución | `/build-feature` → `/qa` → `/merge` | Implementación por feature |
| 4. Integración | `/promote --to qa` → `/qa --env qa` | Promoción a qa + validación formal (full suite, @security deep review, @ux-accessibility audit) |
| 5. Release | `/release` → auto `/promote --to prod` | Despliegue |

## Skills disponibles

| Skill | Descripción |
|-------|-------------|
| `/genesis` | Discovery inicial, genera infraestructura completa |
| `/brainstorming` | Ideación y diseño de features |
| `/create-issues` | Crea issues en formato Gherkin |
| `/build-feature` | Implementa una feature desde un issue |
| `/qa` | Testing y análisis de calidad |
| `/merge` | Integración y cierre de issue |
| `/promote` | Gate de promoción entre ambientes (develop → qa, main → prod) |
| `/release` | Genera releases con SemVer, changelog y GitFlow |
| `/worktree` | Gestión de Git Worktrees |

**Skills de Proyecto:** Se generan durante `/genesis` según el stack elegido.

---

## Sistema de Agentes

### Protocolo RADAR

Todos los agentes implementan el protocolo **RADAR** para razonamiento de alta calidad:

```
R - Read     → Leer contexto completo antes de actuar
A - Analyze  → Generar 2-3 alternativas viables
D - Decide   → Elegir con justificación documentada
A - Act      → Ejecutar con verificación incremental
R - Report   → Comunicar resultado con razonamiento
```

> Ver: `.claude/agents/_common/radar-protocol.md`

### Agentes Core (siempre disponibles)

| Agent | Rol | Responsabilidades |
|-------|-----|-------------------|
| `@developer` | Implementación | Código funcional, tests, seguir patrones |
| `@architect` | Arquitectura | Decisiones de diseño, ADRs, trade-offs |
| `@qa` | Quality Assurance | Testing, Security Gate, validación de ACs |
| `@ux-accessibility` | UX y Accesibilidad | WCAG, ARIA, patrones de usabilidad (activo solo si proyecto tiene UI) |

### Agentes Especializados (bajo demanda)

Se activan durante `/genesis` cuando el proyecto los requiere.

| Señales en discovery | Agente activado |
|---------------------|-----------------|
| Pagos, PCI, datos sensibles, compliance | `@security` |
| Docker, K8s, AWS/GCP/Azure, CI/CD | `@devops` |
| AI/ML, Machine Learning | `@ml-engineer` |
| Mobile App, React Native, Flutter | `@mobile` |
| GraphQL, API pública, Microservicios | `@api-specialist` |
| Alto tráfico, performance crítico | `@performance` |

> Ver catálogo completo: `.claude/agents/README.md`

---

## Estructura de carpetas

```
proyecto/
├── CLAUDE.md                    # Este archivo
├── .claude/
│   ├── agents/                  # Agents especializados
│   │   ├── _common/             # Componentes compartidos (RADAR, checklists)
│   │   ├── templates/           # Templates base
│   │   ├── developer.md         # Core
│   │   ├── architect.md         # Core
│   │   ├── qa.md               # Core
│   │   ├── ux-accessibility.md  # Core
│   │   └── [especializados]    # Según proyecto
│   ├── skills/                 # Todos los skills
│   ├── rules/                  # Reglas de código y arquitectura
│   ├── knowledge/              # Base de conocimiento experto
│   │   ├── _inject/            # Versiones slim para agents
│   │   ├── universal/          # Aplica a todos
│   │   ├── stacks/             # Por stack tecnológico
│   │   └── domain/             # Por dominio especializado
│   ├── validation/             # Capa de validación
│   ├── security/               # Gate de seguridad
│   ├── docs/                   # ADRs y features
│   ├── sessions/               # Registro de ejecuciones
│   └── issues/                 # Sistema de issues local
├── .worktrees/                  # Git Worktrees (opcional)
```

## Convenciones del Proyecto

### Commits
Formato conventional commits: `type(scope): description`
- feat: Nueva funcionalidad
- fix: Corrección de bug
- docs: Documentación
- refactor: Refactorización
- test: Tests

**Scopes comunes para CCHIA:**
- `blog`: Sistema de publicación
- `auth`: Autenticación y roles
- `events`: Calendario y eventos
- `a11y`: Mejoras de accesibilidad
- `seo`: Optimizaciones SEO

### Convenciones de Blog/SEO

| Elemento | Convención |
|----------|------------|
| URLs de posts | `/blog/{slug}` - slugs en español, sin acentos |
| Meta descriptions | 150-160 caracteres, keyword principal al inicio |
| Imágenes | Alt text descriptivo, lazy loading, WebP preferido |
| Headings | Un solo H1 por página, jerarquía correcta |
| JSON-LD | Article schema para posts, Event schema para eventos |

### Convenciones de Accesibilidad

| Requisito | Standard |
|-----------|----------|
| Contraste texto | Mínimo 4.5:1 (AA), preferido 7:1 (AAA) |
| Focus visible | Outline de 2px mínimo, color contrastante |
| Navegación teclado | Tab order lógico, sin trampas de focus |
| ARIA labels | En todos los elementos interactivos sin texto visible |
| Skip links | Presente en todas las páginas |

### Sesiones
Cada ejecución de skill genera una sesión en `.claude/sessions/` con:
- Resumen de lo realizado
- Decisiones tomadas
- Trade-offs considerados
- Archivos modificados
- Próximo paso sugerido

---

## Git Workflow

**Modo**: Tradicional (sin worktrees)

### Branches

| Branch | Propósito |
|--------|-----------|
| `main` | Producción estable |
| `develop` | Desarrollo activo |
| `feature/*` | Features en desarrollo |
| `hotfix/*` | Correcciones urgentes |

### Flujo

```
feature/blog-seo ──► develop ──► /qa ──► /release ──► main
```

---

## Sistema de Calidad (3 Capas)

### Capa 1: Knowledge Base

Base de conocimiento experto inyectado en agents durante `/genesis`.

| Tipo | Contenido |
|------|-----------|
| Universal | security, testing, observability, performance, git, api-design, accessibility |
| Stack | react/patterns, node/patterns, node/security |
| Domain | compliance, infrastructure, ml-patterns |

### Capa 2: Validation Layer

| Tipo | Verificaciones |
|------|---------------|
| Pre-checks | Git estado, tools instaladas, archivos requeridos |
| Error Handling | Try-catch estructurado, rollback, mensajes claros |
| Recovery | Merge fallido, commits perdidos, cleanup |

### Capa 3: Security Gate

Gate **OBLIGATORIO** antes de merge.

| Check | Qué busca |
|-------|-----------|
| Secrets Detection | API keys, passwords, tokens |
| Dependency Audit | Vulnerabilidades npm/pip/cargo |
| Code Patterns | SQL injection, XSS, eval |
| Sensitive Files | .env, *.pem, *.key |

**Integración:** `/qa` ejecuta Security Gate → Si falla, QA rechazado → `/merge` verifica que pasó

---

## Inicio rápido

1. Ejecuta `/genesis` con tu idea de negocio
2. Responde las preguntas de discovery
3. Confirma el equipo de agentes propuesto
4. Valida y ajusta la configuración generada
5. Usa `/brainstorming` para diseñar tu primera feature
6. Sigue el flujo: `create-issues` → `build-feature` → `qa` → `merge`

El sistema de calidad y los agentes con protocolo RADAR se activan automáticamente durante el flujo.
