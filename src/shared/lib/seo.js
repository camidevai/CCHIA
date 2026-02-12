const SITE_URL = 'https://cchia.cl';

export const generateMeta = (post) => {
  const title = post.meta_title || post.title;
  const description = (post.meta_description || post.excerpt || '').slice(0, 160);
  const canonical = `${SITE_URL}/blog/${post.slug}`;
  const ogImage = post.og_image || post.featured_image || null;

  return {
    title,
    description,
    canonical,
    ogTitle: title,
    ogDescription: description,
    ogImage,
    ogUrl: canonical,
    ogType: 'article',
    twitterCard: 'summary_large_image',
  };
};

export const generateArticleJsonLD = (post) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.title,
  description: post.meta_description || post.excerpt || '',
  image: post.featured_image || undefined,
  datePublished: post.published_at,
  author: {
    '@type': 'Organization',
    name: 'CCHIA',
  },
  publisher: {
    '@type': 'Organization',
    name: 'CCHIA',
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/imagenes/logoCchia2.png`,
    },
  },
  url: `${SITE_URL}/blog/${post.slug}`,
});
