'use client';

import { useEffect, useState } from 'react';
import { formatPrice, formatPct } from '@/lib/formatters';

type TickerItem = { symbol: string; price: number; changePct: number };

const TAPE_SYMBOLS = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'SPY', 'BTC-USD', 'ETH-USD', 'AMZN', 'GOOGL', 'META'];

export default function TickerTape() {
  const [tickers, setTickers] = useState<TickerItem[]>([]);
  const [time, setTime] = useState('');

  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const res = await fetch(`/api/market?symbols=${TAPE_SYMBOLS.join(',')}`);
        const data = await res.json();
        setTickers(data.map((d: { symbol: string; regularMarketPrice: number; regularMarketChangePercent: number }) => ({
          symbol: d.symbol,
          price: d.regularMarketPrice,
          changePct: d.regularMarketChangePercent,
        })));
      } catch {
        setTickers(TAPE_SYMBOLS.map((s) => ({ symbol: s, price: 0, changePct: 0 })));
      }
    };

    fetchTickers();
    const iv = setInterval(fetchTickers, 30000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const updateTime = () => setTime(new Date().toUTCString().slice(17, 25) + ' UTC');
    updateTime();
    const iv = setInterval(updateTime, 1000);
    return () => clearInterval(iv);
  }, []);

  const items = [...tickers, ...tickers]; // duplicate for seamless loop

  return (
    <div
      style={{
        height: 32,
        background: '#080808',
        borderBottom: '1px solid #1a1a1a',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* Candlestick Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 14px',
        borderRight: '1px solid #1a1a1a',
        height: '100%',
        flexShrink: 0,
        background: '#0a0a0a',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5.5" y="4" width="1" height="14" fill="#00e676" />
          <rect x="3" y="9" width="6" height="7" fill="#00e676" />
          <rect x="11.5" y="2" width="1" height="16" fill="#ff1744" />
          <rect x="9" y="5" width="6" height="10" fill="#ff1744" />
          <rect x="17.5" y="7" width="1" height="15" fill="#00e676" />
          <rect x="15" y="9" width="6" height="9" fill="#00e676" />
        </svg>
      </div>

      {/* Scrolling tape */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div className="ticker-scroll" style={{ display: 'flex', gap: 0, whiteSpace: 'nowrap' }}>
          {items.map((t, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 20px', borderRight: '1px solid #111' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#888', letterSpacing: '0.08em' }}>{t.symbol.replace('-USD', '')}</span>
              <span style={{ fontSize: 11, fontWeight: 500, color: '#e8e8e8' }}>${formatPrice(t.price)}</span>
              <span style={{ fontSize: 10, color: t.changePct > 0 ? '#00e676' : t.changePct < 0 ? '#ff1744' : '#555' }}>
                {formatPct(t.changePct)}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Clock */}
      <div className="hide-on-mobile" style={{
        padding: '0 14px',
        borderLeft: '1px solid #1a1a1a',
        height: '100%',
        display: 'flex', alignItems: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, color: '#444', letterSpacing: '0.05em' }}>{time}</span>
      </div>
    </div>
  );
}
