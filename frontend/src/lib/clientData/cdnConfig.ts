export const CDN_CONFIG = {
  cloudflare: {
    enabled: true,
    accountId: 'e3c49e7a75ec48f1bbeef71b90ca0b40',
    imageDeliveryUrl: 'https://imagedelivery.net/e3c49e7a75ec48f1bbeef71b90ca0b40',
    variants: {
      thumbnail: 'thumbnail',
      small: 'small',
      medium: 'medium',
      large: 'large',
      xlarge: 'xlarge',
      public: 'public'
    }
  },
  fallback: {
    enabled: true,
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  }
};

export function getImageCdnUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return '/images/placeholder.jpg';
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  
  if (CDN_CONFIG.cloudflare.enabled) {
    const cloudflareIdMatch = cleanPath.match(/cloudflare[_-]?id[_-]?([a-zA-Z0-9-]+)/i);
    if (cloudflareIdMatch) {
      const cloudflareId = cloudflareIdMatch[1];
      return `${CDN_CONFIG.cloudflare.imageDeliveryUrl}/${cloudflareId}/public`;
    }
  }

  return `${CDN_CONFIG.fallback.baseUrl}/${cleanPath}`;
}

export function getOptimizedImageUrl(
  imagePath: string | null | undefined,
  width?: number,
  quality: number = 85
): string {
  if (!imagePath) return '/images/placeholder.jpg';
  
  const baseUrl = getImageCdnUrl(imagePath);
  
  if (!baseUrl.includes('imagedelivery.net')) {
    return baseUrl;
  }

  let variant = 'public';
  if (width) {
    if (width <= 200) variant = 'thumbnail';
    else if (width <= 400) variant = 'small';
    else if (width <= 800) variant = 'medium';
    else if (width <= 1200) variant = 'large';
    else variant = 'xlarge';
  }

  const parts = baseUrl.split('/');
  parts[parts.length - 1] = variant;
  
  return parts.join('/');
}