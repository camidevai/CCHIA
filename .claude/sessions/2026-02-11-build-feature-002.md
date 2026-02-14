# Session: Build Feature #002 - Blog Publico (Lectura)

**Fecha**: 2026-02-11
**Skill**: /build-feature --issue 002
**Branch**: feature/blog-public-read (desde develop)
**Estado**: Completado

## Resumen

Implementacion completa del modulo de blog publico (lectura) para CCHIA. Visitantes pueden listar posts publicados, filtrar por tipo (articulo/noticia/recurso) y categoria, y leer contenido Markdown renderizado.

## Acciones Realizadas

1. **Setup**: Creado branch `feature/blog-public-read` desde `develop`
2. **Dependencias**: Instalado `@tailwindcss/typography` y configurado en `tailwind.config.js`
3. **Service Layer**: `blogAPI` con queries read-only a tabla `content` con join de categorias
4. **Hooks**: `usePosts` (filtros type/category), `usePost` (slug), `useCategories`
5. **Componentes leaf**: PostContent (Markdown), BlogEmptyState, PostCard
6. **Componentes container**: PostList (grid + skeleton), TypeTabs (ARIA tablist), CategoryFilter (ARIA pressed)
7. **Paginas**: BlogPage (`/blog`) y PostDetailPage (`/blog/:slug`) con lazy loading
8. **Navegacion**: BlogIcon en Navbar, handleNavClick actualizado en Navbar y Footer para soportar rutas y hash
9. **Datos**: navigation.json y footer.json actualizados (es + en)
10. **Rutas**: App.jsx con lazy imports y rutas envueltas en MainLayout
11. **Issue**: Movido de backlog/ a in-progress/

## Decisiones

| Decision | Alternativas | Justificacion |
|----------|-------------|---------------|
| Hooks sin Context | Context global vs hooks locales | Blog no necesita estado compartido |
| Type filter server-side | Todo client-side | Reduce datos transferidos |
| Category filter client-side | Doble query al server | Categorias ya vienen del join |
| Tabla `content` | Renombrar a `posts` | Respetar schema existente de issue #001 |

## Trade-offs

- PostDetailPage incluye `marked` y `DOMPurify` en su chunk (~75KB gzip 23KB), aceptable con lazy loading
- Skeleton loading en PostList vs spinner global: mejor UX percibida

## Archivos Modificados

- 13 archivos nuevos en `src/features/blog/`
- 8 archivos modificados (Navbar, Footer, App, navigation, footer, tailwind)
- 1 archivo movido (issue 002 backlog -> in-progress)

## Verificacion

- `vite build`: OK, sin errores
- Chunks generados: BlogPage-CtsmDm-i.js, PostDetailPage-BfYNemnp.js, blogService-aTk2oy2B.js

## Proximo Paso

Ejecutar `/qa --issue 002` para validar ACs con datos de prueba en Supabase.
