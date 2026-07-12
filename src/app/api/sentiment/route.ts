import { NextRequest } from 'next/server';

const MOCK_SENTIMENT: Record<string, object[]> = {
  'AAPL': [{ title: 'Apple Reports Record Services Revenue in Q4', time_published: new Date(Date.now() - 3600000).toISOString(), overall_sentiment_score: 0.42, overall_sentiment_label: 'Bullish', source: 'Bloomberg', url: '#' }],
  'NVDA': [{ title: 'NVIDIA AI Chip Demand Accelerates into 2025', time_published: new Date(Date.now() - 7200000).toISOString(), overall_sentiment_score: 0.71, overall_sentiment_label: 'Bullish', source: 'Reuters', url: '#' }],
  'TSLA': [{ title: 'Tesla Faces Increased EV Competition in Europe', time_published: new Date(Date.now() - 1800000).toISOString(), overall_sentiment_score: -0.31, overall_sentiment_label: 'Bearish', source: 'FT', url: '#' }],
  'BTC-USD': [{ title: 'Bitcoin ETF Inflows Reach 3-Month High', time_published: new Date(Date.now() - 900000).toISOString(), overall_sentiment_score: 0.65, overall_sentiment_label: 'Bullish', source: 'CoinDesk', url: '#' }],
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker') || 'AAPL';
  const apiKey = process.env.ALPHA_VANTAGE_KEY;

  if (!apiKey) {
    return Response.json(MOCK_SENTIMENT[ticker] || MOCK_SENTIMENT['AAPL']);
  }

  try {
    // Alpha Vantage ticker format: strip -USD for crypto
    const avTicker = ticker.replace('-USD', 'X').replace('-', '');
    const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${avTicker}&limit=10&sort=LATEST&apikey=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error('Alpha Vantage error');
    const data = await res.json();

    if (data?.feed) {
      const articles = data.feed.slice(0, 8).map((item: Record<string, unknown>) => {
        const tickerSentiment = (item.ticker_sentiment as Record<string, unknown>[] | undefined)?.find(
          (ts: Record<string, unknown>) => (ts.ticker as string)?.toUpperCase() === avTicker.toUpperCase()
        );
        return {
          title: item.title,
          time_published: item.time_published,
          overall_sentiment_score: tickerSentiment ? parseFloat(tickerSentiment.ticker_sentiment_score as string) : parseFloat(item.overall_sentiment_score as string || '0'),
          overall_sentiment_label: tickerSentiment ? tickerSentiment.ticker_sentiment_label : item.overall_sentiment_label,
          source: item.source,
          url: item.url,
        };
      });
      return Response.json(articles);
    }

    throw new Error('No data from Alpha Vantage');
  } catch {
    return Response.json(MOCK_SENTIMENT[ticker] || MOCK_SENTIMENT['AAPL']);
  }
}
