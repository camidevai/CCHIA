---
name: create-issues
version: 2.0
description: "Crea issues en formato Gherkin con User Stories, Criterios de Aceptación y Definition of Done. Agnóstico: soporta GitHub o sistema local."
---

# Create Issues

## QUICK REFERENCE

### BLOCKING CONDITIONS
> ⛔ Si alguna es TRUE, DETENER inmediatamente

- [ ] No existe documento de diseño (`.claude/docs/features/{feature}/design.md` o `.claude/docs/architecture/*`)
- [ ] Backend no configurado y usuario no especifica `--backend`
- [ ] Usuario rechaza todos los issues generados

### REQUIRED OUTPUTS
> 📦 Archivos que DEBEN existir al finalizar

**Si backend = local:**
- [ ] `.claude/issues/backlog/{número}-{slug}.md` (por cada issue)

**Si backend = github:**
- [ ] Issues creados en GitHub (números asignados)

**Ambos backends:**
- [ ] `.claude/sessions/YYYY-MM-DD-create-issues-{feature}.md`

### PHASES OVERVIEW
```
PHASE 1 → PHASE 2 → PHASE 3 → PHASE 4 → PHASE 5 → PHASE 6
LOAD      ANALYZE   GENERATE  PRESENT   CREATE    SUMMARY
   ↓         ↓         ↓         ↓         ↓         ↓
 Design   Componentes  Issues   Uno a uno  Backend   Resumen
 file     dependencias Gherkin  validar    gh/local  + sesión
```

### PARAMETERS
| Parámetro | Descripción | Default |
|-----------|-------------|---------|
| `--feature {nombre}` | Feature a convertir | Requerido |
| `--backend {github\|local}` | Override de backend | CLAUDE.md config |

---

## Overview

Transforma un diseño de brainstorming en issues accionables con formato estructurado. Funciona tanto con GitHub como con un sistema de issues local.

## Parámetros

- `--feature {nombre}`: Feature del brainstorming a convertir en issues
- `--backend {github|local}`: Override del backend configurado en CLAUDE.md

## Proceso

### 1. Cargar diseño

Lee el documento de brainstorming:
- `.claude/docs/features/{feature}/design.md` (output estandar de /brainstorming modo feature)
- `.claude/docs/architecture/*-arquitectura.md` (output de /brainstorming modo proyecto)

Si no existe, sugiere ejecutar `/brainstorming` primero.

### 2. Análisis del diseño

Identifica:
- Componentes principales a construir
- Dependencias entre componentes
- Orden lógico de implementación
- Entregables cohesivos (feature slices que entregan valor testable end-to-end)

### 3. Generación de issues

Para cada issue, usa el formato:

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

### 3.5. Consolidación

Después de generar los issues iniciales:

1. Revisar todos los issues generados
2. Fusionar issues que:
   - Modifican los mismos archivos
   - Componen un mismo feature slice
   - Uno no tiene valor sin el otro

   **Matriz de decision para consolidacion:**
   | Situacion | Ejemplo | Accion |
   |-----------|---------|--------|
   | Mismos archivos + mismo flujo | Login form + Login API call | Fusionar: son un feature slice |
   | Mismos archivos + distinto flujo | Login form + Registration form | Separar: flujos independientes |
   | Distintos archivos + dependencia fuerte | DB schema + API endpoint que lo usa | Fusionar: uno no funciona sin el otro |
   | Distintos archivos + dependencia debil | User API + Admin dashboard | Separar: pueden implementarse independientemente |
   **Ejemplo de consolidacion:**
   Antes (3 issues separados):
   - "Crear formulario de login"
   - "Validar campos de login"
   - "Conectar login con API"

   Despues (1 issue consolidado):
   - "Implementar flujo completo de login" (con 3 ACs)

3. Verificar que el total respeta la guía de granularidad:
   | Tipo de feature | Issues esperados |
   |-----------------|-----------------|
   | Pequeña | 1-3 |
   | Mediana | 3-5 |
   | Grande | 5-8 |
   | **Máximo absoluto** | ~10 |
4. Presentar al usuario el set consolidado con justificación

### 4. Presentación y validación

Presenta los issues **uno a uno**:

```
📝 Issue #{número}: {título}

{contenido completo}

¿Apruebas este issue? (sí/no/editar)
```

Solo después de aprobación, crea el issue.

### 5. Creación según backend

#### Si backend = github

```bash
gh issue create --title "{título}" --body "{contenido}"
```

Extrae el número de issue creado y actualiza las referencias de dependencias.

#### Si backend = local

Crea archivo en `.claude/issues/backlog/{número}-{slug}.md`:

```markdown
---
id: {número}
title: {título}
status: backlog
created: {fecha}
labels: [feature, {feature-name}]
---

{contenido del issue}
```

El número se asigna secuencialmente basado en los issues existentes.

### 6. Resumen final

```
✅ Issues creados para feature: {nombre}

📋 Issues generados:
   #001 - {título} (bloqueado por: -)
   #002 - {título} (bloqueado por: #001)
   #003 - {título} (bloqueado por: #001, #002)

📍 Progreso del flujo:
   [✓] Génesis
   [✓] Brainstorming
   [✓] Crear Issues ← completado
   [ ] Build Feature
   [ ] QA + Merge

👉 Próximo paso: /build-feature --issue 001
```

## Registro de sesión

> Formato base: `.claude/skills/_common/session-template.md`

Crea `.claude/sessions/YYYY-MM-DD-create-issues-{feature}.md` con campos adicionales:

- **Issues generados**: Tabla #/Título/Complejidad/Dependencias
- **Orden de implementación sugerido**: Lista numerada

## Principios

- **Entregables cohesivos**: Cada issue agrupa componentes relacionados que forman un feature slice testable end-to-end. No atomicidad artificial por tiempo.
- **Granularidad por scope**: Pequeña 1-3, Mediana 3-5, Grande 5-8, Máximo ~10
- **Dependencias claras**: Definir qué bloquea qué
- **Criterios verificables**: 8-15 ACs por issue, verificables objetivamente
- **Scope explícito**: Cada issue define qué incluye y qué NO incluye
- **Consolidación**: Fusionar issues relacionados antes de presentar
- **Validación uno a uno**: Usuario aprueba cada issue antes de crear
- **Agnóstico de backend**: Mismo formato, diferente almacenamiento

---

## FINAL CHECKPOINT

Antes de terminar, verificar:

- [ ] Documento de diseño cargado correctamente
- [ ] Issues consolidados (no atomicidad artificial)
- [ ] Cada issue tiene 8-15 ACs verificables
- [ ] Usuario aprobó cada issue individualmente
- [ ] Issues creados en backend (local o GitHub)
- [ ] Sesión registrada en `.claude/sessions/`
- [ ] Próximo paso comunicado (`/build-feature --issue N`)

---

## Ver también

- **Guía**: `.claude/docs/guides/create-issues-flow-guide.md`
- **Skill anterior**: `.claude/skills/brainstorming/SKILL.md`
- **Skill siguiente**: `.claude/skills/build-feature/SKILL.md`
- **Validación**: `.claude/validation/VALIDATION.md`
- **Session template**: `.claude/skills/_common/session-template.md` → "/create-issues"
- **Issue template**: `.claude/issues/TEMPLATE.md`
