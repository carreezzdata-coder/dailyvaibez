export const API_CONFIG = {
  getBackendUrl(): string {
    if (typeof window !== 'undefined') {
      return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
    }
    const isProduction = 
      process.env.NODE_ENV === 'production' || 
      process.env.VERCEL_ENV === 'production' ||
      process.env.RENDER === 'true';
    const url = isProduction
      ? (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.dailyvaibe.com')
      : (process.env.BACKEND_URL || 'http://localhost:5000');
    return url.replace(/\/$/, '');
  },
  
  getFrontendUrl(): string {
    const isProduction = process.env.NODE_ENV === 'production';
    return isProduction ? 'https://www.dailyvaibe.com' : 'http://localhost:3000';
  },
  
  getSessionCookieName(): string {
    return 'dailyvaibe_public_session';
  },
  
  getAdminSessionCookieName(): string {
    return 'dailyvaibe_admin_session';
  }
};

export const MAIN_CATEGORIES = [
  { slug: 'home', name: 'Home', icon: '🏠', isGroup: false },
  { slug: 'live-world', name: 'Live & World', icon: '🌍', isGroup: true },
  { slug: 'counties', name: 'Counties', icon: '🏢', isGroup: true },
  { slug: 'politics', name: 'Politics', icon: '🏛️', isGroup: true },
  { slug: 'business', name: 'Business', icon: '💼', isGroup: true },
  { slug: 'opinion', name: 'Opinion', icon: '💭', isGroup: true },
  { slug: 'sports', name: 'Sports', icon: '⚽', isGroup: true },
  { slug: 'lifestyle', name: 'Life & Style', icon: '🎭', isGroup: true },
  { slug: 'entertainment', name: 'Entertainment', icon: '🎉', isGroup: true },
  { slug: 'tech', name: 'Technology', icon: '💻', isGroup: true },
  { slug: 'other', name: 'Other', icon: '📌', isGroup: true }
];

export const CATEGORY_GROUPS: Record<string, string[]> = {
  'live-world': ['live', 'world', 'gender', 'east-africa', 'africa', 'international'],
  'counties': ['nairobi', 'coast', 'mountain', 'lake-region', 'rift-valley', 'northern', 'eastern', 'western'],
  'politics': ['politics', 'live-news', 'national-news', 'world-news', 'international', 'legal', 'governance'],
  'business': ['companies', 'finance-markets', 'seeds-of-gold', 'enterprise', 'economy', 'banking', 'business'],
  'opinion': ['editorials', 'columnists', 'guest-blogs', 'letters', 'cutting-edge', 'cartoons', 'analysis', 'opinion'],
  'sports': ['football', 'athletics', 'rugby', 'motorsport', 'talkup', 'other-sports', 'cricket', 'basketball', 'sports', 'sport'],
  'lifestyle': ['motoring', 'culture', 'family', 'relationships', 'art-books', 'travel', 'wellness', 'fashion', 'food', 'lifestyle'],
  'entertainment': ['buzz', 'trending', 'gossip', 'life-stories', 'more-entertainment', 'music', 'movies', 'celebrity', 'entertainment'],
  'tech': ['innovations', 'gadgets', 'startups', 'digital-life', 'ai', 'mobile', 'gaming', 'tech', 'technology'],
  'other': ['others', 'bloggers', 'human-rights', 'climate-crisis', 'investigations', 'interactives', 'features', 'in-pictures', 'other']
};

export const CATEGORY_SLUGS = MAIN_CATEGORIES.map(cat => cat.slug);

export const ALL_CATEGORY_SLUGS = [
  ...Object.keys(CATEGORY_GROUPS),
  ...Object.values(CATEGORY_GROUPS).flat()
];

export const CATEGORY_COLORS: Record<string, string> = {
  'home': '#34495e',
  'live-world': '#e67e22',
  'counties': '#3498db',
  'politics': '#c0392b',
  'business': '#2ecc71',
  'opinion': '#f39c12',
  'sports': '#9b59b6',
  'lifestyle': '#e91e63',
  'entertainment': '#e91e63',
  'tech': '#1abc9c',
  'other': '#34495e',
  'breaking': '#ff4444',
  'featured': '#ffd700',
  'trending': '#ff6b6b'
};

export const CATEGORY_ICONS: Record<string, string> = {
  'home': '🏠',
  'live-world': '🌍',
  'counties': '🏢',
  'politics': '🏛️',
  'business': '💼',
  'opinion': '💭',
  'sports': '⚽',
  'lifestyle': '🎭',
  'entertainment': '🎉',
  'tech': '💻',
  'other': '📌',
  'breaking': '🔥',
  'featured': '⭐',
  'trending': '📈'
};

export function isGroupCategory(slug: string): boolean {
  return Object.keys(CATEGORY_GROUPS).includes(slug);
}

export function getSubCategories(groupSlug: string): string[] {
  return CATEGORY_GROUPS[groupSlug] || [];
}

export function getCategoryIcon(slug: string): string {
  return CATEGORY_ICONS[slug] || '📰';
}

export function getCategoryColor(slug: string): string {
  return CATEGORY_COLORS[slug] || '#34495e';
}

export function normalizeCategorySlug(input: string): string {
  const nameToSlug: Record<string, string> = {
    'Home': 'home',
    'Live & World': 'live-world',
    'Counties': 'counties',
    'Politics': 'politics',
    'Business': 'business',
    'Opinion': 'opinion',
    'Sports': 'sports',
    'Life & Style': 'lifestyle',
    'Lifestyle': 'lifestyle',
    'Entertainment': 'entertainment',
    'Technology': 'tech',
    'Tech': 'tech',
    'Other': 'other'
  };
  if (nameToSlug[input]) {
    return nameToSlug[input];
  }
  return input.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}