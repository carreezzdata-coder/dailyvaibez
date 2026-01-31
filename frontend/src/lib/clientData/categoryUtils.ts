import { CATEGORY_ICONS, CATEGORY_COLORS, MAIN_CATEGORIES, CATEGORY_GROUPS } from './constants';
import type { Category } from './types';

export function getCategoryIcon(slug: string): string {
  return CATEGORY_ICONS[slug] || '📰';
}

export function getCategoryColor(slug: string): string {
  return CATEGORY_COLORS[slug] || '#34495e';
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return MAIN_CATEGORIES.find(cat => cat.slug === slug);
}

export function isCategoryGroup(slug: string): boolean {
  const category = getCategoryBySlug(slug);
  return category?.isGroup ?? false;
}

export function isGroupCategory(slug: string): boolean {
  return Object.keys(CATEGORY_GROUPS).includes(slug);
}

export function getSubCategories(groupSlug: string): string[] {
  return CATEGORY_GROUPS[groupSlug] || [];
}

export function getParentGroup(subCategorySlug: string): string | null {
  for (const [groupSlug, subCategories] of Object.entries(CATEGORY_GROUPS)) {
    if (subCategories.includes(subCategorySlug)) return groupSlug;
  }
  return null;
}