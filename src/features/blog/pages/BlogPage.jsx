import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePosts } from '../hooks/usePosts';
import { useCategories } from '../hooks/useCategories';
import TypeTabs from '../components/TypeTabs';
import CategoryFilter from '../components/CategoryFilter';
import PostList from '../components/PostList';

const BlogPage = () => {
  const {
    posts,
    isLoading,
    activeType,
    setActiveType,
    activeCategory,
    setActiveCategory,
  } = usePosts();

  const { categories } = useCategories();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
            Blog
          </h1>
          <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto">
            Articulos, noticias y recursos sobre Inteligencia Artificial en Chile
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-4 mb-10"
        >
          <TypeTabs activeType={activeType} onTypeChange={setActiveType} />
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </motion.div>

        {/* Post List */}
        <PostList posts={posts} isLoading={isLoading} activeType={activeType} />
      </div>
    </section>
  );
};

export default BlogPage;
