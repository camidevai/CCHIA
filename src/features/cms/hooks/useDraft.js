import { useState, useCallback } from 'react';
import { cmsAPI } from '../services/cmsService';

const INITIAL_FORM = {
  type: 'article',
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  featured_image: '',
  file_url: '',
  file_name: '',
  meta_title: '',
  meta_description: '',
  og_image: '',
  categoryIds: [],
};

export const useDraft = () => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const setField = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const setMultipleFields = useCallback((fields) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  }, []);

  const validate = useCallback((slug, isSlugAvailable) => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El titulo es requerido';
    }

    if (!slug) {
      newErrors.slug = 'El slug es requerido';
    } else if (isSlugAvailable === false) {
      newErrors.slug = 'Este slug ya esta en uso';
    }

    if (!formData.body || formData.body.length < 100) {
      newErrors.body = 'El contenido debe tener al menos 100 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.title, formData.body]);

  const saveDraft = useCallback(async (authorId, slug) => {
    try {
      setIsSaving(true);

      const postPayload = {
        type: formData.type,
        title: formData.title.trim(),
        slug,
        excerpt: formData.excerpt.trim() || null,
        body: formData.body,
        featured_image: formData.featured_image || null,
        file_url: formData.type === 'resource' ? (formData.file_url || null) : null,
        file_name: formData.type === 'resource' ? (formData.file_name || null) : null,
        meta_title: formData.meta_title.trim() || null,
        meta_description: formData.meta_description.trim() || null,
        og_image: formData.og_image || null,
        author_id: authorId,
      };

      let savedPost;
      if (formData.id) {
        savedPost = await cmsAPI.update(formData.id, postPayload);
      } else {
        postPayload.status = 'draft';
        savedPost = await cmsAPI.create(postPayload);
      }

      await cmsAPI.syncCategories(savedPost.id, formData.categoryIds);

      return savedPost;
    } catch (err) {
      console.error('Error saving draft:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [formData]);

  const loadPost = useCallback((post) => {
    if (!post) {
      setFormData(INITIAL_FORM);
      return;
    }

    setFormData({
      id: post.id,
      type: post.type || 'article',
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      body: post.body || '',
      featured_image: post.featured_image || '',
      file_url: post.file_url || '',
      file_name: post.file_name || '',
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || '',
      og_image: post.og_image || '',
      categoryIds: post.categories?.map((c) => c.id) || [],
    });
  }, []);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM);
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    isSaving,
    setField,
    setMultipleFields,
    validate,
    saveDraft,
    loadPost,
    resetForm,
  };
};
