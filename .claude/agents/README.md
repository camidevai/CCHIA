# Catálogo de Agentes

Sistema de agentes especializados con protocolo RADAR integrado.

## Arquitectura

```
agents/
├── _common/                 # Componentes compartidos
│   ├── radar-protocol.md    # Protocolo RADAR unificado
│   ├── checklists.md        # Checklists estándar
│   ├── escalation-matrix.md # Matriz de escalación
│   └── framework-decision.md # Framework de decisión
├── templates/
│   └── agent-radar-template.md
├── developer.md             # Core
├── architect.md             # Core
├── qa.md                    # Core
├── ux-accessibility.md      # Core
├── security.md              # Especializado
├── devops.md                # Especializado
├── api-specialist.md        # Especializado
├── ml-engineer.md           # Especializado
├── mobile.md                # Especializado
└── performance.md           # Especializado
```

---

## Agentes Core (siempre disponibles)

| Agent | Rol | Responsabilidades |
|-------|-----|-------------------|
| @developer | Implementación | Código funcional, tests, seguir patrones |
| @architect | Arquitectura | Decisiones de diseño, ADRs, trade-offs |
| @qa | Quality Assurance | Testing, Security Gate, validación de ACs. En env mode: orquesta @security y @ux-accessibility |
| @ux-accessibility | UX y Accesibilidad | Core condicional (siempre disponible, pero se activa solo si proyecto tiene UI). Basic gate durante `/qa` standard. Full WCAG audit durante `/qa --env qa`. Skipped para proyectos sin UI (APIs, backend, CLI, libraries) |

---

## Agentes Especializados

Se activan durante `/genesis` cuando el proyecto los requiere.

### @security
**Rol:** Seguridad y Compliance

**Se activa cuando:**
- Manejo de pagos o datos financieros
- Datos sensibles (PII, PHI)
- Requisitos de compliance (GDPR, HIPAA, PCI-DSS)
- Autenticación/autorización compleja
- **Invocado por `/qa --env qa`** para deep review del codebase completo

**Responsabilidades:**
- Threat modeling y análisis STRIDE
- Security reviews de código y arquitectura
- Secrets management policies
- Compliance verification

---

### @devops
**Rol:** Infrastructure/DevOps

**Se activa cuando:**
- Containerización (Docker, K8s)
- Cloud deployment (AWS, GCP, Azure)
- CI/CD complejo
- Infrastructure as Code

**Responsabilidades:**
- Pipelines de CI/CD
- Estrategias de containerización
- Configuración cloud
- Monitoring y alerting

---

### @api-specialist
**Rol:** Diseño de APIs

**Se activa cuando:**
- APIs públicas
- GraphQL implementation
- Microservices architecture
- API versioning complejo

**Responsabilidades:**
- Contratos de API (REST, GraphQL, gRPC)
- Estrategias de versionado
- Rate limiting policies
- API documentation (OpenAPI)

---

### @ml-engineer
**Rol:** Machine Learning / AI

**Se activa cuando:**
- ML/AI es parte del dominio del producto
- Training pipelines necesarios
- Model serving en producción

**Responsabilidades:**
- Arquitecturas de modelos
- Training y inference pipelines
- MLOps practices
- Feature engineering

---

### @mobile
**Rol:** Mobile Development

**Se activa cuando:**
- React Native o Flutter
- Apps móviles nativas
- Performance móvil crítica

**Responsabilidades:**
- Platform-specific decisions
- Mobile performance optimization
- Cross-platform patterns
- App store compliance

---

### @performance
**Rol:** Performance Engineering

**Se activa cuando:**
- Alto tráfico esperado
- Latencia crítica
- Optimización como prioridad

**Responsabilidades:**
- Profiling y benchmarking
- Caching strategies
- Database optimization
- High-scale architecture

---

## Detección Dinámica

Durante `/genesis`, el sistema detecta qué agentes son necesarios:

| Señales en discovery | Agente activado |
|---------------------|-----------------|
| Pagos, PCI, datos sensibles, GDPR, HIPAA | @security |
| Docker, K8s, AWS/GCP/Azure, CI/CD | @devops |
| AI/ML, Machine Learning | @ml-engineer |
| Mobile App, React Native, Flutter | @mobile |
| GraphQL, API pública, Microservicios | @api-specialist |
| Alto tráfico, performance crítico | @performance |

### Ejemplos de Discovery Signals

| Signal en respuestas de /genesis | Agente activado |
|----------------------------------|-----------------|
| "Procesamos pagos con Stripe" | @security |
| "Necesitamos HIPAA compliance" | @security |
| "Usaremos Docker y Kubernetes" | @devops |
| "AWS Lambda para backend" | @devops |
| "Modelo de ML para recomendaciones" | @ml-engineer |
| "App React Native para iOS y Android" | @mobile |
| "API REST publica con rate limiting" | @api-specialist |
| "GraphQL federation" | @api-specialist |
| "50K usuarios concurrentes" | @performance |
| "Caching con Redis para alta carga" | @performance |

---

## Protocolo RADAR

Todos los agentes implementan el protocolo RADAR:

```
R - Read     → Leer contexto completo antes de actuar
A - Analyze  → Generar 2-3 alternativas viables
D - Decide   → Elegir con justificación documentada
A - Act      → Ejecutar con verificación incremental
R - Report   → Comunicar resultado con razonamiento
```

Ver: [radar-protocol.md](_common/radar-protocol.md)

---

## Knowledge Injection Matrix

| Agente | Universal | Stack | Domain |
|--------|-----------|-------|--------|
| @developer | testing, git, security basics | stack/patterns | - |
| @architect | api-design, performance, observability | stack/patterns | - |
| @qa | testing, security checks | stack/security | - |
| @ux-accessibility | accessibility (FULL) | react/patterns | - |
| @security | security (FULL) | stack/security | domain/compliance |
| @devops | observability | - | domain/infrastructure |
| @ml-engineer | performance | python/patterns | domain/ml-patterns |
| @mobile | testing | mobile patterns | - |
| @api-specialist | api-design (FULL) | stack/patterns | - |
| @performance | performance (FULL), observability | stack/patterns | - |
