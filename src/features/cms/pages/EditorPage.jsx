import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { useCmsPost } from '../hooks/useCmsPost';
import { useDraft } from '../hooks/useDraft';
import { useSlug } from '../hooks/useSlug';
import { usePublish } from '../hooks/usePublish';
import PostForm from '../components/PostForm';
import MarkdownEditor from '../components/MarkdownEditor';
import SEOFields from '../components/SEOFields';
import SEOPreview from '../components/SEOPreview';

const EditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { post, isLoading: isLoadingPost } = useCmsPost(id);
  const { formData, errors, isSaving, setField, validate, saveDraft, loadPost } = useDraft();
  const { slug, isChecking, isAvailable, setManualSlug } = useSlug(formData.title, formData.id);
  const { publish, isPublishing } = usePublish();

  const [showSEO, setShowSEO] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    if (post) {
      loadPost(post);
    }
  }, [post, loadPost]);

  const showMessage = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
  };

  const handleSave = async () => {
    if (!validate(slug, isAvailable)) return;

    try {
      const savedPost = await saveDraft(user?.id, slug);
      showMessage('success', 'Borrador guardado');

      if (!id && savedPost?.id) {
        navigate(`/admin/cms/editor/${savedPost.id}`, { replace: true });
      }
    } catch (err) {
      showMessage('error', `Error al guardar: ${err.message}`);
    }
  };

  const handlePublish = async () => {
    if (!validate(slug, isAvailable)) return;

    try {
      const savedPost = await saveDraft(user?.id, slug);
      if (!savedPost) return;

      const published = await publish(savedPost.id);
      if (published) {
        showMessage('success', 'Contenido publicado');
        if (!id) {
          navigate(`/admin/cms/editor/${savedPost.id}`, { replace: true });
        }
      } else {
        showMessage('error', 'Error al publicar');
      }
    } catch (err) {
      showMessage('error', `Error: ${err.message}`);
    }
  };

  if (isLoadingPost && id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-light-bg-primary via-light-bg-secondary to-light-bg-tertiary dark:from-dark-bg-primary dark:via-dark-bg-secondary dark:to-dark-bg-tertiary flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-2 border-secondary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg-primary via-light-bg-secondary to-light-bg-tertiary dark:from-dark-bg-primary dark:via-dark-bg-secondary dark:to-dark-bg-tertiary">
      {/* Sticky Header Bar */}
      <div className="sticky top-0 z-40 bg-light-bg-primary/95 dark:bg-dark-bg-primary/95 backdrop-blur-sm border-b border-light-border-primary dark:border-dark-border-primary">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/admin/cms')}
              className="text-light-text-secondary dark:text-dark-text-secondary hover:text-accent transition-colors flex-shrink-0"
              aria-label="Volver a gestion de contenido"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary truncate">
              {id ? 'Editar contenido' : 'Nuevo contenido'}
            </h1>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <motion.button
              onClick={handleSave}
              disabled={isSaving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary rounded-lg font-semibold text-sm text-light-text-primary dark:text-dark-text-primary hover:border-secondary transition-all duration-300 disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : 'Guardar borrador'}
            </motion.button>
            <motion.button
              onClick={handlePublish}
              disabled={isSaving || isPublishing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-gradient-to-r from-secondary to-secondary-light text-white rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {isPublishing ? 'Publicando...' : 'Publicar'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Feedback Message */}
        {feedback.message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            role="status"
            aria-live="polite"
            className={`px-4 py-3 rounded-lg text-sm ${
              feedback.type === 'success'
                ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                : 'bg-error/10 border border-error/30 text-error'
            }`}
          >
            {feedback.message}
          </motion.div>
        )}

        {/* Post Form */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-light-bg-primary dark:bg-dark-bg-primary rounded-xl p-6 border border-light-border-primary dark:border-dark-border-primary shadow-lg"
        >
          <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-6">
            Informacion del post
          </h2>
          <PostForm
            formData={formData}
            errors={errors}
            slug={slug}
            isChecking={isChecking}
            isAvailable={isAvailable}
            onFieldChange={setField}
            onSlugChange={setManualSlug}
          />
        </motion.section>

        {/* Markdown Editor */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-light-bg-primary dark:bg-dark-bg-primary rounded-xl p-6 border border-light-border-primary dark:border-dark-border-primary shadow-lg"
        >
          <MarkdownEditor
            value={formData.body}
            onChange={(val) => setField('body', val)}
            error={errors.body}
          />
        </motion.section>

        {/* SEO Fields (Collapsible) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-light-bg-primary dark:bg-dark-bg-primary rounded-xl border border-light-border-primary dark:border-dark-border-primary shadow-lg overflow-hidden"
        >
          <button
            type="button"
            onClick={() => setShowSEO(!showSEO)}
            className="w-full flex items-center justify-between p-6 text-left"
            aria-expanded={showSEO}
          >
            <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
              SEO
            </h2>
            <svg
              className={`w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary transition-transform duration-200 ${showSEO ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showSEO && (
            <div className="px-6 pb-6">
              <SEOFields
                formData={formData}
                onFieldChange={setField}
              />
            </div>
          )}
        </motion.section>

        {/* SEO Preview (Collapsible) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-light-bg-primary dark:bg-dark-bg-primary rounded-xl border border-light-border-primary dark:border-dark-border-primary shadow-lg overflow-hidden"
        >
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="w-full flex items-center justify-between p-6 text-left"
            aria-expanded={showPreview}
          >
            <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
              Vista previa SEO
            </h2>
            <svg
              className={`w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary transition-transform duration-200 ${showPreview ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showPreview && (
            <div className="px-6 pb-6">
              <SEOPreview
                title={formData.meta_title || formData.title}
                slug={slug}
                description={formData.meta_description || formData.excerpt}
                ogImage={formData.og_image || formData.featured_image}
              />
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default EditorPage;
