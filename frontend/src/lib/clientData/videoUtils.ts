/**
 * Enhanced Video Utility Functions
 * Comprehensive platform detection, icon/color mapping, and video ID extraction
 */

export interface VideoPlatform {
  name: string;
  icon: string;
  color: string;
  supported: boolean;
}

// Platform configuration
const PLATFORM_CONFIG: Record<string, VideoPlatform> = {
  youtube: {
    name: 'YouTube',
    icon: '▶️',
    color: '#FF0000',
    supported: true
  },
  tiktok: {
    name: 'TikTok',
    icon: '🎵',
    color: '#000000',
    supported: true
  },
  instagram: {
    name: 'Instagram',
    icon: '📷',
    color: '#E4405F',
    supported: true
  },
  facebook: {
    name: 'Facebook',
    icon: '👥',
    color: '#1877F2',
    supported: true
  },
  twitter: {
    name: 'Twitter/X',
    icon: '🦅',
    color: '#1DA1F2',
    supported: true
  },
  x: {
    name: 'X',
    icon: '✖️',
    color: '#000000',
    supported: true
  },
  vimeo: {
    name: 'Vimeo',
    icon: '🎬',
    color: '#1AB7EA',
    supported: true
  },
  dailymotion: {
    name: 'Dailymotion',
    icon: '🎥',
    color: '#0066CC',
    supported: true
  },
  twitch: {
    name: 'Twitch',
    icon: '🎮',
    color: '#9146FF',
    supported: true
  },
  rumble: {
    name: 'Rumble',
    icon: '📺',
    color: '#85C742',
    supported: true
  },
  other: {
    name: 'Video',
    icon: '🎥',
    color: '#666666',
    supported: false
  }
};

/**
 * Normalize platform name for consistent matching
 */
export function normalizePlatform(platform: string): string {
  if (!platform) return 'other';
  
  const lower = platform.toLowerCase().trim();
  
  // Direct matches
  if (PLATFORM_CONFIG[lower]) return lower;
  
  // Pattern matching
  if (lower.includes('youtube') || lower === 'youtube_video' || lower === 'youtube_short' || lower === 'youtube_live') {
    return 'youtube';
  }
  if (lower.includes('tiktok') || lower === 'tiktok_video' || lower === 'tiktok_reel' || lower === 'tiktok_live') {
    return 'tiktok';
  }
  if (lower.includes('instagram') || lower === 'instagram_video' || lower === 'instagram_reel' || lower === 'instagram_story') {
    return 'instagram';
  }
  if (lower.includes('facebook') || lower === 'facebook_video' || lower === 'facebook_reel' || lower === 'facebook_live') {
    return 'facebook';
  }
  if (lower.includes('twitter') || lower === 'x_video' || lower === 'twitter_video' || lower === 'twitter_live') {
    return 'twitter';
  }
  if (lower === 'x' || lower.startsWith('x_')) {
    return 'x';
  }
  if (lower.includes('vimeo') || lower === 'vimeo_video') {
    return 'vimeo';
  }
  if (lower.includes('dailymotion') || lower === 'dailymotion_video') {
    return 'dailymotion';
  }
  if (lower.includes('twitch')) {
    return 'twitch';
  }
  if (lower.includes('rumble') || lower === 'rumble_video') {
    return 'rumble';
  }
  
  return 'other';
}

/**
 * Get platform icon emoji
 */
export function getPlatformIcon(platform: string): string {
  const normalized = normalizePlatform(platform);
  return PLATFORM_CONFIG[normalized]?.icon || PLATFORM_CONFIG.other.icon;
}

/**
 * Get platform brand color
 */
export function getPlatformColor(platform: string): string {
  const normalized = normalizePlatform(platform);
  return PLATFORM_CONFIG[normalized]?.color || PLATFORM_CONFIG.other.color;
}

/**
 * Get platform display name
 */
export function getPlatformName(platform: string): string {
  const normalized = normalizePlatform(platform);
  return PLATFORM_CONFIG[normalized]?.name || 'Video';
}

/**
 * Check if platform is supported for embedding
 */
export function isPlatformSupported(platform: string): boolean {
  const normalized = normalizePlatform(platform);
  return PLATFORM_CONFIG[normalized]?.supported || false;
}

/**
 * Extract video ID from URL - Enhanced with more patterns
 */
