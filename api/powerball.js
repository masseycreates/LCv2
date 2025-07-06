// api/powerball.js - Real data only, no fallbacks
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      success: false
    });
  }

  console.log('=== PowerBall API Request Started ===');
  console.log('Timestamp:', new Date().toISOString());

  // Real lottery data sources only
  const dataSources = [
    {
      name: 'NY State Open Data API',
      url: 'https://data.ny.gov/resource/d6yy-54nr.json?$order=draw_date%20DESC&$limit=3',
      timeout: 15000,
      priority: 1
    },
    {
      name: 'NY State Historical API',
      url: 'https://data.ny.gov/resource/dhwa-m6y4.json?$order=date%20DESC&$limit=3',
      timeout: 15000,
      priority: 2
    }
  ];

  let jackpotData = null;
  let latestNumbers = null;
  let sourceUsed = null;
  let errors = [];

  // Try each real data source
  for (const source of dataSources) {
    try {
      console.log(`--- Trying ${source.name} ---`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), source.timeout);
      
      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LotteryAnalyzer/2.0)',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extract data
      const result = extractLotteryData(data, source.name);
      
      if (result.jackpot || result.latestNumbers) {
        jackpotData = result.jackpot;
        latestNumbers = result.latestNumbers;
        sourceUsed = source.name;
        console.log(`✅ Success with ${source.name}`);
        break;
      } else {
        throw new Error('No valid lottery data found in response');
      }
      
    } catch (error) {
      const errorMsg = error.name === 'AbortError' ? 'Request timeout' : error.message;
      console.log(`❌ ${source.name} failed: ${errorMsg}`);
      errors.push(`${source.name}: ${errorMsg}`);
    }
  }

  // If no real data sources worked, return error
  if (!jackpotData && !latestNumbers) {
    console.log('❌ All data sources failed');
    
    return res.status(503).json({
      success: false,
      error: 'Lottery data unavailable',
      message: 'Unable to retrieve current lottery data from any official sources. Please try again later.',
      details: 'All external lottery APIs are currently unavailable or experiencing issues.',
      errors: errors,
      timestamp: new Date().toISOString(),
      retryAfter: 300
    });
  }

  // Calculate next drawing
  const nextDrawing = getNextDrawingInfo();

  const result = {
    success: true,
    jackpot: jackpotData,
    latestNumbers: latestNumbers,
    nextDrawing: `${nextDrawing.date} @ ${nextDrawing.time}`,
    source: sourceUsed,
    timestamp: new Date().toISOString(),
    message: 'Current lottery data retrieved successfully from official sources'
  };

  console.log('=== Final Result ===');
  console.log('Success:', result.success);
  console.log('Source:', result.source);

  res.setHeader('Cache-Control', 's-maxage=900, max-age=900');
  return res.status(200).json(result);
}

// Extract lottery data from different source formats
function extractLotteryData(data, sourceName) {
  const result = { jackpot: null, latestNumbers: null };
  
  try {
    if (Array.isArray(data) && data.length > 0) {
      const latest = data[0];
      
      // Extract jackpot
      if (latest.jackpot) {
        const amount = parseFloat(latest.jackpot.toString().replace(/[$,]/g, ''));
        if (amount >= 20000000 && amount <= 5000000000) {
          const cashValue = latest.cash_value ? 
            parseFloat(latest.cash_value.toString().replace(/[$,]/g, '')) : 
            Math.round(amount * 0.6);
          
          result.jackpot = {
            amount: amount,
            cashValue: cashValue,
            formatted: formatCurrency(amount),
            cashFormatted: formatCurrency(cashValue)
          };
        }
      }
      
      // Extract latest numbers
      if (latest.winning_numbers && latest.draw_date) {
        const numberParts = latest.winning_numbers.trim().split(/\s+/);
        
        if (numberParts.length >= 6) {
          const numbers = numberParts.slice(0, 5).map(n => parseInt(n));
          const powerball = parseInt(numberParts[5]);
          
          if (isValidPowerballNumbers(numbers, powerball)) {
            result.latestNumbers = {
              numbers: numbers.sort((a, b) => a - b),
              powerball: powerball,
              drawDate: latest.draw_date.split('T')[0],
              formatted: `${numbers.sort((a, b) => a - b).join(', ')} | PB: ${powerball}`,
              multiplier: latest.multiplier || null
            };
          }
        }
      }
    }
  } catch (error) {
    console.log(`Data extraction error for ${sourceName}:`, error.message);
  }
  
  return result;
}

// Validate Powerball numbers
function isValidPowerballNumbers(numbers, powerball) {
  return Array.isArray(numbers) && 
         numbers.length === 5 && 
         numbers.every(n => Number.isInteger(n) && n >= 1 && n <= 69) &&
         Number.isInteger(powerball) && powerball >= 1 && powerball <= 26 &&
         new Set(numbers).size === 5;
}

// Helper functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function getNextDrawingInfo() {
  const now = new Date();
  const nextWednesday = new Date(now);
  const nextSaturday = new Date(now);
  
  nextWednesday.setDate(now.getDate() + (3 - now.getDay() + 7) % 7);
  nextWednesday.setHours(23, 0, 0, 0);
  
  nextSaturday.setDate(now.getDate() + (6 - now.getDay() + 7) % 7);
  nextSaturday.setHours(23, 0, 0, 0);
  
  const nextDraw = nextWednesday < nextSaturday ? nextWednesday : nextSaturday;
  
  return {
    date: nextDraw.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    time: '11:00 PM ET',
    timestamp: nextDraw.getTime()
  };
}