/* eslint-disable react/prop-types */
import { motion } from 'framer-motion';

const TYPE_LABELS = {
  article: 'articulos',
  news: 'noticias',
  resource: 'recursos',
};

const BlogEmptyState = ({ type }) => {
  const label = type ? TYPE_LABELS[type] || 'publicaciones' : 'publicaciones';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 mb-6 rounded-full bg-light-bg-secondary dark:bg-dark-bg-secondary flex items-center justify-center">
        <svg
          className="w-10 h-10 text-light-text-tertiary dark:text-dark-text-tertiary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
        No hay {label} disponibles
      </h3>
      <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-md">
        Pronto publicaremos contenido nuevo. Vuelve a visitarnos.
      </p>
    </motion.div>
  );
};

export default BlogEmptyState;