export function extractVideoId(platform: string, url: string): string | null {
  if (!url) return null;
  
  const normalized = normalizePlatform(platform);
  
  try {
    switch (normalized) {
      case 'youtube': {
        // YouTube patterns
        const patterns = [
          /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
          /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
          /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
        ];
        
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match) return match[1];
        }
        break;
      }
      
      case 'vimeo': {
        // Vimeo patterns
        const patterns = [
          /vimeo\.com\/(\d+)/,
          /vimeo\.com\/video\/(\d+)/,
          /player\.vimeo\.com\/video\/(\d+)/,
        ];
        
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match) return match[1];
        }
        break;
      }
      
      case 'dailymotion': {
        // Dailymotion patterns
        const patterns = [
          /dailymotion\.com\/video\/([a-zA-Z0-9]+)/,
          /dai\.ly\/([a-zA-Z0-9]+)/,
        ];
        
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match) return match[1];
        }
        break;
      }
      
      case 'tiktok': {
        // TikTok patterns
        const patterns = [
          /tiktok\.com\/@[\w.]+\/video\/(\d+)/,
          /tiktok\.com\/v\/(\d+)/,
          /vm\.tiktok\.com\/([a-zA-Z0-9]+)/,
        ];
        
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match) return match[1];
        }
        break;
      }
      
      case 'twitch': {
        // Twitch patterns
        const patterns = [
          /twitch\.tv\/videos\/(\d+)/,
          /twitch\.tv\/(\w+)\/video\/(\d+)/,
        ];
        
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match) return match[match.length - 1];
        }
        break;
      }
      
      case 'rumble': {
        // Rumble patterns
        const match = url.match(/rumble\.com\/(?:embed\/)?([a-zA-Z0-9]+)/);
        return match ? match[1] : null;
      }
      
      case 'facebook': {
        // Facebook video patterns
        const patterns = [
          /facebook\.com\/.*\/videos\/(\d+)/,
          /fb\.watch\/([a-zA-Z0-9_-]+)/,
        ];
        
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match) return match[1];
        }
        break;
      }
      
      case 'instagram': {
        // Instagram patterns
        const patterns = [
          /instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/,
        ];
        
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match) return match[1];
        }
        break;
      }
      
      case 'twitter':
      case 'x': {
        // Twitter/X patterns
        const patterns = [
          /twitter\.com\/\w+\/status\/(\d+)/,
          /x\.com\/\w+\/status\/(\d+)/,
        ];
        
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match) return match[1];
        }
        break;
      }
    }
  } catch (error) {
    console.error('[videoUtils] Error extracting video ID:', error);
  }
  
  return null;
}

/**
 * Generate embed code for a video
 */
export function getVideoEmbedCode(
  platform: string, 
  videoId: string, 
  options?: {
    width?: number;
    height?: number;
    autoplay?: boolean;
    muted?: boolean;
  }
): string {
  const width = options?.width || 560;
  const height = options?.height || 315;
  const autoplay = options?.autoplay ? '1' : '0';
  const muted = options?.muted ? '1' : '0';
  
  const normalized = normalizePlatform(platform);
  
  switch (normalized) {
    case 'youtube':
      return `<iframe width="${width}" height="${height}" src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&autoplay=${autoplay}&mute=${muted}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
    
    case 'vimeo':
      return `<iframe width="${width}" height="${height}" src="https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0&autoplay=${autoplay}&muted=${muted}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
    
    case 'dailymotion':
      return `<iframe width="${width}" height="${height}" src="https://www.dailymotion.com/embed/video/${videoId}?autoplay=${autoplay}&mute=${muted}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen loading="lazy"></iframe>`;
    
    case 'twitch':
      return `<iframe src="https://player.twitch.tv/?video=${videoId}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}&autoplay=${autoplay === '1'}" width="${width}" height="${height}" frameborder="0" allowfullscreen loading="lazy"></iframe>`;
    
    case 'rumble':
      return `<iframe width="${width}" height="${height}" src="https://rumble.com/embed/${videoId}/?pub=4" frameborder="0" allowfullscreen loading="lazy"></iframe>`;
    
    default:
      return '';
  }
}

/**
 * Validate video URL
 */
export function isValidVideoUrl(platform: string, url: string): boolean {
  if (!url) return false;
  
  try {
    const videoId = extractVideoId(platform, url);
    return videoId !== null;
  } catch {
    return false;
  }
}

/**
 * Get thumbnail URL for video
 */
export function getVideoThumbnail(
  platform: string, 
  videoId: string, 
  quality: 'low' | 'medium' | 'high' = 'medium'
): string {
  const normalized = normalizePlatform(platform);
  
  switch (normalized) {
    case 'youtube': {
      const qualities = {
        low: 'default',
        medium: 'mqdefault',
        high: 'maxresdefault'
      };
      return `https://img.youtube.com/vi/${videoId}/${qualities[quality]}.jpg`;
    }
    
    case 'vimeo':
      // Vimeo requires API call for thumbnails, return placeholder
      return `https://vumbnail.com/${videoId}.jpg`;
    
    case 'dailymotion':
      return `https://www.dailymotion.com/thumbnail/video/${videoId}`;
    
    default:
      return '';
  }
}

/**
 * Format video duration (seconds to MM:SS or HH:MM:SS)
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/**
 * Get all supported platforms
 */
export function getSupportedPlatforms(): string[] {
  return Object.entries(PLATFORM_CONFIG)
    .filter(([, config]) => config.supported)
    .map(([key]) => key);
}

/**
 * Check if video is a live stream
 */
export function isLiveVideo(platform: string, videoType?: string): boolean {
  if (!videoType) return false;
  
  const liveTypes = ['live', 'youtube_live', 'facebook_live', 'instagram_live', 'twitter_live', 'tiktok_live'];
  return liveTypes.some(type => videoType.toLowerCase().includes(type));
}

/**
 * Check if video is a short-form video
 */
export function isShortVideo(platform: string, videoType?: string): boolean {
  if (!videoType) return false;
  
  const shortTypes = ['short', 'reel', 'story', 'youtube_short', 'instagram_reel', 'facebook_reel', 'tiktok_reel'];
  return shortTypes.some(type => videoType.toLowerCase().includes(type));
}