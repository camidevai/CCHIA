# Session: Brainstorming - CMS Setup Fix
**Date:** 2026-02-13
**Skill:** /brainstorming
**Mode:** FEATURE
**Status:** Completed

---

## Context

Usuario reportó error en el panel de administración del CMS (`http://localhost:5173/admin/cms`):
- Error 1: "Could not find 'public.content' in the schema cache"
- Error 2: "No se encontró ninguna clave API en la solicitud"

## Investigation Summary

**Fase de Exploración (Explore Agent):**
- Duración: ~52s
- Agent ID: ad7ecfb
- Hallazgo principal: Las tablas del blog no existen en la base de datos de Supabase
- Archivo de migración existe (`supabase/migrations/001_blog_schema.sql`) pero nunca fue ejecutado
- Configuración de `.env` es correcta (URL y anon_key válidos)

**Root Cause Confirmada:**
- Tablas faltantes: `content`, `categories`, `content_categories`
- Migration file existe pero no fue aplicado a la instancia de Supabase
- El error de API key es secundario (anon_key no tiene permisos DDL)

## Questions Asked (Phase 1)

### Pregunta 1: Estado de Migraciones
**Pregunta:** "¿Ya ejecutaste las migraciones de Supabase en tu instancia, o necesitas hacerlo ahora?"

**Opciones:**
1. Ya las ejecuté, pero sigue fallando
2. No las he ejecutado aún (Recomendado)
3. No estoy segura del estado

**Respuesta:** "No estoy segura del estado"

### Pregunta 2: Preferencia de Solución
**Pregunta:** "¿Prefieres que la solución incluya pasos manuales (que tú ejecutes en Supabase) o prefieres una solución automatizada?"

**Opciones:**
1. Solución híbrida: script + guía (Recomendado)
2. Manual con instrucciones claras
3. Completamente automatizada

**Respuesta:** "Completamente automatizada"

## Approach Exploration (Phase 2)

### Alternativas Consideradas

**Opción 1: Supabase CLI + Script Automatizado (ELEGIDA)**
- **Pro:** Idempotente, seguro (OAuth), rollback automático, best practices oficiales
- **Pro:** Reutilizable para futuras migraciones
- **Con:** Requiere instalación de Supabase CLI (una vez)
- **Decisión:** Usuario aceptó

**Opción 2: REST API con service_role key (DESCARTADA)**
- **Pro:** No requiere CLI
- **Con:** Expone service_role key (CRITICAL security risk según @security)
- **Con:** No hay rollback automático
- **Con:** Implementación manual de migration tracking
- **Razón de descarte:** Riesgos de seguridad inaceptables

**Opción 3: Manual via Supabase Dashboard (DESCARTADA)**
- **Pro:** Sin dependencias
- **Con:** No automatizada (usuario pidió automatización completa)
- **Con:** Propensa a errores humanos
- **Con:** No repetible
- **Razón de descarte:** No cumple requisito de automatización

## Agent Consultation (Phase 3)

### Agents Consultados

**@architect (Consulted)**
- **Señal detectada:** Multi-componente, CLI vs API design decision, idempotencia
- **Duración:** ~80s
- **Agent ID:** afd3221
- **Recomendación clave:** Usar Supabase CLI para idempotencia nativa y migration tracking. Estructura modular con separación de concerns.
- **ADR implícita:** ADR-005 - Migrations via Supabase CLI

**@security (Consulted)**
- **Señal detectada:** Database migrations, API keys, service_role key exposure
- **Duración:** ~83s
- **Agent ID:** a728614
- **Findings Críticos:**
  - C1: Service Role Key = Root Access (NUNCA exponer)
  - C2: Ejecución en Producción sin Safeguards
  - C3: Sin Backup Verification
- **Recomendación clave:** Usar OAuth login (desarrollo), GitHub Secrets (CI/CD). Implementar 6 capas de seguridad: environment detection, secrets management, pre-flight checks, dry-run mode, execution, validation.
- **Status:** APROBADO con condiciones obligatorias implementadas

**@ux-accessibility (Fallback)**
- **Señal detectada:** Script output, user interaction
- **Status:** Core agent siempre disponible pero se usó fallback básico
- **Recomendaciones:** Mensajes claros con emojis/colores, progreso visible (1/4, 2/4...), estados claros (✓✗⚠→ℹ)

**@performance (Fallback)**
- **Señal detectada:** Database queries, script execution
- **Status:** Fallback (checklist básico)
- **Recomendaciones:** Check tablas antes de migrations, batch queries (no N+1), fail fast strategy

## Design Presentation (Phase 4)

**Secciones presentadas:**
1. Contexto y Problema (usuario confirmó: "si")
2. Enfoque de Solución (usuario confirmó: "si")
3. Arquitectura del Script - revisada para enfoque desarrollo (usuario confirmó: "si")
4. Componentes y Data Flow (usuario confirmó: "si")
5. Consideraciones de Expertos (usuario confirmó: "si")
6. Testing y Verificación (usuario confirmó: "si")

