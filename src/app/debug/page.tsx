'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [info, setInfo] = useState<string[]>([]);

  useEffect(() => {
    const lines: string[] = [];
    lines.push(`Screen: ${screen.width}x${screen.height}`);
    lines.push(`Window inner: ${window.innerWidth}x${window.innerHeight}`);
    lines.push(`DevicePixelRatio: ${window.devicePixelRatio}`);
    lines.push(`UserAgent: ${navigator.userAgent}`);
    
    // Check viewport meta
    const vpMeta = document.querySelector('meta[name="viewport"]');
    lines.push(`Viewport meta: ${vpMeta ? vpMeta.getAttribute('content') : 'MISSING!'}`);

    // Check if CSS media query matches
    const mq = window.matchMedia('(max-width: 950px)');
    lines.push(`Media (max-width:950px) matches: ${mq.matches}`);

    // Check errors
    lines.push(`JS is working: YES`);
    lines.push(`React hydrated: YES`);

    setInfo(lines);
  }, []);

  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: 20, background: '#000', color: '#0f0', minHeight: '100vh', fontFamily: 'monospace', fontSize: 14 }}>
      <h1 style={{ color: '#0f0', marginBottom: 20 }}>AURA DEBUG PAGE</h1>
      
      <button 
        onClick={() => setCount(c => c + 1)}
        style={{ 
          padding: '10px 20px', 
          background: '#0f0', 
          color: '#000', 
          border: 'none', 
          fontSize: 16, 
          fontWeight: 'bold',
          cursor: 'pointer',
          marginBottom: 20 
        }}
      >
        TAP ME: {count}
      </button>

      <div>
        {info.map((line, i) => (
          <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid #030' }}>
            {line}
          </div>
        ))}
      </div>

      {info.length === 0 && (
        <div style={{ color: '#f00', fontSize: 18, marginTop: 20 }}>
          ⚠ JavaScript did NOT execute. React did NOT hydrate.
        </div>
      )}
    </div>
  );
}
