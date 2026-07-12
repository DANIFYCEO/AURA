'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuraStore } from '@/store/useAuraStore';
import { sentimentLabel, sentimentColor, timeAgo } from '@/lib/formatters';

type Article = {
  title: string;
  published_at?: string;
  time_published?: string;
  source: { name: string } | string;
  url: string;
  description?: string;
  entities?: { symbol: string; sentiment_score: number }[];
  overall_sentiment_score?: number;
};

export default function NewsPanel() {
  const { watchlist } = useAuraStore();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const symbols = watchlist.map((t) => t.symbol).join(',');
    const fetchNews = async () => {
      try {
        setHasError(false);
        const res = await fetch(`/api/news?symbols=${symbols}`);
        if (res.status === 429) setHasError(true);
        const data = await res.json();
        if (data.error) setHasError(true);
        setArticles(data.data || []);
      } catch { 
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
    const iv = setInterval(fetchNews, 300000);
    return () => clearInterval(iv);
  }, [watchlist]);

  const getSentimentScore = (article: Article): number => {
    if (article.entities && article.entities.length > 0) return article.entities[0].sentiment_score;
    return article.overall_sentiment_score ?? 0;
  };

  const getSource = (source: { name: string } | string): string => {
    if (typeof source === 'string') return source;
    return source?.name || 'UNKNOWN';
  };

  const getTime = (article: Article): string => {
    const ts = article.published_at || article.time_published || '';
    if (!ts) return '';
    try { return timeAgo(ts); } catch { return ''; }
  };

  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <Link href="/terminal/news" style={{ textDecoration: 'none' }}>
          <span className="panel-header-label" style={{ cursor: 'pointer' }}>◆ LIVE NEWS FEED (EXPAND ↗)</span>
        </Link>
        <span style={{ fontSize: 9, color: '#2a2a2a' }}>
          {loading ? 'LOADING...' : `${articles.length} ARTICLES`}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading && (
          <div style={{ padding: 20, textAlign: 'center' }}>
            <span style={{ fontSize: 10, color: '#2a2a2a', letterSpacing: '0.1em' }}>SCANNING FEEDS...</span>
          </div>
        )}
        {hasError && !loading && (
          <div style={{ textAlign: 'center', padding: 30, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#ff1744', fontWeight: 700, letterSpacing: '0.1em' }}>DATA UNAVAILABLE</span>
            <span style={{ fontSize: 9, color: '#555', letterSpacing: '0.05em' }}>SOURCE RATE LIMIT EXCEEDED</span>
          </div>
        )}
        {articles.map((article, i) => {
          const score = getSentimentScore(article);
          const label = sentimentLabel(score);
          const color = sentimentColor(score);
          const isExpanded = expanded === i;

          return (
            <div
              key={i}
              style={{ borderBottom: '1px solid #0a0a0a', cursor: 'pointer' }}
              onClick={() => setExpanded(isExpanded ? null : i)}
            >
              <div style={{
                padding: '8px 12px',
                display: 'grid',
                gridTemplateColumns: '35px 1fr',
                gap: 10,
                alignItems: 'start',
                background: isExpanded ? '#0d0d0d' : 'transparent',
                transition: 'background 0.1s',
              }}>
                {/* Sentiment badge */}
                <div style={{
                  fontSize: 9, fontWeight: 700, padding: '2px 5px',
                  background: score > 0.25 ? 'rgba(0,230,118,0.08)' : score < -0.25 ? 'rgba(255,23,68,0.08)' : 'rgba(255,214,0,0.08)',
                  color: color, letterSpacing: '0.06em', whiteSpace: 'nowrap', flexShrink: 0, textAlign: 'center',
                  border: `1px solid ${score > 0.25 ? 'rgba(0,230,118,0.15)' : score < -0.25 ? 'rgba(255,23,68,0.15)' : 'rgba(255,214,0,0.15)'}`,
                }}>
                  {score > 0 ? '+' : ''}{(score * 100).toFixed(0)}
                </div>

                {/* Title and Meta */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <p style={{ fontSize: 11, color: isExpanded ? '#ddd' : '#999', lineHeight: 1.4, margin: 0 }}>
                    {article.title}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 9, color: '#444' }}>{getSource(article.source)}</div>
                    <div style={{ fontSize: 9, color: '#333' }}>{getTime(article)}</div>
                  </div>
                  {isExpanded && article.description && (
                    <p style={{ fontSize: 10, color: '#666', lineHeight: 1.5, margin: 0, marginTop: 4 }}>
                      {article.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '5px 12px', borderTop: '1px solid #0f0f0f', flexShrink: 0 }}>
        <span style={{ fontSize: 9, color: '#1c1c1c' }}>SRC: MARKETAUX · REFRESH 5m · AI SCORED</span>
      </div>
    </div>
  );
}
