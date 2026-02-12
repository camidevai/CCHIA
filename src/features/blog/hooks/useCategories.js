import { useState, useEffect } from 'react';
import { blogAPI } from '../services/blogService';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await blogAPI.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error loading categories:', err);
        setError(err.message);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  return { categories, isLoading, error };
};
