# Guía Completa: Flujo de /genesis

> Documentación detallada del proceso de génesis del framework InformatiK-AI.

## Índice

- [Visión General](#visión-general)
- [Fase 1: Discovery](#fase-1-discovery)
- [Fase 2: Detección Dinámica de Agentes](#fase-2-detección-dinámica-de-agentes)
- [Fase 2.5: Inyección de Knowledge Base](#fase-25-inyección-de-knowledge-base)
- [Fase 2.6: Generación con Validación](#fase-26-generación-con-validación)
- [Fase 2.7: Git Worktrees](#fase-27-git-worktrees-opcional)
- [Fase 3: Hooks](#fase-3-hooks)
- [Fase 4: Onboarding](#fase-4-onboarding)
- [Protocolo RADAR](#protocolo-radar)
- [Ejemplo Práctico](#ejemplo-práctico-sitio-web-con-diseño-impactante)
- [Resumen Visual](#resumen-visual)

---

## Visión General

El skill `/genesis` es el punto de entrada al framework InformatiK-AI. Realiza un **discovery estructurado** del proyecto y genera automáticamente toda la infraestructura de Claude Code:

| Artefacto             | Descripción                                      |
|-----------------------|--------------------------------------------------|
| `CLAUDE.md`           | Documentación principal del proyecto             |
| Agents Core           | @developer, @architect, @qa, @ux-accessibility   |
| Agents Especializados | Según las necesidades detectadas                 |
| Skills de Proyecto    | Según el stack tecnológico                       |
| Rules                 | Reglas de código y arquitectura                  |
| Hooks                 | Validaciones pre-commit                          |

### Principios del Proceso

1. **Una pregunta a la vez**: No abrumar al usuario
2. **Validación antes de crear**: Mostrar propuesta, esperar confirmación
3. **Detección inteligente**: Solo crear agentes necesarios
4. **Protocolo RADAR**: Agentes que razonan antes de actuar
5. **Knowledge injection**: Expertise real inyectado en cada agente

---

## Fase 1: Discovery

El discovery consiste en **5 preguntas secuenciales**. El sistema espera tu respuesta antes de continuar con la siguiente.

### Pregunta 1: Idea de Negocio

```
¿Cuál es tu idea de negocio o producto?
Describe brevemente qué problema resuelve y para quién.
```

**Propósito**: Entender el contexto y dominio del proyecto.

### Pregunta 2: Tipo de Producto

```
¿Qué tipo de producto es?
a) Web App (SPA/MPA)
b) API/Backend
c) Mobile App
d) CLI Tool
e) Librería/SDK
f) Landing Page
g) Otro: ___
```

**Propósito**: Determinar stack sugerido y agentes necesarios.

### Pregunta 3: Prioridades

```
Ordena estas prioridades de mayor a menor importancia (1-3):
[ ] Experiencia de usuario (UX)
[ ] Performance/Escalabilidad
[ ] Velocidad de desarrollo
```

**Propósito**: Ajustar recomendaciones y trade-offs.

### Pregunta 4: Stack Tecnológico

```
¿Tienes preferencia de stack o quieres que sugiera uno?
a) Tengo preferencia: ___
b) Sugiéreme según el tipo de producto
```

**Propósito**: Determinar skills de stack y knowledge a inyectar.

### Pregunta 5: Contexto del Proyecto

Esta es la pregunta más importante para la detección de agentes:

```
**a) Dominio:**
[ ] E-commerce / Pagos
[ ] Healthcare / Salud
[ ] Finanzas / Banca
[ ] SaaS B2B
[ ] AI / Machine Learning
[ ] IoT / Hardware

**b) Requisitos de seguridad:**
[ ] Autenticación de usuarios
[ ] Pagos con tarjeta
[ ] Datos sensibles (PII)
[ ] Cumplimiento regulatorio (GDPR, HIPAA, PCI)

**c) Infraestructura:**
[ ] Containers (Docker, Kubernetes)
[ ] Cloud managed (AWS, GCP, Azure)
[ ] CI/CD complejo

**d) Integraciones clave:**
[ ] Auth provider
[ ] Payment provider
[ ] APIs externas importantes
[ ] Message queues / Event streaming

**e) Características especiales:**
[ ] Alto tráfico / Alta escala
[ ] Real-time (WebSockets, SSE)
[ ] GraphQL
[ ] Microservicios
```

**Propósito**: Detectar señales que activan agentes especializados.

---

## Fase 2: Detección Dinámica de Agentes

### Mapeo de Señales a Agentes

El sistema analiza tus respuestas y mapea señales a agentes especializados:

| Señales Detectadas                                  | Agente Activado    | Razón                                        |
|-----------------------------------------------------|--------------------|----------------------------------------------|
| Pagos, PCI, Finanzas, HIPAA, GDPR, datos sensibles  | `@security`        | Requiere expertise en seguridad y compliance |
| Docker, K8s, AWS/GCP/Azure, CI/CD complejo          | `@devops`          | Requiere expertise en infraestructura        |
| AI/ML, Machine Learning en dominio                  | `@ml-engineer`     | Requiere expertise en ML pipelines           |
| Mobile App, React Native, Flutter                   | `@mobile`          | Requiere expertise en plataformas móviles    |
| GraphQL, API pública, Microservicios                | `@api-specialist`  | Requiere expertise en diseño de APIs         |
| Alto tráfico, Alta escala, Performance prioritario  | `@performance`     | Requiere expertise en optimización           |

### Catálogo de Agentes

#### Agentes Core (SIEMPRE se crean)

| Agente                | Rol                | Responsabilidades                          |
|-----------------------|--------------------|--------------------------------------------|
| `@developer`          | Implementación     | Código funcional, tests, seguir patrones   |
| `@architect`          | Arquitectura       | Decisiones de diseño, ADRs, trade-offs     |
| `@qa`                 | Quality Assurance  | Testing, Security Gate, validación de ACs  |
| `@ux-accessibility`   | UX y Accesibilidad | WCAG, ARIA, patrones de usabilidad         |

#### Agentes Especializados (según detección)

| Agente             | Cuándo se activa                        |
|--------------------|-----------------------------------------|
| `@security`        | Pagos, datos sensibles, compliance      |
| `@devops`          | Containers, cloud, CI/CD                |
| `@api-specialist`  | APIs complejas, GraphQL, microservices  |
| `@ml-engineer`     | AI/ML en el dominio                     |
| `@mobile`          | Apps móviles                            |
| `@performance`     | Alta escala, performance crítico        |

### Presentación del Equipo

Después del análisis, el sistema presenta el equipo propuesto:

```
📋 Equipo de agentes para tu proyecto:

**Core (obligatorios):**
- @developer - Implementación de código con protocolo RADAR
- @architect - Decisiones de diseño y arquitectura
- @qa - Quality Assurance y Security Gate

**Especializados (detectados según tu proyecto):**
- @security [DETECTADO: Mencionaste pagos y datos sensibles]
  → Threat modeling, security review, compliance (GDPR, PCI)

- @devops [DETECTADO: Mencionaste Kubernetes y AWS]
  → CI/CD, containers, deployment, monitoring

¿Confirmas este equipo? (puedes agregar/quitar agentes)
```

### Confirmación del Usuario

- **Si confirma** → Continuar a Fase 2.5
- **Si quiere modificar** → Ajustar lista y reconfirmar
- Puede **agregar** agentes no detectados automáticamente
- Puede **quitar** agentes que considera innecesarios

---

## Fase 2.5: Inyección de Knowledge Base

Esta fase **enriquece los agentes con conocimiento experto real** antes de generarlos.

### Estructura del Knowledge Base

```
.claude/knowledge/
├── universal/          # Aplica a todos los proyectos
│   ├── security.md     # OWASP, auth, secrets
│   ├── testing.md      # Test pyramid, patterns
│   ├── observability.md # Logging, monitoring
│   ├── performance.md  # Profiling, optimization
│   ├── git-mastery.md  # Git avanzado
│   └── api-design.md   # REST, versioning
├── stacks/             # Por tecnología
│   ├── react/
│   │   └── patterns.md
│   ├── node/
│   │   ├── patterns.md
│   │   └── security.md
│   ├── python/
│   │   └── patterns.md
│   └── go/
│       └── patterns.md
└── domain/             # Por dominio especializado
    ├── compliance.md
    ├── infrastructure.md
    └── ml-patterns.md
```

### Matriz de Inyección

| Agente             | Universal                               | Stack           | Domain                 |
|--------------------|-----------------------------------------|-----------------|------------------------|
| @developer         | testing, git, security basics           | stack/patterns  |          -             |
| @architect         | api-design, performance, observability  | stack/patterns  |          -             |
| @qa                | testing, security checks                | stack/security  |          -             |
| @ux-accessibility  | accessibility (FULL)                    | react/patterns  |          -             |
| @security          | security (FULL)                         | stack/security  | domain/compliance      |
| @devops            | observability                           |       -         | domain/infrastructure  |
| @ml-engineer       | performance                             | python/patterns | domain/ml-patterns     |
| @api-specialist    | api-design (FULL)                       | stack/patterns  |          -             |
| @performance       | performance (FULL), observability       | stack/patterns  |          -             |

### Resultado Esperado

Agents generados con:
- ~300-400 líneas (con protocolo RADAR completo)
- Conocimiento específico del stack y dominio
- Patrones y anti-patrones concretos
- Checklists de verificación embebidos
- Framework de razonamiento RADAR

---

## Fase 2.6: Generación con Validación

Para **cada artefacto**, el sistema sigue un proceso de validación:

```
1. Presenta el contenido propuesto
       ↓
2. Espera confirmación del usuario
       ↓
3. Solo entonces crea el archivo
```

### Orden de Generación

| # | Artefacto               | Contenido |
|---|-------------------------|-----------|
| 1 | CLAUDE.md               | Documentación principal con roster de agentes |
| 2 | @developer              | Agent con protocolo RADAR + patterns del stack |
| 3 | @architect              | Agent con framework de decisión + ADR templates |
| 4 | @qa                     | Agent con Security Gate + testing patterns |
| 5 | @ux-accessibility       | Agent con WCAG knowledge + ARIA patterns |
| 6 | Agents Especializados   | Según detección (si aplica) |
| 7 | Skills de Proyecto      | Según stack (ej: /react-best-practices) |
| 8 | Rules                   | Reglas de código (ej: react.md) |

---

## Fase 2.7: Git Worktrees (Opcional)

Después de la infraestructura básica, el sistema pregunta:

```
¿Deseas habilitar Git Worktrees para desarrollo aislado?

Los worktrees permiten:
- Ambientes permanentes (dev, qa, prod)
- Un worktree por feature, sin stash/switch
- Flujo GitFlow integrado

a) Sí, configurar worktrees
b) No, prefiero flujo tradicional
```

### Si elige (a): Configurar Worktrees

1. Verifica que existe repositorio Git
2. Si no existe, pregunta si inicializar
3. Ejecuta `/worktree init`:

```
.worktrees/
├── environments/
│   ├── dev/    → branch: develop
│   ├── qa/     → branch: develop/release
│   └── prod/   → branch: main (READONLY)
└── features/
    └── feature-*/  → worktrees temporales
```

### Si elige (b): Flujo Tradicional

- Continúa sin worktrees
- El proyecto puede habilitarlos después con `/worktree init`

---

## Fase 3: Hooks

Configura hooks mínimos para el proyecto:

| Hook | Función |
|------|---------|
| `pre-commit` | Linting + formato automático |
| `commit-msg` | Validar conventional commits |

El sistema presenta la configuración propuesta y espera aprobación antes de aplicar.

---

## Fase 4: Onboarding

Al finalizar, el sistema presenta un resumen completo:

```
✅ Génesis completado. Tu proyecto está configurado.

📁 Infraestructura creada:
   - CLAUDE.md (documentación principal)
   - Agents Core: @developer, @architect, @qa
   - Agents Especializados: {lista de detectados}
   - Skills de proyecto: {lista}
   - Rules: {lista}
   - Worktrees: {habilitados|no configurados}

🤖 Tu equipo de agentes:
   - @developer: Implementación de código
   - @architect: Decisiones de diseño
   - @qa: Testing y Security Gate
   - @ux-accessibility: WCAG y usabilidad

📍 Flujo de desarrollo:
   [✓] Génesis ← estás aquí
   [ ] Brainstorming
   [ ] Crear Issues
   [ ] Build Feature
   [ ] QA + Merge

👉 Próximo paso: /brainstorming para diseñar tu primera feature
```

### Registro de Sesión

Se genera automáticamente `.claude/sessions/YYYY-MM-DD-genesis.md`:

```markdown
# Sesión: Genesis
Fecha: {fecha y hora}
Skill: /genesis

## Resumen
Configuración inicial del proyecto {nombre}.

## Decisiones tomadas
- Stack: {stack elegido}
- Tipo: {tipo de producto}
- Prioridades: {orden}
- Worktrees: {habilitados|no}

## Señales detectadas
{Lista de señales que activaron agentes}

## Equipo de agentes generado
**Core:** @developer, @architect, @qa
**Especializados:** {lista con razón de activación}

## Knowledge inyectado
{Qué knowledge se inyectó en cada agent}

## Próximo paso sugerido
/brainstorming
```

---

## Protocolo RADAR

Todos los agentes implementan el protocolo **RADAR** para razonamiento de alta calidad.

### Las 5 Fases

```
R - Read     → Leer contexto completo antes de actuar
A - Analyze  → Generar 2-3 alternativas viables
D - Decide   → Elegir con justificación documentada
A - Act      → Ejecutar con verificación incremental
R - Report   → Comunicar resultado con razonamiento
```

### R - Read (Leer Contexto)

Antes de cualquier acción:

1. Leer el request/issue COMPLETO
2. Leer archivos relacionados en el codebase
3. Revisar historial relevante (commits, ADRs, sesiones)
4. Entender dependencias e impacto en cascada

### A - Analyze (Analizar Alternativas)

Para toda decisión significativa:

1. Generar **mínimo 2-3 alternativas** viables
2. Documentar pros, cons, riesgos y esfuerzo de cada una
3. Evaluar contra criterios del proyecto

```markdown
### Alternativa {N}: {Nombre}

**Descripción:** {Qué implica esta opción}

**Pros:**
- {Ventaja 1}
- {Ventaja 2}

**Cons:**
- {Desventaja 1}

**Riesgos:** {Riesgo potencial}
**Esfuerzo:** {Bajo|Medio|Alto}
```

### D - Decide (Decidir con Justificación)

Al elegir una alternativa:

```markdown
## Decisión: {Título}

**Elegido:** Alternativa {N} - {Nombre}
**Razón principal:** {Por qué esta sobre las otras}

**Criterios priorizados:**
1. {Criterio 1} porque {razón}

**Trade-offs aceptados:**
- Acepto {desventaja} a cambio de {ventaja}

**Reversibilidad:** {Alta|Media|Baja}
```

**Criterios de decisión por defecto:**

| Prioridad | Criterio |
|-----------|----------|
| 1 | Seguridad (nunca comprometer) |
| 2 | Correctitud funcional |
| 3 | Consistencia con existente |
| 4 | Simplicidad |
| 5 | Performance |
| 6 | Extensibilidad futura |

### A - Act (Actuar con Verificación)

Durante la ejecución:

1. Implementar **incrementalmente** (pasos pequeños)
2. Verificar cada paso antes de continuar
3. Ante problemas, documentar opciones y escalar si necesario
4. Mantener estado recoverable (commits atómicos)

### R - Report (Reportar con Razonamiento)

Al completar:

```markdown
## Resultado: {Título}

### Resumen
{1-2 oraciones de qué se logró}

### Decisiones tomadas
| Decisión | Alternativas | Elegida | Razón |
|----------|--------------|---------|-------|
| {D1} | A, B, C | B | {razón} |

### Cambios realizados
- `{archivo}`: {descripción}

### Trade-offs aceptados
- {Trade-off}: {justificación}

### Próximos pasos sugeridos
1. {Paso siguiente}
```

---

## Ejemplo Práctico: Sitio Web con Diseño Impactante

### Discovery

| # | Pregunta | Respuesta |
|---|----------|-----------|
| 1 | Idea de negocio | "Sitio web con diseño impactante, moderno y atrevido" |
| 2 | Tipo de producto | (f) Landing Page |
| 3 | Prioridades | 1. UX, 2. Velocidad, 3. Performance |
| 4 | Stack | "Sugiéreme uno" → React + Next.js + Tailwind |
| 5 | Contexto | Sin pagos, sin datos sensibles, hosting simple |

### Detección de Agentes

| Señal | Agente | Activado |
|-------|--------|----------|
| Landing Page + UX prioritario | @ux-accessibility | ✅ (Core) |
| React detectado | Skill react-best-practices | ✅ |
| "Diseño impactante" → animaciones | @performance | ✅ |
| Sin pagos | @security | ❌ |
| Sin containers | @devops | ❌ |

### Equipo Final

```
Core:
- @developer (+ react/patterns)
- @architect (+ api-design, observability)
- @qa (+ testing, security checks)
- @ux-accessibility (+ accessibility FULL, react/patterns)

Especializados:
- @performance (+ performance FULL, observability)

Skills:
- /react-best-practices

Rules:
- react.md
```

### Aplicación de RADAR por @ux-accessibility

| Fase | Acción del Agente |
|------|-------------------|
| **Read** | Lee nivel WCAG objetivo (AA), componentes UI, tech stack |
| **Analyze** | Evalúa contra criterios WCAG, patrones ARIA, heurísticas |
| **Decide** | Clasifica severidad: A=bloqueante, AA=importante |
| **Act** | Documenta violaciones con ubicación y solución |
| **Report** | Genera Accessibility Audit Report estructurado |

---

## Resumen Visual

```
/genesis
    │
    ├─► Fase 1: Discovery
    │       │
    │       ├─► Pregunta 1: Idea de negocio
    │       ├─► Pregunta 2: Tipo de producto
    │       ├─► Pregunta 3: Prioridades
    │       ├─► Pregunta 4: Stack tecnológico
    │       └─► Pregunta 5: Contexto del proyecto
    │
    ├─► Fase 2: Detección de Agentes
    │       │
    │       ├─► Mapeo de señales → agentes
    │       ├─► Presentación del equipo propuesto
    │       └─► Confirmación del usuario
    │
    ├─► Fase 2.5: Knowledge Injection
    │       │
    │       ├─► Cargar knowledge universal
    │       ├─► Cargar knowledge del stack
    │       └─► Cargar knowledge de dominio
    │
    ├─► Fase 2.6: Generación con Validación
    │       │
    │       ├─► CLAUDE.md
    │       ├─► Agents Core (@developer, @architect, @qa)
    │       ├─► Agents Especializados
    │       ├─► Skills de proyecto
    │       └─► Rules
    │
    ├─► Fase 2.7: Git Worktrees (Opcional)
    │       │
    │       └─► /worktree init si acepta
    │
    ├─► Fase 3: Hooks
    │       │
    │       ├─► pre-commit (linting)
    │       └─► commit-msg (conventional)
    │
    └─► Fase 4: Onboarding
            │
            ├─► Resumen de infraestructura
            ├─► Equipo de agentes
            ├─► Flujo de desarrollo
            ├─► Registro de sesión
            └─► Próximo paso: /brainstorming
```

---

## Flujo Post-Genesis

Una vez completado `/genesis`, el flujo de desarrollo continúa:

```
[✓] /genesis              → Infraestructura completa
[ ] /brainstorming        → Arquitectura del sistema (modo proyecto)
[ ] /brainstorming        → Diseñar features (modo feature)
[ ] /create-issues        → Crear issues en formato Gherkin
[ ] /build-feature        → Implementar desde issue
[ ] /qa                   → Testing + Security Gate
[ ] /merge                → Integrar y cerrar issue
[ ] /release              → Generar release con SemVer
```

### Nota sobre /brainstorming

El primer `/brainstorming` después de `/genesis` detecta automáticamente que es el primer diseño y entra en **modo proyecto**:

1. **Modo PROYECTO** (primer brainstorming):
   - Genera arquitectura del sistema completo
   - Output: `.claude/docs/architecture/001-{proyecto}-arquitectura.md`
   - Incluye ADRs iniciales, flujo de datos, integraciones

2. **Modo FEATURE** (brainstormings posteriores):
   - Diseña features específicas
   - Output: `.claude/docs/plans/YYYY-MM-DD-{feature}-design.md`

> Ver guía completa: `.claude/docs/guides/brainstorming-flow-guide.md`

---

## Referencias

- Skill Genesis: `.claude/skills/genesis/SKILL.md`
- Protocolo RADAR: `.claude/agents/_common/radar-protocol.md`
- Catálogo de Agentes: `.claude/agents/README.md`
- Knowledge Base: `.claude/knowledge/`
- Templates de Agentes: `.claude/agents/templates/`
