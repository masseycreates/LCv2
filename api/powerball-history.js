// api/powerball-history.js - LCv2 Historical Data API
export default async function handler(req, res) {
  // Enhanced CORS headers
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
    const requestedLimit = parseInt(req.query.limit) || 500;
    const limit = Math.min(Math.max(requestedLimit, 25), 2000);
    
    console.log(`=== LCv2 Historical API Request Started (${limit} drawings) ===`);
    console.log('Timestamp:', new Date().toISOString());
    
    // Enhanced historical data sources
    const historicalSources = [
      {
        name: 'NY State Open Data Portal (SODA API)',
        url: `https://data.ny.gov/resource/d6yy-54nr.json?$order=draw_date%20DESC&$limit=${Math.min(limit * 2, 2000)}`,
        type: 'json',
        extractor: extractFromNYStateAPI,
        timeout: 30000,
        priority: 1
      },
      {
        name: 'NY State History API',
        url: `https://data.ny.gov/resource/dhwa-m6y4.json?$order=date%20DESC&$limit=${Math.min(limit * 2, 2000)}`,
        type: 'json',
        extractor: extractFromNYStateHistoryAPI,
        timeout: 30000,
        priority: 2
      },
      {
        name: 'Mock Data Generator',
        url: null,
        type: 'fallback',
        extractor: generateMockHistoricalData,
        timeout: 1000,
        priority: 99
      }
    ];

    let historicalData = [];
    let sourceUsed = null;
    let errors = [];

    // Try each source sequentially
    for (const source of historicalSources) {
      try {
        console.log(`\n--- Attempting ${source.name} (Priority: ${source.priority}) for ${limit} drawings ---`);
        
        if (source.type === 'fallback') {
          // Use fallback data generator
          const fallbackData = source.extractor(limit);
          if (fallbackData && fallbackData.length > 0) {
            historicalData = fallbackData;
            sourceUsed = source.name;
            console.log(`✅ Fallback generated ${fallbackData.length} mock drawings`);
            break;
          }
          continue;
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), source.timeout);
        
        const response = await fetch(source.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': source.type === 'json' ? 'application/json' : 'text/csv,text/plain',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log(`${source.name} status: ${response.status}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        let data;
        if (source.type === 'json') {
          data = await response.json();
        } else {
          data = await response.text();
        }
        
        console.log(`${source.name} data received, processing...`);
        const extractedData = source.extractor(data, limit);
        
        if (extractedData && extractedData.length >= 10 && validateHistoricalData(extractedData)) {
          historicalData = extractedData;
          sourceUsed = source.name;
          console.log(`✅ Success from ${source.name}: ${extractedData.length} valid drawings`);
          break;
        } else {
          throw new Error(`Insufficient valid data (got ${extractedData?.length || 0} records, need >= 10)`);
        }
        
      } catch (error) {
        const errorMsg = `${source.name}: ${error.message}`;
        errors.push(errorMsg);
        console.log(`❌ ${errorMsg}`);
        continue;
      }
    }

    if (historicalData.length === 0) {
      // COMPLETE FAILURE - This should not happen with fallback
      console.log('=== CRITICAL FAILURE: No data sources working ===');
      return res.status(500).json({
        success: false,
        dataAvailable: false,
        error: 'All data sources failed',
        message: 'HISTORICAL POWERBALL DATA TEMPORARILY UNAVAILABLE',
        details: 'Unable to retrieve or generate historical drawing data.',
        timestamp: new Date().toISOString(),
        apiVersion: 'LCv2',
        debug: {
          sourcesAttempted: historicalSources.length,
          errors: errors,
          requestedLimit: limit
        }
      });
    }

    // Sort and limit data
    const sortedData = historicalData
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);

    console.log(`📊 FINAL RESULT: Returning ${sortedData.length} drawings out of ${limit} requested`);

    // Calculate enhanced statistics
    const statistics = calculateAdvancedFrequencyStats(sortedData);
    
    const result = {
      success: true,
      dataAvailable: true,
      drawings: sortedData,
      statistics: statistics,
      meta: {
        totalDrawings: sortedData.length,
        requestedLimit: requestedLimit,
        actualLimit: limit,
        dateRange: {
          latest: sortedData[0]?.date || null,
          earliest: sortedData[sortedData.length - 1]?.date || null
        },
        source: sourceUsed,
        dataQuality: {
          completeness: (sortedData.length / limit * 100).toFixed(1) + '%',
          sourceReliability: sourceUsed?.includes('NY State') ? 'High' : sourceUsed?.includes('Mock') ? 'Simulated' : 'Medium',
          lastUpdated: new Date().toISOString()
        }
      },
      timestamp: new Date().toISOString(),
      apiVersion: 'LCv2',
      debug: {
        sourcesAttempted: historicalSources.length,
        errors: errors,
        successfulSource: sourceUsed,
        actualDrawingsReturned: sortedData.length,
        requestedDrawings: limit
      }
    };

    // Cache for 6 hours
    res.setHeader('Cache-Control', 's-maxage=21600, max-age=21600');
    return res.status(200).json(result);

  } catch (error) {
    console.error('=== Historical API Critical Error ===');
    console.error('Error:', error);
    
    return res.status(500).json({
      success: false,
      dataAvailable: false,
      error: 'Internal server error',
      message: 'HISTORICAL POWERBALL DATA TEMPORARILY UNAVAILABLE',
      details: 'A technical error occurred while fetching historical data.',
      timestamp: new Date().toISOString(),
      apiVersion: 'LCv2',
      debug: {
        error: error.message,
        stack: error.stack
      }
    });
  }
}

