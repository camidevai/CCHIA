# Plan: Issue #002 - Implementar Blog Publico (Lectura)

## Resumen

Implementar el modulo publico del blog para CCHIA que permite listar posts, filtrar por categoria/tipo, y leer contenido individual con Markdown renderizado.

## Pre-requisitos

- [x] Issue #001 completado (schema de BD en develop)
- [x] Dependencias instaladas: `marked`, `dompurify`
- [ ] Ejecutar migracion SQL en Supabase (si no se ha hecho)

## Archivos a Crear

| Archivo | Descripcion |
|---------|-------------|
| `src/features/blog/services/blogService.js` | API para Supabase (getPublished, getBySlug, getCategories) |
| `src/features/blog/hooks/usePosts.js` | Hook para lista de posts con filtros |
| `src/features/blog/hooks/usePost.js` | Hook para post individual por slug |
| `src/features/blog/hooks/useCategories.js` | Hook para lista de categorias |
| `src/features/blog/components/PostCard.jsx` | Tarjeta de post (imagen, titulo, excerpt, fecha, categoria) |
| `src/features/blog/components/PostList.jsx` | Grid responsivo con loading/empty states |
| `src/features/blog/components/CategoryFilter.jsx` | Chips de filtro por categoria |
| `src/features/blog/components/TypeTabs.jsx` | Tabs para filtrar por tipo (article/news/resource) |
| `src/features/blog/components/PostContent.jsx` | Renderizador de Markdown con marked+dompurify |
| `src/features/blog/pages/BlogPage.jsx` | Pagina principal /blog |
| `src/features/blog/pages/PostDetailPage.jsx` | Pagina de detalle /blog/:slug |

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/App.jsx` | Agregar rutas /blog y /blog/:slug con lazy loading |
| `src/data/navigation.json` | Agregar enlace "Blog" con href "/blog" |
| `src/data/en/navigation.json` | Agregar enlace "Blog" en ingles |
| `src/components/Navbar.jsx` | Agregar BlogIcon + manejar navegacion a rutas (no solo anchors) |

## Orden de Implementacion

### Fase 1: Service Layer
1. **blogService.js** - Queries a Supabase siguiendo patron de `eventsAPI`
   - `getPublished(options)` - Lista posts publicados con filtros opcionales
   - `getBySlug(slug)` - Post individual con categorias
   - `getCategories()` - Todas las categorias

### Fase 2: Hooks
2. **usePosts.js** - Estado: posts, isLoading, error. Recibe {type, categorySlug}
3. **usePost.js** - Estado: post, isLoading, error. Recibe slug
4. **useCategories.js** - Estado: categories, isLoading, error

### Fase 3: Componentes
5. **PostCard.jsx** - Tarjeta con Link a /blog/{slug}, excerpt truncado a 150 chars
6. **PostList.jsx** - Grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`, loading spinner, empty state
7. **CategoryFilter.jsx** - Chips con aria-pressed, boton "Todas" + categorias dinamicas
8. **TypeTabs.jsx** - Tabs con role="tablist", tipos: Todos, Articulos, Noticias, Recursos
9. **PostContent.jsx** - Parsea markdown con `marked`, sanitiza con `DOMPurify`

### Fase 4: Paginas
10. **BlogPage.jsx** - Combina TypeTabs, CategoryFilter, PostList con estado de filtros
11. **PostDetailPage.jsx** - Header (titulo H1, fecha, categorias, imagen), PostContent, boton descarga para resources

### Fase 5: Integracion
12. **App.jsx** - Agregar lazy imports y rutas dentro de MainLayout
13. **navigation.json** - Agregar `{"name": "Blog", "href": "/blog"}` despues de Vision
14. **Navbar.jsx** - Agregar BlogIcon + modificar handleNavClick para soportar rutas

## Criterios de Aceptacion (Mapeo)

| AC | Implementacion |
|----|----------------|
| 1. Ruta /blog muestra posts ordenados por fecha | BlogPage + usePosts con order by published_at DESC |
| 2. Filtro por categoria | CategoryFilter + estado en BlogPage |
| 3. Filtro por tipo con tabs | TypeTabs + estado en BlogPage |
| 4. PostCard: imagen, titulo, excerpt 150 chars, fecha, categoria | PostCard.jsx |
| 5. Click navega a /blog/{slug} | Link en PostCard + ruta en App.jsx |
| 6. Markdown renderizado | PostContent con marked+DOMPurify |
| 7. Detalle: H1, autor, fecha, categorias, imagen | PostDetailPage header |
| 8. Resources: boton descarga | Condicional en PostDetailPage si type=resource |
| 9. Loading state | LoadingSpinner en PostList y PostDetailPage |
| 10. Empty state | UI en PostList cuando posts.length === 0 |
| 11. Responsive 1/2/3 columnas | Tailwind grid-cols-1 md:grid-cols-2 lg:grid-cols-3 |
| 12. Navbar con enlace Blog | navigation.json + Navbar.jsx |

## Patrones a Seguir

- **API**: Seguir estructura de `eventsAPI` en `src/config/supabase.js`
- **Hooks**: Seguir patron de `EventsContext.jsx` (loading, error, data)
- **Componentes**: Tailwind + Framer Motion + soporte dark/light theme
- **Navegacion**: Actualizar `handleNavClick` para detectar rutas vs anchors

## Accesibilidad

- `aria-label` en navegacion y filtros
- `aria-pressed` en botones de filtro
- `role="tablist"` y `aria-selected` en tabs
- Focus visible con `focus-visible:ring-2`
- Elementos semanticos: `<article>`, `<nav>`, `<main>`, `<time>`

## Verificacion

1. Ejecutar `npm run dev`
2. Navegar a `/blog` - debe mostrar lista de posts (o empty state)
3. Probar filtros de tipo y categoria
4. Click en un post - debe navegar a `/blog/{slug}`
5. Verificar Markdown renderizado correctamente
6. Verificar boton de descarga en resources
7. Verificar responsive en diferentes tamanios
8. Verificar navegacion desde Navbar

## Notas

- La tabla `content` usa el campo `type` como ENUM ('article', 'news', 'resource')
- El `author_id` referencia `auth.users` - por ahora mostrar solo fecha, autor se puede agregar despues
- Si no hay posts en la BD, se mostrara empty state
