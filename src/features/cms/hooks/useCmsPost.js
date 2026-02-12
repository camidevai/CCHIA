import { useState, useEffect } from 'react';
import { cmsAPI } from '../services/cmsService';

export const useCmsPost = (id) => {
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setPost(null);
      return;
    }

    const loadPost = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await cmsAPI.getById(id);
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
  }, [id]);

  return { post, isLoading, error };
};
