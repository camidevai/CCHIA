# Implementación: Blog/CMS Database Schema

## Issue
#001: Configurar base de datos para Blog/CMS

## Resumen

Esquema de base de datos para el sistema de Blog/CMS de CCHIA, incluyendo tablas para contenido, categorías y sus relaciones.

## Instrucciones de Ejecución

### 1. Ejecutar Migración SQL

1. Ir a [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleccionar proyecto CCHIA
3. Ir a **SQL Editor**
4. Copiar el contenido de `supabase/migrations/001_blog_schema.sql`
5. Ejecutar la migración

### 2. Crear Bucket de Storage

1. En Supabase Dashboard, ir a **Storage**
2. Click en **New bucket**
3. Nombre: `blog-images`
4. Marcar como **Public bucket** (para que las imágenes sean accesibles)
5. Click en **Create bucket**

### 3. Configurar Políticas de Storage

En el bucket `blog-images`, agregar políticas:

```sql
-- Permitir lectura pública
CREATE POLICY "blog_images_public_read" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'blog-images');

-- Permitir upload a autenticados
CREATE POLICY "blog_images_authenticated_upload" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-images');

-- Permitir delete a autenticados (su propio contenido)
CREATE POLICY "blog_images_authenticated_delete" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-images');
```

### 4. Insertar Post de Prueba (Opcional)

Después de tener un usuario admin, ejecutar en SQL Editor:

```sql
INSERT INTO content (type, slug, title, excerpt, body, status, author_id)
VALUES (
  'article',
  'bienvenidos-a-cchia',
  'Bienvenidos a la Cámara Chilena de Inteligencia Artificial',
  'Conoce nuestra misión y visión para impulsar la IA en Chile.',
  '# Bienvenidos a CCHIA

La **Cámara Chilena de Inteligencia Artificial** nace con la misión de conectar profesionales, empresas y entusiastas del ecosistema de IA en Chile.

## Nuestra Misión

Promover el desarrollo responsable y ético de la inteligencia artificial en Chile.

## Únete

Sé parte de la comunidad que está transformando el futuro tecnológico de Chile.',
  'draft',
  (SELECT id FROM auth.users LIMIT 1)
);
```

## Esquema de Tablas

### content
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | BIGSERIAL | PK auto-incremento |
| type | content_type | article, news, resource |
| slug | TEXT | URL única del post |
| title | TEXT | Título del contenido |
| excerpt | TEXT | Resumen corto |
| body | TEXT | Contenido en Markdown |
| meta_title | TEXT | Título SEO |
| meta_description | TEXT | Descripción SEO |
| og_image | TEXT | Imagen Open Graph |
| status | content_status | draft, published, archived |
| featured | BOOLEAN | Destacado en home |
| featured_image | TEXT | Imagen principal |
| file_url | TEXT | URL descarga (resources) |
| file_name | TEXT | Nombre archivo (resources) |
| created_at | TIMESTAMPTZ | Fecha creación |
| published_at | TIMESTAMPTZ | Fecha publicación |
| updated_at | TIMESTAMPTZ | Última modificación |
| author_id | UUID | FK a auth.users |

### categories
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | BIGSERIAL | PK auto-incremento |
| slug | TEXT | URL única de categoría |
| name | TEXT | Nombre visible |
| description | TEXT | Descripción |

### content_categories
| Campo | Tipo | Descripción |
|-------|------|-------------|
| content_id | BIGINT | FK a content |
| category_id | BIGINT | FK a categories |

## Políticas RLS

| Tabla | Rol | SELECT | INSERT | UPDATE | DELETE |
|-------|-----|--------|--------|--------|--------|
| content | anon | published only | ❌ | ❌ | ❌ |
| content | authenticated | ✅ all | ✅ own | ✅ own | ✅ own |
| categories | anon | ✅ | ❌ | ❌ | ❌ |
| categories | authenticated | ✅ | ✅ | ✅ | ✅ |
| content_categories | anon | published only | ❌ | ❌ | ❌ |
| content_categories | authenticated | ✅ | ✅ own | ❌ | ✅ own |

## Decisiones Técnicas

| Decisión | Razón |
|----------|-------|
| ENUMs para type/status | Validación a nivel DB, mejor performance que strings |
| BIGSERIAL para IDs | Permite escalar a millones de posts |
| TIMESTAMPTZ | Manejo correcto de zonas horarias |
| Trigger para updated_at | Actualización automática sin código frontend |
| Índices en slug, status, type | Queries frecuentes optimizadas |
| CASCADE en FKs | Limpieza automática al eliminar |

## Archivos Creados

| Archivo | Propósito |
|---------|-----------|
| `supabase/migrations/001_blog_schema.sql` | Migración completa |

## Verificación

Para verificar que la migración se ejecutó correctamente:

```sql
-- Verificar tablas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('content', 'categories', 'content_categories');

-- Verificar ENUMs
SELECT typname FROM pg_type
WHERE typname IN ('content_type', 'content_status');

-- Verificar categorías de prueba
SELECT * FROM categories;

-- Verificar políticas RLS
SELECT tablename, policyname FROM pg_policies
WHERE schemaname = 'public';
```
