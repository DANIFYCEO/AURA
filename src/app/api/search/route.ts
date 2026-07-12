import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  
  if (!q) {
    return NextResponse.json({ results: [] });
  }

  try {
    const res = await fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=6&newsCount=0`);
    if (!res.ok) throw new Error('Failed to fetch from Yahoo Search');
    const data = await res.json();
    
    const results = (data.quotes || []).map((quote: any) => ({
      symbol: quote.symbol,
      shortname: quote.shortname || quote.longname || quote.symbol,
      typeDisp: quote.quoteType || 'EQUITY',
      exchange: quote.exchange || 'N/A'
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
