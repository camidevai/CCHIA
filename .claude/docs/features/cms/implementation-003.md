# Implementacion: CMS Admin (escritura)

## Issue
#003: Implementar CMS Admin (escritura)

## Decisiones tecnicas
- **syncCategories delete-then-reinsert**: Mas simple que diff, seguro con CASCADE en content_categories
- **Supabase Storage para imagenes**: Bucket `blog-images`, path `posts/{timestamp}-{filename}`, retorna URL publica
- **Markdown textarea + preview**: Sin libreria de rich text, reutiliza `marked` + `DOMPurify` ya instalados
- **Campos resource condicionales**: file_url y file_name solo visibles cuando type === 'resource'
- **SEO sections colapsables**: Reduce clutter visual, permite focus en contenido principal
- **useSlug con debounce 300ms**: Evita consultas excesivas a Supabase durante escritura
- **formData.id para distinguir create/update**: Si existe id, update; si no, create + navigate a nueva URL

## Archivos creados (20)
| Archivo | Cambio |
|---------|--------|
| `src/features/cms/utils/slugify.js` | Utilidad para generar slugs URL-safe |
| `src/features/cms/services/cmsService.js` | Servicio CRUD completo con Supabase |
| `src/features/cms/hooks/useUpload.js` | Upload de imagenes con validacion |
| `src/features/cms/hooks/useSlug.js` | Auto-generacion de slug con verificacion |
| `src/features/cms/hooks/useCmsPosts.js` | Lista de posts para admin |
| `src/features/cms/hooks/useCmsPost.js` | Post individual por ID |
| `src/features/cms/hooks/usePublish.js` | Publicar/despublicar/archivar |
| `src/features/cms/hooks/useDraft.js` | Estado de formulario y guardado |
| `src/features/cms/components/StatusTabs.jsx` | Tabs ARIA: Borradores/Publicados/Archivados |
| `src/features/cms/components/ImageUploader.jsx` | Subida de imagenes con preview |
| `src/features/cms/components/CategorySelector.jsx` | Multi-select de categorias |
| `src/features/cms/components/MarkdownEditor.jsx` | Editor lado a lado con preview |
| `src/features/cms/components/SEOPreview.jsx` | Preview Google SERP + social card |
| `src/features/cms/components/DeleteConfirmModal.jsx` | Modal de confirmacion |
| `src/features/cms/components/PostForm.jsx` | Formulario de metadata del post |
| `src/features/cms/components/SEOFields.jsx` | Campos SEO con contadores |
| `src/features/cms/components/PostsTable.jsx` | Tabla responsive + cards mobile |
| `src/features/cms/pages/CMSDashboard.jsx` | Dashboard CMS con tabs y acciones |
| `src/features/cms/pages/EditorPage.jsx` | Editor completo con sticky header |
| `src/features/cms/index.js` | Barrel exports |

## Archivos modificados (2)
| Archivo | Cambio |
|---------|--------|
| `src/App.jsx` | 2 rutas lazy protegidas: `/admin/cms`, `/admin/cms/editor/:id?` |
| `src/pages/AdminDashboard.jsx` | Boton "Gestionar Blog" en acciones rapidas |

## Patrones reutilizados
- **Service object**: Mismo patron que `blogService.js` con `flattenCategories`
- **Hook state**: Triple `[data, isLoading, error]` de `usePosts.js`
- **ARIA tabs**: De `TypeTabs.jsx` con `layoutId` animation
- **Markdown render**: De `PostContent.jsx` con `marked` + `DOMPurify` + prose
- **Modal**: De `AdminDashboard.jsx` con `AnimatePresence` + backdrop
- **Form inputs**: Clases Tailwind de `EventsManagement.jsx`
- **Lazy routes**: Patron de `App.jsx` con `ProtectedRoute`
