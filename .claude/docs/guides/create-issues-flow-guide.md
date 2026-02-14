# Guía Completa: Flujo de /create-issues

> Documentación detallada del proceso de creación de issues del framework InformatiK-AI.

## Índice

- [Visión General](#visión-general)
- [Backends Soportados](#backends-soportados)
- [Fase 1: Cargar Diseño](#fase-1-cargar-diseño)
- [Fase 2: Análisis del Diseño](#fase-2-análisis-del-diseño)
- [Fase 2.5: Consolidación](#fase-25-consolidación)
- [Fase 3: Generación de Issues](#fase-3-generación-de-issues)
- [Fase 4: Validación Uno a Uno](#fase-4-validación-uno-a-uno)
- [Fase 5: Creación según Backend](#fase-5-creación-según-backend)
- [Fase 6: Resumen Final](#fase-6-resumen-final)
- [Formato Gherkin de Issues](#formato-gherkin-de-issues)
- [Principios Clave](#principios-clave)
- [Ejemplo Práctico](#ejemplo-práctico-hero-section)
- [Sistema de Issues Local](#sistema-de-issues-local)
- [Integración con GitHub](#integración-con-github)
- [Resumen Visual](#resumen-visual)

---

## Visión General

El skill `/create-issues` transforma un diseño de brainstorming en **issues accionables** con formato estructurado Gherkin. Es agnóstico del backend: funciona igual con GitHub o con un sistema de issues local.

### Características Principales

| Aspecto | Descripción |
|---------|-------------|
| **Input** | Documento de diseño de `/brainstorming` |
| **Output** | Issues cohesivos en formato Gherkin |
| **Backend** | GitHub o sistema local (configurable) |
| **Validación** | Uno a uno antes de crear |

### Ubicación en el Flujo

```
[✓] /genesis        → Infraestructura del proyecto
[✓] /brainstorming  → Diseño de la feature
[→] /create-issues  ← ESTÁS AQUÍ
[ ] /build-feature  → Implementación
[ ] /qa             → Testing + Security
[ ] /merge          → Integración
```

### Parámetros

| Parámetro | Descripción | Ejemplo |
|-----------|-------------|---------|
| `--feature {nombre}` | Feature del brainstorming a convertir | `--feature hero-section` |
| `--backend {github\|local}` | Override del backend configurado | `--backend local` |

---

## Backends Soportados

### Configuración en CLAUDE.md

```yaml
issues:
  backend: local    # local | github
  repo: null        # owner/repo si es github
```

### Comparación de Backends

| Aspecto | GitHub | Local |
|---------|--------|-------|
| **Almacenamiento** | GitHub Issues API | Archivos markdown |
| **Ubicación** | `github.com/{repo}/issues` | `.claude/issues/` |
| **Colaboración** | Nativa | Manual (git) |
| **Offline** | No | Sí |
| **Integración CI** | Nativa | Personalizable |
| **Comando creación** | `gh issue create` | `Write` tool |

---

## Fase 1: Cargar Diseño

### Búsqueda del Documento

El skill busca el documento de brainstorming en orden:

```
1. .claude/docs/features/{feature}/design.md
       ↓ (si no existe)
2. .claude/docs/plans/*-{feature}-design.md
       ↓ (si no existe)
3. Sugerir: "Ejecuta /brainstorming primero"
```

### Validación del Documento

Verifica que el documento tenga las secciones requeridas:

| Sección | Requerida | Usada para |
|---------|-----------|------------|
| Overview | ✅ | Contexto general del issue |
| Approach | ✅ | Decisiones técnicas |
| Architecture | ✅ | Estructura de componentes |
| Components | ✅ | Identificar issues individuales |
| Data Flow | ⚠️ | Dependencias entre issues |
| Error Handling | ⚠️ | Criterios de aceptación |
| Testing Strategy | ⚠️ | Definition of Done |

---

## Fase 2: Análisis del Diseño

### 2.1 Identificar Feature Slices

Del documento de diseño, agrupar componentes en **feature slices** cohesivos:

```
Feature slice = componentes que forman un entregable testable
  → Componente padre + hijos directos → 1 issue
  → Form + validación + API call → 1 issue
  → Setup inicial + tipos + config → 1 issue
  → Módulos independientes → issues separados
```

### 2.2 Mapear Dependencias

```
Componente A (base)
    ↓
Componente B (usa A)
    ↓
Componente C (usa A y B)
```

Se traduce a:

```
Issue #001: Componente A (bloqueado por: -)
Issue #002: Componente B (bloqueado por: #001)
Issue #003: Componente C (bloqueado por: #001, #002)
```

### 2.3 Determinar Orden de Implementación

Criterios para ordenar:

| Prioridad | Criterio |
|-----------|----------|
| 1 | Componentes base sin dependencias |
| 2 | Componentes que desbloquean más issues |
| 3 | Componentes de mayor riesgo técnico |
| 4 | Componentes de integración |
| 5 | Componentes de UI/polish |

### 2.4 Verificar Granularidad

Cada issue debe ser un **entregable cohesivo** que entrega valor testable end-to-end.

| Tipo de feature | Issues esperados | Ejemplo |
|-----------------|-----------------|---------|
| Pequeña | 1-3 | Landing section, CRUD simple |
| Mediana | 3-5 | Auth system, payment flow |
| Grande | 5-8 | Módulo completo |
| **Máximo absoluto** | ~10 | Si necesita más → brainstorming debió dividir en sub-features |

```
❌ Demasiado fragmentado:
- "Crear componente VideoBackground"
- "Implementar hook useVideoLoader"
- "Crear componente HeroContent"
- "Integrar componentes en HeroSection"
(4 issues para una sola sección)

✅ Entregable cohesivo:
- "Implementar Hero Section con Video de Fondo"
(1 issue con sub-tareas y 10 ACs)
```

---

## Fase 2.5: Consolidación

Después de identificar los feature slices, consolidar antes de generar issues:

### Criterios de Fusión

| Criterio | Acción |
|----------|--------|
| Componente + hook que lo usa | Fusionar |
| Componente padre + hijos directos | Fusionar |
| Form + validación + API call | Fusionar |
| Setup inicial + tipos + config | Fusionar en 1 issue |

### Criterios de Separación

| Criterio | Acción |
|----------|--------|
| Módulos independientes sin relación | Mantener separados |
| Dominios funcionales diferentes | Separar |
| Flujos de usuario distintos | Separar |
| Backend vs Frontend con interfaces claras | Separar |

### Proceso

1. Listar todos los componentes/tareas identificados
2. Agrupar por feature slice usando los criterios de fusión
3. Verificar que cada grupo tiene valor testable independiente
4. Si un issue tiene menos de 3 ACs → candidato a fusionar con otro
5. Si un issue tiene más de 15 ACs → candidato a separar
6. Resultado: set consolidado listo para generar

---

## Fase 3: Generación de Issues

### Template de Issue

```markdown
# {Título descriptivo}

## User Story

Como {rol},
quiero {acción},
para {beneficio}.

## Descripción

{Contexto adicional y detalles técnicos}

## Scope

- **Incluye**: {lo que cubre este issue}
- **NO incluye**: {lo que queda fuera}

## Sub-tareas

- [ ] {Sub-tarea 1: componente/archivo/lógica}
- [ ] {Sub-tarea 2}
- [ ] {Sub-tarea 3}

## Criterios de Aceptación

- [ ] {Criterio 1 - verificable}
- [ ] {Criterio 2 - verificable}
- [ ] ... (8-15 criterios por issue)

## Definition of Done

- [ ] Código implementado y funcionando
- [ ] Tests escritos y pasando
- [ ] Documentación actualizada (si aplica)
- [ ] Code review completado (si aplica)

## Dependencias

- Bloquea: #{números de issues que dependen de este}
- Bloqueado por: #{números de issues que deben completarse antes}

## Notas de Implementación

- **Archivos objetivo**: {paths esperados}
- **Patrones a seguir**: {patrón existente en el proyecto}
- **Consideraciones técnicas**: {decisiones clave}

## Estimación

Complejidad: {baja|media|alta}
```

### Guía de Cantidad de ACs

| Tipo de issue | ACs esperados |
|---------------|---------------|
| Issue simple (1-2 sub-tareas) | 5-8 |
| Issue medio (3-4 sub-tareas) | 8-12 |
| Issue complejo (5+ sub-tareas) | 10-15 |

Cada AC debe cubrir un comportamiento verificable. Más ACs = más verificación en `/qa`.

### Guía para User Stories

| Elemento | Descripción | Ejemplo |
|----------|-------------|---------|
| **Rol** | Quién se beneficia | usuario, desarrollador, admin |
| **Acción** | Qué quiere lograr | ver un video de fondo impactante |
| **Beneficio** | Por qué lo necesita | captar atención inmediata |

```markdown
## User Story

Como visitante de la landing page,
quiero ver un video de fondo que se reproduzca automáticamente,
para tener una primera impresión impactante del producto.
```

### Guía para Criterios de Aceptación

Cada criterio debe ser:

| Característica | Descripción | Ejemplo |
|----------------|-------------|---------|
| **Verificable** | Se puede probar objetivamente | ✅ "El video se reproduce sin sonido" |
| **Específico** | Sin ambigüedad | ✅ "Contraste mínimo 4.5:1" |
| **Atómico** | Una sola cosa | ✅ "El poster se muestra antes del video" |

```markdown
## Criterios de Aceptación

- [ ] El video se reproduce automáticamente al cargar
- [ ] El video está en loop continuo
- [ ] No hay audio (muted)
- [ ] Se muestra poster mientras carga el video
- [ ] El video ocupa 100% del viewport
```

### Guía para Complejidad

| Complejidad | Criterios | Sub-tareas típicas |
|-------------|-----------|---------------------|
| **Baja** | Código straightforward, 1-2 sub-tareas, pocas dependencias | 1-2 |
| **Media** | Requiere decisiones técnicas, 3-4 sub-tareas, algunas integraciones | 3-4 |
| **Alta** | Lógica compleja, 5+ sub-tareas, múltiples integraciones | 5+ |

---

## Fase 4: Validación Uno a Uno

### Presentación de cada Issue

```
📝 Issue #001: Crear componente VideoBackground

## User Story

Como desarrollador,
quiero un componente VideoBackground reutilizable,
para manejar la reproducción del video de fondo.

## Descripción

Componente que encapsula el elemento <video> con:
- Autoplay y loop
- Poster image como fallback
- Intersection Observer para lazy loading

## Criterios de Aceptación

- [ ] El componente acepta props: src, poster, className
- [ ] El video solo carga cuando es visible (Intersection Observer)
- [ ] Se muestra poster hasta que el video está listo
- [ ] Respeta prefers-reduced-motion

## Definition of Done

- [ ] Código implementado y funcionando
- [ ] Tests unitarios escritos y pasando
- [ ] Props documentadas con JSDoc

## Dependencias

- Bloquea: #002, #004
- Bloqueado por: -

## Estimación

Complejidad: media

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

¿Apruebas este issue?
a) Sí, crear issue
b) No, necesita cambios
c) Editar (especifica qué)
```

### Flujo de Validación

```
Presentar Issue
      │
      ├─► (a) Aprobado → Crear issue → Siguiente
      │
      ├─► (b) Rechazado → Descartar → Siguiente
      │
      └─► (c) Editar → Aplicar cambios → Re-presentar
```

### Cambios Comunes

| Solicitud | Acción |
|-----------|--------|
| "Dividir en dos" | Crear 2 issues más pequeños |
| "Agregar criterio" | Añadir AC |
| "Cambiar título" | Reformular |
| "Es muy grande" | Reducir scope o dividir |
| "Falta dependencia" | Agregar bloqueado por |

---

## Fase 5: Creación según Backend

### Backend: GitHub

```bash
gh issue create \
  --title "Crear componente VideoBackground" \
  --body "$(cat <<'EOF'
## User Story

Como desarrollador,
quiero un componente VideoBackground reutilizable...

[resto del contenido]
EOF
)"
```

**Post-creación:**
1. Extraer número de issue del output
2. Actualizar referencias en issues siguientes
3. Agregar labels si están configurados

### Backend: Local

Crea archivo en `.claude/issues/backlog/{número}-{slug}.md`:

```markdown
---
id: 001
title: Crear componente VideoBackground
status: backlog
created: 2026-01-28
labels: [feature, hero-section]
blocked_by: []
blocks: [002, 004]
---

# Crear componente VideoBackground

## User Story

Como desarrollador,
quiero un componente VideoBackground reutilizable,
para manejar la reproducción del video de fondo.

[resto del contenido]
```

**Estructura de carpetas:**

```
.claude/issues/
├── backlog/           # Issues pendientes
│   ├── 001-video-background.md
│   ├── 002-hero-content.md
│   └── 003-hero-section.md
├── in-progress/       # Issues en desarrollo
├── done/              # Issues completados
└── TEMPLATE.md        # Template base
```

---

## Fase 6: Resumen Final

### Output de Finalización

```
✅ Issues creados para feature: hero-section

📋 Issues generados:
   #001 - Implementar Hero Section con Video de Fondo
          Complejidad: media | Sub-tareas: 6 | ACs: 10

📊 Resumen:
   Total: 1 issue (consolidado de 4 componentes)
   Complejidad: 1 media

🔗 Orden de implementación sugerido:
   1. #001 Hero Section completo (sin dependencias)

📍 Progreso del flujo:
   [✓] Génesis
   [✓] Brainstorming
   [✓] Crear Issues ← completado
   [ ] Build Feature
   [ ] QA + Merge

👉 Próximo paso: /build-feature --issue 001
```

### Registro de Sesión

Se crea `.claude/sessions/YYYY-MM-DD-create-issues-{feature}.md`:

```markdown
# Sesión: Create Issues - Hero Section
Fecha: 2026-01-28T15:00:00
Skill: /create-issues

## Resumen
Creado 1 issue consolidado para implementar el hero section con video de fondo.
Se consolidaron 4 componentes (VideoBackground, useVideoLoader, HeroContent, HeroSection)
en un único entregable cohesivo con 10 ACs.

## Issues generados

| # | Título | Complejidad | Sub-tareas | ACs | Bloqueado por |
|---|--------|-------------|------------|-----|---------------|
| 001 | Implementar Hero Section con Video de Fondo | media | 6 | 10 | - |

## Orden de implementación sugerido

1. #001 - Hero Section completo (sin dependencias)

## Decisiones tomadas
- Consolidar 4 componentes en 1 issue (todos forman un mismo feature slice)
- Incluir accesibilidad y responsive como ACs del mismo issue
- Sub-tareas definen el desglose interno sin crear issues separados

## Archivos modificados
- `.claude/issues/backlog/001-hero-section.md` (nuevo)

## Próximo paso sugerido
/build-feature --issue 001
```

---

## Formato Gherkin de Issues

### ¿Por qué Gherkin?

| Beneficio | Descripción |
|-----------|-------------|
| **Claridad** | User Stories estructuradas |
| **Verificabilidad** | ACs como checklist |
| **Trazabilidad** | DoD estándar |
| **Comunicación** | Lenguaje común |

### Anatomía de un Issue Gherkin

```
┌─────────────────────────────────────────┐
│ TÍTULO                                   │
│ Acción concreta + contexto              │
├─────────────────────────────────────────┤
│ USER STORY                              │
│ Como [rol]                              │
│ Quiero [acción]                         │
│ Para [beneficio]                        │
├─────────────────────────────────────────┤
│ DESCRIPCIÓN                             │
│ Contexto técnico y decisiones           │
├─────────────────────────────────────────┤
│ SCOPE                                   │
│ Incluye: ...  NO incluye: ...           │
├─────────────────────────────────────────┤
│ SUB-TAREAS                              │
│ - [ ] Sub-tarea 1                       │
│ - [ ] Sub-tarea 2                       │
├─────────────────────────────────────────┤
│ CRITERIOS DE ACEPTACIÓN (8-15)          │
│ - [ ] Criterio verificable 1            │
│ - [ ] Criterio verificable 2            │
│ - [ ] ...                               │
├─────────────────────────────────────────┤
│ DEFINITION OF DONE                      │
│ - [ ] Código funcionando                │
│ - [ ] Tests pasando                     │
│ - [ ] Documentación (si aplica)         │
├─────────────────────────────────────────┤
│ DEPENDENCIAS                            │
│ Bloquea: #X, #Y                         │
│ Bloqueado por: #Z                       │
├─────────────────────────────────────────┤
│ NOTAS DE IMPLEMENTACIÓN                 │
│ Archivos, patrones, consideraciones     │
├─────────────────────────────────────────┤
│ ESTIMACIÓN                              │
│ Complejidad: baja|media|alta            │
└─────────────────────────────────────────┘
```

---

## Principios Clave

### 1. Entregables Cohesivos

```
❌ Incorrecto (demasiado fragmentado):
- "Crear formulario de login"
- "Implementar validación de credenciales"
- "Agregar manejo de sesión"
- "Conectar form con API"
(4 issues para un solo flujo de usuario)

✅ Correcto (feature slice cohesivo):
- "Implementar Login Flow"
  Sub-tareas: form, validación, API call, session
  ACs: 12 criterios verificables end-to-end

❌ Incorrecto (demasiado grande):
- "Implementar sistema de autenticación completo"
  (múltiples flujos de usuario mezclados)

✅ Correcto (separado por flujo):
- "Implementar Login Flow" (12 ACs)
- "Implementar Registration Flow" (10 ACs)
- "Implementar Password Reset" (8 ACs)
- "Implementar Auth Guards" (8 ACs)
```

### 2. Dependencias Claras

```
❌ Incorrecto:
Issue sin mencionar dependencias
(se descubre a mitad de implementación)

✅ Correcto:
## Dependencias
- Bloqueado por: #001 (necesita el componente base)
- Bloquea: #004 (la integración lo necesita)
```

### 3. Criterios Verificables

```
❌ Incorrecto:
- [ ] El código debe ser limpio
- [ ] La UI debe verse bien
- [ ] Debe ser rápido

✅ Correcto:
- [ ] ESLint pasa sin errores
- [ ] Contraste cumple WCAG AA (4.5:1)
- [ ] Tiempo de carga < 2 segundos
```

### 4. Validación Uno a Uno

```
❌ Incorrecto:
"Aquí tienes 10 issues, ¿los creo todos?"

✅ Correcto:
"Issue #1: [detalle]. ¿Aprobado?"
[respuesta]
"Issue #2: [detalle]. ¿Aprobado?"
[respuesta]
...
```

### 5. Consolidación Antes de Crear

```
❌ Incorrecto:
Generar 8 issues directamente del análisis de componentes
y presentar todos al usuario.

✅ Correcto:
1. Identificar componentes del diseño
2. Agrupar en feature slices (criterios de fusión)
3. Verificar granularidad (guía por scope)
4. Consolidar → presentar set optimizado
```

### 6. Agnóstico de Backend

```
El mismo formato de issue funciona para:
- GitHub Issues (vía gh CLI)
- Sistema local (archivos markdown)
- Futuro: Jira, Linear, etc.
```

---

## Ejemplo Práctico: Hero Section

### Input: Documento de Diseño

```markdown
# Design: Hero Section

## Components

### VideoBackground
Componente para video de fondo con lazy loading.

### useVideoLoader
Hook para manejar Intersection Observer.

### HeroContent
Headline, subheadline y CTA centrados.

### HeroSection
Componente contenedor que integra todo.
```

### Análisis y Consolidación

**Antes (fragmentado):** 4 componentes → 4 issues

```
❌ VideoBackground     → Issue #001
   useVideoLoader     → Issue #002
   HeroContent        → Issue #003
   HeroSection        → Issue #004
   (20 pasos de ceremonia: 4 × 5)
```

**Consolidación aplicada:**
- VideoBackground + useVideoLoader → mismo feature slice (video se usa junto al hook)
- HeroContent → hijo directo de HeroSection
- Todos componen un único entregable: Hero Section

**Después (cohesivo):** 4 componentes → 1 issue

```
✅ Hero Section completo → Issue #001
   (5 pasos de ceremonia: 1 × 5)
```

### Issue Generado

#### Issue #001

```markdown
# Implementar Hero Section con Video de Fondo

## User Story

Como visitante de la landing page,
quiero ver un hero section impactante con video de fondo,
para tener una primera impresión memorable del producto.

## Descripción

Hero section completo que integra video de fondo con lazy loading,
contenido centrado (headline, subheadline, CTA) y accesibilidad.
Incluye todos los componentes: VideoBackground, useVideoLoader,
HeroContent y HeroSection como contenedor.

## Scope

- **Incluye**: VideoBackground, useVideoLoader hook, HeroContent, HeroSection, responsive, accesibilidad, tests unitarios
- **NO incluye**: CMS para editar contenido, analytics de video, múltiples variantes de hero

## Sub-tareas

- [ ] Crear componente VideoBackground (autoplay, loop, muted, object-fit: cover)
- [ ] Implementar hook useVideoLoader (Intersection Observer, prefers-reduced-motion)
- [ ] Crear componente HeroContent (headline, subheadline, CTA)
- [ ] Integrar en HeroSection (100vh, overlay, responsive)
- [ ] Implementar accesibilidad (aria-hidden, contraste)
- [ ] Escribir tests unitarios para todos los componentes

## Criterios de Aceptación

- [ ] VideoBackground renderiza video con autoplay, loop y muted
- [ ] Video usa Intersection Observer para lazy loading
- [ ] Poster se muestra mientras carga el video
- [ ] prefers-reduced-motion es respetado (fallback a poster estático)
- [ ] HeroContent muestra headline (h1), subheadline (p) y CTA (enlace estilizado)
- [ ] Contraste texto/fondo cumple WCAG AA (4.5:1)
- [ ] Hero ocupa 100vh con overlay oscuro entre video y contenido
- [ ] Responsive en todos los breakpoints (desktop, tablet, móvil)
- [ ] Video es decorativo y tiene aria-hidden="true"
- [ ] Tests unitarios pasan para todos los componentes

## Definition of Done

- [ ] Código implementado y funcionando
- [ ] Tests unitarios escritos y pasando
- [ ] Props documentadas con TypeScript
- [ ] Verificado contraste con herramienta

## Dependencias

- Bloquea: -
- Bloqueado por: -

## Notas de Implementación

- **Archivos objetivo**: `src/components/HeroSection/`, `src/hooks/useVideoLoader.ts`
- **Patrones a seguir**: Componentes funcionales con props tipadas, custom hooks con cleanup
- **Consideraciones técnicas**: Intersection Observer para performance, prefers-reduced-motion para accesibilidad

## Estimación

Complejidad: media
```

### Output Final

```
✅ Issues creados para feature: hero-section

📋 Issues generados:
   #001 - Implementar Hero Section con Video de Fondo
          Complejidad: media | Sub-tareas: 6 | ACs: 10

📊 Resumen:
   Total: 1 issue (consolidado de 4 componentes)
   Complejidad: 1 media

🔗 Orden de implementación:
   1. #001 Hero Section completo (sin dependencias)

👉 Próximo paso: /build-feature --issue 001
```

---

## Ejemplo Práctico: Auth System

### Input: Documento de Diseño

```markdown
# Design: Authentication System

## Components
LoginForm, LoginValidation, LoginAPI, SessionManager,
RegisterForm, RegisterValidation, RegisterAPI, EmailVerification,
ForgotPasswordForm, ResetPasswordAPI, ResetPasswordPage,
AuthGuard, ProtectedRoute, AuthContext, useAuth
```

### Análisis y Consolidación

**Antes (fragmentado):** 15 componentes → 12+ issues

**Consolidación aplicada:**
- LoginForm + LoginValidation + LoginAPI + SessionManager → Login Flow
- RegisterForm + RegisterValidation + RegisterAPI + EmailVerification → Registration Flow
- ForgotPasswordForm + ResetPasswordAPI + ResetPasswordPage → Password Reset Flow
- AuthGuard + ProtectedRoute + AuthContext + useAuth → Auth Guards

**Después (cohesivo):** 15 componentes → 4 issues

```
#001: Implementar Login Flow
      Sub-tareas: form, validación, API call, session management
      12 ACs | Complejidad: alta

#002: Implementar Registration Flow
      Sub-tareas: form, validación, API call, email verification
      10 ACs | Complejidad: alta

#003: Implementar Password Reset Flow
      Sub-tareas: forgot form, reset API, reset page
      8 ACs | Complejidad: media

#004: Implementar Auth Guards y Route Protection
      Sub-tareas: AuthContext, useAuth hook, ProtectedRoute, AuthGuard
      8 ACs | Complejidad: media
```

### Output Final

```
✅ Issues creados para feature: auth-system

📋 Issues generados:
   #001 - Implementar Login Flow (alta, 12 ACs)
   #002 - Implementar Registration Flow (alta, 10 ACs)
   #003 - Implementar Password Reset Flow (media, 8 ACs)
   #004 - Implementar Auth Guards y Route Protection (media, 8 ACs)

📊 Resumen:
   Total: 4 issues (consolidado de 15 componentes)
   Complejidad: 2 alta, 2 media

🔗 Orden de implementación:
   1. #001 Login Flow (base de autenticación)
   2. #004 Auth Guards (necesita session de #001)
   3. #002 Registration Flow (paralelo a #004)
   4. #003 Password Reset (independiente)

👉 Próximo paso: /build-feature --issue 001
```

---

## Sistema de Issues Local

### Estructura de Carpetas

```
.claude/issues/
├── backlog/              # Issues pendientes
│   └── 001-hero-section.md
├── in-progress/          # Issues en desarrollo
│   └── (vacío inicialmente)
├── done/                 # Issues completados
│   └── (vacío inicialmente)
└── TEMPLATE.md           # Template base
```

### Frontmatter del Issue

```yaml
---
id: 001
title: Implementar Hero Section con Video de Fondo
status: backlog          # backlog | in-progress | done
created: 2026-01-28
labels: [feature, hero-section]
blocked_by: []           # IDs de issues que bloquean este
blocks: []               # IDs de issues que este bloquea
---
```

### Ciclo de Vida

```
backlog/001-xxx.md
        │
        ▼ (/build-feature --issue 001)
in-progress/001-xxx.md
        │
        ▼ (/merge --issue 001)
done/001-xxx.md
```

### Comandos Útiles

```bash
# Ver issues en backlog
ls .claude/issues/backlog/

# Ver issue en progreso
ls .claude/issues/in-progress/

# Buscar issue por palabra
grep -r "VideoBackground" .claude/issues/
```

---

## Integración con GitHub

### Requisitos

- GitHub CLI (`gh`) instalado y autenticado
- Repositorio configurado en CLAUDE.md

```yaml
issues:
  backend: github
  repo: usuario/mi-proyecto
```

### Creación de Issue

```bash
gh issue create \
  --repo usuario/mi-proyecto \
  --title "Crear componente VideoBackground" \
  --body "contenido..." \
  --label "feature,hero-section"
```

### Labels Automáticos

| Tipo | Label sugerido |
|------|----------------|
| Feature nueva | `feature` |
| Bug fix | `bug` |
| Mejora | `enhancement` |
| Documentación | `docs` |

### Sincronización de Estado

```bash
# Ver estado de issues
gh issue list --repo usuario/mi-proyecto

# Cerrar issue completado
gh issue close 001 --repo usuario/mi-proyecto
```

---

## Resumen Visual

```
/create-issues --feature hero-section
    │
    ├─► Fase 1: Cargar Diseño
    │       │
    │       ├─► Buscar documento de brainstorming
    │       └─► Validar secciones requeridas
    │
    ├─► Fase 2: Análisis del Diseño
    │       │
    │       ├─► Identificar feature slices
    │       ├─► Mapear dependencias
    │       ├─► Determinar orden
    │       └─► Verificar granularidad (guía por scope)
    │
    ├─► Fase 2.5: Consolidación
    │       │
    │       ├─► Aplicar criterios de fusión
    │       ├─► Aplicar criterios de separación
    │       ├─► Verificar ACs por issue (8-15)
    │       └─► Set consolidado listo
    │
    ├─► Fase 3: Generación de Issues
    │       │
    │       ├─► User Story (Como/Quiero/Para)
    │       ├─► Scope (incluye / NO incluye)
    │       ├─► Sub-tareas
    │       ├─► Criterios de Aceptación (8-15)
    │       ├─► Definition of Done
    │       ├─► Notas de Implementación
    │       └─► Dependencias y Complejidad
    │
    ├─► Fase 4: Validación Uno a Uno
    │       │
    │       ├─► Presentar Issue #001
    │       │     └─► ¿Aprobado? → Crear
    │       └─► ... (cada issue consolidado)
    │
    ├─► Fase 5: Creación según Backend
    │       │
    │       ├─► GitHub: gh issue create
    │       └─► Local: Write .claude/issues/backlog/
    │
    └─► Fase 6: Resumen Final
            │
            ├─► Lista de issues creados (con sub-tareas y ACs)
            ├─► Orden de implementación
            ├─► Registro de sesión
            └─► Próximo paso: /build-feature
```

---

## Comparación: /brainstorming vs /create-issues

| Aspecto | /brainstorming | /create-issues |
|---------|----------------|----------------|
| **Input** | Idea del usuario | Documento de diseño |
| **Output** | Documento de diseño | Issues accionables |
| **Enfoque** | Exploración y decisiones | Planificación y división |
| **Preguntas** | Abiertas, exploratorias | Validación sí/no/editar |
| **Granularidad** | Feature completa | Entregables cohesivos (feature slices) |
| **Siguiente** | /create-issues | /build-feature |

---

## Troubleshooting

### "No encuentro el documento de diseño"

**Síntoma:** El skill no encuentra el brainstorming.

**Solución:**
1. Verificar nombre del feature
2. Buscar en `.claude/docs/plans/`
3. Ejecutar `/brainstorming` si no existe

### "Los issues son muy grandes"

**Síntoma:** Issues con más de 15 ACs o que mezclan flujos de usuario distintos.

**Solución:**
1. Verificar si mezcla dominios funcionales diferentes → separar
2. Verificar si mezcla flujos de usuario distintos → separar
3. Mantener cada issue como un feature slice con valor testable independiente

### "Dependencias circulares"

**Síntoma:** Issue A bloquea B, B bloquea A.

**Solución:**
1. Identificar componente más básico
2. Extraer parte común a nuevo issue
3. Reorganizar dependencias

### "Demasiados issues"

**Síntoma:** Feature simple con más issues de lo esperado por la guía de granularidad.

**Solución:**
1. Aplicar criterios de fusión (Fase 2.5 Consolidación)
2. Verificar que cada issue entrega valor testable independiente
3. Fusionar issues que modifican los mismos archivos o componen un mismo feature slice
4. Consultar guía: Pequeña 1-3, Mediana 3-5, Grande 5-8, Máximo ~10

### "Issue demasiado simple"

**Síntoma:** Issue con menos de 3 ACs o sin valor testable independiente.

**Solución:**
1. Fusionar con el issue más relacionado
2. Si es setup/config, incluir en el primer issue que lo necesite
3. Todo issue debe tener al menos 5 ACs verificables

---

## Referencias

- Skill Create Issues: `.claude/skills/create-issues/SKILL.md`
- Template de Issue: `.claude/issues/TEMPLATE.md`
- Template de Sesión: `.claude/skills/_common/session-template.md`
- Guía Brainstorming: `.claude/docs/guides/brainstorming-flow-guide.md`
- Siguiente Skill: `.claude/skills/build-feature/SKILL.md`
