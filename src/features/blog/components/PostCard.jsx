/* eslint-disable react/prop-types */
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const TYPE_LABELS = {
  article: 'Articulo',
  news: 'Noticia',
  resource: 'Recurso',
};

const TYPE_COLORS = {
  article: 'bg-accent text-white',
  news: 'bg-info text-white',
  resource: 'bg-success text-white',
};

const PostCard = ({ post }) => {
  const formattedDate = new Date(post.published_at).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const excerpt = post.excerpt
    ? post.excerpt.length > 150
      ? post.excerpt.slice(0, 150) + '...'
      : post.excerpt
    : '';

  return (
    <motion.article
      whileHover={{ y: -5 }}
      className="group rounded-2xl overflow-hidden border-2 border-light-border-primary dark:border-dark-border-primary bg-light-bg-primary dark:bg-dark-bg-primary shadow-md hover:shadow-xl hover:border-accent transition-all duration-300 focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2"
    >
      <Link to={`/blog/${post.slug}`} className="block no-underline text-inherit">
        {/* Featured Image */}
        <div className="relative h-48 overflow-hidden bg-light-bg-secondary dark:bg-dark-bg-secondary">
          {post.featured_image ? (
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg aria-hidden="true" className="w-16 h-16 text-light-text-tertiary dark:text-dark-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          )}

          {/* Type Badge */}
          <span className={`absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full ${TYPE_COLORS[post.type] || TYPE_COLORS.article}`}>
            {TYPE_LABELS[post.type] || 'Articulo'}
          </span>

          {/* Download indicator for resources */}
          {post.type === 'resource' && post.file_url && (
            <span className="absolute top-3 right-3 p-2 rounded-full bg-dark-bg-primary/70 text-white">
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary group-hover:text-accent transition-colors duration-300 mb-2 line-clamp-2">
            {post.title}
          </h3>

          {excerpt && (
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4 line-clamp-3">
              {excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between">
            <time
              dateTime={post.published_at}
              className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary"
            >
              {formattedDate}
            </time>

            {/* Category chips */}
            {post.categories?.length > 0 && (
              <div className="flex gap-1.5 flex-wrap justify-end">
                {post.categories.slice(0, 2).map((cat) => (
                  <span
                    key={cat.id}
                    className="text-xs px-2 py-0.5 rounded-full bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text-secondary dark:text-dark-text-secondary"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default PostCard;
