# Sesion: Build Feature - Issue #003
Fecha: 2026-02-12
Skill: /build-feature

## Resumen
Implementacion de issue #003 - CMS Admin (escritura). Modulo completo para crear, editar y publicar contenido desde el panel de administracion.

## Decisiones tomadas
- **syncCategories delete-then-reinsert**: Mas simple que calcular diff, CASCADE en FK lo hace seguro
- **textarea + preview**: Sin libreria rich text, reutiliza marked/DOMPurify existentes. Menor complejidad, sin dependencias nuevas
- **SEO sections colapsables**: Reduce clutter, prioriza contenido sobre metadata
- **useSlug debounce 300ms**: Balance entre responsividad y carga de red
- **formData.id para create vs update**: Patron simple, el ID se obtiene despues del primer save

## Trade-offs considerados
- **Rich text editor vs Markdown textarea**: Elegimos textarea por zero dependencias nuevas y consistencia con PostContent. Trade-off: experiencia de escritura mas tecnica
- **Collapsible vs always-visible SEO**: Collapsible reduce sobrecarga visual pero requiere clicks extra. Priorizado: simplicidad visual

## ACs verificados
| AC | Estado | Evidencia |
|----|--------|-----------|
| AC1: Dashboard con status tabs | OK | CMSDashboard.jsx:L84 + StatusTabs.jsx |
| AC2: Tabla con titulo, tipo, estado, fecha, acciones | OK | PostsTable.jsx:L69-L130 |
| AC3: "Nuevo Post" navega a editor | OK | CMSDashboard.jsx:L89 |
| AC4: Seleccion de tipo en editor | OK | PostForm.jsx:L16-L37 |
| AC5: Markdown textarea + preview | OK | MarkdownEditor.jsx:L17-L70 |
| AC6: PostForm fields (titulo, slug, excerpt, categorias, imagen) | OK | PostForm.jsx:L39-L148 |
| AC7: SEO fields (meta_title, meta_description, og_image) | OK | SEOFields.jsx |
| AC8: SEO Preview (Google + social) | OK | SEOPreview.jsx |
| AC9: "Guardar borrador" sin publicar | OK | useDraft.js:saveDraft + EditorPage.jsx:handleSave |
| AC10: "Publicar" cambia status + published_at | OK | usePublish.js + cmsService.js:publish |
| AC11: Image upload con Supabase Storage | OK | useUpload.js + ImageUploader.jsx + cmsService.js:uploadImage |
| AC12: Validacion (titulo req, slug unico, body >= 100) | OK | useDraft.js:validate |
| AC13: ProtectedRoute en rutas CMS | OK | App.jsx rutas /admin/cms |
| AC14: Modal confirmacion eliminar | OK | DeleteConfirmModal.jsx + CMSDashboard.jsx |

## Archivos creados (20)
- `src/features/cms/utils/slugify.js` (nuevo)
- `src/features/cms/services/cmsService.js` (nuevo)
- `src/features/cms/hooks/useUpload.js` (nuevo)
- `src/features/cms/hooks/useSlug.js` (nuevo)
- `src/features/cms/hooks/useCmsPosts.js` (nuevo)
- `src/features/cms/hooks/useCmsPost.js` (nuevo)
- `src/features/cms/hooks/usePublish.js` (nuevo)
- `src/features/cms/hooks/useDraft.js` (nuevo)
- `src/features/cms/components/StatusTabs.jsx` (nuevo)
- `src/features/cms/components/ImageUploader.jsx` (nuevo)
- `src/features/cms/components/CategorySelector.jsx` (nuevo)
- `src/features/cms/components/MarkdownEditor.jsx` (nuevo)
- `src/features/cms/components/SEOPreview.jsx` (nuevo)
- `src/features/cms/components/DeleteConfirmModal.jsx` (nuevo)
- `src/features/cms/components/PostForm.jsx` (nuevo)
- `src/features/cms/components/SEOFields.jsx` (nuevo)
- `src/features/cms/components/PostsTable.jsx` (nuevo)
- `src/features/cms/pages/CMSDashboard.jsx` (nuevo)
- `src/features/cms/pages/EditorPage.jsx` (nuevo)
- `src/features/cms/index.js` (nuevo)

## Archivos modificados (2)
- `src/App.jsx` (modificado)
- `src/pages/AdminDashboard.jsx` (modificado)

## Verificacion
- Build: OK (vite build sin errores)
- Lint: OK (0 errores, 0 warnings en archivos CMS)

## Proximo paso sugerido
/qa --issue 003
