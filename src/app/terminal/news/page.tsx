'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuraStore } from '@/store/useAuraStore';
import { sentimentLabel, sentimentColor, timeAgo } from '@/lib/formatters';

type Article = {
  title: string;
  description?: string;
  desc?: string;
  source?: string | { name: string };
  src?: string;
  published_at?: string;
  time?: string;
  entities?: Array<{ sentiment_score: number }>;
  score?: number;
};

export default function NewsPage() {
  const { watchlist } = useAuraStore();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const symbols = watchlist.map(w => w.symbol).join(',');
        const res = await fetch(`/api/news?symbols=${symbols}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setArticles(data);
        } else if (data && Array.isArray(data.data)) {
          setArticles(data.data);
        } else {
          setArticles([]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [watchlist]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100dvh',
      background: '#000',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 48, background: '#0a0a0a', borderBottom: '1px solid #1a1a1a', flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/terminal" style={{ color: '#888', textDecoration: 'none', fontSize: 10, letterSpacing: '0.1em' }}>
            ◀ BACK
          </Link>
          <span style={{ color: '#333' }}>|</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', color: '#fff' }}>AURA NEWS DESK</span>
        </div>
        <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.1em', textAlign: 'right' }}>
          {loading ? 'SYNCING...' : `${articles.length} ARTICLES`}
        </div>
      </div>

      {/* Grid Layout */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
        alignContent: 'start'
      }}>
        {articles.map((a, i) => {
          const score = a.entities?.[0]?.sentiment_score ?? a.score ?? 0;
          const color = sentimentColor(score);
          const bg = score >= 0.25 ? 'rgba(0,230,118,0.05)' : score <= -0.25 ? 'rgba(255,23,68,0.05)' : 'rgba(255,214,0,0.05)';
          const border = score >= 0.25 ? 'rgba(0,230,118,0.2)' : score <= -0.25 ? 'rgba(255,23,68,0.2)' : 'rgba(255,214,0,0.2)';
          const src = a.src || (typeof a.source === 'object' ? a.source?.name : a.source) || 'Unknown';
          const time = a.time || (a.published_at ? timeAgo(a.published_at) : '');
          const desc = a.desc || a.description;

          return (
            <div key={i} style={{
              background: '#0a0a0a',
              border: `1px solid #111`,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 6px',
                  border: `1px solid ${border}`, color: color, background: bg,
                  letterSpacing: '0.05em'
                }}>
                  {sentimentLabel(score)} {score > 0 ? '+' : ''}{(score * 100).toFixed(0)}
                </span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: '#666' }}>{src}</div>
                  <div style={{ fontSize: 9, color: '#444', marginTop: 2 }}>{time}</div>
                </div>
              </div>
              
              <div style={{ fontSize: 14, color: '#ccc', fontWeight: 500, lineHeight: 1.4 }}>
                {a.title}
              </div>
              
              {desc && (
                <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5, flex: 1 }}>
                  {desc}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
