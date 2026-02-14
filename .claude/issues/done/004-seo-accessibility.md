---
id: 004
title: Implementar SEO y Accesibilidad
status: done
created: 2026-02-09
closed: 2026-02-12
implemented_in: 4f1d061
labels: [feature, seo, a11y, blog]
blocked_by: [002, 003]
blocks: []
---

# Implementar SEO y Accesibilidad

## User Story

Como visitante y motor de búsqueda,
quiero que el blog tenga meta tags correctos, datos estructurados y sea accesible,
para encontrar y consumir el contenido fácilmente.

## Descripción

Implementar componentes de SEO (meta tags, JSON-LD, Open Graph), botones de compartir en redes sociales, y asegurar cumplimiento WCAG AA+ en todos los componentes del blog.

## Scope

- **Incluye**: SEOMeta component, JSON-LD schemas, Open Graph tags, ShareButtons, auditoría de accesibilidad, ajustes ARIA
- **NO incluye**: Sitemap automático (script separado), analytics, AMP

## Sub-tareas

- [ ] Crear `src/shared/lib/seo.js` con funciones generateMeta() y jsonLD()
- [ ] Crear `src/shared/lib/markdown.js` con parseMarkdown() y sanitize()
- [ ] Crear componente `SEOMeta` con React Helmet para meta tags dinámicos
- [ ] Implementar JSON-LD Article schema en PostDetailPage
- [ ] Implementar Open Graph tags (og:title, og:description, og:image, og:url)
- [ ] Crear componente `ShareButtons` (LinkedIn, Twitter, Facebook)
- [ ] Auditar accesibilidad de PostCard, PostList, CategoryFilter
- [ ] Agregar aria-live en zona de resultados filtrados
- [ ] Verificar contraste 4.5:1 en todos los textos
- [ ] Verificar focus visible en todos los elementos interactivos
- [ ] Agregar alt text a todas las imágenes

## Criterios de Aceptación

- [ ] Cada página del blog tiene <title> único y descriptivo
- [ ] Meta description presente en todas las páginas (150-160 chars)
- [ ] JSON-LD Article schema válido en PostDetailPage (verificar con Google Rich Results Test)
- [ ] Open Graph tags presentes: og:title, og:description, og:image, og:url, og:type
- [ ] Twitter Card tags presentes: twitter:card, twitter:title, twitter:description, twitter:image
- [ ] Canonical URL en cada página
- [ ] ShareButtons funcionan correctamente (abren ventana de compartir)
- [ ] ShareButtons tienen aria-label="Compartir en {Red}"
- [ ] ShareButtons tienen tamaño mínimo 44x44px
- [ ] PostList usa <article> para cada post
- [ ] PostDetailPage tiene un solo H1 (título del post)
- [ ] Zona de resultados tiene aria-live="polite"
- [ ] Contraste de texto cumple 4.5:1 (verificar con axe)
- [ ] Focus visible en todos los botones y links
- [ ] Imágenes tienen alt text descriptivo

## Definition of Done

- [ ] Lighthouse SEO score > 90
- [ ] Lighthouse Accessibility score > 90
- [ ] Sin errores críticos en axe-core
- [ ] JSON-LD válido en Rich Results Test

## Notas de Implementación

- **Archivos objetivo**:
  - `src/shared/lib/seo.js`
  - `src/shared/lib/markdown.js`
  - `src/shared/components/SEOMeta.jsx`
  - `src/shared/components/ShareButtons.jsx`
  - Modificar: `PostDetailPage.jsx`, `BlogPage.jsx`, `PostCard.jsx`
- **Patrones a seguir**: react-helmet-async para meta tags, marked + dompurify para Markdown
- **Consideraciones técnicas**: JSON-LD debe ser dinámico por post, ShareButtons usan URLs de sharing nativas

## Estimación

Complejidad: media
