// LCv2 Powerball API Service
import { API_ENDPOINTS, APP_CONFIG } from '../utils/constants.js';
import { calculateNextDrawing, validateHistoricalData, validateJackpotData } from '../utils/helpers.js';

export class PowerballAPI {
  constructor() {
    this.cache = new Map();
    this.retryCount = 0;
    this.maxRetries = APP_CONFIG.maxRetries;
  }

  // Fetch current jackpot and live data
  async fetchCurrentData() {
    try {
      console.log('🔄 Fetching current Powerball data...');
      
      const response = await fetch(API_ENDPOINTS.powerball, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Powerball API response:', data.success ? 'Success' : 'Failed');

      // Cache successful responses
      if (data.success && data.dataAvailable) {
        this.cache.set('current', {
          data: data,
          timestamp: Date.now(),
          ttl: APP_CONFIG.cacheTimeout
        });
      }

      return {
        success: data.success,
        dataAvailable: data.dataAvailable || false,
        jackpot: data.jackpot || null,
        latestNumbers: data.latestNumbers || null,
        nextDrawing: data.nextDrawing || calculateNextDrawing(),
        source: data.source || 'Unknown',
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        message: data.message || null
      };

    } catch (error) {
      console.error('❌ Powerball API error:', error.message);
      
      // Return cached data if available
      const cached = this.getCachedData('current');
      if (cached) {
        console.log('📦 Using cached data due to API error');
        return cached;
      }

      return {
        success: false,
        dataAvailable: false,
        jackpot: null,
        latestNumbers: null,
        nextDrawing: calculateNextDrawing(),
        source: 'Error',
        lastUpdated: new Date().toISOString(),
        message: 'Unable to connect to lottery data sources',
        error: error.message
      };
    }
  }

  // Fetch historical data with specified limit
  async fetchHistoricalData(limit = 500) {
    const cacheKey = `history_${limit}`;
    
    // Check cache first
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      console.log('📦 Using cached historical data');
      return cached;
    }

    try {
      console.log(`🔄 Fetching ${limit} historical drawings...`);
      
      const response = await fetch(`${API_ENDPOINTS.history}?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Historical API response:', data.success ? 'Success' : 'Failed');

      if (data.success && data.dataAvailable) {
        // Process and enhance the historical data
        const processedData = this.processHistoricalData(data);
        
        // Cache the processed data
        this.cache.set(cacheKey, {
          data: processedData,
          timestamp: Date.now(),
          ttl: APP_CONFIG.cacheTimeout * 2 // Historical data caches longer
        });

        return processedData;
      } else {
        throw new Error(data.message || 'Historical data not available');
      }

    } catch (error) {
      console.error('❌ Historical API error:', error.message);
      
      return {
        success: false,
        dataAvailable: false,
        drawings: [],
        statistics: null,
        message: 'Historical data temporarily unavailable',
        error: error.message
      };
    }
  }

  // Process and enhance historical data
  processHistoricalData(rawData) {
    const { drawings, statistics, meta } = rawData;
    
    // Validate data quality
    if (!validateHistoricalData(drawings)) {
      console.warn('⚠️ Historical data validation failed');
    }

    // Enhanced statistics processing
    const enhancedStats = this.enhanceStatistics(statistics, drawings);
    
    return {
      success: true,
      dataAvailable: true,
      drawings: drawings,
      statistics: enhancedStats,
      meta: {
        ...meta,
        processedAt: new Date().toISOString(),
        qualityScore: this.calculateDataQuality(drawings)
      }
    };
  }

  // Enhance statistics with additional analysis
  enhanceStatistics(stats, drawings) {
    if (!stats || !drawings) return null;

    // Calculate additional metrics
    const recentDrawings = drawings.slice(0, Math.min(50, Math.floor(drawings.length * 0.3)));
    const trends = this.calculateTrends(recentDrawings);
    const patterns = this.identifyPatterns(drawings);
    
    return {
      ...stats,
      trends: trends,
      patterns: patterns,
      analysisDepth: drawings.length,
      lastAnalyzed: new Date().toISOString(),
      
      // Enhanced frequency analysis
      enhancedHotNumbers: this.calculateEnhancedFrequency(drawings, 'hot'),
      enhancedColdNumbers: this.calculateEnhancedFrequency(drawings, 'cold'),
      
      // Pattern metrics
      numberPairs: this.calculateNumberPairs(drawings),
      sumRanges: this.calculateSumRanges(drawings),
      gaps: this.calculateGaps(drawings)
    };
  }

  // Calculate recent trends
  calculateTrends(recentDrawings) {
    if (!recentDrawings || recentDrawings.length < 10) return null;

    const trends = {
      increasing: [],
      decreasing: [],
      stable: []
    };

    // Analyze frequency trends for each number
    for (let num = 1; num <= 69; num++) {
      const recent = recentDrawings.slice(0, 15);
      const older = recentDrawings.slice(15, 30);
      
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

  // Identify drawing patterns
  identifyPatterns(drawings) {
    if (!drawings || drawings.length < 20) return null;

    return {
      consecutiveNumbers: this.findConsecutivePatterns(drawings),
      evenOddDistribution: this.analyzeEvenOdd(drawings),
      lowHighDistribution: this.analyzeLowHigh(drawings),
      sumDistribution: this.analyzeSumDistribution(drawings)
    };
  }

  // Calculate enhanced frequency with weighting
  calculateEnhancedFrequency(drawings, type) {
    const frequency = {};
    const totalDrawings = drawings.length;
    const recentWeight = 0.3;
    const recentCount = Math.min(50, Math.floor(totalDrawings * 0.3));

    for (let num = 1; num <= 69; num++) {
      let totalScore = 0;
      let recentScore = 0;

      drawings.forEach((drawing, index) => {
        if (drawing.numbers.includes(num)) {
          totalScore += 1;
          if (index < recentCount) {
            recentScore += 1;
          }
        }
      });

      const normalizedTotal = totalScore / totalDrawings;
      const normalizedRecent = recentScore / recentCount;
      
      frequency[num] = {
        total: totalScore,
        recent: recentScore,
        normalizedTotal: normalizedTotal,
        normalizedRecent: normalizedRecent,
        enhancedScore: normalizedTotal + (normalizedRecent * recentWeight)
      };
    }

    // Sort by enhanced score
    const sorted = Object.entries(frequency)
      .map(([num, data]) => ({ number: parseInt(num), ...data }))
      .sort((a, b) => type === 'hot' ? b.enhancedScore - a.enhancedScore : a.enhancedScore - b.enhancedScore);

    return sorted.slice(0, 25).map(item => item.number);
  }

  // Calculate number pair relationships
  calculateNumberPairs(drawings) {
    const pairs = {};
    
    drawings.forEach(drawing => {
      const numbers = drawing.numbers;
      for (let i = 0; i < numbers.length; i++) {
        for (let j = i + 1; j < numbers.length; j++) {
          const pair = `${Math.min(numbers[i], numbers[j])}-${Math.max(numbers[i], numbers[j])}`;
          pairs[pair] = (pairs[pair] || 0) + 1;
        }
      }
    });

    return Object.entries(pairs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([pair, count]) => ({ pair, count, frequency: count / drawings.length }));
  }

  // Calculate sum ranges
  calculateSumRanges(drawings) {
    const sums = drawings.map(drawing => 
      drawing.numbers.reduce((sum, num) => sum + num, 0)
    );

    return {
      min: Math.min(...sums),
      max: Math.max(...sums),
      average: sums.reduce((sum, val) => sum + val, 0) / sums.length,
      median: this.calculateMedian(sums),
      distribution: this.createSumDistribution(sums)
    };
  }

  // Calculate gaps between appearances
  calculateGaps(drawings) {
    const gaps = {};
    
    for (let num = 1; num <= 69; num++) {
      const appearances = [];
      drawings.forEach((drawing, index) => {
        if (drawing.numbers.includes(num)) {
          appearances.push(index);
        }
      });

      if (appearances.length > 1) {
        const numberGaps = [];
        for (let i = 1; i < appearances.length; i++) {
          numberGaps.push(appearances[i] - appearances[i-1]);
        }
        
        gaps[num] = {
          averageGap: numberGaps.reduce((sum, gap) => sum + gap, 0) / numberGaps.length,
          maxGap: Math.max(...numberGaps),
          minGap: Math.min(...numberGaps),
          currentGap: appearances[0], // Drawings since last appearance
          appearances: appearances.length
        };
      }
    }

    return gaps;
  }

  // Helper methods
  findConsecutivePatterns(drawings) {
    let consecutiveCount = 0;
    drawings.forEach(drawing => {
      const sorted = [...drawing.numbers].sort((a, b) => a - b);
      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i + 1] === sorted[i] + 1) {
          consecutiveCount++;
          break;
        }
      }
    });
    return consecutiveCount / drawings.length;
  }

  analyzeEvenOdd(drawings) {
    const distribution = { even: 0, odd: 0 };
    drawings.forEach(drawing => {
      const evenCount = drawing.numbers.filter(num => num % 2 === 0).length;
      distribution.even += evenCount;
      distribution.odd += (5 - evenCount);
    });
    return {
      evenPercentage: (distribution.even / (drawings.length * 5)) * 100,
      oddPercentage: (distribution.odd / (drawings.length * 5)) * 100
    };
  }

  analyzeLowHigh(drawings) {
    const distribution = { low: 0, high: 0 };
    drawings.forEach(drawing => {
      const lowCount = drawing.numbers.filter(num => num <= 35).length;
      distribution.low += lowCount;
      distribution.high += (5 - lowCount);
    });
    return {
      lowPercentage: (distribution.low / (drawings.length * 5)) * 100,
      highPercentage: (distribution.high / (drawings.length * 5)) * 100
    };
  }

  analyzeSumDistribution(drawings) {
    const sums = drawings.map(drawing => 
      drawing.numbers.reduce((sum, num) => sum + num, 0)
    );
    
    const ranges = {
      '100-150': 0,
      '151-200': 0,
      '201-250': 0,
      '251-300': 0,
      '300+': 0
    };

    sums.forEach(sum => {
      if (sum <= 150) ranges['100-150']++;
      else if (sum <= 200) ranges['151-200']++;
      else if (sum <= 250) ranges['201-250']++;
      else if (sum <= 300) ranges['251-300']++;
      else ranges['300+']++;
    });

    return ranges;
  }

  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  createSumDistribution(sums) {
    const min = Math.min(...sums);
    const max = Math.max(...sums);
    const binSize = (max - min) / 10;
    const bins = Array(10).fill(0);

    sums.forEach(sum => {
      const binIndex = Math.min(Math.floor((sum - min) / binSize), 9);
      bins[binIndex]++;
    });

    return bins;
  }

  calculateDataQuality(drawings) {
    if (!drawings || drawings.length === 0) return 0;
    
    const validDrawings = drawings.filter(drawing => 
      validateHistoricalData([drawing])
    );
    
    return Math.round((validDrawings.length / drawings.length) * 100);
  }

  // Cache management
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  clearCache() {
    this.cache.clear();
    console.log('🗑️ PowerballAPI cache cleared');
  }

  // Test API connectivity
  async testConnectivity() {
    try {
      const response = await fetch(API_ENDPOINTS.test);
      const data = await response.json();
      return {
        success: response.ok && data.success,
        message: data.message || 'Connection test completed',
        environment: data.environment || 'unknown'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Connection test failed: ' + error.message,
        environment: 'error'
      };
    }
  }

  // Get API status and diagnostics
  async getDiagnostics() {
    try {
      const response = await fetch(API_ENDPOINTS.diagnose);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Export singleton instance
export const powerballAPI = new PowerballAPI();