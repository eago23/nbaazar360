/**
 * Albanian character mapping for transliteration
 */
const albanianChars = {
  'ë': 'e',
  'Ë': 'E',
  'ç': 'c',
  'Ç': 'C'
};

/**
 * Convert string to URL-friendly slug
 * @param {string} text - Text to convert
 * @returns {string} URL-friendly slug
 */
const slugify = (text) => {
  if (!text) return '';

  let slug = text.toString().toLowerCase();

  // Replace Albanian characters
  Object.keys(albanianChars).forEach((char) => {
    slug = slug.replace(new RegExp(char, 'g'), albanianChars[char]);
  });

  // Replace accented characters with non-accented equivalents
  slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Replace spaces and underscores with hyphens
  slug = slug.replace(/[\s_]+/g, '-');

  // Remove all non-word characters except hyphens
  slug = slug.replace(/[^\w-]+/g, '');

  // Replace multiple hyphens with single hyphen
  slug = slug.replace(/--+/g, '-');

  // Remove leading/trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '');

  return slug;
};

/**
 * Generate unique slug by appending number if needed
 * @param {string} text - Text to convert
 * @param {Function} checkExists - Async function to check if slug exists
 * @returns {string} Unique slug
 */
const generateUniqueSlug = async (text, checkExists) => {
  let baseSlug = slugify(text);
  let slug = baseSlug;
  let counter = 1;

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;

    // Safety limit
    if (counter > 100) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }

  return slug;
};

module.exports = {
  slugify,
  generateUniqueSlug
};
