# Session: Create Issues - CMS Setup Fix
**Date:** 2026-02-13
**Skill:** /create-issues
**Feature:** cms-setup-fix
**Backend:** local
**Status:** Completed

---

## Context

Conversión del diseño de brainstorming (`.claude/docs/features/cms-setup-fix/design.md`) en issues accionables con formato Gherkin.

**Origen:**
- Design document creado en: 2026-02-13
- Brainstorming session: `.claude/sessions/2026-02-13-brainstorming-cms-setup-fix.md`
- Feature: Script automatizado para aplicar migraciones de Supabase al CMS

## Design Analysis

### Componentes Identificados

| Componente | Archivo | Responsabilidad |
|------------|---------|-----------------|
| Script principal | `scripts/setup-cms.mjs` | Orchestrator del flujo completo |
| CLI verification | `scripts/lib/check-cli.mjs` | Verificar Supabase CLI instalado |
| Schema validation | `scripts/lib/validate-tables.mjs` | Validar tablas creadas |
| Structured logging | `scripts/lib/logger.mjs` | Logging con colores y símbolos |
| NPM script | `package.json` | Script `setup:cms` y dependencies |

### Flujo de Datos

```
npm run setup:cms
    ↓
[FASE 1: Preflight Checks]
├─ check-cli.mjs → Verifica CLI instalado
├─ Verifica autenticación OAuth
└─ Link proyecto Supabase
    ↓
[FASE 2: Database State Check]
├─ validate-tables.mjs → Query information_schema
└─ Si tablas existen → Exit 0 (idempotencia)
    ↓
[FASE 3: Apply Migrations]
├─ Dry-run: supabase db diff
├─ Confirmation prompt
└─ supabase db push
    ↓
[FASE 4: Validation]
├─ validate-tables.mjs → Re-check tablas
├─ Smoke test: SELECT count(*) FROM content
└─ Success message
```

### Dependencias entre Componentes

