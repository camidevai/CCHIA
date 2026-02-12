/* eslint-disable react/prop-types */
import { motion } from 'framer-motion';

const TYPE_LABELS = {
  article: 'Articulo',
  news: 'Noticia',
  resource: 'Recurso',
};

const STATUS_STYLES = {
  draft: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
  published: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30',
  archived: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/30',
};

const STATUS_LABELS = {
  draft: 'Borrador',
  published: 'Publicado',
  archived: 'Archivado',
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const PostsTable = ({ posts, onEdit, onPublish, onUnpublish, onArchive, onDelete }) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-light-text-tertiary dark:text-dark-text-tertiary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-light-text-tertiary dark:text-dark-text-tertiary">
          No hay contenido en esta categoria
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-light-border-primary dark:border-dark-border-primary">
              <th className="text-left py-3 px-4 text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">Titulo</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">Tipo</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">Estado</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">Fecha</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">Acciones</th>
            </tr>
          </thead>
          <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
            {posts.map((post) => (
              <motion.tr
                key={post.id}
                variants={itemVariants}
                className="border-b border-light-border-primary/50 dark:border-dark-border-primary/50 hover:bg-light-bg-secondary/50 dark:hover:bg-dark-bg-secondary/50 transition-colors"
              >
                <td className="py-3 px-4">
                  <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary truncate max-w-xs">
                    {post.title}
                  </p>
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    {TYPE_LABELS[post.type] || post.type}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full border ${STATUS_STYLES[post.status]}`}>
                    {STATUS_LABELS[post.status] || post.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                    {formatDate(post.published_at || post.updated_at)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => onEdit(post.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/10 rounded-lg transition-colors"
                      aria-label={`Editar ${post.title}`}
                    >
                      Editar
                    </button>
                    {post.status === 'draft' && (
                      <button
                        onClick={() => onPublish(post.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-green-600 dark:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                        aria-label={`Publicar ${post.title}`}
                      >
                        Publicar
                      </button>
                    )}
                    {post.status === 'published' && (
                      <button
                        onClick={() => onUnpublish(post.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                        aria-label={`Despublicar ${post.title}`}
                      >
                        Despublicar
                      </button>
                    )}
                    {post.status !== 'archived' && (
                      <button
                        onClick={() => onArchive(post.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-500/10 rounded-lg transition-colors"
                        aria-label={`Archivar ${post.title}`}
                      >
                        Archivar
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(post)}
                      className="px-3 py-1.5 text-xs font-semibold text-error hover:bg-error/10 rounded-lg transition-colors"
                      aria-label={`Eliminar ${post.title}`}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <motion.div
        className="md:hidden space-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {posts.map((post) => (
          <motion.div
            key={post.id}
            variants={itemVariants}
            className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg p-4 border border-light-border-primary dark:border-dark-border-primary"
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary flex-1 mr-2">
                {post.title}
              </p>
              <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full border flex-shrink-0 ${STATUS_STYLES[post.status]}`}>
                {STATUS_LABELS[post.status]}
              </span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                {TYPE_LABELS[post.type]}
              </span>
              <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                {formatDate(post.published_at || post.updated_at)}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => onEdit(post.id)}
                className="px-3 py-1.5 text-xs font-semibold text-accent bg-accent/10 rounded-lg"
                aria-label={`Editar ${post.title}`}
              >
                Editar
              </button>
              {post.status === 'draft' && (
                <button
                  onClick={() => onPublish(post.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-500/10 rounded-lg"
                  aria-label={`Publicar ${post.title}`}
                >
                  Publicar
                </button>
              )}
              {post.status === 'published' && (
                <button
                  onClick={() => onUnpublish(post.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 rounded-lg"
                  aria-label={`Despublicar ${post.title}`}
                >
                  Despublicar
                </button>
              )}
              <button
                onClick={() => onDelete(post)}
                className="px-3 py-1.5 text-xs font-semibold text-error bg-error/10 rounded-lg"
                aria-label={`Eliminar ${post.title}`}
              >
                Eliminar
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
};

export default PostsTable;
