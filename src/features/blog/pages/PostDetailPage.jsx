import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePost } from '../hooks/usePost';
import PostContent from '../components/PostContent';

const TYPE_LABELS = {
  article: 'Articulo',
  news: 'Noticia',
  resource: 'Recurso',
};

const PostDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { post, isLoading, error } = usePost(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" aria-live="polite">
        <motion.div
          className="relative w-16 h-16"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute inset-0 border-4 border-accent/30 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-accent rounded-full" />
        </motion.div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4">
        <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
          Post no encontrado
        </h2>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
          El articulo que buscas no existe o fue removido.
        </p>
        <button
          onClick={() => navigate('/blog')}
          className="px-6 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-colors"
        >
          Volver al Blog
        </button>
      </div>
    );
  }

  const formattedDate = new Date(post.published_at).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="min-h-screen">
      {/* Hero with featured image */}
      <div className="relative h-64 md:h-96 overflow-hidden bg-light-bg-secondary dark:bg-dark-bg-secondary">
        {post.featured_image ? (
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/20 to-primary/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-light-bg-primary dark:from-dark-bg-primary via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Type badge */}
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-accent text-white mb-4">
            {TYPE_LABELS[post.type] || 'Articulo'}
          </span>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
            <time dateTime={post.published_at}>{formattedDate}</time>

            {post.categories?.length > 0 && (
              <div className="flex gap-2">
                {post.categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="px-3 py-0.5 rounded-full bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text-secondary dark:text-dark-text-secondary"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Markdown body */}
          <PostContent content={post.body} />

          {/* Download button for resources */}
          {post.type === 'resource' && post.file_url && (
            <div className="mt-10 p-6 rounded-2xl border-2 border-accent/30 bg-accent/5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent/10">
                  <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                    {post.file_name || 'Descargar recurso'}
                  </p>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Archivo disponible para descarga
                  </p>
                </div>
                <a
                  href={post.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-colors"
                >
                  Descargar
                </a>
              </div>
            </div>
          )}

          {/* Back link */}
          <div className="mt-12 mb-20">
            <button
              onClick={() => navigate('/blog')}
              className="inline-flex items-center gap-2 text-accent hover:text-accent-hover font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al Blog
            </button>
          </div>
        </motion.div>
      </div>
    </article>
  );
};

export default PostDetailPage;
