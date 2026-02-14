---
id: 005
title: Script Automatizado de Setup CMS con Migraciones Supabase
status: done
created: 2026-02-13
closed: 2026-02-13
implemented_in: 740a546
labels: [feature, cms-setup-fix, automation, database]
blocked_by: []
blocks: []
---

# Script Automatizado de Setup CMS con Migraciones Supabase

## User Story

Como desarrollador del proyecto CCHIA,
quiero un script automatizado que aplique las migraciones de Supabase al CMS,
para que las tablas del blog se creen automáticamente sin pasos manuales y el panel de administración funcione correctamente.

## Descripción

El panel de administración del CMS (`/admin/cms`) actualmente muestra errores porque las tablas del blog (`content`, `categories`, `content_categories`) no existen en la base de datos de Supabase. Aunque el archivo de migración existe en `supabase/migrations/001_blog_schema.sql`, nunca fue ejecutado.

Este issue implementa un script Node.js que automatiza completamente el proceso de setup:
1. Verifica que Supabase CLI está instalado
2. Autentica usando OAuth (seguro)
3. Verifica si las tablas ya existen (idempotencia)
4. Si no existen, ejecuta `supabase db push`
5. Valida que todo funcionó correctamente

**Contexto técnico:**
- Error actual: "Could not find 'public.content' in the schema cache"
- Root cause: Tablas no existen en DB
- Solución: Aplicar migrations via Supabase CLI
- Seguridad: OAuth login, no exponer service_role key

## Scope

### Incluye:
- Script principal `scripts/setup-cms.mjs` con flujo completo
- Módulo `scripts/lib/check-cli.mjs` para verificar CLI instalado
- Módulo `scripts/lib/validate-tables.mjs` para validar schema
- Módulo `scripts/lib/logger.mjs` para logging estructurado
- Script NPM `setup:cms` en `package.json`
- Dependencies: `execa`, `chalk`, `inquirer`
- Manejo de errores con mensajes claros
- Idempotencia (safe to run múltiples veces)

### NO Incluye:
- Modificaciones al archivo de migración existente (ya está correcto)
- Cambios al código del CMS (ya está correcto)
- Soporte para producción (solo desarrollo)
- Rollback manual (Supabase CLI lo maneja automáticamente)

## Sub-tareas

- [ ] Instalar dependencies: `execa`, `chalk`, `inquirer`
- [ ] Crear `scripts/lib/logger.mjs` con API de logging (✓✗⚠→ℹ)
- [ ] Crear `scripts/lib/check-cli.mjs` con verificación de Supabase CLI
- [ ] Crear `scripts/lib/validate-tables.mjs` con queries de validación
- [ ] Crear `scripts/setup-cms.mjs` con flujo completo de 4 fases
- [ ] Agregar script `setup:cms` a `package.json`
- [ ] Testing manual: escenario fresh install
- [ ] Testing manual: escenario idempotencia (run twice)
- [ ] Validar en browser que `/admin/cms` funciona sin errores

## Criterios de Aceptación

- [ ] AC1: Script ejecuta sin errores cuando las tablas NO existen
- [ ] AC2: Script crea las 3 tablas: `content`, `categories`, `content_categories`
- [ ] AC3: Si las tablas YA existen, script muestra "Already set up" y exit 0 (no error)
- [ ] AC4: Si Supabase CLI NO está instalado, muestra guía de instalación y exit 1
- [ ] AC5: Si NO está autenticado, ejecuta `supabase login` automáticamente (OAuth)
- [ ] AC6: Antes de aplicar migrations, muestra dry-run con cambios a realizar
- [ ] AC7: Pide confirmación explícita antes de aplicar (prompt: "Apply these migrations?")
- [ ] AC8: Si usuario cancela (dice "no"), script termina con exit 0 y mensaje "Cancelled by user"
- [ ] AC9: Después de aplicar, valida que las 3 tablas fueron creadas exitosamente
- [ ] AC10: Después de aplicar, ejecuta smoke test: `SELECT count(*) FROM content`
- [ ] AC11: Logging usa colores y símbolos: ✓ (verde), ✗ (rojo), ⚠ (amarillo), → (cyan), ℹ (azul)
- [ ] AC12: Mensajes de error son accionables (incluyen comando a ejecutar o link a docs)
- [ ] AC13: Script muestra progreso: "1/4 Checking CLI...", "2/4 Verifying auth...", etc.
- [ ] AC14: Al finalizar con éxito, muestra: "✅ CMS setup completed! 🎉" y "Next: Open http://localhost:5173/admin/cms"
- [ ] AC15: CMS admin panel (`/admin/cms`) carga sin error "Could not find 'public.content'"
- [ ] AC16: CMS admin panel NO muestra error "No se encontró ninguna clave API"
- [ ] AC17: Tabs del CMS (Borradores, Publicados, Archivados) son clickeables y muestran estado vacío (no error)

