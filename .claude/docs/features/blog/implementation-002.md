# Implementacion: Blog Publico (Lectura)

## Issue
#002: Blog publico (lectura)

## Resumen

Modulo completo de blog publico para que visitantes puedan listar posts, filtrar por categoria/tipo y leer contenido Markdown renderizado. Incluye paginas BlogPage y PostDetailPage, componentes de filtrado, servicio Supabase read-only y navegacion integrada.

## Criterios de Aceptacion - Evidencia

| # | AC | Estado | Archivo:linea |
|---|-----|--------|---------------|
| 1 | Ruta `/blog` muestra lista de posts publicados | OK | `src/features/blog/pages/BlogPage.jsx:27` + `src/App.jsx:64` |
| 2 | Posts se filtran por categoria | OK | `src/features/blog/components/CategoryFilter.jsx:7` + `src/features/blog/hooks/usePosts.js:32` |
| 3 | Posts se filtran por tipo con tabs | OK | `src/features/blog/components/TypeTabs.jsx:10` + `src/features/blog/hooks/usePosts.js:13` |
| 4 | PostCard muestra imagen, titulo, excerpt, fecha, categoria | OK | `src/features/blog/components/PostCard.jsx:36` |
| 5 | Click en PostCard navega a `/blog/{slug}` | OK | `src/features/blog/components/PostCard.jsx:40` |
| 6 | PostDetailPage muestra Markdown renderizado | OK | `src/features/blog/components/PostContent.jsx:7` |
| 7 | PostDetailPage muestra titulo, fecha, categorias, imagen | OK | `src/features/blog/pages/PostDetailPage.jsx:78` |
| 8 | Resources muestran boton de descarga | OK | `src/features/blog/pages/PostDetailPage.jsx:119` |
| 9 | Loading state visible | OK | `src/features/blog/components/PostList.jsx:23` + `src/features/blog/pages/PostDetailPage.jsx:28` |
| 10 | Empty state cuando no hay posts | OK | `src/features/blog/components/BlogEmptyState.jsx:13` |
| 11 | Responsive 1/2/3 columnas | OK | `src/features/blog/components/PostList.jsx:54` |
| 12 | Navbar incluye enlace a /blog | OK | `src/data/navigation.json:14` + `src/components/Navbar.jsx:165` |

## Archivos Creados (13)

| Archivo | Descripcion |
|---------|-------------|
| `src/features/blog/services/blogService.js` | API read-only Supabase (tabla `content`) |
| `src/features/blog/hooks/usePosts.js` | Hook lista de posts + filtros type/category |
| `src/features/blog/hooks/usePost.js` | Hook post individual por slug |
| `src/features/blog/hooks/useCategories.js` | Hook lista de categorias |
| `src/features/blog/components/PostCard.jsx` | Tarjeta preview con imagen, badges, excerpt |
| `src/features/blog/components/PostList.jsx` | Grid responsive con skeleton loading |
| `src/features/blog/components/TypeTabs.jsx` | Tabs Todos/Articulos/Noticias/Recursos |
| `src/features/blog/components/CategoryFilter.jsx` | Chips de filtro por categoria |
| `src/features/blog/components/PostContent.jsx` | Renderizador Markdown (marked + DOMPurify) |
| `src/features/blog/components/BlogEmptyState.jsx` | Estado vacio contextual |
| `src/features/blog/pages/BlogPage.jsx` | Pagina listado `/blog` |
| `src/features/blog/pages/PostDetailPage.jsx` | Pagina detalle `/blog/:slug` |
| `src/features/blog/index.js` | Barrel exports |

## Archivos Modificados (8)

| Archivo | Cambio |
|---------|--------|
| `src/components/Navbar.jsx` | BlogIcon + icons array + handleNavClick con useNavigate/useLocation |
| `src/components/Footer.jsx` | handleNavClick con soporte de rutas `/` + hash desde subpaginas |
| `src/App.jsx` | Lazy imports + 2 rutas blog en MainLayout |
| `src/data/navigation.json` | Link Blog posicion 4 (despues de Eventos) |
| `src/data/en/navigation.json` | Link Blog posicion 4 |
| `src/data/footer.json` | Blog href `#` -> `/blog` |
| `src/data/en/footer.json` | Blog href `#` -> `/blog` |
| `tailwind.config.js` | Plugin @tailwindcss/typography |

## Decisiones Tecnicas

| Decision | Razon |
|----------|-------|
| Hooks ligeros sin Context | Blog no necesita estado global, solo se consume en /blog y /blog/:slug |
| Filtro type server-side, category client-side | Type cambia el query SQL; categorias ya vienen del join |
| Tabla `content` (no `posts`) | Schema existente de issue #001 usa tabla `content` |
| DOMPurify para sanitizar HTML | Previene XSS en Markdown renderizado |
| @tailwindcss/typography | Estilos prose necesarios para Markdown sin el reset de Tailwind |
| Skeleton loading | Mejor UX que spinner para listas |

## Accesibilidad

| Componente | ARIA implementado |
|------------|-------------------|
| TypeTabs | `role="tablist"`, `role="tab"`, `aria-selected` |
| CategoryFilter | `aria-pressed` en cada chip, `aria-label` |
| PostCard | `<article>` semantico, `<time datetime>` |
| PostDetailPage | `<article>`, H1 unico, `<time>` |
| Loading states | `aria-live="polite"` |
