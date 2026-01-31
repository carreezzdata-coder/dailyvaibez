import { getImageCdnUrl, getOptimizedImageUrl } from './cdnConfig';

export function getImageUrl(url: string | null | undefined): string {
  if (!url) return '/images/placeholder.jpg';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const isDevelopment = typeof window !== 'undefined' 
    ? window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    : process.env.NODE_ENV === 'development';
  const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
  if (isDevelopment) return `http://localhost:5000/${cleanUrl}`;
  return getImageCdnUrl(url);
}

export function getOptimizedImage(url: string | null | undefined, width?: number, quality?: number): string {
  return getOptimizedImageUrl(url, width, quality);
}