import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MOCK_ANALYSIS: Record<string, string> = {
  default: `◆ AURA MARKET BRIEF — SYSTEM ONLINE

MACRO ENVIRONMENT: The Federal Reserve has signaled a cautious approach to rate cuts with inflation remaining above the 2% target. Equity markets continue to price in resilient corporate earnings despite elevated borrowing costs.

SECTOR ROTATION: Technology and AI-adjacent names are leading current market action. Semiconductor supply constraints are easing, which is bullish for the broader tech complex. Watch NVDA as a bellwether — it remains the highest-conviction AI infrastructure play.

RISK FACTORS: Geopolitical tensions in key semiconductor supply chain regions. Credit card delinquency rates ticking up — watch the consumer spending narrative carefully.

CRYPTO: Bitcoin's spot ETF approval has fundamentally changed the institutional access landscape. The correlation between BTC and risk-on equities is increasing, suggesting macro sentiment is the primary driver at current levels.

AI ASSESSMENT: Overall market posture is CAUTIOUSLY BULLISH. Momentum is intact but valuations at the top of their historical range require earnings to continue delivering.

◆ END BRIEF`
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { ticker, price, changePercent, sentiment, newsHeadlines } = body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ analysis: MOCK_ANALYSIS.default });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are AURA — a brutally honest, data-driven market intelligence AI for FABER AI Studio. Your tone is terse, analytical, and precise. No fluff. No disclaimers.

Analyze the following market data and give a concise intelligence brief:

TICKER: ${ticker}
CURRENT PRICE: $${price}
24H CHANGE: ${changePercent > 0 ? '+' : ''}${changePercent?.toFixed(2)}%
NEWS SENTIMENT SCORE: ${sentiment}
RECENT HEADLINES: ${newsHeadlines?.join(' | ')}

Provide a structured brief with:
1. SIGNAL: (BULLISH / BEARISH / NEUTRAL) with one-line justification
2. KEY DRIVERS: 2-3 bullet points on what's moving price
3. RISK FACTORS: 1-2 bullet points on key risks
4. LEVELS TO WATCH: Key support/resistance commentary
5. AURA VERDICT: One decisive sentence

Keep the entire response under 200 words. Use uppercase for emphasis. Format as terminal text.`;

    const result = await model.generateContent(prompt);
    const analysis = result.response.text();
    return Response.json({ analysis });
  } catch (err) {
    console.error('Gemini error:', err);
    return Response.json({ analysis: MOCK_ANALYSIS.default });
  }
}
