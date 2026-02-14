# Design: CMS Setup Fix - Automated Database Migration

## Overview

Fix del panel de administración del CMS que muestra errores "Could not find 'public.content' in the schema cache" y "No se encontró ninguna clave API". La causa raíz es que las tablas del blog (content, categories, content_categories) no existen en la base de datos de Supabase, aunque el archivo de migración existe en el repositorio.

**Goals:**
- Aplicar automáticamente las migraciones de Supabase sin pasos manuales
- Solución idempotente (safe to run múltiples veces)
- Validar que el CMS funciona correctamente después del setup
- Script reutilizable para futuras migraciones

## Approach

**Opción Elegida: Supabase CLI + Script Automatizado**

Crear un script Node.js que:
1. Verifica que Supabase CLI está instalado
2. Autentica usando OAuth (seguro, sin exponer service_role key)
3. Verifica si las tablas ya existen (idempotencia)
4. Si no existen, ejecuta `supabase db push` para aplicar migraciones
5. Valida que las tablas fueron creadas correctamente

**Rationale:**
- Usa herramientas oficiales de Supabase (best practices)
- Idempotente por diseño (CLI maneja migration tracking)
- Seguro: OAuth login en lugar de hardcodear keys
- Rollback automático si algo falla (transaccional)
- Reutilizable para futuras migraciones

**Alternativas Descartadas:**
1. **REST API con service_role key**: Riesgo de seguridad crítico (exponer service_role key), no hay rollback automático
2. **Manual via Dashboard**: No automatizada, propensa a errores, no repetible

## Architecture

### Flujo de Ejecución

```
npm run setup:cms
    ↓
[FASE 1: Preflight Checks]
├─ Verificar Supabase CLI instalado
│  └─ Si no → Mostrar guía de instalación y exit
├─ Verificar autenticación
│  └─ Si no → Ejecutar `supabase login` (OAuth)
└─ Link proyecto a Supabase
   └─ `supabase link --project-ref {project-id}`
    ↓
[FASE 2: Database State Check]
├─ Query a information_schema.tables
├─ Verificar si 'content', 'categories', 'content_categories' existen
│  └─ Si existen → "✅ Already set up" y exit 0
└─ Si no existen → Continuar a FASE 3
    ↓
[FASE 3: Apply Migrations]
├─ Dry-run mode (mostrar cambios)
│  └─ `supabase db diff --schema public`
├─ Confirmación usuario
│  └─ "Apply these changes? (yes/no)"
└─ Aplicar migrations
   └─ `supabase db push`
    ↓
[FASE 4: Validation]
├─ Re-query information_schema
├─ Verificar tablas creadas:
│  ├─ content ✓
│  ├─ categories ✓
│  └─ content_categories ✓
├─ Smoke test: SELECT count(*) FROM content
└─ Success message con próximos pasos
```

### Capas de Seguridad (desde @security)

```
Capa 1: Secrets Management
- Desarrollo: OAuth login (sin service key expuesta)
- NUNCA commitear keys al repositorio

Capa 2: Pre-Flight Safety Checks
- Verificar CLI instalado
- Verificar autenticación válida
- Check tablas (idempotencia)

Capa 3: Dry-Run + Confirmation
- Mostrar cambios ANTES de aplicar
- Confirmation prompt obligatorio

Capa 4: Execution (Supabase CLI)
- supabase db push
- Transaccional (rollback automático)
- Migration tracking nativo

Capa 5: Validation & Logging
- Verificar tablas creadas
- Smoke test query
- Logging estructurado con timestamps
```

## Components

### Script Principal: `scripts/setup-cms.mjs`

**Responsabilidades:**
- Orquestar el flujo completo de setup
- Manejar interacción con usuario (prompts)
- Ejecutar comandos de Supabase CLI
- Logging claro y estructurado

**Dependencias Externas:**
- `execa` - Ejecutar comandos shell con manejo de errores
- `chalk` - Colores en terminal para mejor UX
- `inquirer` - Prompts interactivos

**Funciones Principales:**
```javascript
export async function setupCMS(options = {})
export async function checkTablesExist(supabase)
export async function applyMigrations(projectRef)
```

### Módulo: `scripts/lib/check-cli.mjs`

