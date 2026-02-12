import { useState, useEffect, useCallback } from 'react';
import { blogAPI } from '../services/blogService';

export const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeType, setActiveType] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  const loadPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await blogAPI.getAll({ type: activeType });
      setPosts(data);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError(err.message);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeType]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const filteredPosts = activeCategory
    ? posts.filter((post) =>
        post.categories.some((cat) => cat.slug === activeCategory)
      )
    : posts;

  return {
    posts: filteredPosts,
    isLoading,
    error,
    activeType,
    setActiveType,
    activeCategory,
    setActiveCategory,
  };
};
