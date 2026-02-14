# Guía Completa: Flujo de /build-feature

> Documentación detallada del proceso de implementación de features del framework InformatiK-AI.

## Índice

- [Visión General](#visión-general)
- [Parámetros](#parámetros)
- [Paso -1: Pre-checks](#paso--1-pre-checks-validation-layer)
- [Paso 0: Worktree](#paso-0-verificarcrear-worktree)
- [Paso 1: Cargar Issue](#paso-1-cargar-issue)
- [Paso 2: Verificar Dependencias](#paso-2-verificar-dependencias)
- [Paso 3: Mover a In-Progress](#paso-3-mover-a-in-progress)
- [Paso 4: Análisis del Issue](#paso-4-análisis-del-issue)
- [Paso 5: Implementación](#paso-5-implementación)
- [Paso 6: Verificación de ACs](#paso-6-verificación-de-acs)
- [Paso 7: Documentación](#paso-7-documentación)
- [Paso 8: Resumen Final](#paso-8-resumen-final)
- [Agent @developer](#agent-developer)
- [Skills de Proyecto](#skills-de-proyecto)
- [Ejemplo Práctico](#ejemplo-práctico-videobackground)
- [Manejo de Errores](#manejo-de-errores)
- [Resumen Visual](#resumen-visual)

---

## Visión General

El skill `/build-feature` es el **motor de ejecución principal** del framework. Toma un issue y lo implementa completamente, invocando al agent `@developer` y utilizando skills de proyecto cuando sea necesario.

### Características Principales

| Aspecto | Descripción |
|---------|-------------|
| **Input** | Número de issue a implementar |
| **Ejecutor** | Agent @developer con protocolo RADAR |
| **Output** | Código implementado + documentación |
| **Validación** | Pre-checks + verificación de ACs |

### Ubicación en el Flujo

```
[✓] /genesis        → Infraestructura del proyecto
[✓] /brainstorming  → Diseño de la feature
[✓] /create-issues  → Issues accionables
[→] /build-feature  ← ESTÁS AQUÍ
[ ] /qa             → Testing + Security
[ ] /merge          → Integración
```

---

## Parámetros

| Parámetro | Requerido | Descripción | Ejemplo |
|-----------|-----------|-------------|---------|
| `--issue {número}` | ✅ | Número del issue a implementar | `--issue 001` |
| `--agent {nombre}` | ❌ | Override del agent (default: @developer) | `--agent architect` |

### Ejemplos de Uso

```bash
# Básico
/build-feature --issue 001

# Con agent específico
/build-feature --issue 001 --agent architect

# Issue de GitHub
/build-feature --issue 42
```

---

## Paso -1: Pre-checks (Validation Layer)

### Propósito

Validar que el entorno está listo antes de cualquier operación. Previene errores a mitad de implementación.

### 1. Git Pre-checks

```bash
# Verificar que existe repositorio
git rev-parse --is-inside-work-tree
→ Si falla: ERROR "No git repo"

# Verificar no hay merge en progreso
test ! -f .git/MERGE_HEAD
→ Si falla: ERROR "Merge en progreso"

# Verificar no hay rebase en progreso
test ! -d .git/rebase-merge
→ Si falla: ERROR "Rebase en progreso"

# Verificar estado del working tree
git status --porcelain
→ Si hay cambios: WARN "Cambios sin commit"
```

### 2. Tools Pre-checks

```bash
# Detectar stack desde archivos de proyecto
# package.json → Node.js
# requirements.txt → Python
# go.mod → Go
# Cargo.toml → Rust

# Verificar herramientas según stack detectado
npm --version    # Node.js
python --version # Python
go version       # Go
cargo --version  # Rust
```

### 3. Issue Pre-check

```bash
# Verificar que el issue existe
# En backlog
test -f ".claude/issues/backlog/{número}-*.md"

# O en in-progress
test -f ".claude/issues/in-progress/{número}-*.md"

# Si no existe: ERROR "Issue #{número} no encontrado"
```

### Manejo de Resultados

**ERROR (bloqueante):**
```
❌ Pre-check fallido: GIT_MERGE_IN_PROGRESS

Problema:
  Hay un merge en progreso que debe resolverse primero.

Solución:
  1. Resolver conflictos pendientes
  2. git merge --continue o git merge --abort
  3. Ejecutar /build-feature nuevamente

El skill no puede continuar hasta resolver este problema.
```

**WARN (requiere confirmación):**
```
⚠️ Advertencia: UNCOMMITTED_CHANGES

Hay cambios sin commit en el working tree:
  - src/components/Header.tsx (modified)
  - src/utils/helpers.ts (modified)

¿Continuar de todas formas? [s/N]
```

---

## Paso 0: Verificar/Crear Worktree

### Detección de Worktrees

```bash
# Verificar si worktrees están habilitados
test -d ".worktrees/.meta/config.json"
```

### Si Worktrees Están Habilitados

#### 1. Verificar si existe worktree para el issue

```bash
test -d ".worktrees/features/feature-{issue}"
```

#### 2. Si no existe, crearlo automáticamente

```
📦 Creando worktree para issue #001...
```

**Comandos ejecutados:**
```bash
# Operación ATÓMICA: crear branch y worktree sin cambiar HEAD del repo principal
git fetch origin develop
git worktree add -b feature/001-video-background \
  .worktrees/features/feature-001-video-background origin/develop
```

> **Importante**: NO usar `git checkout -b` + `git worktree add`
> por separado. El patrón atómico evita race conditions en
> creación simultánea de múltiples features.

#### 3. Informar al usuario

```
🌳 Worktree creado: feature-001-video-background

Directorio: .worktrees/features/feature-001-video-background
Branch: feature/001-video-background

Todo el trabajo se realizará en este worktree aislado.
```

#### 4. Actualizar registro de features

Se actualiza `active-features.json`:
```json
{
  "name": "001-video-background",
  "type": "feature",
  "branch": "feature/001-video-background",
  "path": ".worktrees/features/feature-001-video-background",
  "issue": "001",
  "createdAt": "2026-01-28T15:30:00Z"
}
```

### Si Worktrees NO Están Habilitados

- Continuar con flujo normal
- Crear branch local: `feature/001-video-background`
- Trabajar en el repositorio principal

---

## Paso 1: Cargar Issue

### Backend: GitHub

```bash
gh issue view 001 --json title,body,labels
```

**Output esperado:**
```json
{
  "title": "Crear componente VideoBackground",
  "body": "## User Story\n\nComo desarrollador...",
  "labels": ["feature", "hero-section"]
}
```

### Backend: Local

Lee archivo de `.claude/issues/`:

```bash
# Buscar en backlog primero
cat .claude/issues/backlog/001-*.md

# Si no está, buscar en in-progress
cat .claude/issues/in-progress/001-*.md
```

### Si No Encuentra el Issue

```
❌ Issue #001 no encontrado.

Ubicaciones buscadas:
  - .claude/issues/backlog/001-*.md
  - .claude/issues/in-progress/001-*.md
  - GitHub Issues (si configurado)

¿Deseas ejecutar /create-issues para crear los issues?
```

---

## Paso 2: Verificar Dependencias

### Extracción de Dependencias

Del issue, extraer el campo `blocked_by`:

```yaml
---
blocked_by: [002, 003]
---
```

### Verificación de Estado

Para cada dependencia:
1. Verificar si está en `done/`
2. Si está en `backlog/` o `in-progress/` → pendiente

### Si Hay Dependencias Pendientes

```
⚠️ Issue #004 está bloqueado por:
   - #001: Crear componente VideoBackground (✅ completado)
   - #002: Implementar hook useVideoLoader (❌ pendiente)
   - #003: Crear componente HeroContent (❌ pendiente)

Opciones:
a) Implementar #002 primero
b) Implementar #003 primero
c) Continuar de todas formas (no recomendado)
```

### Si Todas las Dependencias Están Completadas

```
✅ Dependencias verificadas:
   - #001: Crear componente VideoBackground (completado)
   - #002: Implementar hook useVideoLoader (completado)

Continuando con implementación de #004...
```

---

## Paso 3: Mover a In-Progress

### Backend: GitHub

```bash
gh issue edit 001 --add-label "in-progress"
```

### Backend: Local

```bash
# Mover archivo de backlog a in-progress
mv .claude/issues/backlog/001-video-background.md \
   .claude/issues/in-progress/001-video-background.md

# Actualizar status en frontmatter
# status: backlog → status: in-progress
```

**Resultado:**
```
📋 Issue #001 movido a "in-progress"
```

---

## Paso 4: Análisis del Issue

### Extracción de Información

Del issue se extrae:

| Campo | Uso |
|-------|-----|
| User Story | Contexto y objetivo |
| Descripción | Detalles técnicos |
| Criterios de Aceptación | Checklist de implementación |
| Definition of Done | Validaciones finales |
| Notas técnicas | Consideraciones especiales |

### Generación del Plan

El sistema analiza y genera un plan de implementación:

```
📋 Issue #001: Crear componente VideoBackground

📖 User Story:
   Como desarrollador,
   quiero un componente VideoBackground reutilizable,
   para encapsular la lógica del video de fondo.

📌 Plan de implementación:
   1. Crear estructura del componente
   2. Implementar props interface
   3. Agregar lógica de video HTML5
   4. Implementar fallback con poster
   5. Agregar estilos para cover
   6. Escribir tests unitarios

🔧 Archivos a crear/modificar:
   - src/components/HeroSection/VideoBackground.tsx (nuevo)
   - src/components/HeroSection/VideoBackground.test.tsx (nuevo)
   - src/components/HeroSection/index.ts (modificar - export)

⏱️ Complejidad: media

¿Procedo con la implementación? (sí/ajustar)
```

### Ajustes del Usuario

Si el usuario dice "ajustar":
```
¿Qué te gustaría modificar del plan?
a) Orden de los pasos
b) Archivos objetivo
c) Agregar/quitar pasos
d) Cambiar enfoque técnico
```

---

## Paso 5: Implementación

### Invocación del Agent @developer

El skill invoca al agent `@developer` con contexto completo:

```markdown
## Tarea: Implementar Issue #001

### User Story
Como desarrollador,
quiero un componente VideoBackground reutilizable,
para encapsular la lógica del video de fondo.

### Criterios de Aceptación
- [ ] Acepta props: src (string), poster (string), className (string)
- [ ] Video tiene atributos: autoplay, loop, muted, playsinline
- [ ] Video cubre 100% del contenedor con object-fit: cover
- [ ] Poster se muestra mientras carga el video
- [ ] Componente es accesible (aria-hidden="true")

### Plan acordado
1. Crear estructura del componente
2. Implementar props interface
3. Agregar lógica de video HTML5
4. Implementar fallback con poster
5. Agregar estilos para cover
6. Escribir tests unitarios

### Archivos objetivo
- src/components/HeroSection/VideoBackground.tsx (nuevo)
- src/components/HeroSection/VideoBackground.test.tsx (nuevo)
```

### Protocolo RADAR del @developer

| Fase | Acción |
|------|--------|
| **Read** | Lee issue completo, ACs, código relacionado |
| **Analyze** | Genera 2+ approaches de implementación |
| **Decide** | Elige siguiendo patrones existentes |
| **Act** | Implementa incrementalmente con tests |
| **Report** | Documenta cambios, ACs verificados |

### Flujo de Implementación

```
@developer recibe contexto
        │
        ├─► Lee archivos relacionados
        │     - Componentes similares existentes
        │     - Patrones del proyecto
        │     - Convenciones de estilo
        │
        ├─► Analiza approaches
        │     - Approach A: Componente funcional simple
        │     - Approach B: Componente con forwardRef
        │
        ├─► Decide approach
        │     - Elige A: más simple, suficiente para el caso
        │
        ├─► Implementa incrementalmente
        │     1. Crea archivo con estructura básica
        │     2. Agrega props interface
        │     3. Implementa render del video
        │     4. Agrega estilos
        │     5. Escribe tests
        │
        └─► Reporta resultado
              - Archivos creados/modificados
              - Decisiones tomadas
              - ACs verificados
```

### Uso de Skills de Proyecto

Si hay patrones repetitivos, el @developer puede invocar skills:

| Skill | Cuándo se usa |
|-------|---------------|
| `/generate-component` | Crear nuevo componente con boilerplate |
| `/create-endpoint` | Crear nuevo endpoint de API |
| `/add-test` | Agregar tests para módulo existente |

---

## Paso 6: Verificación de ACs

### Checklist de Criterios

Para cada Criterio de Aceptación:

```
📋 Verificando Criterios de Aceptación:

✅ Acepta props: src, poster, className
   → Verificado en VideoBackground.tsx:5-9

✅ Video tiene atributos: autoplay, loop, muted, playsinline
   → Verificado en VideoBackground.tsx:15

✅ Video cubre 100% con object-fit: cover
   → Verificado en estilos línea 23

✅ Poster se muestra mientras carga
   → Verificado con prop poster en video element

✅ Componente es accesible (aria-hidden="true")
   → Verificado en VideoBackground.tsx:14

Todos los ACs verificados: 5/5 ✓
```

### Si Algún AC No Se Cumple

```
📋 Verificando Criterios de Aceptación:

✅ Acepta props: src, poster, className
❌ Video tiene atributos: autoplay, loop, muted, playsinline
   → Falta: playsinline

Corrigiendo...
```

El @developer itera hasta cumplir todos los ACs.

---

## Paso 7: Documentación

### Creación de Documentación de Implementación

Se crea/actualiza `.claude/docs/features/{feature}/implementation.md`:

```markdown
# Implementación: Hero Section

## Issue
#001: Crear componente VideoBackground

## Decisiones técnicas

| Decisión | Razón |
|----------|-------|
| Componente funcional vs clase | Funcional: más simple, hooks disponibles |
| CSS Modules vs Tailwind | Tailwind: consistente con el proyecto |
| Video element vs react-player | Video nativo: sin dependencias extra |

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/components/HeroSection/VideoBackground.tsx` | Nuevo componente |
| `src/components/HeroSection/VideoBackground.test.tsx` | Tests unitarios |
| `src/components/HeroSection/index.ts` | Export agregado |

## Patrones utilizados

| Patrón | Dónde se usó |
|--------|--------------|
| Compound component | HeroSection con VideoBackground |
| Props spreading | className passthrough |

## Notas para futuro

- Considerar lazy loading con Intersection Observer (Issue #002)
- Agregar soporte para múltiples fuentes de video (mp4, webm)
```

---

## Paso 8: Resumen Final

### Output de Finalización

```
✅ Issue #001 implementado.

📁 Archivos modificados:
   - src/components/HeroSection/VideoBackground.tsx (nuevo)
   - src/components/HeroSection/VideoBackground.test.tsx (nuevo)
   - src/components/HeroSection/index.ts (modificado)

📝 Documentación:
   .claude/docs/features/hero-section/implementation.md

🌳 Worktree: .worktrees/features/feature-001-video-background
   Branch: feature/001-video-background
   Commits: 3 commits listos para merge

📊 ACs verificados: 5/5 ✓

📍 Progreso del flujo:
   [✓] Génesis
   [✓] Brainstorming
   [✓] Crear Issues
   [✓] Build Feature ← completado
   [ ] QA + Merge

👉 Próximo paso: /qa --issue 001
```

### Registro de Sesión

Se crea `.claude/sessions/YYYY-MM-DD-build-feature-001.md`:

```markdown
# Sesión: Build Feature - Issue #001
Fecha: 2026-01-28T16:00:00
Skill: /build-feature

## Resumen
Implementado componente VideoBackground para el hero section.

## Worktree
- Path: .worktrees/features/feature-001-video-background
- Branch: feature/001-video-background

## Decisiones tomadas
- Componente funcional: Más simple que clase, suficiente para el caso
- Video nativo: Sin dependencias externas
- Tailwind para estilos: Consistente con el proyecto

## Trade-offs considerados
- react-player descartado: Bundle size vs simplicidad
- forwardRef descartado: No necesario para este caso

## ACs verificados
- [x] Acepta props: src, poster, className
- [x] Video tiene atributos: autoplay, loop, muted, playsinline
- [x] Video cubre 100% con object-fit: cover
- [x] Poster se muestra mientras carga
- [x] Componente es accesible (aria-hidden="true")

## Archivos modificados
- `src/components/HeroSection/VideoBackground.tsx` (nuevo)
- `src/components/HeroSection/VideoBackground.test.tsx` (nuevo)
- `src/components/HeroSection/index.ts` (modificado)

## Próximo paso sugerido
/qa --issue 001
```

---

## Agent @developer

### Identidad y Propósito

| Responsable de | NO responsable de |
|----------------|-------------------|
| Implementación de código | Decisiones arquitectónicas cross-module |
| Escribir tests | Agregar dependencias sin justificación |
| Seguir patrones del proyecto | Modificar código fuera del scope |
| Verificar ACs | Diseñar APIs públicas |
| Mantener consistencia | Definir estándares de seguridad |

### Protocolo RADAR Aplicado

| Fase | Acción del @developer |
|------|----------------------|
| **Read** | Lee issue, ACs, DoD, código relacionado |
| **Analyze** | Genera 2+ approaches de implementación |
| **Decide** | Elige siguiendo patrones existentes |
| **Act** | Implementa incrementalmente con tests |
| **Report** | Documenta cambios, ACs verificados |

### Framework de Decisión

**Decide autónomamente:**
- Nombres de variables/funciones
- Estructura de archivo (si hay patrón)
- Implementación de lógica local
- Agregar tests

**Escala cuando:**
- Cambio afecta múltiples módulos → @architect
- Nueva dependencia externa → @architect
- Duda sobre seguridad → @security
- Issue ambiguo → Usuario

### Restricciones Absolutas

**NUNCA:**
- Codear sin leer el issue completo
- Asumir comportamiento sin verificar
- Modificar código fuera del scope
- Agregar dependencias sin justificación
- Omitir tests para funcionalidad nueva
- Commits sin verificar que funciona
- Commits directos a main/develop
- Secrets hardcodeados

**SIEMPRE:**
- Leer antes de codear
- Considerar 2+ approaches
- Seguir patrones existentes
- Escribir tests para código nuevo
- Verificar cada paso
- Documentar decisiones importantes

---

## Skills de Proyecto

### Skills Disponibles para @developer

| Skill | Descripción | Cuándo usar |
|-------|-------------|-------------|
| `/generate-component` | Crear componente con boilerplate | Nuevo componente React |
| `/create-endpoint` | Crear endpoint de API | Nuevo endpoint backend |
| `/add-test` | Agregar tests a módulo | Aumentar coverage |
| `/worktree create` | Crear worktree | Desarrollo aislado |

### Ejemplo: Usando /generate-component

Cuando el @developer detecta que necesita crear un componente:

```
@developer: Detecté que necesito crear un nuevo componente.
            Usando /generate-component para seguir el patrón del proyecto.

/generate-component VideoBackground --path src/components/HeroSection
```

El skill genera:
```
src/components/HeroSection/
├── VideoBackground.tsx        # Componente con estructura base
├── VideoBackground.test.tsx   # Tests con estructura AAA
└── index.ts                   # Export actualizado
```

---

## Ejemplo Práctico: VideoBackground

### Contexto

Issue #001 del hero section.

### Flujo Completo

```
/build-feature --issue 001
        │
        ├─► Pre-checks
        │     ✓ Git repo existe
        │     ✓ No hay merge/rebase pendiente
        │     ✓ npm instalado
        │     ✓ Issue #001 existe
        │
        ├─► Worktree
        │     Creando feature-001-video-background...
        │     ✓ Worktree creado
        │
        ├─► Cargar Issue
        │     Leyendo .claude/issues/backlog/001-video-background.md
        │     ✓ Issue cargado
        │
        ├─► Verificar Dependencias
        │     Issue #001 no tiene dependencias
        │     ✓ Puede continuar
        │
        ├─► Mover a In-Progress
        │     backlog/ → in-progress/
        │     ✓ Issue en progreso
        │
        ├─► Análisis del Issue
        │     Generando plan...
        │     ✓ Plan presentado y aprobado
        │
        ├─► Implementación (@developer)
        │     │
        │     ├─► Read: Leer issue y código relacionado
        │     ├─► Analyze: 2 approaches identificados
        │     ├─► Decide: Componente funcional simple
        │     ├─► Act: Implementar incrementalmente
        │     │     1. Crear VideoBackground.tsx
        │     │     2. Agregar props interface
        │     │     3. Implementar video element
        │     │     4. Agregar estilos
        │     │     5. Escribir tests
        │     └─► Report: Documentar cambios
        │
        ├─► Verificación de ACs
        │     ✓ 5/5 criterios cumplidos
        │
        ├─► Documentación
        │     Creando implementation.md...
        │     ✓ Documentación creada
        │
        └─► Resumen Final
              ✓ Issue #001 implementado
              👉 Próximo: /qa --issue 001
```

### Código Generado

**VideoBackground.tsx:**
```tsx
interface VideoBackgroundProps {
  src: string;
  poster: string;
  className?: string;
}

export const VideoBackground = ({
  src,
  poster,
  className = '',
}: VideoBackgroundProps) => {
  return (
    <video
      className={`absolute inset-0 w-full h-full object-cover ${className}`}
      autoPlay
      loop
      muted
      playsInline
      poster={poster}
      aria-hidden="true"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
};
```

**VideoBackground.test.tsx:**
```tsx
import { render, screen } from '@testing-library/react';
import { VideoBackground } from './VideoBackground';

describe('VideoBackground', () => {
  it('renders video with correct attributes', () => {
    render(
      <VideoBackground
        src="/video.mp4"
        poster="/poster.jpg"
      />
    );

    const video = screen.getByRole('video', { hidden: true });
    expect(video).toHaveAttribute('autoplay');
    expect(video).toHaveAttribute('loop');
    expect(video).toHaveAttribute('muted');
    expect(video).toHaveAttribute('playsinline');
  });

  it('applies custom className', () => {
    render(
      <VideoBackground
        src="/video.mp4"
        poster="/poster.jpg"
        className="custom-class"
      />
    );

    const video = screen.getByRole('video', { hidden: true });
    expect(video).toHaveClass('custom-class');
  });
});
```

---

## Manejo de Errores

### Durante Pre-checks

| Error | Causa | Solución |
|-------|-------|----------|
| `GIT_NOT_FOUND` | No hay repo git | `git init` |
| `MERGE_IN_PROGRESS` | Merge sin terminar | Resolver o abortar |
| `REBASE_IN_PROGRESS` | Rebase sin terminar | Continuar o abortar |
| `ISSUE_NOT_FOUND` | Issue no existe | `/create-issues` |

### Durante Implementación

| Error | Causa | Solución |
|-------|-------|----------|
| Dependencia circular | Imports cruzados | Refactorizar estructura |
| Test falla | Implementación incorrecta | Corregir código |
| Build falla | Error de sintaxis/tipos | Corregir errores |

### Recuperación

Si algo falla durante implementación:

```
❌ Error durante implementación

Problema:
  {descripción del error}

Estado actual:
  - Archivos modificados: {lista}
  - Último paso completado: {paso}

Opciones:
a) Reintentar desde el último paso
b) Rollback de cambios
c) Pausar y resolver manualmente
```

---

## Resumen Visual

```
/build-feature --issue 001
    │
    ├─► Paso -1: Pre-checks
    │       │
    │       ├─► Git checks (repo, merge, rebase)
    │       ├─► Tools checks (npm, python, etc.)
    │       └─► Issue check (existe)
    │
    ├─► Paso 0: Worktree
    │       │
    │       ├─► ¿Worktrees habilitados?
    │       ├─► Crear worktree si no existe
    │       └─► Actualizar registro
    │
    ├─► Paso 1: Cargar Issue
    │       │
    │       ├─► GitHub: gh issue view
    │       └─► Local: leer .claude/issues/
    │
    ├─► Paso 2: Verificar Dependencias
    │       │
    │       └─► Todas las dependencias completadas?
    │
    ├─► Paso 3: Mover a In-Progress
    │       │
    │       └─► backlog/ → in-progress/
    │
    ├─► Paso 4: Análisis del Issue
    │       │
    │       ├─► Extraer User Story, ACs, DoD
    │       ├─► Generar plan de implementación
    │       └─► Confirmar con usuario
    │
    ├─► Paso 5: Implementación (@developer)
    │       │
    │       ├─► R: Leer contexto
    │       ├─► A: Analizar approaches
    │       ├─► D: Decidir approach
    │       ├─► A: Actuar incrementalmente
    │       └─► R: Reportar resultado
    │
    ├─► Paso 6: Verificación de ACs
    │       │
    │       └─► Verificar cada criterio
    │
    ├─► Paso 7: Documentación
    │       │
    │       └─► Crear implementation.md
    │
    └─► Paso 8: Resumen Final
            │
            ├─► Lista de archivos modificados
            ├─► Registro de sesión
            └─► Próximo paso: /qa
```

---

## Comparación con Otros Skills

| Aspecto | /create-issues | /build-feature | /qa |
|---------|---------------|----------------|-----|
| **Input** | Documento diseño | Número de issue | Issue implementado |
| **Output** | Issues en backlog | Código + docs | Reporte de QA |
| **Ejecutor** | Sistema | @developer | @qa |
| **Modificaciones** | Solo issues | Código fuente | Ninguna (solo tests) |
| **Siguiente** | /build-feature | /qa | /merge |

---

## Troubleshooting

### "Pre-check falla pero quiero continuar"

**Síntoma:** Pre-check da WARN pero es seguro continuar.

**Solución:** Responder "s" cuando pregunte si continuar.

### "Dependencia marcada como pendiente pero ya está lista"

**Síntoma:** El issue dependency está implementado pero no movido a done/.

**Solución:** Mover manualmente a `done/` o ejecutar `/merge` para ese issue primero.

### "El @developer no sigue el patrón del proyecto"

**Síntoma:** Código generado no es consistente con el resto.

**Solución:**
1. Verificar que existan ejemplos en el codebase
2. Agregar regla en `.claude/rules/`
3. Ajustar el plan antes de implementar

### "ACs no se pueden verificar automáticamente"

**Síntoma:** Criterio subjetivo como "debe verse bien".

**Solución:** Reformular AC para que sea verificable objetivamente.

---

## Referencias

- Skill Build Feature: `.claude/skills/build-feature/SKILL.md`
- Agent Developer: `.claude/agents/developer.md`
- Protocolo RADAR: `.claude/agents/_common/radar-protocol.md`
- Validation Layer: `.claude/validation/VALIDATION.md`
- Template de Sesión: `.claude/skills/_common/session-template.md`
- Guía Create Issues: `.claude/docs/guides/create-issues-flow-guide.md`
- Siguiente Skill: `.claude/skills/qa/SKILL.md`
