import { supabase } from '../../../config/supabase';

const flattenCategories = (post) => ({
  ...post,
  categories: post.content_categories?.map((cc) => cc.categories).filter(Boolean) || [],
  content_categories: undefined,
});

export const blogAPI = {
  async getAll({ type } = {}) {
    let query = supabase
      .from('content')
      .select(`
        id, slug, title, excerpt, type, status, featured,
        featured_image, file_url, file_name, published_at, author_id,
        content_categories ( categories ( id, slug, name ) )
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(flattenCategories);
  },

  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('content')
      .select(`
        id, slug, title, excerpt, body, type, status, featured,
        featured_image, file_url, file_name, published_at, author_id,
        content_categories ( categories ( id, slug, name ) )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) throw error;
    return flattenCategories(data);
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('id, slug, name')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },
};
