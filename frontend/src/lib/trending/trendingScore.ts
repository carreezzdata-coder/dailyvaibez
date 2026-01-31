export function getHeatLevel(score: number): number {
  if (score > 120000) return 5;
  if (score > 80000) return 4;
  if (score > 45000) return 3;
  if (score > 20000) return 2;
  return 1;
}

export function getTimeSince(date: string): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  const days = Math.floor(seconds / 86400);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export function normalizeScore(score: number): number {
  return Math.min(score / 150000, 1);
}