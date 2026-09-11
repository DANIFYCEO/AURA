import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, context, mode } = body;

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      const keys = Object.keys(process.env).filter(k => k.includes('GROQ') || k.includes('KEY'));
      return Response.json({ error: `No GROQ_API_KEY configured. (Vercel sees: ${keys.join(', ')})` }, { status: 500 });
    }

    let systemPrompt = `You are AURA — the market intelligence engine for FABER AI Studio.

Your voice: terse, direct, data-backed. No filler, no corporate hedge-speak, no "as an AI" disclaimers.

Your structure, every response:
1. State the current data point(s) driving the read (price action, volume, sentiment, news).
2. State what it implies — the bull case AND the bear case, briefly.
3. State a confidence level in plain terms (e.g. "strong signal," "mixed," "low conviction").
4. State what would invalidate this read (a level, an event, a data point to watch).

Hard rules:
- Never say "buy," "sell," "enter," or "exit." Describe the setup, not the action.
- Never state a prediction as certain. Markets are probabilistic — say so when it matters.
- If asked directly "should I buy/sell X," redirect to what the data shows and what the user should personally weigh, not a directive.
- Always ground claims in the live data provided via UI Context.

Live UI Context:
${context || 'No specific ticker context provided.'}
`;

    if (mode === 'beginner') {
      systemPrompt += `\nBEGINNER MODE IS ACTIVE: You MUST speak in extremely simple, layman's terms. Explain everything as if you are talking to an absolute beginner. Strip away ALL Wall Street jargon. If you must use a trading term, define it immediately using a simple real-world analogy. Instead of "bullish divergence," say "the price is going down but the underlying buying pressure is building up, which is a good sign." Be educational, clear, and very easy to understand.`;
    } else {
      systemPrompt += `\nPRO MODE IS ACTIVE: Drop all explainers. Maximize data density and use technical shorthand. Assume the user is an institutional trader.`;
    }

    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content
      }))
    ];

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: groqMessages,
        stream: true,
        max_tokens: 1000
      })
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq upstream error:', groqRes.status, errText);
      return Response.json({ error: `Groq error ${groqRes.status}: ${errText}` }, { status: 500 });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = decoder.decode(chunk);
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const rawData = line.slice(6).trim();
            if (rawData === '[DONE]') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              break;
            }
            try {
              const parsed = JSON.parse(rawData);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: content })}\n\n`));
              }
            } catch {
              // ignore partial json chunks
            }
          }
        }
      }
    });

    return new Response(groqRes.body?.pipeThrough(transformStream), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (err: any) {
    console.error('API route error:', err);
    return Response.json({ error: `Server Error: ${String(err.message || err)}` }, { status: 500 });
  }
}
