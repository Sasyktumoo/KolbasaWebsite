/**
 * Cloudflare R2 storage configuration
 */
export const R2_PUBLIC_URL = 'https://pub-895eb9a5de3e472cbcc807ee92cf66a5.r2.dev';

/**
 * Resolves an image URL to ensure it works with Cloudflare R2
 * - If it's a full URL (https://), it's returned as is
 * - If it's a path, it's converted to a full R2 URL
 * - If it's undefined/null, it returns undefined
 */
export const resolveImage = (uri?: string): string | undefined => {
  if (!uri) {
    return undefined;
  }
  
  // If it's already a full URL, return as is
  if (/^https?:\/\//i.test(uri)) {
    return uri;
  }
  
  // Extract just the filename if it's a path
  const filename = uri.split('/').pop();
  return `${R2_PUBLIC_URL}/${filename}`;
};