- **Script principal** depende de: `check-cli.mjs`, `validate-tables.mjs`, `logger.mjs`
- **Módulos lib/** son independientes entre sí
- **Todo el feature** es un único feature slice end-to-end testable

## Consolidation Decision

### Antes de Consolidación (Análisis Inicial)

Opciones consideradas:
1. **5 issues separados** (uno por archivo)
2. **2 issues** (módulos lib + script principal)
3. **1 issue consolidado** (todo el feature)

### Matriz de Decisión

| Criterio | Evaluación | Resultado |
|----------|------------|-----------|
| ¿Mismos archivos + mismo flujo? | No mismos archivos, pero único flujo | Considerar fusión |
| ¿Un componente tiene valor sin el otro? | NO - script principal no funciona sin módulos | **FUSIONAR** |
| ¿Dependencia fuerte entre componentes? | SÍ - script principal importa los 3 módulos | **FUSIONAR** |
| ¿Feature testeable end-to-end parcialmente? | NO - necesita todos los archivos para testear | **FUSIONAR** |
| Granularidad de feature | Pequeña (1-3 issues recomendados) | **1 ISSUE** |

### Después de Consolidación

**Decisión Final:** **1 issue consolidado (#005)**

**Rationale:**
- Este es un feature slice completo y cohesivo
- Implementar un módulo sin los otros no es testeable
- El feature no tiene valor si está parcialmente implementado
- Todos los componentes se usan juntos en un único flujo
- Feature pequeña → 1-3 issues → Este es 1 issue perfecto

**Alternativa Descartada:**
- Separar en "Módulos lib" + "Script principal": Descartada porque los módulos solo tienen sentido en el contexto del script principal

## Issues Generated

### Issue #005: Script Automatizado de Setup CMS con Migraciones Supabase

**Metadata:**
- **ID:** 005
- **Title:** Script Automatizado de Setup CMS con Migraciones Supabase
- **Status:** backlog
- **Labels:** feature, cms-setup-fix, automation, database
- **Complejidad:** Media
- **Bloqueado por:** Ninguno
- **Bloquea:** Ninguno

**User Story:**
Como desarrollador del proyecto CCHIA,
quiero un script automatizado que aplique las migraciones de Supabase al CMS,
para que las tablas del blog se creen automáticamente sin pasos manuales y el panel de administración funcione correctamente.

**Scope:**
- ✅ Incluye: 4 archivos nuevos (setup-cms.mjs + 3 módulos lib), script NPM, 3 dependencies
- ❌ NO incluye: Cambios a migración existente, cambios a CMS, soporte producción

**Sub-tareas (9):**
1. Instalar dependencies: execa, chalk, inquirer
2. Crear logger.mjs
3. Crear check-cli.mjs
4. Crear validate-tables.mjs
5. Crear setup-cms.mjs con flujo de 4 fases
6. Agregar script a package.json
7. Testing: fresh install
8. Testing: idempotencia
9. Validar CMS funciona sin errores

**Criterios de Aceptación (17):**
- AC1-AC14: Comportamiento del script (errores, idempotencia, dry-run, confirmación, validación, logging, progreso)
- AC15-AC17: CMS admin panel funciona correctamente (sin errores, tabs clickeables)

**Definition of Done (6):**
- Código implementado
- Script ejecutado exitosamente (2 escenarios)
- CMS verificado manualmente
- Documentación en código
- Session file creado

**Archivos Afectados:**
- `scripts/setup-cms.mjs` (NUEVO)
- `scripts/lib/check-cli.mjs` (NUEVO)
- `scripts/lib/validate-tables.mjs` (NUEVO)
- `scripts/lib/logger.mjs` (NUEVO)
- `package.json` (MODIFICAR)

**Consideraciones Técnicas:**
- Seguridad: OAuth login, no service_role key, static SQL
- Arquitectura: CLI over REST API, modularización
- Performance: Check antes de apply, batch queries, fail fast

## User Validation

**Issue presentado:** #005 - Script Automatizado de Setup CMS
**Usuario respondió:** "si" (aprobado)
**Acción:** Issue creado en `.claude/issues/backlog/005-cms-setup-automation.md`

## Backend Configuration

**Configurado en CLAUDE.md:**
```yaml
issues:
  backend: local
  repo: null
```

**Backend usado:** local
**Archivos creados:** `.claude/issues/backlog/005-cms-setup-automation.md`

## Implementation Order

**Orden sugerido:**
1. Issue #005 (único issue de esta feature)

**Rationale:**
- No hay dependencias externas
- Todos los archivos necesarios (migración, CMS) ya existen
- Feature autocontenida

## Metrics

- **Issues generados (draft):** 1
- **Issues después de consolidación:** 1
- **Issues presentados:** 1
- **Issues aprobados:** 1 (100%)
- **Issues rechazados:** 0
- **Issues editados:** 0
- **Total sub-tareas:** 9
- **Total ACs:** 17
- **Total DoD items:** 6

## Files Generated

### Issue File
- **Path:** `.claude/issues/backlog/005-cms-setup-automation.md`
- **Status:** ✓ Created
- **Backend:** local

### Session File
- **Path:** `.claude/sessions/2026-02-13-create-issues-cms-setup-fix.md`
- **Status:** ✓ Created (this file)

## Design Document Reference

**Source:**
- `.claude/docs/features/cms-setup-fix/design.md`
- Created: 2026-02-13
- Brainstorming session: `.claude/sessions/2026-02-13-brainstorming-cms-setup-fix.md`

**Key Sections Used:**
- Overview → User Story
- Approach → Scope (incluye/no incluye)
- Architecture → Sub-tareas (flujo de 4 fases)
- Components → Archivos objetivo
- Data Flow → Notas de implementación
- Error Handling → Criterios de aceptación
- Testing Strategy → Definition of Done
- Expert Considerations → Consideraciones técnicas

## Next Steps

### Immediate (For /build-feature)
```bash
/build-feature --issue 005
```

Implementará:
1. Instalar dependencies
2. Crear 4 archivos nuevos
3. Modificar package.json
4. Testing manual (2 escenarios)
5. Validación en browser

### Expected Outcome
- CMS admin panel (`/admin/cms`) funciona sin errores
- Tablas del blog existen en Supabase
- Script es idempotente y reutilizable

## Success Criteria

- [x] Issue #005 creado en backlog
- [x] Formato Gherkin correcto
- [x] 17 ACs verificables
- [x] Scope claro (incluye/no incluye)
- [x] Dependencias definidas (ninguna en este caso)
- [x] Estimación de complejidad: Media
- [x] Usuario aprobó el issue
- [x] Session file creado

---

**Create Issues Status:** ✅ Completed
**Total Issues Created:** 1
**Next Skill:** `/build-feature --issue 005`
