/**
 * AURA proprietary scoring logic
 */

export type AuraScoreContext = {
  priceChangePct?: number; // 24h percentage change (e.g. 2.5 for +2.5%)
  sentimentScore?: number; // AlphaVantage sentiment (-1 to 1)
};

export function calculateAuraScore(ctx: AuraScoreContext): number {
  const { priceChangePct = 0, sentimentScore = 0 } = ctx;

  // Base score (Neutral market health)
  let score = 50;

  // 1. Sentiment modifier (+/- 30 max)
  // sentimentScore ranges from -1 to 1, so multiply by 30
  const sentimentMod = sentimentScore * 30;

  // 2. Price Momentum modifier (+/- 20 max)
  // 5% move = max modifier. 
  // Formula: pct * 4 (so 5% * 4 = 20)
  let momentumMod = priceChangePct * 4;
  if (momentumMod > 20) momentumMod = 20;
  if (momentumMod < -20) momentumMod = -20;

  score += sentimentMod + momentumMod;

  // Clamp 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getAuraScoreColor(score: number): string {
  if (score >= 70) return '#00e676'; // Bullish Green
  if (score <= 30) return '#ff1744'; // Bearish Red
  return '#ffd600'; // Neutral Amber
}

export function getAuraScoreLabel(score: number): string {
  if (score >= 80) return 'STRONG BUY';
  if (score >= 60) return 'BULLISH';
  if (score <= 20) return 'STRONG SELL';
  if (score <= 40) return 'BEARISH';
  return 'NEUTRAL';
}
