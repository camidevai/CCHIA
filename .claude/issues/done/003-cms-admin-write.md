---
id: 003
title: Implementar CMS Admin (escritura)
status: done
created: 2026-02-09
closed: 2026-02-12
implemented_in: af00b7b
labels: [feature, cms, admin, frontend]
blocked_by: [001]
blocks: [004]
---

# Implementar CMS Admin (escritura)

## User Story

Como administrador,
quiero crear, editar y publicar artículos, noticias y recursos,
para mantener el blog actualizado con contenido de valor.

## Descripción

Crear el módulo de administración del CMS con editor Markdown, formulario de metadata, gestión de borradores y publicación. Solo accesible para usuarios autenticados.

## Scope

- **Incluye**: Páginas CMSDashboard y EditorPage; componentes MarkdownEditor, PostForm, DraftList, SEOPreview; servicios CRUD; rutas protegidas
- **NO incluye**: Gestión de usuarios/roles, comentarios, analytics

## Sub-tareas

- [x] Crear `cmsService.js` con CRUD (create, update, delete, publish, unpublish)
- [x] Crear hooks: `usePublish`, `useDraft`, `useUpload`
- [x] Crear componente `MarkdownEditor` con textarea + preview side-by-side
- [x] Crear componente `PostForm` con campos de metadata y SEO
- [x] Crear componente `DraftList` con lista de borradores
- [x] Crear componente `SEOPreview` con preview de Google/redes
- [x] Crear página `CMSDashboard` en `/admin/cms`
- [x] Crear página `EditorPage` en `/admin/cms/editor/:id?`
- [x] Integrar rutas protegidas en App.jsx
- [x] Agregar enlace "CMS" en AdminDashboard

## Criterios de Aceptación

- [x] Ruta `/admin/cms` muestra dashboard con tabs: Borradores, Publicados, Archivados
- [x] Dashboard muestra tabla con: título, tipo, estado, fecha, acciones (editar, eliminar)
- [x] Botón "Nuevo Post" navega a `/admin/cms/editor`
- [x] EditorPage permite seleccionar tipo (article, news, resource)
- [x] MarkdownEditor muestra textarea izquierda y preview derecha en tiempo real
- [x] PostForm incluye campos: título, slug (auto-generado), excerpt, categorías, imagen destacada
- [x] PostForm incluye campos SEO: meta_title, meta_description, og_image
- [x] SEOPreview muestra cómo se verá en Google y redes sociales
- [x] Botón "Guardar borrador" guarda sin publicar
- [x] Botón "Publicar" cambia status a 'published' y asigna published_at
- [x] Upload de imágenes funciona con Supabase Storage
- [x] Validación: título requerido, slug único, body mínimo 100 chars
- [x] Solo usuarios autenticados pueden acceder (ProtectedRoute)
- [x] Confirmación antes de eliminar posts

## Definition of Done

- [x] Código implementado y funcionando
- [x] CRUD completo verificado
- [x] Validaciones funcionando

## Notas de Implementación

- **Archivos objetivo**:
  - `src/features/cms/services/cmsService.js`
  - `src/features/cms/hooks/usePublish.js`, `useDraft.js`, `useUpload.js`
  - `src/features/cms/components/MarkdownEditor.jsx`, `PostForm.jsx`, `DraftList.jsx`, `SEOPreview.jsx`
  - `src/features/cms/pages/CMSDashboard.jsx`, `EditorPage.jsx`
  - `src/App.jsx` (rutas protegidas)
- **Patrones a seguir**: Estructura de EventsManagement, formularios existentes
- **Consideraciones técnicas**: Slug auto-generado desde título, debounce en preview Markdown

## Estimación

Complejidad: alta
