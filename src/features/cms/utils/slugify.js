/**
 * Convert a title string to a URL-safe slug.
 * Removes accents, lowercases, replaces non-alphanumeric with dashes.
 */
export const slugify = (text) => {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