**Responsabilidad:** Verificar que Supabase CLI está instalado y accesible.

**Funciones:**
```javascript
export async function isCliInstalled()
  // Check if `supabase` command exists
  // Return: boolean

export function showInstallGuide()
  // Display installation instructions
  // Platform-agnostic (muestra comando correcto por OS)
```

### Módulo: `scripts/lib/validate-tables.mjs`

**Responsabilidad:** Validar que las tablas fueron creadas correctamente.

**Funciones:**
```javascript
export async function checkTableExists(supabase, tableName)
  // Query information_schema.tables
  // Return: boolean

export async function validateSchema(supabase)
  // Verificar todas las tablas requeridas
  // Return: { success: boolean, missing: string[] }

export async function smokeTest(supabase)
  // SELECT count(*) FROM content
  // Verificar RLS policies básicas
  // Return: { success: boolean, error?: string }
```

### Módulo: `scripts/lib/logger.mjs`

**Responsabilidad:** Logging estructurado con colores y emojis (UX).

**API:**
```javascript
export const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✓'), msg),
  error: (msg) => console.error(chalk.red('✗'), msg),
  warning: (msg) => console.log(chalk.yellow('⚠'), msg),
  step: (msg) => console.log(chalk.cyan('→'), msg),
}
```

## Data Flow

### 1. Usuario Ejecuta Script

```bash
npm run setup:cms
```

NPM ejecuta el script definido en `package.json`:
```json
{
  "scripts": {
    "setup:cms": "node scripts/setup-cms.mjs"
  }
}
```

### 2. Preflight Checks

```javascript
// check-cli.mjs
const installed = await isCliInstalled()
if (!installed) {
  showInstallGuide()
  process.exit(1)
}

// Verificar auth
const { stdout } = await execa('supabase', ['projects', 'list'], { reject: false })
if (stdout.includes('not logged in')) {
  log.warning('Not authenticated. Running supabase login...')
  await execa('supabase', ['login'], { stdio: 'inherit' })
}
```

### 3. Link Proyecto

```javascript
// Extraer project-ref del SUPABASE_URL
const url = process.env.VITE_SUPABASE_URL
// "https://uwaapfclxbmlnywhzzjc.supabase.co"
const projectRef = url.split('//')[1].split('.')[0]
// "uwaapfclxbmlnywhzzjc"

// Link (idempotente - no falla si ya está linked)
await execa('supabase', ['link', '--project-ref', projectRef])
```

### 4. Check Estado Actual (Idempotencia)

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const { data } = await supabase
  .from('information_schema.tables')
  .select('table_name')
  .eq('table_schema', 'public')
  .in('table_name', ['content', 'categories', 'content_categories'])

if (data && data.length === 3) {
  log.success('Tables already exist. Nothing to do.')
  process.exit(0)
}
```

### 5. Dry-Run y Confirmación

```javascript
// Mostrar cambios
log.step('Showing pending migrations (dry-run)...')
await execa('supabase', ['db', 'diff', '--schema', 'public'], {
  stdio: 'inherit'
})

// Pedir confirmación
const { confirm } = await inquirer.prompt([{
  type: 'confirm',
  name: 'confirm',
  message: 'Apply these migrations?',
  default: false
}])

if (!confirm) {
  log.warning('Cancelled by user')
  process.exit(0)
}
```

### 6. Aplicar Migrations

```javascript
log.step('Applying migrations...')

try {
  await execa('supabase', ['db', 'push'], {
    stdio: 'inherit'
  })
  log.success('Migrations applied successfully')
} catch (error) {
  log.error('Migration failed:', error.message)
  log.info('Supabase rolled back changes automatically')
  log.info('Check Supabase Dashboard logs for details')
  process.exit(1)
}
```

### 7. Validación Post-Apply

```javascript
const validation = await validateSchema(supabase)

if (!validation.success) {
  log.error('Validation failed. Missing tables:', validation.missing)
  process.exit(1)
}

// Smoke test
const smoke = await smokeTest(supabase)
if (!smoke.success) {
  log.warning('Smoke test failed:', smoke.error)
  log.info('Tables exist but may have RLS issues')
}

