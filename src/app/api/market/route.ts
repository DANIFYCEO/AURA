import { NextRequest } from 'next/server';

// Mock data for when APIs are not available
const MOCK_QUOTES: Record<string, object> = {
  'AAPL': { symbol: 'AAPL', regularMarketPrice: 213.07, regularMarketChange: 3.21, regularMarketChangePercent: 1.53, regularMarketVolume: 54200000, marketCap: 3290000000000, shortName: 'Apple Inc.' },
  'NVDA': { symbol: 'NVDA', regularMarketPrice: 875.43, regularMarketChange: 18.72, regularMarketChangePercent: 2.18, regularMarketVolume: 42100000, marketCap: 2160000000000, shortName: 'NVIDIA Corp.' },
  'TSLA': { symbol: 'TSLA', regularMarketPrice: 248.50, regularMarketChange: -4.12, regularMarketChangePercent: -1.63, regularMarketVolume: 98700000, marketCap: 791000000000, shortName: 'Tesla Inc.' },
  'MSFT': { symbol: 'MSFT', regularMarketPrice: 441.80, regularMarketChange: 2.15, regularMarketChangePercent: 0.49, regularMarketVolume: 18900000, marketCap: 3280000000000, shortName: 'Microsoft Corp.' },
  'SPY': { symbol: 'SPY', regularMarketPrice: 561.30, regularMarketChange: 1.83, regularMarketChangePercent: 0.33, regularMarketVolume: 67200000, marketCap: 0, shortName: 'SPDR S&P 500 ETF' },
  'BTC-USD': { symbol: 'BTC-USD', regularMarketPrice: 67432.18, regularMarketChange: 1394.22, regularMarketChangePercent: 2.11, regularMarketVolume: 28900000000, marketCap: 1330000000000, shortName: 'Bitcoin USD' },
  'ETH-USD': { symbol: 'ETH-USD', regularMarketPrice: 3521.44, regularMarketChange: 87.33, regularMarketChangePercent: 2.54, regularMarketVolume: 14200000000, marketCap: 422000000000, shortName: 'Ethereum USD' },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get('symbols') || 'AAPL,NVDA,TSLA,MSFT,SPY,BTC-USD,ETH-USD';
  const symbols = symbolsParam.split(',').map((s) => s.trim());

  try {
    // Try to fetch from Yahoo Finance (no API key needed)
    const results: object[] = [];

    for (const symbol of symbols) {
      // 1. BINANCE ROUTE FOR CRYPTO
      if (symbol.includes('-USD') || symbol === 'BTC' || symbol === 'ETH') {
        const binanceSymbol = symbol.replace('-USD', '') + 'USDT';
        try {
          const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`, { next: { revalidate: 30 } });
          if (!res.ok) throw new Error('Binance unavailable');
          const data = await res.json();
          results.push({
            symbol: symbol,
            regularMarketPrice: parseFloat(data.lastPrice),
            regularMarketChange: parseFloat(data.priceChange),
            regularMarketChangePercent: parseFloat(data.priceChangePercent),
            regularMarketVolume: parseFloat(data.volume),
            marketCap: 0,
            shortName: symbol,
            previousClose: parseFloat(data.prevClosePrice),
            dayHigh: parseFloat(data.highPrice),
            dayLow: parseFloat(data.lowPrice),
          });
        } catch {
          const mock = MOCK_QUOTES[symbol];
          results.push(mock || { symbol, regularMarketPrice: 0, regularMarketChange: 0, regularMarketChangePercent: 0, regularMarketVolume: 0, marketCap: 0, shortName: symbol });
        }
        continue;
      }

      // 2. YAHOO ROUTE FOR EQUITIES
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          next: { revalidate: 30 },
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error('Yahoo Finance unavailable');

        const data = await res.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (!meta) throw new Error('No data');

        results.push({
          symbol: meta.symbol || symbol,
          regularMarketPrice: meta.regularMarketPrice || 0,
          regularMarketChange: (meta.regularMarketPrice || 0) - (meta.chartPreviousClose || 0),
          regularMarketChangePercent: (((meta.regularMarketPrice || 0) - (meta.chartPreviousClose || 0)) / (meta.chartPreviousClose || 1)) * 100,
          regularMarketVolume: meta.regularMarketVolume || 0,
          marketCap: meta.marketCap || 0,
          shortName: meta.shortName || symbol,
          previousClose: meta.chartPreviousClose || 0,
          dayHigh: meta.regularMarketDayHigh || 0,
          dayLow: meta.regularMarketDayLow || 0,
        });
      } catch {
        // Fallback to mock data
        const mock = MOCK_QUOTES[symbol];
        if (mock) results.push(mock);
        else results.push({ symbol, regularMarketPrice: 0, regularMarketChange: 0, regularMarketChangePercent: 0, regularMarketVolume: 0, marketCap: 0, shortName: symbol });
      }
    }

    return Response.json(results);
  } catch {
    // Return all mock data
    return Response.json(symbols.map((s) => MOCK_QUOTES[s] || { symbol: s, regularMarketPrice: 0, regularMarketChange: 0, regularMarketChangePercent: 0, regularMarketVolume: 0, marketCap: 0, shortName: s }));
  }
}
