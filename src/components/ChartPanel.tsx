'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useAuraStore } from '@/store/useAuraStore';
import { Maximize2, Minimize2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const AdvancedRealTimeChart = dynamic(
  () => import('react-ts-tradingview-widgets').then((w) => w.AdvancedRealTimeChart),
  { ssr: false }
);

export default function ChartPanel() {
  const activeTicker = useAuraStore((state) => state.activeTicker);
  const isChartFullscreen = useAuraStore((state) => state.isChartFullscreen);
  const toggleChartFullscreen = useAuraStore((state) => state.toggleChartFullscreen);

  const [isMobile, setIsMobile] = useState(false);
  const [ready, setReady] = useState(false);
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 950);
    check();
    setReady(true);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // TradingView prefers symbols without dashes, and explicit exchanges for crypto
  let formattedSymbol = activeTicker.replace('-', '');
  if (activeTicker.includes('-USD') || activeTicker === 'BTC' || activeTicker === 'ETH') {
    formattedSymbol = `COINBASE:${formattedSymbol}`;
  }

  const containerStyle: React.CSSProperties = isMobileLandscape
    ? {
        position: 'fixed',
        top: '50%',
        left: '50%',
        width: '100vh',
        height: '100vw',
        transform: 'translate(-50%, -50%) rotate(90deg)',
        zIndex: 9999,
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
      }
    : {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#000',
        minWidth: 0,
        minHeight: 0,
        overflow: 'hidden',
      };

  return (
    <div className="panel" style={containerStyle}>
      {/* Header */}
      <div className="panel-header" style={{ borderBottom: '1px solid #1a1a1a', padding: '8px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="panel-header-label" style={{ color: '#fff' }}>◆ {activeTicker.replace('-USD', '')} / TRADINGVIEW PRO</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={() => (isMobile ? setIsMobileLandscape(!isMobileLandscape) : toggleChartFullscreen())}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 4,
              borderRadius: 4,
            }}
            title={isChartFullscreen || isMobileLandscape ? "Exit Fullscreen" : "Fullscreen Chart"}
          >
            {isChartFullscreen || isMobileLandscape ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Chart area - simple, no rotation */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0, overflow: 'hidden' }}>
        {ready && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <AdvancedRealTimeChart
              symbol={formattedSymbol}
              theme="dark"
              width="100%"
              height="100%"
              autosize={false}
              allow_symbol_change={false}
              hide_side_toolbar={isMobile}
              timezone="Etc/UTC"
              style="1"
            />
          </div>
        )}
      </div>
    </div>
  );
}
