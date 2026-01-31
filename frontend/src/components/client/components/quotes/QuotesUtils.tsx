import { Quote } from '../../hooks/useQuotes';

export const getTierClass = (index: number): string => {
  const pattern = index % 12;
  if (pattern === 0) return 'tier-hero';
  if (pattern % 4 === 1) return 'tier-large';
  if (pattern % 3 === 0) return 'tier-medium';
  return 'tier-small';
};

export const getThemeColor = (theme: string): string => {
  switch (theme) {
    case 'dark':
      return '#00ffc6';
    case 'african':
      return '#dc2626';
    default:
      return '#2563eb';
  }
};

export const getInitials = (name: string): string => {
  if (!name) return 'DV';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const filterQuotes = (
  allQuotes: Quote[],
  itemsPerPage: number
): Quote[] => {
  return allQuotes.slice(0, itemsPerPage);
};