**Ajuste realizado:**
- Usuario recordó que todo debe ser sobre ambiente de develop
- Se simplificó la arquitectura eliminando validaciones de producción innecesarias:
  - ✗ Backup verification (solo dev)
  - ✗ Confirmación tipo "APPLY-PRODUCTION" (solo dev)
  - ✗ Environment detection estricta (asumimos dev)
  - ✗ Notificaciones Slack/email (solo dev)

## Decisions Made

### Technical Decisions

1. **Tool Selection: Supabase CLI**
   - Rationale: Idempotencia nativa, rollback automático, best practices oficiales
   - Trade-off: Requiere instalación CLI (aceptado por usuario)

2. **Authentication: OAuth Login**
   - Rationale: No expone service_role key, tokens temporales
   - Alternative: service_role key hardcoded (rechazada por @security)

3. **Architecture: Modular Script**
   - Components:
     - `setup-cms.mjs` - Orchestrator
     - `check-cli.mjs` - CLI verification
     - `validate-tables.mjs` - Schema validation
     - `logger.mjs` - Structured logging
   - Rationale: Separation of concerns, testability, reusability

4. **Idempotency Strategy**
   - Check tablas antes de aplicar
   - Exit 0 si ya están configuradas
   - Safe to run múltiples veces

5. **Error Handling**
   - Try-catch con mensajes específicos por tipo de error
   - Rollback automático delegado a Supabase CLI
   - Logging estructurado para debugging

### Security Decisions

1. **Never hardcode service_role key**
2. **Use OAuth login for development**
3. **Static .sql files (no dynamic SQL construction)**
4. **Verify .gitignore includes .env** (ya verificado)
5. **Dry-run mode obligatorio antes de aplicar**

### UX Decisions

1. **Progress indicators:** 1/4, 2/4, 3/4, 4/4
2. **Color-coded messages:** ✓ (green), ✗ (red), ⚠ (yellow), → (cyan), ℹ (blue)
3. **Actionable error messages:** Incluir comando a ejecutar o link a docs
4. **Confirmation prompts:** Mostrar cambios antes de pedir confirmación

## Files Generated

### Design Document
- **Path:** `.claude/docs/features/cms-setup-fix/design.md`
- **Status:** ✓ Created
- **Sections:**
  - Overview
  - Approach
  - Architecture
  - Components
  - Data Flow
  - Expert Considerations (@architect, @security, @ux-accessibility, @performance)
  - Error Handling
  - Testing Strategy
  - Critical Files
  - Verification Checklist
  - Agents Consulted

### Session Document
- **Path:** `.claude/sessions/2026-02-13-brainstorming-cms-setup-fix.md`
- **Status:** ✓ Created (this file)

## Next Steps

### Immediate (For /create-issues)
1. Crear issue en formato Gherkin basado en el design document
2. User Story con criterios de aceptación
3. Definition of Done

### Implementation (For /build-feature)
1. Instalar dependencies: `npm install --save-dev execa chalk inquirer`
2. Crear `scripts/setup-cms.mjs` con flujo completo
3. Crear módulos auxiliares en `scripts/lib/`
4. Agregar script a `package.json`: `"setup:cms": "node scripts/setup-cms.mjs"`
5. Testing manual con los 5 escenarios documentados
6. Validación end-to-end en http://localhost:5173/admin/cms

### Validation (For /qa)
1. Ejecutar script en fresh install
2. Verificar idempotencia (run twice)
3. Verificar CMS funciona sin errores
4. Security review de @security
5. UX review de mensajes y prompts

## Metrics

- **Investigation time:** ~52s (Explore agent)
- **Architecture design:** ~80s (@architect)
- **Security review:** ~83s (@security)
- **Total agent time:** ~215s (~3.5 min)
- **Design presentation:** ~6 sections (incremental validation)
- **User confirmations:** 6/6 (100% acceptance rate)
- **Adjustments:** 1 (revisión para enfoque desarrollo)

## Alternatives Discarded

### Why Not REST API?
- Security risk: expone service_role key
- No rollback automático
- Más complejo de implementar
- @security lo marcó como CRITICAL finding C1

### Why Not Manual Dashboard?
- No cumple requisito de automatización completa del usuario
- Propensa a errores humanos
- No repetible ni documentable

## Trade-offs Accepted

| Trade-off | Why Accepted |
|-----------|--------------|
| Requiere instalación de Supabase CLI | Gana: idempotencia, seguridad, best practices oficiales |
| Paso interactivo de OAuth login (primera vez) | Gana: no expone service_role key, seguridad |
| Dependencia externa (CLI) | Gana: rollback automático, migration tracking nativo |

## Success Criteria

- [ ] Script ejecuta sin errores
- [ ] Tablas creadas: content, categories, content_categories
- [ ] RLS policies aplicadas
- [ ] CMS admin panel funciona sin errores
- [ ] Idempotente (safe to run múltiples veces)
- [ ] Mensajes claros y accionables
- [ ] No expone secrets

## Links

- **Design Document:** `.claude/docs/features/cms-setup-fix/design.md`
- **Migration File:** `supabase/migrations/001_blog_schema.sql`
- **CMS Service:** `src/features/cms/services/cmsService.js`
- **Supabase Config:** `src/config/supabase.js`

---

**Brainstorming Status:** ✅ Completed
**Next Skill:** `/create-issues`
