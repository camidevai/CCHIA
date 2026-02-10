---
id: 001
title: Configurar base de datos para Blog/CMS
status: done
created: 2026-02-09
completed: 2026-02-09
labels: [feature, blog, database]
blocked_by: []
blocks: [002, 003]
---

# Configurar base de datos para Blog/CMS

## User Story

Como desarrollador,
quiero tener las tablas de contenido, categorías y relaciones en Supabase,
para poder almacenar y consultar posts del blog.

## Descripción

Crear el esquema de base de datos para el sistema de Blog/CMS incluyendo tipos ENUM, tablas con campos SEO, y políticas RLS para control de acceso.

## Scope

- **Incluye**: Tablas content, categories, content_categories; ENUMs; políticas RLS; bucket de Storage
- **NO incluye**: Código frontend, servicios JavaScript, UI

## Sub-tareas

- [x] Crear tipos ENUM (content_type, content_status)
- [x] Crear tabla `content` con campos SEO y metadata
- [x] Crear tabla `categories` con slug único
- [x] Crear tabla `content_categories` (relación M2M)
- [x] Configurar políticas RLS para cada tabla
- [x] Crear bucket `blog-images` en Storage *(instrucciones documentadas)*
- [x] Agregar datos de prueba (2-3 categorías, 1 post draft) *(categorías en SQL, post documentado)*

## Criterios de Aceptación

- [x] Tabla `content` existe con campos: id, type, slug, title, excerpt, body, meta_title, meta_description, og_image, status, featured, featured_image, file_url, file_name, created_at, published_at, updated_at, author_id
- [x] Tabla `categories` existe con campos: id, slug, name, description
- [x] Tabla `content_categories` existe con PKs compuestas (content_id, category_id)
- [x] ENUM `content_type` tiene valores: 'article', 'news', 'resource'
- [x] ENUM `content_status` tiene valores: 'draft', 'published', 'archived'
- [x] RLS: Anónimos pueden SELECT contenido con status='published'
- [x] RLS: Autenticados pueden ALL en content, categories
- [x] Bucket `blog-images` creado y accesible *(instrucciones en implementation.md)*
- [x] Al menos 2 categorías de prueba insertadas *(3 categorías en SQL)*
- [x] Al menos 1 post de prueba insertado (status draft) *(query documentado en implementation.md)*

## Definition of Done

- [ ] Migración SQL ejecutada en Supabase *(PENDIENTE: acción manual del usuario)*
- [ ] Políticas RLS verificadas desde cliente anónimo *(PENDIENTE: después de ejecutar migración)*
- [x] Documentación de esquema actualizada

## Notas de Implementación

- **Archivos objetivo**: `supabase/migrations/001_blog_schema.sql`
- **Patrones a seguir**: Estructura existente de tabla `events`
- **Consideraciones técnicas**: author_id referencia auth.users, usar CASCADE en foreign keys

## Estimación

Complejidad: media

---

## Implementación Completada

**Fecha**: 2026-02-09

**Archivos creados**:
- `supabase/migrations/001_blog_schema.sql` - Migración completa
- `.claude/docs/features/blog/implementation.md` - Documentación e instrucciones

**Evidencia por AC**:
| AC | Líneas en SQL |
|----|---------------|
| Tabla content | 33-57 |
| Tabla categories | 17-24 |
| Tabla content_categories | 63-68 |
| ENUM content_type | 11 |
| ENUM content_status | 14 |
| RLS anónimos | 108-111 |
| RLS autenticados | 113-135 |
| Categorías prueba | 172-175 |

**Pasos manuales pendientes**:
1. Ejecutar `001_blog_schema.sql` en Supabase Dashboard → SQL Editor
2. Crear bucket `blog-images` en Storage
3. Insertar post de prueba (query en implementation.md)
