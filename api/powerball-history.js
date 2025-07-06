// api/powerball-history.js - Real data only, no fallbacks
export default async function handler(req, res) {
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

  try {
    const requestedLimit = parseInt(req.query.limit) || 150;
    const limit = Math.min(Math.max(requestedLimit, 25), 2000);
    
    console.log(`=== Historical API Request Started (${limit} drawings) ===`);
    
    const historicalSources = [
      {
        name: 'NY State Open Data Portal',
        url: `https://data.ny.gov/resource/d6yy-54nr.json?$order=draw_date%20DESC&$limit=${Math.min(limit * 2, 2000)}`,
        timeout: 30000,
        priority: 1
      }
    ];

    let historicalData = [];
    let sourceUsed = null;
    let errors = [];

    // Try data source
    for (const source of historicalSources) {
      try {
        console.log(`--- Attempting ${source.name} ---`);
        
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
        
        const rawData = await response.json();
        const processedData = processHistoricalData(rawData, limit);
        
        if (processedData && processedData.length > 0) {
          historicalData = processedData;
          sourceUsed = source.name;
          console.log(`✅ Success: Retrieved ${processedData.length} drawings`);
          break;
        } else {
          throw new Error('No valid historical data found');
        }
        
      } catch (error) {
        const errorMsg = error.name === 'AbortError' ? 'Request timeout' : error.message;
        console.log(`❌ ${source.name} failed: ${errorMsg}`);
        errors.push(`${source.name}: ${errorMsg}`);
      }
    }

    // If no real data sources worked, return error
    if (historicalData.length === 0) {
      console.log('❌ All historical data sources failed');
      
      return res.status(503).json({
        success: false,
        error: 'Historical lottery data unavailable',
        message: 'Unable to retrieve historical lottery data from any official sources. Please try again later.',
        details: 'All external lottery data APIs are currently unavailable or experiencing issues.',
        errors: errors,
        timestamp: new Date().toISOString(),
        retryAfter: 600
      });
    }

    // Generate analysis from real data
    const analysis = generateAnalysis(historicalData);

    const result = {
      success: true,
      drawings: historicalData,
      analysis: analysis,
      source: sourceUsed,
      timestamp: new Date().toISOString(),
      processingInfo: {
        requested: limit,
        processed: historicalData.length,
        dataSource: sourceUsed
      },
      message: `Historical lottery data retrieved successfully from ${sourceUsed}`
    };

    res.setHeader('Cache-Control', 's-maxage=3600, max-age=3600');
    return res.status(200).json(result);

  } catch (error) {
    console.error('Historical API Error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'An unexpected error occurred while processing historical lottery data',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

function processHistoricalData(rawData, limit) {
  try {
    if (!Array.isArray(rawData)) return [];
    
    const processedDrawings = rawData
      .slice(0, limit)
      .map(drawing => {
        try {
          if (!drawing.winning_numbers) return null;
          
          const allNumbers = drawing.winning_numbers
            .replace(/\s*PB:\s*/, ' ')
            .split(/\s+/)
            .map(n => parseInt(n.trim()))
            .filter(n => !isNaN(n) && n >= 1);

          if (allNumbers.length >= 6) {
            const numbers = allNumbers.slice(0, 5);
            const powerball = allNumbers[5];
            
            if (numbers.every(n => n >= 1 && n <= 69) && 
                powerball >= 1 && powerball <= 26 &&
                new Set(numbers).size === 5) {
              
              return {
                numbers: numbers.sort((a, b) => a - b),
                powerball: powerball,
                drawDate: drawing.draw_date ? drawing.draw_date.split('T')[0] : null,
                jackpot: drawing.jackpot ? parseFloat(drawing.jackpot.toString().replace(/[$,]/g, '')) : null,
                multiplier: drawing.multiplier || null
              };
            }
          }
          return null;
        } catch (error) {
          return null;
        }
      })
      .filter(drawing => drawing !== null);
      
    return processedDrawings;
    
  } catch (error) {
    console.error('Error processing historical data:', error);
    return [];
  }
}

function generateAnalysis(drawings) {
  if (!drawings || drawings.length === 0) return null;

  try {
    const numberFreq = {};
    const powerballFreq = {};
    
    for (let i = 1; i <= 69; i++) numberFreq[i] = 0;
    for (let i = 1; i <= 26; i++) powerballFreq[i] = 0;
    
    drawings.forEach(drawing => {
      drawing.numbers.forEach(num => numberFreq[num]++);
      powerballFreq[drawing.powerball]++;
    });

    const hotNumbers = Object.entries(numberFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }));

    const coldNumbers = Object.entries(numberFreq)
      .sort(([,a], [,b]) => a - b)
      .slice(0, 10)
      .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }));

    const hotPowerballs = Object.entries(powerballFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }));

    const jackpots = drawings
      .map(d => d.jackpot)
      .filter(j => j && !isNaN(j) && j > 0);
    const averageJackpot = jackpots.length > 0 ? 
      Math.round(jackpots.reduce((sum, j) => sum + j, 0) / jackpots.length) : null;

    return {
      totalDrawings: drawings.length,
      dateRange: {
        earliest: drawings[drawings.length - 1]?.drawDate,
        latest: drawings[0]?.drawDate
      },
      hotNumbers,
      coldNumbers,
      hotPowerballs,
      averageJackpot,
      lastUpdate: new Date().toISOString()
    };

  } catch (error) {
    console.error('Analysis generation error:', error);
    return null;
  }
}