// Extract from NY State SODA API
function extractFromNYStateAPI(data, maxRecords = 2000) {
  try {
    console.log('NY State SODA API extractor - processing...');
    const drawings = [];
    
    if (Array.isArray(data)) {
      console.log(`Processing ${data.length} records from SODA API for max ${maxRecords}`);
      
      data.forEach((drawing) => {
        if (drawings.length >= maxRecords) return;
        
        try {
          const date = drawing.draw_date ? drawing.draw_date.split('T')[0] : null;
          const winningNumbers = drawing.winning_numbers;
          
          if (date && winningNumbers) {
            const numberParts = winningNumbers.trim().split(/\s+/);
            
            if (numberParts.length >= 6) {
              const numbers = numberParts.slice(0, 5).map(n => parseInt(n));
              const powerball = parseInt(numberParts[5]);
              
              if (isValidPowerballNumbers(numbers, powerball)) {
                drawings.push({
                  date: date,
                  numbers: numbers.sort((a, b) => a - b),
                  powerball: powerball,
                  jackpot: drawing.jackpot ? parseInt(drawing.jackpot) : null,
                  multiplier: drawing.multiplier || null,
                  source: 'NY State SODA API'
                });
              }
            }
          }
        } catch (err) {
          console.log('Error parsing NY State SODA drawing:', err.message);
        }
      });
    }
    
    console.log(`NY State SODA API extracted ${drawings.length} valid drawings`);
    return drawings;
    
  } catch (error) {
    console.log('NY State SODA API extraction failed:', error.message);
    return [];
  }
}

// Extract from NY State History API
function extractFromNYStateHistoryAPI(data, maxRecords = 2000) {
  try {
    console.log('NY State History API extractor - processing...');
    const drawings = [];
    
    if (Array.isArray(data)) {
      console.log(`Processing ${data.length} records from History API for max ${maxRecords}`);
      
      data.forEach((drawing) => {
        if (drawings.length >= maxRecords) return;
        
        try {
          const date = drawing.date ? drawing.date.split('T')[0] : null;
          
          if (date && drawing.white_balls && drawing.powerball) {
            let numbers = [];
            
            if (Array.isArray(drawing.white_balls)) {
              numbers = drawing.white_balls.map(n => parseInt(n));
            } else if (typeof drawing.white_balls === 'string') {
              numbers = drawing.white_balls.split(/[,\s]+/).map(n => parseInt(n.trim()));
            }
            
            const powerball = parseInt(drawing.powerball);
            
            if (isValidPowerballNumbers(numbers, powerball)) {
              drawings.push({
                date: date,
                numbers: numbers.sort((a, b) => a - b),
                powerball: powerball,
                jackpot: drawing.jackpot ? parseInt(drawing.jackpot) : null,
                multiplier: drawing.multiplier || null,
                source: 'NY State History API'
              });
            }
          }
        } catch (err) {
          console.log('Error parsing NY State History drawing:', err.message);
        }
      });
    }
    
    console.log(`NY State History API extracted ${drawings.length} valid drawings`);
    return drawings;
    
  } catch (error) {
    console.log('NY State History API extraction failed:', error.message);
    return [];
  }
}