log.success('✅ CMS setup completed! 🎉')
log.info('Next: Open http://localhost:5173/admin/cms')
```

## Expert Considerations

> 🤖 Recomendaciones integradas de agentes especializados

### Architecture (@architect)

**Decisiones Clave:**

1. **Supabase CLI over REST API**
   - CLI maneja transacciones, rollback, y migration tracking automáticamente
   - Trade-off: Requiere instalación del CLI, pero gana idempotencia y seguridad

2. **Script Idempotente**
   - Check tablas antes de aplicar migrations
   - Safe to run múltiples veces
   - No side-effects si ya está configurado

3. **Modularización**
   - Separar concerns: CLI checks, validation, logging
   - Facilita testing unitario de cada módulo
   - Reutilizable para otros scripts de setup

4. **Migration Tracking**
   - Usar sistema nativo de Supabase (tabla `supabase_migrations.schema_migrations`)
   - No reinventar la rueda

**ADR Implícita:**
- **ADR-005: Migrations via Supabase CLI**
- Contexto: Necesitamos aplicar schema changes de forma automatizada
- Decisión: Usar Supabase CLI en lugar de REST API custom
- Consecuencias:
  - ✅ Idempotencia nativa
  - ✅ Rollback automático
  - ✅ Best practices oficiales
  - ❌ Dependencia externa (CLI)

### Security Considerations (@security)

**Findings Críticos Implementados:**

1. **C1: Service Role Key Management**
   ```javascript
   // ✅ CORRECTO: OAuth login (sin service key expuesta)
   await execa('supabase', ['login']) // Interactive OAuth

   // ❌ NUNCA hacer esto:
   const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // hardcoded
   ```

2. **H1: Anon Key vs Service Role**
   - Script usa Supabase CLI (maneja auth internamente)
   - CLI usa token de OAuth login
   - Anon key del .env solo se usa para validation queries (read-only)

3. **H3: SQL Injection Prevention**
   - ✅ Migrations en archivos `.sql` estáticos versionados
   - ✅ No construcción dinámica de SQL
   - ✅ Supabase CLI ejecuta archivos tal cual

4. **Secrets en .gitignore**
   ```gitignore
   # .gitignore (ya verificado)
   .env
   .env.local
   .env.*.local
   ```

**Security Posture:**
- No expone service_role key
- Usa OAuth (tokens temporales)
- No permite SQL injection
- Secrets nunca commiteados

### Accessibility & UX (@ux-accessibility - Fallback)

**Principios Aplicados:**

1. **Mensajes Claros y Accionables**
   ```javascript
   // ✓ Bueno:
   log.error('Supabase CLI not found')
   log.info('Install with: npm install -g supabase')
   log.info('Or visit: https://supabase.com/docs/guides/cli')
   ```

2. **Progreso Visible**
   ```javascript
   log.step('1/4 Checking CLI installation...')
   log.step('2/4 Verifying authentication...')
   log.step('3/4 Applying migrations...')
   log.step('4/4 Validating setup...')
   ```

3. **Estados con Símbolos Claros**
   - ✓ Success (verde)
   - ✗ Error (rojo)
   - ⚠ Warning (amarillo)
   - → Step (cyan)
   - ℹ Info (azul)

4. **Confirmaciones Explícitas**
   - No defaults peligrosos
   - Mostrar cambios ANTES de aplicar
   - Require explicit "yes"

### Performance (@performance - Fallback)

**Optimizaciones:**

1. **Check Tablas Antes de Migrations**
   - Evita ejecutar migrations innecesarias
   - Query rápido a information_schema (~10ms)

2. **Dry-Run Mode**
   - `supabase db diff` es read-only
   - No costo en database

3. **Validación Incremental**
   - Check CLI → Auth → Tablas → Apply
   - Fail fast: si CLI no está, exit inmediato

4. **No N+1 Queries**
   - Validation: 1 query para todas las tablas
   ```javascript
   // ✅ Batch query
   .in('table_name', ['content', 'categories', 'content_categories'])

   // ❌ NO hacer N+1:
   for (const table of tables) {
     await checkTableExists(supabase, table)
   }
   ```

## Error Handling

### Errores Comunes y Recovery

| Error | Causa | Recovery |
|-------|-------|----------|
| **CLI not found** | Supabase CLI no instalado | Mostrar guía de instalación con comando específico |
| **Not authenticated** | `supabase login` nunca ejecutado | Ejecutar `supabase login` automáticamente (interactivo) |
| **Invalid project ref** | SUPABASE_URL mal formateada | Validar formato URL, mostrar ejemplo correcto |
| **Tables already exist** | Script ya fue ejecutado | Exit 0 con mensaje "Already set up" (no es error) |
| **Migration failed** | Error SQL en migration file | Supabase rollback automático, mostrar logs |
| **Permission denied** | Token expirado o sin permisos | Re-authenticate con `supabase login` |
| **Usuario cancela** | Usuario dice "no" al prompt | Exit 0 con mensaje "Cancelled by user" |

### Try-Catch Strategy

```javascript
// Wrapper para comandos CLI con manejo de errores
async function runSupabaseCommand(args, options = {}) {
  try {
    const result = await execa('supabase', args, {
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    })
    return { success: true, output: result.stdout }
  } catch (error) {
    log.error(`Command failed: supabase ${args.join(' ')}`)

    // Parsear errores comunes
    if (error.message.includes('not logged in')) {
      log.warning('Authentication required. Run: supabase login')
    } else if (error.message.includes('project not found')) {
      log.warning('Project not linked. Check VITE_SUPABASE_URL')
    } else {
      log.error('Unexpected error:', error.message)
    }

    return { success: false, error: error.message }
  }
}
```

### Rollback Strategy

**Si migration falla:**

1. Supabase CLI maneja rollback automático (transaccional)
2. El script no necesita implementar rollback custom
3. Mostrar mensaje claro de que el rollback fue automático
4. Sugerir revisar logs en Supabase Dashboard

## Testing Strategy

### Testing Manual (Desarrollo)

**Escenario 1: Fresh Install (tablas no existen)**
```bash
# Pre-condición: tablas no existen en Supabase
npm run setup:cms

