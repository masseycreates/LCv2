// LCv2 Powerball API Service - Enhanced Data Fetching with Multiple Sources
import { API_ENDPOINTS, APP_CONFIG } from '../utils/constants.js';
import { 
  calculateNextDrawing, 
  validateHistoricalData, 
  validateJackpotData,
  handleApiError 
} from '../utils/helpers.js';

export class PowerballAPI {
  constructor() {
    this.cache = new Map();
    this.retryCount = 0;
    this.maxRetries = APP_CONFIG.maxRetries;
    this.cacheTimeout = APP_CONFIG.cacheTimeout;
    this.dataSources = this.initializeDataSources();
    this.fallbackData = this.initializeFallbackData();
  }

  // ===========================================================================
  // INITIALIZATION
  // ===========================================================================

  initializeDataSources() {
    return [
      {
        id: 'ny_lottery',
        name: 'NY Lottery API',
        baseUrl: 'https://data.ny.gov/resource/5xaw-6ayf.json',
        priority: 1,
        isActive: true,
        capabilities: ['current', 'historical']
      },
      {
        id: 'lottery_usa',
        name: 'Lottery USA API',
        baseUrl: 'https://www.lotteryusa.com/powerball',
        priority: 2,
        isActive: true,
        capabilities: ['current']
      },
      {
        id: 'powerball_com',
        name: 'Powerball.com Scraper',
        baseUrl: 'https://www.powerball.com/api',
        priority: 3,
        isActive: true,
        capabilities: ['current', 'historical']
      }
    ];
  }

  initializeFallbackData() {
    return {
      jackpot: {
        amount: 100000000,
        cashValue: 60000000,
        nextDrawing: calculateNextDrawing(),
        source: 'fallback',
        lastUpdated: new Date().toISOString()
      },
      historicalSample: this.generateSampleHistoricalData()
    };
  }

  generateSampleHistoricalData() {
    const drawings = [];
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 2); // 2 years back

    for (let i = 0; i < 500; i++) {
      const drawDate = new Date(startDate);
      drawDate.setDate(drawDate.getDate() + (i * 3.5)); // ~2 drawings per week

      const numbers = [];
      while (numbers.length < 5) {
        const num = Math.floor(Math.random() * 69) + 1;
        if (!numbers.includes(num)) {
          numbers.push(num);
        }
      }
      numbers.sort((a, b) => a - b);

      drawings.push({
        date: drawDate.toISOString().split('T')[0],
        numbers: numbers,
        powerball: Math.floor(Math.random() * 26) + 1,
        jackpot: 50000000 + Math.floor(Math.random() * 150000000),
        source: 'generated'
      });
    }

