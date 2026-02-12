/* eslint-disable react/prop-types */
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from './PostCard';
import BlogEmptyState from './BlogEmptyState';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const PostList = ({ posts, isLoading, activeType }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" aria-live="polite">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden border-2 border-light-border-primary dark:border-dark-border-primary animate-pulse"
          >
            <div className="h-48 bg-light-bg-secondary dark:bg-dark-bg-secondary" />
            <div className="p-5 space-y-3">
              <div className="h-5 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded w-3/4" />
              <div className="h-4 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded w-full" />
              <div className="h-4 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return <BlogEmptyState type={activeType} />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${activeType}-list`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {posts.map((post) => (
          <motion.div key={post.id} variants={itemVariants}>
            <PostCard post={post} />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export default PostList;