## Definition of Done

- [ ] Código implementado y funcionando
- [ ] Script ejecutado exitosamente en desarrollo (fresh install)
- [ ] Script ejecutado exitosamente en desarrollo (idempotencia test)
- [ ] CMS admin panel verificado manualmente sin errores
- [ ] Documentación en el código (comentarios en funciones clave)
- [ ] Session file creado: `.claude/sessions/2026-02-13-build-feature-005.md`

## Dependencias

- **Bloquea:** Ninguno (este es el único issue de esta feature)
- **Bloqueado por:** Ninguno (todos los archivos necesarios ya existen)

## Notas de Implementación

### Archivos Objetivo:
```
scripts/
├── setup-cms.mjs              # NUEVO - Script principal
└── lib/
    ├── check-cli.mjs          # NUEVO - CLI verification
    ├── validate-tables.mjs    # NUEVO - Schema validation
    └── logger.mjs             # NUEVO - Structured logging

package.json                   # MODIFICAR - Agregar script + dependencies
```

### Patrones a Seguir:
- **Modularización:** Separar concerns en módulos independientes
- **Error handling:** Try-catch con mensajes específicos por tipo de error
- **Idempotencia:** Check estado antes de aplicar cambios
- **UX:** Progreso visible, colores, mensajes accionables

### Consideraciones Técnicas:

**Seguridad (@security):**
- ✅ Usar OAuth login (NO exponer service_role key)
- ✅ Migrations en archivos `.sql` estáticos (NO dynamic SQL)
- ✅ Verificar que `.env` está en `.gitignore` (ya verificado)

**Arquitectura (@architect):**
- CLI over REST API (idempotencia nativa, rollback automático)
- Migration tracking delegado a Supabase CLI
- Módulos testeables independientemente

**Performance (@performance):**
- Check tablas antes de migrations (evita trabajo innecesario)
- Batch query para validación: `.in('table_name', [...])`  (NO N+1)
- Fail fast: exit inmediato si CLI no está

### Dependencies NPM:
```json
{
  "devDependencies": {
    "execa": "^8.0.1",
    "chalk": "^5.3.0",
    "inquirer": "^9.2.12"
  }
}
```

### Script NPM a Agregar:
```json
{
  "scripts": {
    "setup:cms": "node scripts/setup-cms.mjs"
  }
}
```

### Ejemplo de Uso:
```bash
npm run setup:cms

# Output esperado (fresh install):
# ✓ CLI detected
# ✓ Authenticated
# ✓ Linked to project
# → Showing migrations (dry-run)
# ? Apply these migrations? (yes)
# → Applying migrations...
# ✓ Migrations applied
# ✓ Validation passed
# ✅ CMS setup completed! 🎉
# ℹ Next: Open http://localhost:5173/admin/cms
```

## Estimación

**Complejidad:** Media

**Justificación:**
- Código relativamente simple (4 archivos nuevos, ~300-400 LOC total)
- Requiere entender Supabase CLI commands
- Múltiples escenarios de error a manejar
- Testing manual en múltiples escenarios
- Integración con comandos externos (CLI)
