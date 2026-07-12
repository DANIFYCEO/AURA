'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import TickerTape from '@/components/TickerTape';
import WatchlistPanel from '@/components/WatchlistPanel';
import AIChatPanel from '@/components/AIChatPanel';
import SentimentPanel from '@/components/SentimentPanel';
import NewsPanel from '@/components/NewsPanel';
import { useAuraStore } from '@/store/useAuraStore';
import { Activity, BarChart2, MessageSquare, Radio } from 'lucide-react';

// Chart must be client-only (accesses DOM)
const ChartPanel = dynamic(() => import('@/components/ChartPanel'), {
  ssr: false,
  loading: () => (
    <div className="panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 10, color: '#2a2a2a', letterSpacing: '0.15em' }}>LOADING CHART ENGINE...</span>
    </div>
  ),
});

export default function Home() {
  const isChartFullscreen = useAuraStore((state) => state.isChartFullscreen);
  const userMode = useAuraStore((state) => state.userMode);
  const toggleUserMode = useAuraStore((state) => state.toggleUserMode);
  const mobileTab = useAuraStore((state) => state.mobileTab);
  const setMobileTab = useAuraStore((state) => state.setMobileTab);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 950);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100%',
      background: '#000',
      color: '#fff',
      fontFamily: 'var(--font-mono)',
      overflow: 'hidden'
    }}>
      {/* ── TOP: AURA Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        height: 40,
        background: '#000',
        borderBottom: '1px solid #111',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.3em', color: '#e8e8e8' }}>AURA</span>
          <span style={{ fontSize: 9, color: '#555', letterSpacing: '0.12em' }}>BY FABER AI STUDIO</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={toggleUserMode}
            style={{
              background: userMode === 'pro' ? '#111' : '#e8e8e8',
              color: userMode === 'pro' ? '#666' : '#000',
              border: `1px solid ${userMode === 'pro' ? '#222' : '#e8e8e8'}`,
              padding: '4px 12px',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            title="Toggle intelligence density"
          >
            {userMode === 'pro' ? 'MODE: PRO' : 'MODE: BEGINNER'}
          </button>
        </div>
      </div>

      {/* ── TICKER TAPE ── */}
      <TickerTape />

      {/* ── MAIN CONTENT ── */}
      {isMobile ? (
        /* ═══ MOBILE: Render only the active tab ═══ */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          {mobileTab === 'watchlist' && <WatchlistPanel />}
          {mobileTab === 'chart' && <ChartPanel />}
          {mobileTab === 'ai' && <AIChatPanel />}
          {mobileTab === 'radar' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 1, background: '#0a0a0a' }}>
              <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                <SentimentPanel />
              </div>
              <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                <NewsPanel />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ═══ DESKTOP: Original CSS Grid ═══ */
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: isChartFullscreen ? '1fr' : '280px 1fr 340px',
            gridTemplateRows: isChartFullscreen ? '1fr' : '60% 40%',
            gap: 1,
            background: '#0a0a0a',
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {/* Col 1 Row 1+2: Watchlist (spans full height) */}
          {!isChartFullscreen && (
            <div style={{ gridRow: '1 / 3', background: '#000' }}>
              <WatchlistPanel />
            </div>
          )}

          {/* Col 2 Row 1: Chart */}
          <div style={{ background: '#000', minHeight: 0, gridRow: isChartFullscreen ? '1 / 3' : '1' }}>
            <ChartPanel />
          </div>

          {/* Col 3 Row 1+2: AI Chat (spans full height) */}
          {!isChartFullscreen && (
            <div style={{ gridRow: '1 / 3', background: '#000' }}>
              <AIChatPanel />
            </div>
          )}

          {/* Col 2 Row 2: Split — Sentiment + News */}
          {!isChartFullscreen && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 1,
                background: '#0a0a0a',
                minHeight: 0,
              }}
            >
              <div style={{ background: '#000', minHeight: 0 }}>
                <SentimentPanel />
              </div>
              <div style={{ background: '#000', minHeight: 0 }}>
                <NewsPanel />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MOBILE BOTTOM NAV (only on mobile) ── */}
      {isMobile && (
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          width: '100%',
          flexShrink: 0,
          height: 60,
          background: '#080808',
          borderTop: '1px solid #1a1a1a',
          paddingBottom: 'env(safe-area-inset-bottom)',
          zIndex: 999,
        }}>
          {[
            { tab: 'watchlist' as const, icon: <Activity size={20} />, label: 'WATCHLIST' },
            { tab: 'chart' as const, icon: <BarChart2 size={20} />, label: 'CHART' },
            { tab: 'ai' as const, icon: <MessageSquare size={20} />, label: 'AURA AI' },
            { tab: 'radar' as const, icon: <Radio size={20} />, label: 'RADAR' },
          ].map(({ tab, icon, label }) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 4,
                background: 'transparent',
                border: 'none',
                color: mobileTab === tab ? '#e8e8e8' : '#555',
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