# Expected:
# ✓ CLI detected
# ✓ Authenticated (o prompt de login)
# ✓ Linked to project
# → Showing migrations (dry-run)
# ? Apply these migrations? (yes)
# ✓ Migrations applied
# ✓ Validation passed
# ✅ CMS setup completed! 🎉
# ℹ Next: Open http://localhost:5173/admin/cms
```

**Escenario 2: Already Set Up (idempotencia)**
```bash
# Pre-condición: tablas ya existen
npm run setup:cms

# Expected:
# ✓ CLI detected
# ✓ Authenticated
# ✓ Linked to project
# ✓ Tables already exist. Nothing to do.
```

**Escenario 3: CLI No Instalado**
```bash
# Pre-condición: supabase CLI no está en PATH
npm run setup:cms

# Expected:
# ✗ Supabase CLI not found
# ℹ Install with: npm install -g supabase
# ℹ Or visit: https://supabase.com/docs/guides/cli
# (exit code 1)
```

**Escenario 4: Not Authenticated**
```bash
# Pre-condición: nunca ejecutó supabase login
npm run setup:cms

# Expected:
# ✓ CLI detected
# ⚠ Not authenticated. Running supabase login...
# (Abre browser para OAuth login)
# ✓ Authenticated
# (Continúa normalmente)
```

**Escenario 5: Usuario Cancela**
```bash
npm run setup:cms

# Expected:
# ✓ CLI detected
# ✓ Authenticated
# ✓ Linked to project
# → Showing migrations (dry-run)
# ? Apply these migrations? (no)
# ⚠ Cancelled by user
# (exit code 0)
```

### Validation Queries

**Post-migration checks:**

```sql
-- 1. Verificar tablas creadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('content', 'categories', 'content_categories');
-- Expected: 3 rows

-- 2. Verificar columnas de content
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'content'
ORDER BY ordinal_position;
-- Expected: id, type, slug, title, excerpt, body, meta_title,
--           meta_description, og_image, status, featured,
--           featured_image, file_url, file_name, created_at,
--           published_at, updated_at, author_id

-- 3. Verificar RLS habilitada
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('content', 'categories', 'content_categories');
-- Expected: rowsecurity = true para todas

