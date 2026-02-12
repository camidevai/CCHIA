import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCmsPosts } from '../hooks/useCmsPosts';
import { usePublish } from '../hooks/usePublish';
import { cmsAPI } from '../services/cmsService';
import StatusTabs from '../components/StatusTabs';
import PostsTable from '../components/PostsTable';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const CMSDashboard = () => {
  const navigate = useNavigate();
  const { posts, isLoading, error, activeStatus, setActiveStatus, refresh } = useCmsPosts();
  const { publish, unpublish, archive } = usePublish();

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 3000);
  };

  const handlePublish = async (id) => {
    const result = await publish(id);
    if (result) {
      showFeedback('success', 'Contenido publicado');
      refresh();
    } else {
      showFeedback('error', 'Error al publicar');
    }
  };

  const handleUnpublish = async (id) => {
    const result = await unpublish(id);
    if (result) {
      showFeedback('success', 'Contenido despublicado');
      refresh();
    } else {
      showFeedback('error', 'Error al despublicar');
    }
  };

  const handleArchive = async (id) => {
    const result = await archive(id);
    if (result) {
      showFeedback('success', 'Contenido archivado');
      refresh();
    } else {
      showFeedback('error', 'Error al archivar');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await cmsAPI.delete(deleteTarget.id);
      showFeedback('success', 'Contenido eliminado');
      refresh();
    } catch (err) {
      console.error('Error deleting post:', err);
      showFeedback('error', 'Error al eliminar');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg-primary via-light-bg-secondary to-light-bg-tertiary dark:from-dark-bg-primary dark:via-dark-bg-secondary dark:to-dark-bg-tertiary px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                Gestion de Contenido
              </h1>
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="text-sm text-accent hover:underline"
              >
                &larr; Volver al Dashboard
              </button>
            </div>
            <motion.button
              onClick={() => navigate('/admin/cms/editor')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-gradient-to-r from-secondary to-secondary-light text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Nuevo Post
            </motion.button>
          </div>
        </motion.div>

        {/* Feedback Message */}
        {feedback.message && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            role="status"
            aria-live="polite"
            className={`mb-6 px-4 py-3 rounded-lg text-sm ${
              feedback.type === 'success'
                ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                : 'bg-error/10 border border-error/30 text-error'
            }`}
          >
            {feedback.message}
          </motion.div>
        )}

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-light-bg-primary dark:bg-dark-bg-primary rounded-xl p-6 border border-light-border-primary dark:border-dark-border-primary shadow-lg"
        >
          {/* Tabs */}
          <div className="mb-6">
            <StatusTabs
              activeStatus={activeStatus}
              onStatusChange={setActiveStatus}
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-secondary border-t-transparent rounded-full" />
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="text-center py-12">
              <p className="text-error mb-4">{error}</p>
              <button onClick={refresh} className="text-sm text-accent hover:underline">
                Reintentar
              </button>
            </div>
          )}

          {/* Posts Table */}
          {!isLoading && !error && (
            <PostsTable
              posts={posts}
              onEdit={(id) => navigate(`/admin/cms/editor/${id}`)}
              onPublish={handlePublish}
              onUnpublish={handleUnpublish}
              onArchive={handleArchive}
              onDelete={(post) => setDeleteTarget(post)}
            />
          )}
        </motion.div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={!!deleteTarget}
          title={deleteTarget?.title || ''}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
};

export default CMSDashboard;
