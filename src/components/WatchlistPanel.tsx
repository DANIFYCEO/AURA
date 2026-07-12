'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuraStore } from '@/store/useAuraStore';
import { formatPrice, formatPct, formatChange } from '@/lib/formatters';
import { calculateAuraScore, getAuraScoreColor } from '@/lib/scoring';

type Quote = {
  symbol: string;
  shortName: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  marketCap: number;
};

function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export default function WatchlistPanel() {
  const { watchlist, activeTicker, setActiveTicker, addToWatchlist, removeFromWatchlist } = useAuraStore();
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchInput.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchInput)}`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  const handleAddTicker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const symbol = searchInput.trim().toUpperCase();
    addToWatchlist({ symbol, name: symbol, type: symbol.includes('USD') || symbol.includes('-') ? 'CRYPTO' : 'EQUITY' });
    setSearchInput('');
  };

  const fetchQuotes = useCallback(async () => {
    const symbols = watchlist.map((t) => t.symbol).join(',');
    try {
      const res = await fetch(`/api/market?symbols=${symbols}`);
      const data: Quote[] = await res.json();
      const map: Record<string, Quote> = {};
      data.forEach((q) => (map[q.symbol] = q));
      setQuotes(map);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [watchlist]);

  useEffect(() => {
    fetchQuotes();
    const iv = setInterval(fetchQuotes, 30000);
    return () => clearInterval(iv);
  }, [fetchQuotes]);

  return (
    <div className="panel" style={{ height: '100%' }}>
      <div className="panel-header">
        <span className="panel-header-label">◆ WATCHLIST</span>
        <span style={{ fontSize: 9, color: '#333', letterSpacing: '0.05em' }}>
          {loading ? 'SYNCING...' : `${watchlist.length} ASSETS`}
        </span>
      </div>

      <div style={{ padding: '8px 12px', borderBottom: '1px solid #1a1a1a', background: '#0a0a0a', flexShrink: 0, position: 'relative' }}>
        <form onSubmit={handleAddTicker} style={{ display: 'flex', gap: 6 }}>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="ADD TICKER (e.g. AMZN, EURUSD=X)"
            className="terminal-input"
            style={{ flex: 1, padding: '4px 8px', fontSize: 10, border: '1px solid #222' }}
          />
          <button type="submit" style={{
            background: '#e8e8e8', color: '#000', border: 'none', padding: '0 12px',
            fontSize: 9, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.1em'
          }}>
            ADD
          </button>
        </form>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && searchInput.trim().length >= 2 && (
          <div style={{
            position: 'absolute', top: '100%', left: 12, right: 12, background: '#0d0d0d', border: '1px solid #222', 
            borderTop: 'none', zIndex: 50, maxHeight: 200, overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}>
            {searchResults.map((res, i) => (
              <div 
                key={i}
                onClick={() => {
                  addToWatchlist({ symbol: res.symbol, name: res.shortname, type: res.symbol.includes('=X') || res.symbol.includes('-') ? 'CRYPTO' : 'EQUITY' });
                  setSearchInput('');
                  setSearchResults([]);
                }}
                style={{
                  padding: '8px 10px', borderBottom: '1px solid #111', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1a1a')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#0d0d0d')}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>{res.symbol}</span>
                  <span style={{ fontSize: 9, color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>{res.shortname}</span>
                </div>
                <span style={{ fontSize: 8, color: '#444', padding: '2px 4px', border: '1px solid #222', background: '#000' }}>{res.typeDisp}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 50px auto auto', gap: 8,
        padding: '5px 12px', borderBottom: '1px solid #0f0f0f',
        fontSize: 9, color: '#2a2a2a', letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0,
      }}>
        <span>ASSET</span>
        <span style={{ textAlign: 'center' }}>AURA</span>
        <span style={{ textAlign: 'right' }}>PRICE</span>
        <span style={{ textAlign: 'right', minWidth: 58 }}>CHG%</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {watchlist.map((ticker) => (
          <WatchlistRow 
            key={ticker.symbol} 
            ticker={ticker} 
            q={quotes[ticker.symbol]} 
            isActive={activeTicker === ticker.symbol} 
            setActiveTicker={setActiveTicker} 
            removeFromWatchlist={removeFromWatchlist} 
          />
        ))}
      </div>

      <div style={{ padding: '6px 12px', borderTop: '1px solid #0f0f0f', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 9, color: '#222' }}>AUTO-REFRESH 30s</span>
        <span style={{ fontSize: 9, color: '#222' }}>YAHOO FINANCE</span>
      </div>
    </div>
  );
}

function WatchlistRow({ ticker, q, isActive, setActiveTicker, removeFromWatchlist }: any) {
  const pct = q?.regularMarketChangePercent ?? 0;
  const change = q?.regularMarketChange ?? 0;
  const price = q?.regularMarketPrice;
  const prevPrice = usePrevious(price);
  
  const isUp = pct > 0;
  const isDown = pct < 0;
  const mockSentiment = ((ticker.symbol.length * 7) % 200 - 100) / 100;
  const auraScore = calculateAuraScore({ priceChangePct: pct, sentimentScore: mockSentiment });

  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (price && prevPrice && price !== prevPrice) {
      setFlash(price > prevPrice ? 'up' : 'down');
      const t = setTimeout(() => setFlash(null), 1000);
      return () => clearTimeout(t);
    }
  }, [price, prevPrice]);

  return (
    <div
      onClick={() => setActiveTicker(ticker.symbol)}
      style={{
        width: '100%', display: 'grid', gridTemplateColumns: '1fr 45px 80px 65px',
        gap: 8, alignItems: 'center', padding: '9px 12px',
        borderBottom: '1px solid #0a0a0a',
        background: isActive ? '#0f0f0f' : (flash === 'up' ? 'rgba(0,230,118,0.1)' : flash === 'down' ? 'rgba(255,23,68,0.1)' : 'transparent'),
        cursor: 'pointer',
        borderLeft: isActive ? '2px solid #e8e8e8' : '2px solid transparent',
        transition: 'background 0.3s ease-out', textAlign: 'left',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: isActive ? '#fff' : '#bbb', letterSpacing: '0.04em' }}>
            {ticker.symbol.replace('-USD', '')}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); removeFromWatchlist(ticker.symbol); }}
            style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', fontSize: 10, padding: '0 4px' }}
            title="Remove from Watchlist"
          >
            ×
          </button>
        </div>
        <div style={{ fontSize: 9, color: '#383838', marginTop: 1 }}>
          {ticker.type === 'crypto' ? 'CRYPTO' : ticker.type === 'etf' ? 'ETF' : 'EQUITY'}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{
          fontSize: 7, fontWeight: 700, padding: '1px 3px',
          border: `1px solid ${getAuraScoreColor(auraScore)}`,
          color: getAuraScoreColor(auraScore),
          background: `${getAuraScoreColor(auraScore)}15`,
          textAlign: 'center',
          minWidth: '40px'
        }}>
          {auraScore}
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 12, color: flash === 'up' ? '#00e676' : flash === 'down' ? '#ff1744' : '#d8d8d8', transition: 'color 0.3s ease-out' }}>
          {price ? `$${formatPrice(price)}` : '—'}
        </div>
        <div style={{ fontSize: 9, color: isUp ? '#00a84a' : isDown ? '#b31232' : '#333', marginTop: 1 }}>
          {q ? formatChange(change) : ''}
        </div>
      </div>

      <div style={{ minWidth: 58, textAlign: 'right' }}>
        <span style={{
          fontSize: 11, fontWeight: 700,
          color: isUp ? '#00e676' : isDown ? '#ff1744' : '#555',
          background: isUp ? 'rgba(0,230,118,0.06)' : isDown ? 'rgba(255,23,68,0.06)' : 'transparent',
          padding: '1px 5px',
        }}>
          {q ? formatPct(pct) : '—'}
        </span>
      </div>
    </div>
  );
}