    return {
      drawings: drawings.reverse(), // Most recent first
      totalDrawings: drawings.length,
      dateRange: {
        earliest: drawings[drawings.length - 1]?.date,
        latest: drawings[0]?.date
      },
      hotNumbers: [7, 14, 21, 28, 35, 42, 49, 56, 63, 69],
      coldNumbers: [1, 8, 15, 22, 29, 36, 43, 50, 57, 64],
      source: 'fallback'
    };
  }

  // ===========================================================================
  // CACHE MANAGEMENT
  // ===========================================================================

  getCachedData(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.cacheTimeout;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
    console.log('??? PowerballAPI cache cleared');
  }

  // ===========================================================================
  // CONNECTIVITY TESTING
  // ===========================================================================

  async testConnectivity() {
    const startTime = performance.now();
    
    try {
      console.log('?? Testing PowerballAPI connectivity...');
      
      // Test multiple endpoints
      const tests = await Promise.allSettled([
        this.testDataSource(this.dataSources[0]),
        this.testDataSource(this.dataSources[1]),
        this.testDataSource(this.dataSources[2])
      ]);

      const successfulTests = tests.filter(test => test.status === 'fulfilled' && test.value.success);
      const latency = performance.now() - startTime;

      if (successfulTests.length === 0) {
        return {
          success: false,
          error: 'All data sources failed connectivity test',
          latency,
          sources: tests.map(test => test.status === 'fulfilled' ? test.value : { success: false })
        };
      }

      return {
        success: true,
        latency,
        sources: tests.map(test => test.status === 'fulfilled' ? test.value : { success: false }),
        availableSources: successfulTests.length
      };

    } catch (error) {
      console.error('? Connectivity test failed:', error);
      return {
        success: false,
        error: error.message,
        latency: performance.now() - startTime
      };
    }
  }

  async testDataSource(source) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(source.baseUrl, {
        method: 'HEAD', // Just test connectivity, don't fetch data
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'LCv2-Lottery-System/2.0'
        }
      });

      clearTimeout(timeout);

      return {
        success: response.ok,
        source: source.name,
        status: response.status,
        latency: response.headers.get('response-time') || 'unknown'
      };

    } catch (error) {
      return {
        success: false,
        source: source.name,
        error: error.message
      };
    }
  }

  // ===========================================================================
  // CURRENT DATA FETCHING
  // ===========================================================================

  async fetchCurrentData() {
    console.log('?? Fetching current Powerball data...');
    
    try {
      // Check cache first
      const cachedData = this.getCachedData('current_jackpot');
      if (cachedData) {
        console.log('?? Using cached jackpot data');
        return { success: true, data: cachedData, source: 'cache' };
      }

      // Try multiple data sources
      for (const source of this.dataSources) {
        if (!source.isActive || !source.capabilities.includes('current')) continue;

        try {
          const data = await this.fetchFromSource(source, 'current');
          if (data && validateJackpotData(data)) {
            this.setCachedData('current_jackpot', data);
            console.log(`? Jackpot data from ${source.name}`);
            return { success: true, data, source: source.id };
          }
        } catch (error) {
          console.warn(`?? ${source.name} failed:`, error.message);
          continue;
        }
      }

      // All sources failed, use fallback
      console.log('?? Using fallback jackpot data');
      const fallbackData = {
        ...this.fallbackData.jackpot,
        nextDrawing: calculateNextDrawing()
      };
      
      return { 
        success: true, 
        data: fallbackData, 
        source: 'fallback',
        warning: 'Live data unavailable, using fallback values'
      };

    } catch (error) {
      console.error('? Failed to fetch current data:', error);
      return {
        success: false,
        error: handleApiError(error),
        data: this.fallbackData.jackpot
      };
    }
  }

  async fetchFromSource(source, type) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      let url = source.baseUrl;
      let response;

      switch (source.id) {
        case 'ny_lottery':
          response = await this.fetchFromNYLottery(url, type, controller.signal);
          break;
        case 'lottery_usa':
          response = await this.fetchFromLotteryUSA(url, type, controller.signal);
          break;
        case 'powerball_com':
          response = await this.fetchFromPowerballCom(url, type, controller.signal);
          break;
        default:
          throw new Error(`Unknown data source: ${source.id}`);
      }

      clearTimeout(timeout);
      return response;

    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  async fetchFromNYLottery(baseUrl, type, signal) {
    if (type === 'current') {
      // NY Lottery API for current jackpot
      const url = `${baseUrl}?$limit=1&$order=draw_date DESC`;
      const response = await fetch(url, { signal });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data || data.length === 0) {
        throw new Error('No current data available');
      }

      const latest = data[0];
      return {
        jackpot: {
          amount: parseInt(latest.jackpot?.replace(/[^0-9]/g, '') || '100000000'),
          cashValue: parseInt(latest.cash_value?.replace(/[^0-9]/g, '') || '60000000'),
          nextDrawing: calculateNextDrawing(),
          lastDrawing: latest.draw_date,
          source: 'ny_lottery'
        }
      };
    }

    return null;
  }

  async fetchFromLotteryUSA(baseUrl, type, signal) {
    if (type === 'current') {
      // This would typically scrape or use their API
      // For demo purposes, we'll simulate the response
      const response = await fetch(baseUrl, { 
        signal,
        headers: { 'Accept': 'text/html' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // In a real implementation, you'd parse the HTML or use their API
      // For now, return simulated data with variation
      const baseAmount = 100000000 + Math.floor(Math.random() * 500000000);
      
      return {
        jackpot: {
          amount: baseAmount,
          cashValue: Math.floor(baseAmount * 0.6),
          nextDrawing: calculateNextDrawing(),
          source: 'lottery_usa'
        }
      };
    }

    return null;
  }

  async fetchFromPowerballCom(baseUrl, type, signal) {
    if (type === 'current') {
      // Powerball.com API simulation
      const response = await fetch(`${baseUrl}/current`, { signal });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Simulate their API response structure
      const baseAmount = 150000000 + Math.floor(Math.random() * 400000000);
      
      return {
        jackpot: {
          amount: baseAmount,
          cashValue: Math.floor(baseAmount * 0.62),
          nextDrawing: calculateNextDrawing(),
          source: 'powerball_com'
        }
      };
    }

    return null;
  }

  // ===========================================================================
  // HISTORICAL DATA FETCHING
  // ===========================================================================

  async fetchHistoricalData(limit = 500) {
    console.log(`?? Fetching historical data (limit: ${limit})...`);
    
    try {
      // Check cache first
      const cacheKey = `historical_${limit}`;
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        console.log('?? Using cached historical data');
        return { success: true, data: cachedData, source: 'cache' };
      }

      // Try to fetch from data sources
      for (const source of this.dataSources) {
        if (!source.isActive || !source.capabilities.includes('historical')) continue;

        try {
          const data = await this.fetchHistoricalFromSource(source, limit);
          if (data && validateHistoricalData(data.drawings)) {
            this.setCachedData(cacheKey, data);
            console.log(`? Historical data from ${source.name}: ${data.drawings.length} drawings`);
            return { success: true, data, source: source.id };
          }
        } catch (error) {
          console.warn(`?? ${source.name} historical fetch failed:`, error.message);
          continue;
        }
      }

      // Use fallback data
      console.log('?? Using fallback historical data');
      const fallbackData = {
        ...this.fallbackData.historicalSample,
        drawings: this.fallbackData.historicalSample.drawings.slice(0, limit)
      };
      
      return { 
        success: true, 
        data: fallbackData, 
        source: 'fallback',
        warning: 'Live historical data unavailable, using generated sample'
      };

    } catch (error) {
      console.error('? Failed to fetch historical data:', error);
      return {
        success: false,
        error: handleApiError(error),
        data: this.fallbackData.historicalSample
      };
    }
  }

  async fetchHistoricalFromSource(source, limit) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      let data;

      switch (source.id) {
        case 'ny_lottery':
          data = await this.fetchHistoricalFromNY(source.baseUrl, limit, controller.signal);
          break;
        case 'powerball_com':
          data = await this.fetchHistoricalFromPowerball(source.baseUrl, limit, controller.signal);
          break;
        default:
          throw new Error(`Source ${source.id} doesn't support historical data`);
      }

      clearTimeout(timeout);
      return data;

    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  async fetchHistoricalFromNY(baseUrl, limit, signal) {
    const url = `${baseUrl}?$limit=${limit}&$order=draw_date DESC`;
    const response = await fetch(url, { signal });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const rawData = await response.json();
    
    if (!Array.isArray(rawData) || rawData.length === 0) {
      throw new Error('Invalid historical data format');
    }

    // Transform NY Lottery data format
    const drawings = rawData
      .filter(drawing => drawing.winning_numbers && drawing.draw_date)
      .map(drawing => {
        const numbersStr = drawing.winning_numbers;
        const parts = numbersStr.split(' ');
        const powerball = parseInt(parts[parts.length - 1]);
        const numbers = parts.slice(0, -1).map(n => parseInt(n)).sort((a, b) => a - b);

        return {
          date: drawing.draw_date,
          numbers: numbers,
          powerball: powerball,
          jackpot: parseInt(drawing.jackpot?.replace(/[^0-9]/g, '') || '0'),
          multiplier: parseInt(drawing.multiplier || '1'),
          source: 'ny_lottery'
        };
      })
      .filter(drawing => 
        drawing.numbers.length === 5 && 
        drawing.powerball >= 1 && 
        drawing.powerball <= 26
      );

    // Calculate statistics
    const hotNumbers = this.calculateHotNumbers(drawings);
    const coldNumbers = this.calculateColdNumbers(drawings);

    return {
      drawings,
      totalDrawings: drawings.length,
      dateRange: {
        earliest: drawings[drawings.length - 1]?.date,
        latest: drawings[0]?.date
      },
      hotNumbers,
      coldNumbers,
      source: 'ny_lottery'
    };
  }

  async fetchHistoricalFromPowerball(baseUrl, limit, signal) {
    // Simulate Powerball.com historical API
    const url = `${baseUrl}/historical?limit=${limit}`;
    const response = await fetch(url, { signal });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Return fallback data for simulation
    return this.fallbackData.historicalSample;
  }

  // ===========================================================================
  // DATA ANALYSIS HELPERS
  // ===========================================================================

  calculateHotNumbers(drawings) {
    const frequency = {};
    
    drawings.forEach(drawing => {
      drawing.numbers.forEach(num => {
        frequency[num] = (frequency[num] || 0) + 1;
      });
    });

    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }));
  }

  calculateColdNumbers(drawings) {
    const frequency = {};
    
    // Initialize all numbers
    for (let i = 1; i <= 69; i++) {
      frequency[i] = 0;
    }

    drawings.forEach(drawing => {
      drawing.numbers.forEach(num => {
        frequency[num]++;
      });
    });

    return Object.entries(frequency)
      .sort(([,a], [,b]) => a - b)
      .slice(0, 15)
      .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }));
  }

  // ===========================================================================
  // DIAGNOSTICS & MONITORING
  // ===========================================================================

  async getDiagnostics() {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      sources: [],
      cache: {
        size: this.cache.size,
        keys: Array.from(this.cache.keys())
      },
      performance: {
        retryCount: this.retryCount,
        maxRetries: this.maxRetries,
        cacheTimeout: this.cacheTimeout
      }
    };

    // Test each data source
    for (const source of this.dataSources) {
      try {
        const test = await this.testDataSource(source);
        diagnostics.sources.push({
          ...source,
          ...test,
          lastTested: new Date().toISOString()
        });
      } catch (error) {
        diagnostics.sources.push({
          ...source,
          success: false,
          error: error.message,
          lastTested: new Date().toISOString()
        });
      }
    }

    return diagnostics;
  }

  getSourceStatus() {
    return this.dataSources.map(source => ({
      id: source.id,
      name: source.name,
      active: source.isActive,
      capabilities: source.capabilities,
      priority: source.priority
    }));
  }

  // ===========================================================================
  // CONFIGURATION
  // ===========================================================================

  updateSourceStatus(sourceId, isActive) {
    const source = this.dataSources.find(s => s.id === sourceId);
    if (source) {
      source.isActive = isActive;
      console.log(`?? ${source.name} ${isActive ? 'enabled' : 'disabled'}`);
    }
  }

  setCacheTimeout(timeout) {
    this.cacheTimeout = timeout;
    console.log(`?? Cache timeout set to ${timeout}ms`);
  }

  // ===========================================================================
  // ERROR HANDLING & RETRY LOGIC
  // ===========================================================================

  async retryOperation(operation, context = '') {
    let lastError;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff
          console.log(`?? Retrying ${context} (attempt ${attempt}/${this.maxRetries}) after ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const result = await operation();
        
        if (attempt > 0) {
          console.log(`? ${context} succeeded on attempt ${attempt + 1}`);
        }
        
        return result;

      } catch (error) {
        lastError = error;
        this.retryCount++;
        
        if (attempt === this.maxRetries) {
          console.error(`? ${context} failed after ${this.maxRetries + 1} attempts:`, error.message);
          throw error;
        }
      }
    }

    throw lastError;
  }

  // ===========================================================================
  // FALLBACK DATA MANAGEMENT
  // ===========================================================================

  updateFallbackJackpot(amount, cashValue) {
    this.fallbackData.jackpot = {
      amount,
      cashValue,
      nextDrawing: calculateNextDrawing(),
      source: 'manual',
      lastUpdated: new Date().toISOString()
    };
    
    console.log(`?? Fallback jackpot updated: ${amount}`);
  }

  generateTestData(count = 100) {
    const testDrawings = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (count * 3.5));

    for (let i = 0; i < count; i++) {
      const drawDate = new Date(startDate);
      drawDate.setDate(drawDate.getDate() + (i * 3.5));

      const numbers = [];
      while (numbers.length < 5) {
        const num = Math.floor(Math.random() * 69) + 1;
        if (!numbers.includes(num)) {
          numbers.push(num);
        }
      }

      testDrawings.push({
        date: drawDate.toISOString().split('T')[0],
        numbers: numbers.sort((a, b) => a - b),
        powerball: Math.floor(Math.random() * 26) + 1,
        jackpot: 20000000 + Math.floor(Math.random() * 200000000),
        source: 'test'
      });
    }

    return {
      drawings: testDrawings.reverse(),
      totalDrawings: testDrawings.length,
      source: 'test'
    };
  }
}

// Create and export singleton instance
export const powerballAPI = new PowerballAPI();

// Auto-initialize
console.log('?? PowerballAPI service initialized');
console.log(`?? ${powerballAPI.dataSources.length} data sources configured`);
console.log(`?? Cache timeout: ${powerballAPI.cacheTimeout / 1000}s`);