// Generate mock historical data as fallback
function generateMockHistoricalData(maxRecords = 500) {
  try {
    console.log(`Generating ${maxRecords} mock historical drawings as fallback...`);
    const drawings = [];
    
    const today = new Date();
    
    // Generate realistic mock data
    for (let i = 0; i < maxRecords; i++) {
      const drawDate = new Date(today);
      drawDate.setDate(today.getDate() - (i * 3.5)); // Drawings every ~3.5 days
      
      const numbers = [];
      while (numbers.length < 5) {
        const num = Math.floor(Math.random() * 69) + 1;
        if (!numbers.includes(num)) {
          numbers.push(num);
        }
      }
      
      const powerball = Math.floor(Math.random() * 26) + 1;
      
      // Add some frequency bias to make it more realistic
      const biasedNumbers = numbers.map(num => {
        // Slightly bias towards middle range numbers
        if (num >= 20 && num <= 50 && Math.random() < 0.15) {
          let newNum;
          do {
            newNum = Math.floor(Math.random() * 31) + 20; // 20-50 range
          } while (numbers.includes(newNum));
          return newNum;
        }
        return num;
      });
      
      drawings.push({
        date: drawDate.toISOString().split('T')[0],
        numbers: [...new Set(biasedNumbers)].slice(0, 5).sort((a, b) => a - b),
        powerball: powerball,
        jackpot: Math.floor(Math.random() * 800000000) + 40000000, // $40M to $840M
        multiplier: Math.random() < 0.3 ? (Math.floor(Math.random() * 5) + 2) : null,
        source: 'Mock Data Generator'
      });
    }
    
    console.log(`Generated ${drawings.length} mock drawings`);
    return drawings;
    
  } catch (error) {
    console.log('Mock data generation failed:', error.message);
    return [];
  }
}

// Validate Powerball numbers
function isValidPowerballNumbers(numbers, powerball) {
  if (!Array.isArray(numbers) || numbers.length !== 5) return false;
  if (!powerball || powerball < 1 || powerball > 26) return false;
  
  for (const num of numbers) {
    if (!num || num < 1 || num > 69) return false;
  }
  
  // Check for duplicates
  const uniqueNumbers = new Set(numbers);
  if (uniqueNumbers.size !== 5) return false;
  
  return true;
}

// Validate historical data quality
function validateHistoricalData(drawings) {
  if (!Array.isArray(drawings) || drawings.length < 10) return false;
  
  // Check that we have reasonable data
  const validDrawings = drawings.filter(drawing => {
    return drawing.date && 
           drawing.numbers && 
           drawing.powerball &&
           isValidPowerballNumbers(drawing.numbers, drawing.powerball);
  });
  
  // At least 80% of data should be valid
  const validityRatio = validDrawings.length / drawings.length;
  console.log(`Data validation: ${validDrawings.length}/${drawings.length} valid (${(validityRatio * 100).toFixed(1)}%)`);
  
  return validityRatio >= 0.8;
}

