import { supabase } from '../../../config/supabase';

const flattenCategories = (post) => ({
  ...post,
  categories: post.content_categories?.map((cc) => cc.categories).filter(Boolean) || [],
  content_categories: undefined,
});

export const cmsAPI = {
  async getAll({ status, type } = {}) {
    let query = supabase
      .from('content')
      .select(`
        id, slug, title, excerpt, type, status, featured,
        featured_image, file_url, file_name, published_at, updated_at, author_id,
        content_categories ( categories ( id, slug, name ) )
      `)
      .order('updated_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(flattenCategories);
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('content')
      .select(`
        id, slug, title, excerpt, body, type, status, featured,
        featured_image, file_url, file_name, meta_title, meta_description,
        og_image, published_at, updated_at, author_id,
        content_categories ( categories ( id, slug, name ) )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return flattenCategories(data);
  },

  async create(postData) {
    const { data, error } = await supabase
      .from('content')
      .insert(postData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, postData) {
    const { data, error } = await supabase
      .from('content')
      .update(postData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async publish(id) {
    const { data, error } = await supabase
      .from('content')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async unpublish(id) {
    const { data, error } = await supabase
      .from('content')
      .update({ status: 'draft', published_at: null })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async archive(id) {
    const { data, error } = await supabase
      .from('content')
      .update({ status: 'archived' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async isSlugAvailable(slug, excludeId) {
    let query = supabase
      .from('content')
      .select('id')
      .eq('slug', slug);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).length === 0;
  },

  async syncCategories(contentId, categoryIds) {
    const { error: deleteError } = await supabase
      .from('content_categories')
      .delete()
      .eq('content_id', contentId);

    if (deleteError) throw deleteError;

    if (categoryIds.length === 0) return;

    const rows = categoryIds.map((categoryId) => ({
      content_id: contentId,
      category_id: categoryId,
    }));

    const { error: insertError } = await supabase
      .from('content_categories')
      .insert(rows);

    if (insertError) throw insertError;
  },

  async uploadImage(file) {
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `posts/${Date.now()}-${sanitizedName}`;

    const { error } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath);

    return { url: data.publicUrl, path: filePath };
  },

  async deleteImage(filePath) {
    const { error } = await supabase.storage
      .from('blog-images')
      .remove([filePath]);

    if (error) throw error;
  },
};
