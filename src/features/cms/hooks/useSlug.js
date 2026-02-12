import { useState, useEffect, useRef } from 'react';
import { slugify } from '../utils/slugify';
import { cmsAPI } from '../services/cmsService';

export const useSlug = (title, excludeId) => {
  const [slug, setSlug] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [manualOverride, setManualOverride] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (manualOverride) return;
    const generated = slugify(title);
    setSlug(generated);
  }, [title, manualOverride]);

  useEffect(() => {
    if (!slug) {
      setIsAvailable(null);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setIsChecking(true);
        const available = await cmsAPI.isSlugAvailable(slug, excludeId);
        setIsAvailable(available);
      } catch (err) {
        console.error('Error checking slug:', err);
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [slug, excludeId]);

  const setManualSlug = (value) => {
    setManualOverride(true);
    setSlug(slugify(value));
  };

  return { slug, isChecking, isAvailable, setManualSlug };
};
