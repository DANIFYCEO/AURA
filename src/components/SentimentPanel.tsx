'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuraStore } from '@/store/useAuraStore';
import { sentimentLabel, sentimentColor } from '@/lib/formatters';

type SentimentArticle = {
  title: string;
  time_published: string;
  overall_sentiment_score: number;
  overall_sentiment_label: string;
  source: string;
  url: string;
};

type TickerSentiment = {
  symbol: string;
  score: number;
  label: string;
  articleCount: number;
};

export default function SentimentPanel() {
  const { watchlist } = useAuraStore();
  const [sentiments, setSentiments] = useState<TickerSentiment[]>([]);
  const [loading, setLoading] = useState(true);

  const [hasError, setHasError] = useState(false);

  const fetchSentiments = useCallback(async () => {
    const results: TickerSentiment[] = [];
    let encounteredError = false;
    for (const ticker of watchlist.slice(0, 6)) {
      try {
        const res = await fetch(`/api/sentiment?ticker=${ticker.symbol}`);
        if (res.status === 429) encounteredError = true;
        const articles = await res.json();
        if (articles.error) encounteredError = true;
        
        if (Array.isArray(articles) && articles.length > 0) {
          const avg = articles.reduce((sum, a) => sum + (a.overall_sentiment_score ?? 0), 0) / articles.length;
          results.push({
            symbol: ticker.symbol.replace('-USD', ''),
            score: avg,
            label: sentimentLabel(avg),
            articleCount: articles.length,
          });
        }
      } catch {
        encounteredError = true;
      }
    }
    setSentiments(results);
    setHasError(encounteredError && results.length === 0);
    setLoading(false);
  }, [watchlist]);

  useEffect(() => {
    fetchSentiments();
    const iv = setInterval(fetchSentiments, 120000);
    return () => clearInterval(iv);
  }, [fetchSentiments]);

  const getBarWidth = (score: number) => {
    // score is -1 to +1, map to 0-100%
    return Math.round(((score + 1) / 2) * 100);
  };

  // Aggregate market mood
  const marketMood = sentiments.length > 0
    ? sentiments.reduce((s, t) => s + t.score, 0) / sentiments.length
    : 0;
  const moodLabel = sentimentLabel(marketMood);
  const moodColor = sentimentColor(marketMood);

  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="panel-header">
        <span className="panel-header-label">◆ SENTIMENT RADAR</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: moodColor, letterSpacing: '0.1em' }}>
            {loading ? '...' : moodLabel}
          </span>
          <span style={{ fontSize: 9, color: '#2a2a2a' }}>MARKET</span>
        </div>
      </div>

      {/* Aggregate mood bar */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #0f0f0f', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 9, color: '#ff1744', letterSpacing: '0.08em' }}>◀ BEAR</span>
          <span style={{ fontSize: 9, color: '#555' }}>OVERALL MARKET</span>
          <span style={{ fontSize: 9, color: '#00e676', letterSpacing: '0.08em' }}>BULL ▶</span>
        </div>
        <div style={{ height: 4, background: '#111', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 0, left: '50%', height: '100%',
            width: `${Math.abs(marketMood) * 50}%`,
            background: marketMood >= 0 ? '#00e676' : '#ff1744',
            transformOrigin: 'left center',
            transform: marketMood < 0 ? 'translateX(-100%)' : 'none',
            transition: 'width 0.5s ease',
          }} />
          {/* Center line */}
          <div style={{ position: 'absolute', top: -2, left: '50%', width: 1, height: 8, background: '#333' }} />
        </div>
      </div>

      {/* Per-ticker rows */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <span style={{ fontSize: 10, color: '#2a2a2a', letterSpacing: '0.1em' }}>SCANNING FEEDS...</span>
          </div>
        )}
        {hasError && !loading && (
          <div style={{ textAlign: 'center', padding: 30, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#ff1744', fontWeight: 700, letterSpacing: '0.1em' }}>DATA UNAVAILABLE</span>
            <span style={{ fontSize: 9, color: '#555', letterSpacing: '0.05em' }}>SOURCE RATE LIMIT EXCEEDED</span>
          </div>
        )}
        {sentiments.map((t) => (
          <div key={t.symbol} style={{ padding: '6px 12px', borderBottom: '1px solid #080808' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#bbb', letterSpacing: '0.04em' }}>{t.symbol}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 9, color: '#333' }}>{t.articleCount} ARTICLES</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: sentimentColor(t.score), letterSpacing: '0.08em' }}>
                  {t.label}
                </span>
              </div>
            </div>
            {/* Progress bar */}
            <div style={{ height: 3, background: '#111', borderRadius: 0 }}>
              <div style={{
                height: '100%',
                width: `${getBarWidth(t.score)}%`,
                background: `linear-gradient(90deg, #ff1744 0%, #ffd600 50%, #00e676 100%)`,
                clipPath: `inset(0 ${100 - getBarWidth(t.score)}% 0 0)`,
                transition: 'clip-path 0.5s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ fontSize: 9, color: '#1a1a1a' }}>-1.0</span>
              <span style={{ fontSize: 9, color: '#333' }}>{t.score.toFixed(2)}</span>
              <span style={{ fontSize: 9, color: '#1a1a1a' }}>+1.0</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '5px 12px', borderTop: '1px solid #0f0f0f', flexShrink: 0 }}>
        <span style={{ fontSize: 9, color: '#1c1c1c' }}>SRC: ALPHA VANTAGE · REFRESH 2m</span>
      </div>
    </div>
  );
}
