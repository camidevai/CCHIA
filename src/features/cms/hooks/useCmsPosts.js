import { useState, useEffect, useCallback } from 'react';
import { cmsAPI } from '../services/cmsService';

export const useCmsPosts = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatus, setActiveStatus] = useState('draft');
  const [activeType, setActiveType] = useState(null);

  const loadPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await cmsAPI.getAll({ status: activeStatus, type: activeType });
      setPosts(data);
    } catch (err) {
      console.error('Error loading CMS posts:', err);
      setError(err.message);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeStatus, activeType]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return {
    posts,
    isLoading,
    error,
    activeStatus,
    setActiveStatus,
    activeType,
    setActiveType,
    refresh: loadPosts,
  };
};
