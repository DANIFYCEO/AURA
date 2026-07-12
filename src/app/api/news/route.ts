import { NextRequest } from 'next/server';
import Groq from 'groq-sdk';

const MOCK_NEWS = [
  { title: 'Federal Reserve Signals Rates to Stay Higher for Longer', published_at: new Date(Date.now() - 1200000).toISOString(), source: { name: 'Reuters' }, url: '#', description: 'Fed Chair Powell indicated interest rates will remain elevated as inflation stays above the 2% target.' },
  { title: 'Apple Plans Major AI Expansion into Enterprise Software', published_at: new Date(Date.now() - 3600000).toISOString(), source: { name: 'WSJ' }, url: '#', description: 'Apple is set to unveil a suite of AI tools targeting enterprise customers, a market dominated by Microsoft.' },
  { title: 'NVIDIA H100 Supply Constraints Easing as New Fabs Come Online', published_at: new Date(Date.now() - 5400000).toISOString(), source: { name: 'Bloomberg' }, url: '#', description: 'TSMC production ramp for NVIDIA\'s flagship AI chip is accelerating.' },
  { title: 'Tesla Lowers Prices Again in China to Combat Local Competition', published_at: new Date(Date.now() - 9000000).toISOString(), source: { name: 'FT' }, url: '#', description: 'The price cuts pressure margins as BYD continues to gain market share.' },
  { title: 'S&P 500 Hits Fresh All-Time High as Tech Leads Gains', published_at: new Date(Date.now() - 10800000).toISOString(), source: { name: 'CNBC' }, url: '#', description: 'Broad market rally led by semiconductor stocks pushed the index to new highs.' },
  { title: 'Ethereum Upgrade Reduces Transaction Fees by 80%', published_at: new Date(Date.now() - 14400000).toISOString(), source: { name: 'Decrypt' }, url: '#', description: 'The Dencun upgrade\'s blob transactions have dramatically lowered L2 costs.' },
  { title: 'Microsoft Cloud Revenue Beats Estimates, AI Demand Surges', published_at: new Date(Date.now() - 18000000).toISOString(), source: { name: 'Bloomberg' }, url: '#', description: 'Azure growth accelerated to 31% on AI workload demand from enterprise clients.' },
  { title: 'Gold Prices Surge Past $2400 Amid Geopolitical Tensions', published_at: new Date(Date.now() - 21600000).toISOString(), source: { name: 'Reuters' }, url: '#', description: 'Investors flock to safe-haven assets as global uncertainty increases.' },
  { title: 'Consumer Confidence Drops Unexpectedly in Latest Survey', published_at: new Date(Date.now() - 25200000).toISOString(), source: { name: 'WSJ' }, url: '#', description: 'Rising gas prices and inflation fears dented consumer outlook for the quarter.' },
  { title: 'Amazon Announces New Robotics Division for Warehouse Automation', published_at: new Date(Date.now() - 28800000).toISOString(), source: { name: 'The Verge' }, url: '#', description: 'The e-commerce giant aims to fully automate logistics within a decade.' },
];

async function scoreHeadlinesWithSLM(articles: any[]) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || articles.length === 0) return articles;

  try {
    const groq = new Groq({ apiKey });
    const headlinesList = articles.map((a, i) => `[${i}] ${a.title}`).join('\n');
    
    const prompt = `Analyze the sentiment of the following financial headlines. 
Return a JSON object with a single key "scores" containing an array of numbers. 
Each number must be between -1.0 (extremely negative/bearish) and 1.0 (extremely positive/bullish), corresponding to the exact order of the headlines.
Example: {"scores": [0.8, -0.4, 0.0, 0.2]}

Headlines:
${headlinesList}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content || '{"scores":[]}';
    const parsed = JSON.parse(content);
    const scores = parsed.scores || [];

    // Inject the SLM scores back into the articles array
    return articles.map((a, i) => ({
      ...a,
      overall_sentiment_score: typeof scores[i] === 'number' ? scores[i] : 0,
      entities: [{ symbol: 'AI_SCORED', sentiment_score: typeof scores[i] === 'number' ? scores[i] : 0 }]
    }));
  } catch (err) {
    console.error("SLM Scoring failed:", err);
    return articles;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get('symbols') || '';
  const apiKey = process.env.MARKETAUX_KEY;

  let rawData = MOCK_NEWS;

  if (apiKey) {
    try {
      const cleanSymbols = symbols.split(',').map(s => s.replace('-USD', '')).join(',');
      const url = `https://api.marketaux.com/v1/news/all?symbols=${cleanSymbols}&language=en&limit=50&api_token=${apiKey}`;
      const res = await fetch(url, { next: { revalidate: 300 } });
      if (res.ok) {
        const payload = await res.json();
        if (payload?.data?.length > 0) {
          rawData = payload.data;
        }
      }
    } catch {
      // Fallback to mock on network error
    }
  }

  // Pass through our fast 8B model to score sentiment natively
  const scoredData = await scoreHeadlinesWithSLM(rawData);

  return Response.json({ data: scoredData });
}