-- 4. Smoke test: query vacío debe funcionar
SELECT count(*) FROM content;
-- Expected: 0 (sin error)
```

### End-to-End Test

**Flujo Completo:**

1. Ejecutar script: `npm run setup:cms`
2. Verificar migrations aplicadas (Supabase Dashboard)
3. Abrir browser: http://localhost:5173/admin/cms
4. **Verificar que NO aparecen errores:**
   - ✓ No "Could not find 'public.content' in the schema cache"
   - ✓ No "No se encontró ninguna clave API"
5. Verificar que aparecen 3 tabs: Borradores, Publicados, Archivados
6. Cada tab debe mostrar mensaje "No hay publicaciones" (no error)
7. Ejecutar script de nuevo: `npm run setup:cms`
8. Debe decir "Tables already exist. Nothing to do." (idempotencia)

## Critical Files

### New Files to Create

```
scripts/
├── setup-cms.mjs              # Main script (NEW)
└── lib/
    ├── check-cli.mjs          # CLI verification (NEW)
    ├── validate-tables.mjs    # Schema validation (NEW)
    └── logger.mjs             # Structured logging (NEW)
```

### Files to Modify

**1. `package.json`**
- Add script: `"setup:cms": "node scripts/setup-cms.mjs"`
- Add dependencies:
  ```json
  "devDependencies": {
    "execa": "^8.0.1",
    "chalk": "^5.3.0",
    "inquirer": "^9.2.12"
  }
  ```

**2. `.gitignore`**
- Verify `.env`, `.env.local`, `*.key` are ignored (ya verificado como correcto)

### Existing Files (Reference Only - No Changes)

- `supabase/migrations/001_blog_schema.sql` - Migration to apply (no changes needed)
- `src/config/supabase.js` - Client config (already correct)
- `src/features/cms/services/cmsService.js` - CMS API (already correct)
- `.env` - Environment variables (already correct)

## Verification Checklist

### Post-Implementation

Después de implementar el script:

- [ ] Script ejecuta sin errores en fresh install
- [ ] Script es idempotente (safe to run múltiples veces)
- [ ] Tablas creadas en Supabase:
  - [ ] `content` existe con todas las columnas
  - [ ] `categories` existe
  - [ ] `content_categories` existe
- [ ] RLS policies aplicadas (verificable en Dashboard)
- [ ] CMS admin panel carga sin errores:
  - [ ] http://localhost:5173/admin/cms accesible
  - [ ] Tabs: Borradores, Publicados, Archivados visibles
  - [ ] No error "Could not find 'public.content'"
  - [ ] No error "No se encontró ninguna clave API"
- [ ] Smoke test queries funcionan:
  - [ ] `SELECT * FROM content` no da error
  - [ ] `SELECT * FROM categories` no da error
  - [ ] `SELECT * FROM content_categories` no da error

### Manual Test Sequence

```bash
# 1. Instalar dependencies
npm install

# 2. Ejecutar script
npm run setup:cms

# 3. Verificar en Supabase Dashboard
# - Abrir https://supabase.com/dashboard/project/uwaapfclxbmlnywhzzjc
# - Ir a Table Editor
# - Verificar que aparecen: content, categories, content_categories

# 4. Verificar en browser
# - Abrir http://localhost:5173/admin/cms
# - Verificar que NO hay errores en consola
# - Verificar que tabs cargan correctamente

# 5. Verificar idempotencia
npm run setup:cms  # Debe decir "Already set up"
```

## Agents Consulted

| Agent | Signal Detected | Status | Key Recommendation |
|-------|-----------------|--------|-------------------|
| @architect | Multi-componente, CLI vs API design, idempotencia | Consulted | Use Supabase CLI for native migration tracking. Modular structure with separated concerns. Idempotent by design. |
| @security | Database migrations, API keys, service_role key exposure risk | Consulted | CRITICAL: Never hardcode service_role key. Use OAuth login (dev). Implement dry-run mode. No SQL injection via static .sql files. |
| @ux-accessibility | Script output messages, user interaction, progress visibility | Fallback | Clear messages with emojis/colors. Visible progress steps (1/4, 2/4...). Actionable error messages with next steps. |
| @performance | Database queries, script execution time, fail-fast strategy | Fallback | Check tables before applying migrations. Batch validation queries (no N+1). Fail fast: exit immediately if CLI missing. |

---

**End of Design Document**
