---
id: 002
title: Implementar Blog público (lectura)
status: done
created: 2026-02-09
closed: 2026-02-11
labels: [feature, blog, frontend]
blocked_by: [001]
blocks: [004]
implemented_in: dd1aa3c
---

# Implementar Blog público (lectura)

## User Story

Como visitante del sitio,
quiero ver artículos, noticias y recursos publicados,
para informarme sobre IA en Chile.

## Descripción

Crear el módulo público del blog que permite a los visitantes listar posts, filtrar por categoría/tipo, y leer contenido individual con Markdown renderizado.

## Scope

- **Incluye**: Páginas BlogPage y PostDetailPage; componentes PostCard, PostList, CategoryFilter, PostContent; servicios y hooks de lectura; rutas públicas
- **NO incluye**: Creación/edición de contenido (CMS), autenticación, SEO avanzado

## Sub-tareas

- [x] Crear `blogService.js` con queries read-only (getAll, getBySlug, getByCategory)
- [x] Crear hooks: `usePosts`, `usePost`, `useCategories`
- [x] Crear componente `PostCard` con imagen, título, excerpt, fecha
- [x] Crear componente `PostList` con grid responsive
- [x] Crear componente `CategoryFilter` con chips/tabs
- [x] Crear componente `PostContent` con Markdown renderizado
- [x] Crear página `BlogPage` en `/blog`
- [x] Crear página `PostDetailPage` en `/blog/:slug`
- [x] Integrar rutas en App.jsx
- [x] Agregar enlace "Blog" en Navbar

## Criterios de Aceptación

- [x] Ruta `/blog` muestra lista de posts publicados ordenados por fecha
- [x] Posts se filtran por categoría al hacer clic en CategoryFilter
- [x] Posts se filtran por tipo (article, news, resource) con tabs
- [x] PostCard muestra: imagen destacada, título, excerpt (150 chars), fecha, categoría
- [x] Click en PostCard navega a `/blog/{slug}`
- [x] PostDetailPage muestra contenido Markdown renderizado correctamente
- [~] PostDetailPage muestra: título (H1), autor, fecha, categorías, imagen destacada *(parcial: autor no mostrado por limitación de schema #001 - no hay tabla profiles para join)*
- [x] Resources muestran botón de descarga con file_url
- [x] Loading state visible mientras cargan datos
- [x] Empty state cuando no hay posts
- [x] Responsive: 1 columna mobile, 2 tablet, 3 desktop
- [x] Navbar incluye enlace a "/blog"

## Definition of Done

- [x] Código implementado y funcionando
- [x] Sin errores en consola
- [x] Navegación fluida entre lista y detalle

## Notas de Implementación

- **Archivos objetivo**:
  - `src/features/blog/services/blogService.js`
  - `src/features/blog/hooks/usePosts.js`, `usePost.js`, `useCategories.js`
  - `src/features/blog/components/PostCard.jsx`, `PostList.jsx`, `CategoryFilter.jsx`, `PostContent.jsx`
  - `src/features/blog/pages/BlogPage.jsx`, `PostDetailPage.jsx`
  - `src/App.jsx` (rutas)
  - `src/components/Navbar.jsx` (enlace)
- **Patrones a seguir**: Estructura de EventsContext, componentes existentes con Tailwind
- **Consideraciones técnicas**: Usar `marked` para Markdown, `dompurify` para sanitizar HTML

## Estimación

Complejidad: alta

---

## Implementación Completada

**Fecha**: 2026-02-11

**Archivos creados (13)**:
- `src/features/blog/index.js` - Public API del módulo
- `src/features/blog/services/blogService.js` - Queries Supabase read-only
- `src/features/blog/hooks/usePosts.js` - Hook para lista de posts con filtros
- `src/features/blog/hooks/usePost.js` - Hook para post individual por slug
- `src/features/blog/hooks/useCategories.js` - Hook para categorías
- `src/features/blog/components/PostCard.jsx` - Card con imagen, título, excerpt, fecha, categorías
- `src/features/blog/components/PostList.jsx` - Grid responsive 1/2/3 columnas con skeleton loading
- `src/features/blog/components/CategoryFilter.jsx` - Chips de categoría con aria-pressed
- `src/features/blog/components/TypeTabs.jsx` - Tabs article/news/resource con roving tabindex
- `src/features/blog/components/PostContent.jsx` - Markdown rendering con marked + DOMPurify
- `src/features/blog/components/BlogEmptyState.jsx` - Empty state por tipo
- `src/features/blog/pages/BlogPage.jsx` - Página principal /blog
- `src/features/blog/pages/PostDetailPage.jsx` - Página detalle /blog/:slug

**Archivos modificados (10)**:
- `package.json` - Dependencias: marked, dompurify, @tailwindcss/typography
- `package-lock.json` - Lock file actualizado
- `tailwind.config.js` - Plugin @tailwindcss/typography
- `src/App.jsx` - Rutas /blog y /blog/:slug con lazy loading
- `src/components/Navbar.jsx` - Enlace Blog con BlogIcon
- `src/components/Footer.jsx` - handleNavClick actualizado
- `src/data/navigation.json` - Item Blog en navegación
- `src/data/en/navigation.json` - Item Blog en navegación (EN)
- `src/data/footer.json` - Link Blog en footer
- `src/data/en/footer.json` - Link Blog en footer (EN)

**Evidencia por AC**:
| AC | Archivo | Líneas |
|----|---------|--------|
| Ruta /blog | App.jsx | 66-72 |
| Filtro categoría | CategoryFilter.jsx, usePosts.js | 6-23, 30-34 |
| Filtro tipo (tabs) | TypeTabs.jsx, usePosts.js | 3-21, 15 |
| PostCard completo | PostCard.jsx | 39,71,25-29,83,91 |
| Navegación slug | PostCard.jsx | 34 |
| Markdown rendering | PostContent.jsx | 8-9 |
| Detalle completo | PostDetailPage.jsx | H1,fecha,cats,img OK. Autor parcial |
| Botón descarga | PostDetailPage.jsx | 117-143 |
| Loading state | PostList.jsx, PostDetailPage.jsx | 21-39, 22-34 |
| Empty state | BlogEmptyState.jsx, PostList.jsx | 9-43, 41-42 |
| Responsive grid | PostList.jsx | 52 |
| Navbar enlace | navigation.json, Navbar.jsx | 16, 183 |

**Condiciones QA (heredadas)**:
- AC7 parcial: nombre de autor no mostrado (solo `author_id` en schema, no hay tabla `profiles`). Es limitación de issue #001, no bug de #002.

**Commits**:
- `2dc6e8d` - feat(blog): implement public blog reading module
- `dd1aa3c` - feat(blog): implement issue #002 - blog publico lectura (merge)