// Enhanced frequency statistics calculation
function calculateAdvancedFrequencyStats(drawings) {
  const numberFreq = {};
  const powerballFreq = {};
  const totalDrawings = drawings.length;
  const recentDrawings = drawings.slice(0, Math.min(50, Math.floor(totalDrawings * 0.3)));
  
  console.log(`📊 Calculating enhanced stats for ${totalDrawings} drawings (${recentDrawings.length} recent)`);
  
  // Initialize frequency counters
  for (let i = 1; i <= 69; i++) numberFreq[i] = { total: 0, recent: 0, lastSeen: null };
  for (let i = 1; i <= 26; i++) powerballFreq[i] = { total: 0, recent: 0, lastSeen: null };
  
  // Count frequencies and track last seen dates
  drawings.forEach((drawing, index) => {
    const isRecent = index < recentDrawings.length;
    
    drawing.numbers.forEach(num => {
      numberFreq[num].total++;
      if (isRecent) numberFreq[num].recent++;
      if (!numberFreq[num].lastSeen) numberFreq[num].lastSeen = drawing.date;
    });
    
    powerballFreq[drawing.powerball].total++;
    if (isRecent) powerballFreq[drawing.powerball].recent++;
    if (!powerballFreq[drawing.powerball].lastSeen) powerballFreq[drawing.powerball].lastSeen = drawing.date;
  });
  
  // Calculate hot and cold numbers with enhanced scoring
  const hotNumbers = Object.entries(numberFreq)
    .map(([num, freq]) => ({
      number: parseInt(num),
      score: freq.recent * 3 + freq.total * 0.2,
      totalFreq: freq.total,
      recentFreq: freq.recent,
      lastSeen: freq.lastSeen
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 25)
    .map(item => item.number);
    
  const coldNumbers = Object.entries(numberFreq)
    .map(([num, freq]) => ({
      number: parseInt(num),
      score: freq.recent * 3 + freq.total * 0.2,
      totalFreq: freq.total,
      recentFreq: freq.recent,
      lastSeen: freq.lastSeen
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 25)
    .map(item => item.number);

  // Hot and cold powerballs
  const hotPowerballs = Object.entries(powerballFreq)
    .map(([num, freq]) => ({
      number: parseInt(num),
      score: freq.recent * 3 + freq.total * 0.2
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(item => item.number);

  const coldPowerballs = Object.entries(powerballFreq)
    .map(([num, freq]) => ({
      number: parseInt(num),
      score: freq.recent * 3 + freq.total * 0.2
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 10)
    .map(item => item.number);

  // Enhanced pattern analysis
  const patterns = calculatePatternAnalysis(drawings);
  const trends = calculateNumberTrends(drawings);
  const sumRanges = calculateSumStatistics(drawings);
  
  return {
    // Core frequency data
    numberFrequency: numberFreq,
    powerballFrequency: powerballFreq,
    hotNumbers: hotNumbers,
    coldNumbers: coldNumbers,
    hotPowerballs: hotPowerballs,
    coldPowerballs: coldPowerballs,
    
    // Enhanced analysis
    patterns: patterns,
    trends: trends,
    sumRanges: sumRanges,
    
    // Metadata
    totalDrawings: totalDrawings,
    recentDrawings: recentDrawings.length,
    analysisDate: new Date().toISOString().split('T')[0],
    dataSource: 'LCv2 Enhanced Historical Analysis',
    drawings: drawings, // Include full drawings for components
    
    // Date range information
    dateRange: {
      latest: drawings[0]?.date || null,
      earliest: drawings[drawings.length - 1]?.date || null
    },
    
    // Quality metrics
    qualityMetrics: {
      dataCompleteness: (totalDrawings / 2000 * 100).toFixed(1) + '%',
      recentCoverage: (recentDrawings.length / 50 * 100).toFixed(1) + '%',
      historicalDepth: calculateHistoricalDepth(drawings)
    }
  };
}

// Calculate pattern analysis
function calculatePatternAnalysis(drawings) {
  let consecutiveCount = 0;
  let evenOddStats = { even: 0, odd: 0 };
  let lowHighStats = { low: 0, high: 0 };
  
  drawings.forEach(drawing => {
    // Consecutive numbers
    const sorted = [...drawing.numbers].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1] === sorted[i] + 1) {
        consecutiveCount++;
        break;
      }
    }
    
    // Even/Odd distribution
    const evenCount = drawing.numbers.filter(num => num % 2 === 0).length;
    evenOddStats.even += evenCount;
    evenOddStats.odd += (5 - evenCount);
    
    // Low/High distribution (1-35 vs 36-69)
    const lowCount = drawing.numbers.filter(num => num <= 35).length;
    lowHighStats.low += lowCount;
    lowHighStats.high += (5 - lowCount);
  });
  
  return {
    consecutiveNumbers: consecutiveCount / drawings.length,
    evenOddDistribution: {
      evenPercentage: (evenOddStats.even / (drawings.length * 5)) * 100,
      oddPercentage: (evenOddStats.odd / (drawings.length * 5)) * 100
    },
    lowHighDistribution: {
      lowPercentage: (lowHighStats.low / (drawings.length * 5)) * 100,
      highPercentage: (lowHighStats.high / (drawings.length * 5)) * 100
    }
  };
}

// Calculate number trends
function calculateNumberTrends(drawings) {
  if (drawings.length < 30) return null;
  
  const recent = drawings.slice(0, 15);
  const older = drawings.slice(15, 30);
  const trends = { increasing: [], decreasing: [], stable: [] };
  
  for (let num = 1; num <= 69; num++) {
    const recentCount = recent.filter(d => d.numbers.includes(num)).length;
    const olderCount = older.filter(d => d.numbers.includes(num)).length;
    
    if (recentCount > olderCount * 1.5) {
      trends.increasing.push(num);
    } else if (olderCount > recentCount * 1.5) {
      trends.decreasing.push(num);
    } else {
      trends.stable.push(num);
    }
  }
  
  return trends;
}

// Calculate sum statistics
function calculateSumStatistics(drawings) {
  const sums = drawings.map(drawing => 
    drawing.numbers.reduce((sum, num) => sum + num, 0)
  );
  
  if (sums.length === 0) return null;
  
  const sorted = [...sums].sort((a, b) => a - b);
  const mean = sums.reduce((sum, val) => sum + val, 0) / sums.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  
  return {
    min: Math.min(...sums),
    max: Math.max(...sums),
    average: mean,
    median: median,
    range: Math.max(...sums) - Math.min(...sums)
  };
}

// Calculate historical depth
function calculateHistoricalDepth(drawings) {
  if (!drawings || drawings.length === 0) return 'No data';
  
  const earliestDate = new Date(drawings[drawings.length - 1].date);
  const latestDate = new Date(drawings[0].date);
  const daysDiff = Math.floor((latestDate - earliestDate) / (1000 * 60 * 60 * 24));
  
  if (daysDiff > 365) {
    return `${Math.floor(daysDiff / 365)} years`;
  } else if (daysDiff > 30) {
    return `${Math.floor(daysDiff / 30)} months`;
  } else {
    return `${daysDiff} days`;
  }
}