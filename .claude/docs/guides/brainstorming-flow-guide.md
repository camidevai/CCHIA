# Guía Completa: Flujo de /brainstorming

> Documentación detallada del proceso de ideación y diseño del framework InformatiK-AI.

## Índice

- [Visión General](#visión-general)
- [Detección Automática de Modo](#detección-automática-de-modo)
- [Modo PROYECTO](#modo-proyecto)
- [Modo FEATURE](#modo-feature)
- [Cuándo Usar Este Skill](#cuándo-usar-este-skill)
- [Fase 1: Entender la Idea](#fase-1-entender-la-idea)
- [Fase 2: Explorar Enfoques](#fase-2-explorar-enfoques)
- [Fase 3: Presentar el Diseño](#fase-3-presentar-el-diseño)
- [Fase 4: Documentación](#fase-4-documentación)
- [Fase 5: Finalización](#fase-5-finalización)
- [Template del Documento de Diseño](#template-del-documento-de-diseño)
- [Principios Clave](#principios-clave)
- [Ejemplo Práctico](#ejemplo-práctico-landing-page-con-diseño-impactante)
- [Integración con Agentes](#integración-con-agentes)
- [Resumen Visual](#resumen-visual)

---

## Visión General

El skill `/brainstorming` transforma ideas en **diseños completos y especificaciones** a través de un diálogo colaborativo y estructurado.

### Características Principales

| Aspecto | Descripción |
|---------|-------------|
| **Propósito** | Convertir ideas vagas en diseños concretos |
| **Método** | Diálogo iterativo con preguntas una a una |
| **Output** | Documento de diseño en markdown |
| **Naturaleza** | Solo planificación, NUNCA ejecuta código |

### Ubicación en el Flujo

```
[✓] /genesis              → Infraestructura del proyecto
[→] /brainstorming        ← ESTÁS AQUÍ (modo PROYECTO o FEATURE)
[ ] /create-issues        → Issues en formato Gherkin
[ ] /build-feature        → Implementación
[ ] /qa                   → Testing + Security
[ ] /merge                → Integración
```

---

## Detección Automática de Modo

El skill `/brainstorming` opera en **dos modos** que se detectan automáticamente:

### Lógica de Detección

```
SI NO existe `.claude/docs/plans/*-design.md`
   Y NO existe `.claude/docs/architecture/*-arquitectura.md`
   Y existe `.claude/sessions/*-genesis.md`
ENTONCES
   → Modo PROYECTO (primer brainstorming post-genesis)
SINO
   → Modo FEATURE (comportamiento estándar)
```

### Resumen de Modos

| Modo | Cuándo se activa | Output |
|------|------------------|--------|
| **PROYECTO** | Primer brainstorming después de `/genesis` | `.claude/docs/architecture/001-{proyecto}-arquitectura.md` |
| **FEATURE** | Brainstormings posteriores | `.claude/docs/plans/YYYY-MM-DD-{feature}-design.md` |

---

## Modo PROYECTO

### Propósito

El primer `/brainstorming` después de `/genesis` tiene un propósito especial: **definir la arquitectura del sistema completo** antes de diseñar features individuales.

Este documento sirve como:
- Contexto técnico para todos los agentes
- ADR inicial del proyecto
- Base para las features a implementar

### Alcance del Modo Proyecto

| Aspecto | Qué se define |
|---------|---------------|
| Contexto | Qué hace el sistema, para quién, qué problema resuelve |
| ADRs Iniciales | Decisiones de stack y arquitectura con justificación |
| Componentes | Módulos principales y sus responsabilidades |
| Flujo de datos | Cómo fluye la información en el sistema |
| Integraciones | APIs externas, servicios, bases de datos |
| Seguridad | Autenticación, autorización, datos sensibles |
| Testing | Estrategia de testing del sistema |

### Preguntas Adicionales del Modo Proyecto

1. **Visión del sistema**: ¿Cuál es el flujo principal del usuario?
2. **Módulos principales**: ¿Cuáles son las áreas funcionales clave?
3. **Flujo de datos**: ¿Cómo fluye la información?
4. **Integraciones**: ¿Qué servicios externos se usarán?
5. **Seguridad**: ¿Qué datos sensibles maneja?
6. **Testing**: ¿Qué nivel de cobertura se requiere?

### Template del Modo Proyecto

```markdown
# Arquitectura: {Nombre del Proyecto}

## Contexto del Sistema
{Qué hace el sistema, para quién, qué problema resuelve}

## Decisiones de Arquitectura (ADR Inicial)

### ADR-001: Stack Tecnológico
**Contexto:** {Por qué se eligió}
**Decisión:** {Stack específico}
**Consecuencias:** {Trade-offs}

### ADR-002: Arquitectura General
**Contexto:** {Requisitos}
**Decisión:** {Tipo de arquitectura}
**Consecuencias:** {Implicaciones}

## Componentes del Sistema
| Componente | Responsabilidad | Tecnología |
|------------|-----------------|------------|

## Flujo de Datos Principal
{Descripción del flujo}

## Integraciones Externas
| Servicio | Propósito | Credenciales |
|----------|-----------|--------------|

## Consideraciones de Seguridad
- **Autenticación:** {estrategia}
- **Autorización:** {modelo}
- **Datos sensibles:** {protección}

## Estrategia de Testing
| Tipo | Herramientas | Cobertura |
|------|--------------|-----------|

## Próximos Pasos
1. {Primera feature}
2. {Segunda feature}
```

### Output del Modo Proyecto

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

---

## Modo FEATURE

El modo feature es el comportamiento estándar del skill, diseñado para crear diseños de features específicas.

---

## Cuándo Usar Este Skill

### DEBE usarse antes de

- Crear nuevas features
- Construir componentes
- Agregar funcionalidad
- Modificar comportamiento existente
- Cualquier trabajo creativo significativo

### NO es necesario para

- Corrección de bugs simples
- Cambios de estilo/formato
- Actualizaciones de dependencias
- Tareas con requisitos ya definidos

---

## Fase 1: Entender la Idea

### 1.1 Revisar Contexto del Proyecto

Antes de comenzar las preguntas, el sistema:

1. **Lee archivos existentes** del proyecto
2. **Revisa documentación** (CLAUDE.md, ADRs)
3. **Examina commits recientes** para entender el estado actual
4. **Identifica patrones** y convenciones establecidas

### 1.2 Preguntas de Descubrimiento

El skill hace preguntas **una a una**, esperando respuesta antes de continuar.

```
Regla: Solo UNA pregunta por mensaje
```

**Tipos de preguntas:**

| Tipo | Cuándo usar | Ejemplo |
|------|-------------|---------|
| **Múltiple opción** | Preferido cuando hay opciones claras | "¿Qué tipo de animaciones prefieres? a) Sutiles b) Llamativas c) Minimalistas" |
| **Abierta** | Cuando se necesita exploración | "¿Qué problema específico resuelve esta feature?" |
| **Sí/No** | Para confirmar supuestos | "¿Los usuarios necesitarán autenticarse?" |

**Áreas a explorar:**

| Área | Preguntas típicas |
|------|-------------------|
| **Propósito** | ¿Qué problema resuelve? ¿Para quién? |
| **Alcance** | ¿Qué incluye? ¿Qué NO incluye? |
| **Restricciones** | ¿Límites técnicos? ¿De tiempo? ¿De presupuesto? |
| **Criterios de éxito** | ¿Cómo sabremos que funciona? |
| **Dependencias** | ¿Qué necesita existir primero? |

### 1.3 Ejemplo de Secuencia

```
Sistema: ¿Cuál es el objetivo principal de esta feature?
Usuario: Quiero un hero section que impacte visualmente

Sistema: ¿Qué elementos debe incluir el hero?
a) Solo título y CTA
b) Título, subtítulo y CTA
c) Título, imagen/video y CTA
d) Diseño personalizado (describe)
Usuario: c) Título, video de fondo y CTA

Sistema: ¿El video debe reproducirse automáticamente?
Usuario: Sí, en loop y sin sonido

Sistema: ¿Hay restricciones de accesibilidad específicas?
a) WCAG AA estándar
b) WCAG AAA estricto
c) Sin restricciones específicas
Usuario: a) WCAG AA estándar
```

---

## Fase 2: Explorar Enfoques

### 2.1 Proponer Alternativas

Una vez entendida la idea, el sistema propone **2-3 enfoques diferentes**:

```markdown
## Enfoques Propuestos

### Enfoque A: Video HTML5 Nativo (Recomendado)
**Descripción:** Usar elemento <video> con lazy loading

**Pros:**
- Máximo control sobre reproducción
- Mejor performance inicial
- Sin dependencias externas

**Cons:**
- Requiere múltiples formatos (mp4, webm)
- Más trabajo de optimización manual

**Esfuerzo:** Medio

---

### Enfoque B: Librería de Video (react-player)
**Descripción:** Usar react-player para abstracción

**Pros:**
- API simplificada
- Soporte multi-fuente automático

**Cons:**
- Bundle size adicional (~50kb)
- Menor control granular

**Esfuerzo:** Bajo

---

### Enfoque C: CSS Background Video
**Descripción:** Video como background-image con object-fit

**Pros:**
- Implementación más simple
- Buena integración con layouts

**Cons:**
- Menos control de reproducción
- Problemas en algunos móviles

**Esfuerzo:** Bajo
```

### 2.2 Recomendación Justificada

El sistema **lidera con su recomendación** y explica por qué:

```
Recomiendo el Enfoque A (Video HTML5 Nativo) porque:

1. Tu prioridad es UX/diseño impactante → necesitas control total
2. Sin dependencias = mejor performance = mejor experiencia
3. El esfuerzo adicional se compensa con flexibilidad

¿Estás de acuerdo o prefieres explorar otro enfoque?
```

### 2.3 Iterar si es Necesario

- Si el usuario tiene dudas → explorar más
- Si prefiere otro enfoque → documentar razón
- Si quiere combinar → evaluar viabilidad

---

## Fase 3: Presentar el Diseño

### 3.1 Presentación Incremental

El diseño se presenta en **secciones de 200-300 palabras**:

```
Sección 1: Overview         → "¿Esto captura bien el objetivo?"
    ↓
Sección 2: Arquitectura     → "¿La estructura tiene sentido?"
    ↓
Sección 3: Componentes      → "¿Falta algún componente?"
    ↓
Sección 4: Data Flow        → "¿El flujo de datos es claro?"
    ↓
Sección 5: Error Handling   → "¿Cubrimos los casos de error?"
    ↓
Sección 6: Testing          → "¿La estrategia de testing es adecuada?"
```

### 3.2 Validación por Sección

Después de cada sección:

```
¿Esta sección captura correctamente lo que discutimos?
a) Sí, continúa con la siguiente
b) Necesita ajustes (especifica)
c) Volvamos a discutir este punto
```

### 3.3 Flexibilidad para Retroceder

Si algo no tiene sentido:
- Volver a la sección anterior
- Reformular preguntas
- Explorar alternativas no consideradas

---

## Fase 4: Documentación

### 4.1 Ubicación del Output

| Escenario | Ubicación |
|-----------|-----------|
| Con parámetro `PLAN_NAME` | `.claude/docs/{PLAN_NAME}/brainstorming.md` |
| Uso standalone | `.claude/docs/plans/YYYY-MM-DD-<topic>-design.md` |

### 4.2 Proceso de Escritura

```
1. Determinar path según parámetros
       ↓
2. Usar Write tool para crear archivo
       ↓
3. Incluir TODAS las secciones validadas
       ↓
4. Commit del documento a git
```

**CRÍTICO:** El documento DEBE ser creado explícitamente con Write tool.

---

## Fase 5: Finalización

### 5.1 Confirmar Creación

```
✅ Brainstorming completado.

Documento guardado en: `.claude/docs/plans/2026-01-28-hero-section-design.md`
```

### 5.2 Mostrar Progreso

```
📍 Progreso del flujo:
   [✓] Génesis
   [✓] Brainstorming ← completado
   [ ] Crear Issues
   [ ] Build Feature
   [ ] QA + Merge

👉 Próximo paso: /create-issues
```

### 5.3 Registro de Sesión

Se crea automáticamente:

```
.claude/sessions/YYYY-MM-DD-brainstorming-{feature}.md
```

**Contenido:**

```markdown
# Sesión: Brainstorming - Hero Section
Fecha: 2026-01-28T14:30:00
Skill: /brainstorming

## Resumen
Diseño de hero section con video de fondo para landing page.

## Decisiones tomadas
- Video HTML5 nativo: Mayor control para experiencia impactante
- Lazy loading: Performance optimizada
- Fallback imagen: Accesibilidad en conexiones lentas

## Alternativas consideradas
- react-player: Descartado por bundle size
- CSS background: Descartado por limitaciones móviles

## Archivos modificados
- `.claude/docs/plans/2026-01-28-hero-section-design.md` (nuevo)

## Próximo paso sugerido
/create-issues
```

---

## Template del Documento de Diseño

```markdown
# Design: {Feature Name}

## Overview

{Descripción breve del feature y sus objetivos principales.
Máximo 2-3 oraciones que capturen la esencia.}

## Approach

{Enfoque elegido y justificación.
Por qué este enfoque sobre las alternativas.
Trade-offs aceptados.}

## Architecture

{Decisiones de arquitectura de alto nivel.
Cómo encaja en el sistema existente.
Patrones utilizados.}

## Components

{Componentes clave y sus responsabilidades.
Estructura de archivos propuesta.
Interfaces entre componentes.}

### Component: {Name}
- **Responsabilidad:** {qué hace}
- **Props/Inputs:** {entradas}
- **Output:** {salidas}

## Data Flow

{Cómo fluyen los datos a través del sistema.
Diagrama ASCII si ayuda a clarificar.
Estados y transiciones.}

```
User Action → Component → State → UI Update
```

## Error Handling

{Escenarios de error identificados.
Estrategia de manejo para cada uno.
Mensajes de error y recuperación.}

| Error | Causa | Manejo |
|-------|-------|--------|
| {error} | {causa} | {acción} |

## Testing Strategy

{Cómo se probará esta feature.
Tipos de tests necesarios.
Casos críticos a cubrir.}

### Unit Tests
- {test 1}
- {test 2}

### Integration Tests
- {test 1}

### E2E Tests (si aplica)
- {test 1}
```

---

## Principios Clave

### 1. Una Pregunta a la Vez

```
❌ Incorrecto:
"¿Qué colores quieres? ¿Y qué tipografía?
¿Hay animaciones? ¿Responsive?"

✅ Correcto:
"¿Qué estilo de colores prefieres para el hero?"
[esperar respuesta]
"¿Qué tipografía refleja mejor la marca?"
[esperar respuesta]
```

### 2. Múltiple Opción Preferido

```
❌ Incorrecto:
"¿Cómo quieres manejar el estado?"

✅ Correcto:
"¿Cómo prefieres manejar el estado del video?
a) Estado local con useState
b) Context para compartir entre componentes
c) Zustand para estado global"
```

### 3. YAGNI Implacable

```
❌ Incorrecto:
"Agreguemos soporte para múltiples videos,
playlist, controles personalizados, analytics
de reproducción, subtítulos multi-idioma..."

✅ Correcto:
"Para el MVP: un video, autoplay, sin controles.
¿Necesitas algo más ahora mismo?"
```

### 4. Explorar Alternativas

```
❌ Incorrecto:
"Usaremos React Player porque es fácil."

✅ Correcto:
"Hay 3 enfoques posibles:
A) HTML5 nativo (recomendado) - máximo control
B) React Player - más fácil, menos control
C) CSS background - simple pero limitado

¿Cuál prefieres explorar?"
```

### 5. Validación Incremental

```
❌ Incorrecto:
[Presenta documento de 2000 palabras]
"¿Todo bien?"

✅ Correcto:
[Presenta Overview - 200 palabras]
"¿Esto captura el objetivo?"
[Presenta Arquitectura - 250 palabras]
"¿La estructura hace sentido?"
```

### 6. Flexibilidad para Retroceder

```
Usuario: "Espera, creo que el enfoque A no funciona para móvil"

Sistema: "Buen punto. Volvamos a evaluar los enfoques
considerando las limitaciones móviles..."
```

---

## Ejemplo Práctico: Landing Page con Diseño Impactante

### Contexto

Después de `/genesis`, el usuario quiere diseñar el hero section.

### Diálogo de Discovery

```
Sistema: Revisé el proyecto. Es una landing page con
React + Next.js + Tailwind. ¿Qué feature quieres diseñar?

Usuario: El hero section, quiero que sea impactante visualmente

Sistema: ¿Qué elemento principal quieres en el hero?
a) Video de fondo
b) Imagen hero con parallax
c) Animación/ilustración interactiva
d) Diseño tipográfico bold

Usuario: a) Video de fondo

Sistema: ¿El video debe cubrir toda la pantalla (fullscreen)?

Usuario: Sí, 100vh con el contenido centrado encima

Sistema: ¿Qué contenido irá sobre el video?
a) Solo headline + CTA
b) Headline + subheadline + CTA
c) Headline + formulario de captura
d) Otro (especifica)

Usuario: b) Headline + subheadline + CTA

Sistema: ¿Hay requisitos de accesibilidad específicos?
a) WCAG AA (estándar recomendado)
b) WCAG AAA (más estricto)
c) Mínimo viable

Usuario: a) WCAG AA

Sistema: ¿El video tiene audio?

Usuario: No, solo visual

Sistema: ¿Necesitas fallback para conexiones lentas?
a) Sí, imagen de poster
b) Sí, degradado de color
c) No, el video es esencial

Usuario: a) Sí, imagen de poster
```

### Exploración de Enfoques

```
Basándome en tus respuestas, propongo 3 enfoques:

## Enfoque A: Video HTML5 con Intersection Observer (Recomendado)

**Descripción:**
Video nativo con lazy loading via Intersection Observer.
Solo carga cuando el hero es visible.

**Pros:**
- Performance óptima (no carga innecesariamente)
- Control total de reproducción
- Mejor para SEO (Next.js puede pre-renderizar poster)

**Cons:**
- Más código para manejar estados
- Requiere formatos mp4 + webm

**Esfuerzo:** Medio

---

## Enfoque B: Next/Image con video como poster + autoplay

**Descripción:**
Usar next/image para el poster, video se activa on-mount

**Pros:**
- Optimización de imagen automática
- Más simple de implementar

**Cons:**
- Menos control sobre timing de carga
- Posible flash entre poster y video

**Esfuerzo:** Bajo

---

## Enfoque C: Component Library (react-player)

**Descripción:**
Usar react-player para abstracción completa

**Pros:**
- API muy simple
- Maneja edge cases automáticamente

**Cons:**
- +50kb de bundle
- Menos control visual

**Esfuerzo:** Bajo

---

Recomiendo Enfoque A porque:
1. Tu prioridad es "diseño impactante" → necesitas control total
2. Performance es clave en landing pages → lazy loading nativo
3. WCAG AA requiere poster accesible → mejor con HTML5 nativo

¿Vamos con el Enfoque A?
```

### Presentación del Diseño (Sección por Sección)

**Sección 1: Overview**
```
## Overview

Hero section fullscreen con video de fondo que
crea impacto visual inmediato. El video se reproduce
automáticamente en loop, sin audio. Sobre el video
se muestra headline, subheadline y CTA centrados.

Incluye fallback de imagen poster para:
- Conexiones lentas
- Usuarios con data saver
- Antes de que cargue el video

Cumple WCAG AA con contraste adecuado entre
texto y video/poster.

¿Esto captura el objetivo? (a) Sí (b) Ajustar
```

**Sección 2: Arquitectura**
```
## Architecture

Estructura de componentes:

```
HeroSection/
├── index.tsx           # Componente principal
├── VideoBackground.tsx # Maneja video + poster
├── HeroContent.tsx     # Headline + CTA
├── hooks/
│   └── useVideoLoader.ts  # Intersection Observer
└── styles/
    └── hero.module.css    # Estilos específicos
```

Decisiones clave:
- Componentes separados para testabilidad
- Hook custom para lógica de carga
- CSS Modules para encapsulación

¿La estructura hace sentido? (a) Sí (b) Ajustar
```

[Continúa con cada sección...]

### Output Final

```
✅ Brainstorming completado.

Documento guardado en:
`.claude/docs/plans/2026-01-28-hero-section-design.md`

📍 Progreso del flujo:
   [✓] Génesis
   [✓] Brainstorming ← completado
   [ ] Crear Issues
   [ ] Build Feature
   [ ] QA + Merge

👉 Próximo paso: /create-issues

El documento incluye:
- Overview con objetivos
- Enfoque elegido (HTML5 + Intersection Observer)
- Arquitectura de componentes
- Flujo de datos (video loading states)
- Manejo de errores (fallbacks)
- Estrategia de testing
```

---

## Integración con Agentes

Durante el brainstorming, diferentes agentes pueden ser consultados:

| Agente | Cuándo se consulta | Qué aporta |
|--------|-------------------|------------|
| `@architect` | Decisiones de estructura | Valida arquitectura propuesta |
| `@ux-accessibility` | Requisitos de accesibilidad | Verifica WCAG compliance |
| `@performance` | Features con impacto en performance | Sugiere optimizaciones |
| `@developer` | Viabilidad técnica | Confirma que es implementable |

### Ejemplo de Consulta a @ux-accessibility

```
Sistema: Consultando @ux-accessibility sobre el hero con video...

@ux-accessibility: Para WCAG AA con video de fondo:

1. Contraste texto/fondo: Overlay oscuro recomendado
   - Mínimo 4.5:1 para texto normal
   - Mínimo 3:1 para texto grande (24px+)

2. Reducir movimiento: Respetar prefers-reduced-motion
   - Pausar video si usuario prefiere
   - Mostrar poster estático

3. Poster accesible: Alt text descriptivo
   - No solo "hero image"
   - Describir contenido relevante

4. No autoplay con audio: ✅ Ya confirmado sin audio

Recomendación: Agregar hook useReducedMotion()
```

---

## Resumen Visual

```
/brainstorming
    │
    ├─► Fase 1: Entender la Idea
    │       │
    │       ├─► Revisar contexto del proyecto
    │       ├─► Preguntas una a una
    │       │     ├─► Propósito
    │       │     ├─► Alcance
    │       │     ├─► Restricciones
    │       │     └─► Criterios de éxito
    │       └─► Confirmar entendimiento
    │
    ├─► Fase 2: Explorar Enfoques
    │       │
    │       ├─► Proponer 2-3 alternativas
    │       ├─► Documentar pros/cons/esfuerzo
    │       ├─► Recomendar con justificación
    │       └─► Usuario elige enfoque
    │
    ├─► Fase 3: Presentar el Diseño
    │       │
    │       ├─► Sección 1: Overview (200-300 palabras)
    │       │     └─► Validar con usuario
    │       ├─► Sección 2: Arquitectura
    │       │     └─► Validar con usuario
    │       ├─► Sección 3: Componentes
    │       │     └─► Validar con usuario
    │       ├─► Sección 4: Data Flow
    │       │     └─► Validar con usuario
    │       ├─► Sección 5: Error Handling
    │       │     └─► Validar con usuario
    │       └─► Sección 6: Testing Strategy
    │             └─► Validar con usuario
    │
    ├─► Fase 4: Documentación
    │       │
    │       ├─► Determinar path de output
    │       ├─► Escribir documento con Write tool
    │       └─► Commit a git
    │
    └─► Fase 5: Finalización
            │
            ├─► Confirmar creación del archivo
            ├─► Mostrar progreso del flujo
            ├─► Registrar sesión
            └─► Sugerir: /create-issues
```

---

## Comparación: /genesis vs /brainstorming

| Aspecto | /genesis | /brainstorming |
|---------|----------|----------------|
| **Cuándo** | Inicio del proyecto | Antes de cada feature |
| **Propósito** | Infraestructura completa | Diseño de una feature |
| **Output** | CLAUDE.md, Agents, Skills, Rules | Documento de diseño |
| **Preguntas** | 5 fijas | Variables según feature |
| **Duración** | Una vez por proyecto | Múltiples veces |
| **Siguiente** | /brainstorming | /create-issues |

---

## Troubleshooting

### "El diseño es muy complejo"

**Síntoma:** Documento con demasiadas secciones y detalles.

**Solución:** Aplicar YAGNI. Preguntar:
- "¿Esto es necesario para el MVP?"
- "¿Podemos agregar esto después?"

### "No sé qué enfoque elegir"

**Síntoma:** Usuario indeciso entre alternativas.

**Solución:**
1. Pedir más contexto sobre prioridades
2. Hacer prototipo mental de cada enfoque
3. Elegir el más reversible

### "El usuario cambia de idea frecuentemente"

**Síntoma:** Muchas iteraciones sin converger.

**Solución:**
1. Documentar cada cambio y razón
2. Establecer "puntos de no retorno"
3. Validar más frecuentemente

### "La feature es muy grande"

**Síntoma:** Diseño que tomaría semanas implementar.

**Solución:**
1. Dividir en sub-features
2. Hacer brainstorming separado para cada una
3. Priorizar con usuario

---

## Referencias

- Skill Brainstorming: `.claude/skills/brainstorming/SKILL.md`
- Template de Sesión: `.claude/skills/_common/session-template.md`
- Siguiente Skill: `.claude/skills/create-issues/SKILL.md`
- Guía Genesis: `.claude/docs/guides/genesis-flow-guide.md`
