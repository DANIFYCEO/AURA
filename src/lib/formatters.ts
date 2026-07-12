/**
 * AURA Formatting Utilities
 */

export function formatPrice(price: number): string {
  if (!price) return '0.00';
  if (price >= 1000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (price >= 1) {
    return price.toFixed(2);
  }
  return price.toFixed(4);
}

export function formatPct(pct: number): string {
  if (pct == null) return '0.00%';
  const prefix = pct > 0 ? '+' : '';
  return `${prefix}${pct.toFixed(2)}%`;
}

export function formatChange(chg: number): string {
  if (chg == null) return '0.00';
  const prefix = chg > 0 ? '+' : '';
  return `${prefix}${chg.toFixed(2)}`;
}

export function formatVol(vol: number): string {
  if (!vol) return '0';
  if (vol >= 1e9) return `${(vol / 1e9).toFixed(2)}B`;
  if (vol >= 1e6) return `${(vol / 1e6).toFixed(2)}M`;
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(1)}K`;
  return vol.toString();
}

export function sentimentLabel(score: number): string {
  if (score >= 0.25) return 'BULLISH';
  if (score <= -0.25) return 'BEARISH';
  return 'NEUTRAL';
}

export function sentimentColor(score: number): string {
  if (score >= 0.25) return 'var(--green)';
  if (score <= -0.25) return 'var(--red)';
  return 'var(--amber)';
}

export function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const ts = new Date(dateStr).getTime();
    const d = Date.now() - ts;
    const m = Math.floor(d / 60000);
    if (m < 60) return `${m}m ago`;
    if (m < 1440) return `${Math.floor(m / 60)}h ago`;
    return `${Math.floor(m / 1440)}d ago`;
  } catch {
    return '';
  }
}
