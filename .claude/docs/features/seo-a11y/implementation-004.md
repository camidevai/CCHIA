# Implementation: SEO y Accesibilidad (Issue #004)

## Resumen

Implementacion completa de SEO meta tags, datos estructurados JSON-LD, Open Graph/Twitter Card tags, botones de compartir y mejoras de accesibilidad para las paginas publicas del blog.

## Decisiones Tecnicas

### SEO Architecture
- **Patron centralizado**: `SEOMeta` component + `seo.js` utility para evitar duplicacion
- **react-helmet-async**: Ya instalado, wrapeado en `HelmetProvider` a nivel App
- **JSON-LD**: Generado dinamicamente per-post con Article schema

### Accessibility Approach
- **Keyboard navigation**: Arrow keys en TypeTabs (WAI-ARIA tabs pattern)
- **Focus visible**: `focus:outline-2 focus:outline-offset-2 focus:outline-accent` uniforme
- **PostCard refactor**: Cambiado de `onClick` + `cursor-pointer` a `<Link>` nativo con `focus-within` ring
- **aria-live**: Zona de resultados del blog anuncia cambios a screen readers

### Code Reuse
- Markdown rendering extraido a `src/shared/lib/markdown.js` (usado por PostContent)
- SEO utilities en `src/shared/lib/seo.js` (reutilizable para futuras paginas)

## Archivos

### Nuevos (4)
| Archivo | Proposito |
|---------|-----------|
| `src/shared/lib/seo.js` | generateMeta(), generateArticleJsonLD() |
| `src/shared/lib/markdown.js` | renderMarkdown() - extraido de PostContent |
| `src/shared/components/SEOMeta.jsx` | Helmet wrapper para meta tags |
| `src/shared/components/ShareButtons.jsx` | LinkedIn, X, Facebook share buttons |

### Modificados (10)
| Archivo | Cambio |
|---------|--------|
| `src/App.jsx` | HelmetProvider wrapper |
| `src/features/blog/services/blogService.js` | meta_title, meta_description, og_image en getBySlug |
| `src/features/blog/pages/PostDetailPage.jsx` | SEOMeta + JSON-LD + ShareButtons + h1 fix |
| `src/features/blog/pages/BlogPage.jsx` | SEOMeta con meta tags estaticos |
| `src/features/blog/components/PostContent.jsx` | Usa shared markdown utility |
| `src/features/blog/components/PostList.jsx` | aria-live, role, aria-label |
| `src/features/blog/components/PostCard.jsx` | Link nativo + focus-within + aria-hidden en SVGs |
| `src/features/blog/components/CategoryFilter.jsx` | Focus outline en botones |
| `src/features/blog/components/TypeTabs.jsx` | Arrow key nav + focus outline |
| `src/features/blog/components/BlogEmptyState.jsx` | aria-hidden en SVG decorativo |

## Verificacion

- Build: `npx vite build` - PASS
- Lint: `npx eslint` - 0 errors
