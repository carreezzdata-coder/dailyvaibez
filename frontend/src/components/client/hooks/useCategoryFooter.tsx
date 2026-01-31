import { useState, useEffect } from 'react';

export interface FooterCategory {
  category_id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  description?: string;
  color?: string;
  icon?: string;
  article_count?: number;
}

export interface CategoryGroup {
  title: string;
  icon: string;
  description: string;
  mainSlug: string;
  slug: string;
  color: string;
  order: number;
  categories: FooterCategory[];
}

export interface CategoryGroups {
  [key: string]: CategoryGroup;
}

export const useCategoryFooter = () => {
  const [groups, setGroups] = useState<CategoryGroups>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/client/footer-categories', {
          credentials: 'include',
          headers: { 
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json'
          },
          signal: abortController.signal
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
        }

        const data = await response.json();
        
        if (data.success && data.groups) {
          setGroups(data.groups);
        } else {
          throw new Error(data.message || 'Failed to load footer categories');
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error('Error fetching footer categories:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setGroups({});
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchCategories();
    return () => abortController.abort();
  }, []);

  return { groups, isLoading, error };
};