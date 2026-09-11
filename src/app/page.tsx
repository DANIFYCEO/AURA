'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { BarChart2, Zap, ShieldAlert, Cpu } from 'lucide-react';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: '#000',
      color: '#e0e0e0',
      fontFamily: 'var(--font-mono)',
      overflowX: 'hidden',
    }}>
      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #111', zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.3em', color: '#fff' }}>AURA</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Left Candle (Green) */}
            <rect x="5.5" y="4" width="1" height="14" fill="#00e676" />
            <rect x="3" y="9" width="6" height="7" fill="#00e676" />
            
            {/* Middle Candle (Red) */}
            <rect x="11.5" y="2" width="1" height="16" fill="#ff1744" />
            <rect x="9" y="5" width="6" height="10" fill="#ff1744" />
            
            {/* Right Candle (Green) */}
            <rect x="17.5" y="7" width="1" height="15" fill="#00e676" />
            <rect x="15" y="9" width="6" height="9" fill="#00e676" />
          </svg>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section style={{
        position: 'relative', minHeight: '100vh', paddingTop: 60, paddingBottom: 60, paddingLeft: 24, paddingRight: 24,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        borderBottom: '1px solid #111',
        overflow: 'hidden',
      }}>
        {/* Background Grid */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)',
          backgroundSize: '40px 40px', opacity: 0.5,
          maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
        }} />

        {/* 3D Orbital Rings */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '150vw', maxWidth: 800,
          height: '150vw', maxHeight: 800,
          pointerEvents: 'none', zIndex: 0,
          perspective: 1000,
          opacity: 0.15,
        }}>
          <div className="ring ring-1"></div>
          <div className="ring ring-2"></div>
          <div className="ring ring-3"></div>
        </div>

        <div style={{ zIndex: 1, width: '100%', maxWidth: 900, animation: 'heroFadeInUp 0.6s ease-out forwards' }}>
          <div style={{ display: 'inline-block', padding: '4px 12px', background: '#111', border: '1px solid #333', color: '#aaa', fontSize: 10, letterSpacing: '0.15em', marginBottom: 24 }}>
            AURA V1.0 IS LIVE
          </div>
          <h1 style={{ 
            fontSize: 'clamp(1.5rem, 6vw, 5rem)', fontWeight: 800, letterSpacing: '0.05em', 
            margin: 0, lineHeight: 1.1, color: '#fff', wordBreak: 'break-word'
          }}>
            INTELLIGENCE FOR<br />
            <span style={{ color: '#00e676' }}>THE MODERN TRADER</span>
          </h1>
          <p style={{ 
            fontSize: 'clamp(12px, 2vw, 16px)', color: '#888', lineHeight: 1.6, 
            letterSpacing: '0.05em', marginTop: 32, maxWidth: 600, marginInline: 'auto' 
          }}>
            A brutalist, high-density market terminal. Real-time Binance & Yahoo feeds, integrated AI sentiment analysis, and instant pattern recognition.
          </p>
          
          <div style={{ marginTop: 48, display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link href="/terminal" style={{ textDecoration: 'none' }}>
               <button style={{
                background: '#00e676', color: '#000', border: 'none', cursor: 'pointer',
                padding: '16px 32px', fontSize: 13, fontWeight: 800, letterSpacing: '0.15em',
                boxShadow: '0 0 20px rgba(0, 230, 118, 0.4)'
              }}>
                INITIALIZE TERMINAL
              </button>
            </Link>
          </div>
          
          {/* TERMINAL MOCKUP WINDOW */}
          <div style={{
            marginTop: 80,
            width: '100%',
            maxWidth: 1000,
            marginInline: 'auto',
            background: '#050505',
            border: '1px solid #222',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            transform: 'perspective(1000px) rotateX(2deg)',
            transformOrigin: 'top center',
          }}>
            <div style={{ height: 24, background: '#111', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f56' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffbd2e' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#27c93f' }} />
              <span style={{ fontSize: 10, color: '#555', letterSpacing: '0.1em', marginLeft: 'auto' }}>AURA_TERMINAL_V1.0</span>
            </div>
            <div style={{ height: 400, background: 'linear-gradient(180deg, #0a0a0a 0%, #000 100%)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(0deg, rgba(0,230,118,0.05) 0%, transparent 100%)' }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#333', fontSize: 14, letterSpacing: '0.5em', fontWeight: 800 }}>
                 SYSTEM ONLINE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: 1 
        }}>
          {/* Feature 1 */}
          <div style={{ background: '#080808', border: '1px solid #1a1a1a', padding: 40, display: 'flex', flexDirection: 'column' }}>
            <BarChart2 size={32} color="#00e676" style={{ marginBottom: 24 }} />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '0.1em', marginBottom: 12 }}>PRO-GRADE CHARTING</h3>
            <p style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>Direct integration with TradingView Lightweight Charts. Instantly toggle between equities, crypto, and forex with zero lag.</p>
          </div>

          {/* Feature 2 */}
          <div style={{ background: '#080808', border: '1px solid #1a1a1a', padding: 40, display: 'flex', flexDirection: 'column' }}>
            <Cpu size={32} color="#40c4ff" style={{ marginBottom: 24 }} />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '0.1em', marginBottom: 12 }}>AURA INTELLIGENCE</h3>
            <p style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>Chat natively with the integrated AURA AI directly on your dashboard. It scans live pricing and news to give you instantaneous market reads.</p>
          </div>

          {/* Feature 3 */}
          <div style={{ background: '#080808', border: '1px solid #1a1a1a', padding: 40, display: 'flex', flexDirection: 'column' }}>
            <Zap size={32} color="#ffd600" style={{ marginBottom: 24 }} />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '0.1em', marginBottom: 12 }}>SENTIMENT RADAR</h3>
            <p style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>Automated NLP pipeline scoring the top 50 financial news headlines in real-time. Know when the market mood shifts before the price moves.</p>
          </div>

          {/* Feature 4 */}
          <div style={{ background: '#080808', border: '1px solid #1a1a1a', padding: 40, display: 'flex', flexDirection: 'column' }}>
            <ShieldAlert size={32} color="#ff1744" style={{ marginBottom: 24 }} />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '0.1em', marginBottom: 12 }}>BRUTALIST EFFICIENCY</h3>
            <p style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>No fluff. No rounded corners. No wasted space. Every pixel is dedicated to data density and execution speed.</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ marginTop: 'auto', padding: '40px 24px', borderTop: '1px solid #111', background: '#050505', textAlign: 'center' }}>
        <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.3em', color: '#333' }}>AURA</span>
        <div style={{ marginTop: 16, fontSize: 10, color: '#555', letterSpacing: '0.1em' }}>
          © 2026 FABER AI STUDIO.
        </div>
      </footer>
    </div>
  );
}
