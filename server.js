const path = require('path');

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    
    // API Routes
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(req, url);
    }
    
    // Static file serving
    const filePath = url.pathname === '/' ? '/index.html' : url.pathname;
    const file = Bun.file(path.join(__dirname, filePath));
    
    try {
      const exists = await file.exists();
      if (!exists) {
        return new Response('Not Found', { status: 404 });
      }
      
      const mimeType = getMimeType(filePath);
      return new Response(file, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'no-cache'
        }
      });
    } catch (error) {
      return new Response('Server Error', { status: 500 });
    }
  }
});

async function handleAPI(req, url) {
  const response = {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  };
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: response.headers });
  }
  
  try {
    if (url.pathname === '/api/quote') {
      const symbol = url.searchParams.get('symbol');
      if (!symbol) {
        return new Response(JSON.stringify({ error: 'Symbol required' }), { 
          status: 400, 
          headers: response.headers 
        });
      }
      
      const quote = await getStockQuote(symbol);
      return new Response(JSON.stringify(quote), { headers: response.headers });
    }
    
    if (url.pathname === '/api/search') {
      const query = url.searchParams.get('q');
      if (!query) {
        return new Response(JSON.stringify({ error: 'Query required' }), { 
          status: 400, 
          headers: response.headers 
        });
      }
      
      const results = await searchStocks(query);
      return new Response(JSON.stringify(results), { headers: response.headers });
    }
    
    return new Response(JSON.stringify({ error: 'Not Found' }), { 
      status: 404, 
      headers: response.headers 
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500, 
      headers: response.headers 
    });
  }
}

async function getStockQuote(symbol) {
  try {
    // Using Yahoo Finance API (free tier)
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
    const data = await response.json();
    
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error('No data found');
    }
    
    const result = data.chart.result[0];
    const meta = result.meta;
    const quote = result.indicators.quote[0];
    
    return {
      symbol: meta.symbol,
      price: meta.regularMarketPrice,
      change: meta.regularMarketPrice - meta.previousClose,
      changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
      volume: meta.regularMarketVolume,
      marketCap: meta.marketCap,
      high: meta.regularMarketDayHigh,
      low: meta.regularMarketDayLow,
      open: meta.regularMarketOpen,
      previousClose: meta.previousClose,
      timestamp: Date.now()
    };
  } catch (error) {
    // Fallback mock data for development
    return {
      symbol: symbol.toUpperCase(),
      price: 150.00 + Math.random() * 10,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      volume: Math.floor(Math.random() * 1000000),
      marketCap: Math.floor(Math.random() * 1000000000),
      high: 155.00,
      low: 148.00,
      open: 151.00,
      previousClose: 149.50,
      timestamp: Date.now()
    };
  }
}

async function searchStocks(query) {
  try {
    const response = await fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${query}`);
    const data = await response.json();
    
    return data.quotes.slice(0, 10).map(quote => ({
      symbol: quote.symbol,
      name: quote.shortname || quote.longname,
      type: quote.typeDisp
    }));
  } catch (error) {
    // Fallback mock data
    return [
      { symbol: query.toUpperCase(), name: `${query.toUpperCase()} Company`, type: 'Equity' }
    ];
  }
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
  };
  return mimeTypes[ext] || 'text/plain';
}

console.log(`🐱 NEKO-TICKER server running on http://localhost:3000`);