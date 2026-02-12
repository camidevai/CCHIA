import { useState, useEffect } from 'react';
import { blogAPI } from '../services/blogService';

export const usePost = (slug) => {
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    const loadPost = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await blogAPI.getBySlug(slug);
        setPost(data);
      } catch (err) {
        console.error('Error loading post:', err);
        setError(err.message);
        setPost(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  return { post, isLoading, error };
};
