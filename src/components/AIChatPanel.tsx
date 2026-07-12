'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuraStore } from '@/store/useAuraStore';

type Message = { role: 'user' | 'assistant'; content: string };

export default function AIChatPanel() {
  const { activeTicker, setAiContext, userMode } = useAuraStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '◆ AURA\n\nMarket intelligence terminal ready. I have access to live prices, news sentiment, and macro data.\n\nAsk me anything — specific tickers, macro reads, risk assessment, or trade setups.' },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [context, setContext] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-fetch context when ticker changes
  useEffect(() => {
    const buildContext = async () => {
      try {
        const [quoteRes, sentimentRes] = await Promise.all([
          fetch(`/api/market?symbols=${activeTicker}`),
          fetch(`/api/sentiment?ticker=${activeTicker}`),
        ]);
        const quotes = await quoteRes.json();
        const sentiment = await sentimentRes.json();
        const q = quotes[0];
        const headlines = sentiment.slice(0, 3).map((s: { title: string }) => s.title).join('; ');
        const ctx = `Active ticker: ${activeTicker} | Price: $${q?.regularMarketPrice?.toFixed(2) ?? 'N/A'} | 24h: ${q?.regularMarketChangePercent?.toFixed(2) ?? '0'}% | Recent headlines: ${headlines}`;
        setContext(ctx);
        setAiContext(ctx);
      } catch {
        setContext(`Active ticker: ${activeTicker}`);
      }
    };
    buildContext();
  }, [activeTicker, setAiContext]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;
    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);

    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, context, mode: userMode }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${res.status}`);
      }
      if (!res.body) throw new Error('No stream');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: updated[updated.length - 1].content + parsed.text,
                  };
                  return updated;
                });
              }
            } catch { /* ignore */ }
          }
        }
      }
    } catch (e: any) {
      console.error(e);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { 
          ...updated[updated.length - 1], 
          content: `◆ ERROR: ${e?.message || 'Could not reach AI'}` 
        };
        return updated;
      });
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  }, [messages, streaming, context, userMode]);

  const QUICK_PROMPTS = [
    `Analyze ${activeTicker}`,
    'Market sentiment today?',
    'Biggest risk right now?',
    'BTC vs ETH outlook?',
  ];

  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="panel-header">
        <span className="panel-header-label">◆ AURA AI ANALYST</span>
        {streaming && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ffd600', display: 'inline-block' }} className="blink" />
            <span style={{ fontSize: 9, color: '#333', letterSpacing: '0.08em' }}>PROCESSING</span>
          </div>
        )}
      </div>

      {/* Context bar */}
      <div style={{ padding: '4px 12px', borderBottom: '1px solid #0f0f0f', flexShrink: 0 }}>
        <span style={{ fontSize: 9, color: '#2a2a2a', letterSpacing: '0.03em' }}>
          CTX: {context || `LOADING ${activeTicker}...`}
        </span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {msg.role === 'user' && (
              <span style={{ fontSize: 9, color: '#2a2a2a', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                ▶ INPUT
              </span>
            )}
            <div style={{
              fontSize: 12,
              color: msg.role === 'user' ? '#888' : '#d8d8d8',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              paddingLeft: msg.role === 'assistant' ? 0 : 8,
              borderLeft: msg.role === 'user' ? '1px solid #1a1a1a' : 'none',
            }}>
              {msg.content}
              {streaming && i === messages.length - 1 && msg.role === 'assistant' && (
                <span className="blink" style={{ color: '#00e676' }}>█</span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {!streaming && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '6px 12px', borderTop: '1px solid #0f0f0f', flexShrink: 0 }}>
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              style={{
                fontSize: 9, padding: '3px 7px', border: '1px solid #1a1a1a',
                background: 'transparent', color: '#444', cursor: 'pointer',
                fontFamily: 'inherit', letterSpacing: '0.04em',
                transition: 'all 0.1s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#888'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#333'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#444'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#1a1a1a'; }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display: 'flex', alignItems: 'center', borderTop: '1px solid #1a1a1a', flexShrink: 0 }}>
        <span style={{ padding: '0 10px', color: '#333', fontSize: 12, flexShrink: 0 }}>▶</span>
        <input
          ref={inputRef}
          className="terminal-input"
          placeholder={streaming ? 'AURA is thinking...' : `Ask AURA about ${activeTicker.replace('-USD', '')}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(input); }}
          disabled={streaming}
          style={{ borderTop: 'none' }}
        />
      </div>
    </div>
  );
}
