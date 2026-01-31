export function velocityTier(delta: number): 'fast' | 'medium' | 'slow' {
  if (delta > 12000) return 'fast';
  if (delta > 5000) return 'medium';
  return 'slow';
}

export function calculateVelocity(
  currentScore: number,
  previousScore: number
): number {
  return Math.max(0, currentScore - previousScore);
}

export function calculateAcceleration(
  currentVelocity: number,
  previousVelocity: number
): number {
  return currentVelocity - previousVelocity;
}