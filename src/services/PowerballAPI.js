// src/services/PowerballAPI.js - Enhanced Data Accuracy & Error Handling
import { API_ENDPOINTS, APP_CONFIG } from '../utils/constants.js';
import { getCachedData, setCachedData, logError, isValidMainNumber, isValidPowerball } from '../utils/helpers.js';

class EnhancedPowerballAPI {
  constructor() {
    this.initialized = false;
    this.lastUpdate = null;
    this.errorCount = 0;
    this.maxRetries = APP_CONFIG.maxRetries;
    this.requestTimeout = APP_CONFIG.requestTimeout;
    this.cacheTimeout = APP_CONFIG.cacheTimeout;
    
    // Enhanced data sources with priority and fallback logic
    this.dataSources = [
      {
        id: 'ny_lottery_primary',
        name: 'NY State Lottery (Primary)',
        baseUrl: 'https://data.ny.gov/resource/d6yy-54nr.json',
        priority: 1,
        isActive: true,
        capabilities: ['current', 'historical'],
        rateLimit: { requests: 100, window: 3600000 }, // 100 requests per hour
        parser: this.parseNYLotteryData.bind(this),
        validator: this.validateDrawingData.bind(this)
      },
      {
        id: 'ny_lottery_backup',
        name: 'NY State Lottery (Backup)',
        baseUrl: 'https://data.ny.gov/resource/5xaw-6ayf.json',
        priority: 2,
        isActive: true,
        capabilities: ['current', 'historical'],
        rateLimit: { requests: 100, window: 3600000 },
        parser: this.parseNYLotteryBackupData.bind(this),
        validator: this.validateDrawingData.bind(this)
      },
      {
        id: 'powerball_com',
        name: 'Powerball.com API',
        baseUrl: 'https://www.powerball.com/api/v1',
        priority: 3,
        isActive: false, // Disabled by default due to CORS
        capabilities: ['current'],
        rateLimit: { requests: 50, window: 3600000 },
        parser: this.parsePowerballComData.bind(this),
        validator: this.validateDrawingData.bind(this)
      }
    ];
    
    // Fallback data for offline mode
    this.fallbackData = {
      current: {
        jackpot: {
          amount: 100000000,
          cashValue: 60000000,
          nextDrawing: this.calculateNextDrawing(),
          lastDrawing: new Date().toISOString().split('T')[0],
          source: 'fallback'
        }
      },
      historicalSample: this.generateFallbackHistoricalData()
    };
    
    this.initialize();
  }

  // ===========================================================================
  // INITIALIZATION & SETUP
  // ===========================================================================
  
  async initialize() {
    if (this.initialized) return;
    
    try {
      console.log('🌐 Initializing Enhanced PowerballAPI...');
      
      // Test data source connectivity
      await this.testDataSources();
      
      // Load cached data if available
      await this.loadCachedData();
      
      this.initialized = true;
      console.log('✅ PowerballAPI initialized successfully');
      console.log(`📊 Active sources: ${this.getActiveSources().length}`);
      
    } catch (error) {
      console.error('❌ PowerballAPI initialization failed:', error);
      this.errorCount++;
      // Continue with fallback mode
      this.initialized = true;
    }
  }

  async testDataSources() {
    console.log('🔍 Testing data source connectivity...');
    
    for (const source of this.dataSources) {
      if (!source.isActive) continue;
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${source.baseUrl}?$limit=1`, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'LCv2-LotteryApp/2.0.0'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log(`✅ ${source.name}: Connected`);
          source.lastTested = new Date().toISOString();
          source.status = 'healthy';
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
        
      } catch (error) {
        console.warn(`⚠️ ${source.name}: ${error.message}`);
        source.status = 'error';
        source.lastError = error.message;
        
        // Disable source if consistently failing
        if (error.name === 'AbortError') {
          source.isActive = false;
        }
      }
    }
  }

  getActiveSources() {
    return this.dataSources.filter(source => source.isActive && source.status !== 'error');
  }

  // ===========================================================================
  // CURRENT JACKPOT DATA FETCHING
  // ===========================================================================
  
  async fetchCurrentData() {
    console.log('🎰 Fetching current jackpot data...');
    
    try {
      // Check cache first
      const cacheKey = 'current_jackpot';
      const cachedData = getCachedData(cacheKey);
      if (cachedData && this.isCacheValid(cachedData.timestamp)) {
        console.log('📋 Using cached current data');
        return {
          success: true,
          data: cachedData.data,
          source: 'cache'
        };
      }

      // Try active sources in priority order
      const activeSources = this.getActiveSources()
        .filter(source => source.capabilities.includes('current'))
        .sort((a, b) => a.priority - b.priority);

      for (const source of activeSources) {
        try {
          console.log(`🌐 Trying ${source.name}...`);
          const data = await this.fetchFromSource(source, 'current');
          
          if (data && this.validateCurrentData(data)) {
            // Cache successful response
            setCachedData(cacheKey, {
              data,
              timestamp: new Date().toISOString(),
              source: source.id
            });
            
            console.log(`✅ Current data from ${source.name}`);
            return {
              success: true,
              data,
              source: source.id
            };
          }
          
        } catch (error) {
          console.warn(`❌ ${source.name} failed:`, error.message);
          continue;
        }
      }

      // All sources failed, return fallback
      console.log('⚠️ All sources failed, using fallback data');
      return {
        success: false,
        data: this.fallbackData.current,
        source: 'fallback',
        warning: 'Live data unavailable, using generated sample'
      };

    } catch (error) {
      console.error('❌ Failed to fetch current data:', error);
      this.errorCount++;
      logError(error, { context: 'fetchCurrentData' });
      
      return {
        success: false,
        data: this.fallbackData.current,
        source: 'fallback',
        error: error.message
      };
    }
  }

  // ===========================================================================
  // HISTORICAL DATA FETCHING
  // ===========================================================================
  
  async fetchHistoricalData(limit = 500) {
    console.log(`📊 Fetching historical data (limit: ${limit})...`);
    
    try {
      // Validate limit
      limit = Math.min(Math.max(limit, 25), 2000);
      
      // Check cache first
      const cacheKey = `historical_${limit}`;
      const cachedData = getCachedData(cacheKey);
      if (cachedData && this.isCacheValid(cachedData.timestamp, 1800000)) { // 30 min cache
        console.log('📋 Using cached historical data');
        return {
          success: true,
          data: cachedData.data,
          source: 'cache'
        };
      }

      // Try active sources
      const activeSources = this.getActiveSources()
        .filter(source => source.capabilities.includes('historical'))
        .sort((a, b) => a.priority - b.priority);

      for (const source of activeSources) {
        try {
          console.log(`🌐 Fetching historical from ${source.name}...`);
          const data = await this.fetchFromSource(source, 'historical', { limit });
          
          if (data && this.validateHistoricalData(data)) {
            // Cache successful response
            setCachedData(cacheKey, {
              data,
              timestamp: new Date().toISOString(),
              source: source.id
            });
            
            console.log(`✅ Historical data from ${source.name}: ${data.drawings.length} drawings`);
            return {
              success: true,
              data,
              source: source.id
            };
          }
          
        } catch (error) {
          console.warn(`❌ ${source.name} historical fetch failed:`, error.message);
          continue;
        }
      }

      // All sources failed, return fallback
      console.log('⚠️ Using fallback historical data');
      return {
        success: false,
        data: {
          ...this.fallbackData.historicalSample,
          drawings: this.fallbackData.historicalSample.drawings.slice(0, limit)
        },
        source: 'fallback',
        warning: 'Live historical data unavailable, using generated sample'
      };

    } catch (error) {
      console.error('❌ Historical data fetch failed:', error);
      this.errorCount++;
      return {
        success: false,
        data: this.fallbackData.historicalSample,
        source: 'fallback',
        error: error.message
      };
    }
  }

  // ===========================================================================
  // DATA SOURCE IMPLEMENTATIONS
  // ===========================================================================
  
  async fetchFromSource(source, type, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);
    
    try {
      let url = source.baseUrl;
      
      if (type === 'current') {
        url += '?$order=draw_date DESC&$limit=1';
      } else if (type === 'historical') {
        const limit = options.limit || 500;
        url += `?$order=draw_date DESC&$limit=${limit}`;
      }
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'LCv2-LotteryApp/2.0.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const rawData = await response.json();
      return source.parser(rawData, type, options);
      
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // ===========================================================================
  // DATA PARSERS
  // ===========================================================================
  
  parseNYLotteryData(rawData, type, options = {}) {
    if (!Array.isArray(rawData) || rawData.length === 0) {
      throw new Error('No data received from NY Lottery API');
    }

    if (type === 'current') {
      const latest = rawData[0];
      return {
        jackpot: {
          amount: this.parseJackpotAmount(latest.jackpot),
          cashValue: this.parseJackpotAmount(latest.cash_value),
          nextDrawing: this.calculateNextDrawing(),
          lastDrawing: latest.draw_date,
          numbers: this.parseNumbers(latest.winning_numbers),
          powerball: parseInt(latest.multiplier) || null,
          source: 'ny_lottery'
        }
      };
    } else if (type === 'historical') {
      const drawings = rawData.map(drawing => ({
        date: drawing.draw_date,
        numbers: this.parseNumbers(drawing.winning_numbers),
        powerball: parseInt(drawing.multiplier) || null,
        jackpot: this.parseJackpotAmount(drawing.jackpot),
        source: 'ny_lottery'
      })).filter(drawing => this.validateDrawingData(drawing));

      return {
        drawings,
        totalDrawings: drawings.length,
        dateRange: this.calculateDateRange(drawings),
        source: 'ny_lottery',
        lastUpdated: new Date().toISOString()
      };
    }

    throw new Error(`Unsupported data type: ${type}`);
  }

  parseNYLotteryBackupData(rawData, type, options = {}) {
    // Similar structure to primary, but might have different field names
    return this.parseNYLotteryData(rawData, type, options);
  }

  parsePowerballComData(rawData, type, options = {}) {
    // Implementation for Powerball.com API
    // This would need to be customized based on their actual API structure
    throw new Error('Powerball.com API parser not implemented');
  }

  // ===========================================================================
  // DATA VALIDATION
  // ===========================================================================
  
  validateCurrentData(data) {
    if (!data || !data.jackpot) return false;
    
    const { jackpot } = data;
    return (
      typeof jackpot.amount === 'number' &&
      jackpot.amount > 0 &&
      jackpot.nextDrawing &&
      jackpot.source
    );
  }

  validateHistoricalData(data) {
    if (!data || !Array.isArray(data.drawings)) return false;
    
    // Validate at least 80% of drawings have valid data
    const validDrawings = data.drawings.filter(this.validateDrawingData);
    return validDrawings.length >= data.drawings.length * 0.8;
  }

  validateDrawingData(drawing) {
    if (!drawing || !drawing.date) return false;
    
    // Validate numbers
    if (drawing.numbers) {
      if (!Array.isArray(drawing.numbers) || drawing.numbers.length !== 5) return false;
      if (!drawing.numbers.every(num => isValidMainNumber(num))) return false;
    }
    
    // Validate powerball
    if (drawing.powerball && !isValidPowerball(drawing.powerball)) return false;
    
    return true;
  }

  // ===========================================================================
  // UTILITY METHODS
  // ===========================================================================
  
  parseJackpotAmount(amountStr) {
    if (!amountStr) return null;
    
    // Remove currency symbols and convert to number
    const cleanStr = amountStr.toString().replace(/[^0-9.]/g, '');
    const amount = parseFloat(cleanStr);
    
    // Handle millions notation
    if (amountStr.toLowerCase().includes('million')) {
      return Math.round(amount * 1000000);
    }
    
    return Math.round(amount);
  }

  parseNumbers(numbersStr) {
    if (!numbersStr) return null;
    
    try {
      // Handle various formats: "1,2,3,4,5" or "1 2 3 4 5" or JSON array
      if (typeof numbersStr === 'string') {
        const numbers = numbersStr
          .replace(/[\[\]]/g, '') // Remove brackets
          .split(/[,\s]+/) // Split by comma or space
          .map(num => parseInt(num.trim()))
          .filter(num => !isNaN(num) && num >= 1 && num <= 69);
        
        return numbers.length === 5 ? numbers.sort((a, b) => a - b) : null;
      }
      
      if (Array.isArray(numbersStr)) {
        const numbers = numbersStr
          .map(num => parseInt(num))
          .filter(num => !isNaN(num) && num >= 1 && num <= 69);
        
        return numbers.length === 5 ? numbers.sort((a, b) => a - b) : null;
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to parse numbers:', numbersStr, error);
      return null;
    }
  }

  calculateNextDrawing() {
    const now = new Date();
    const drawDays = [1, 3, 6]; // Monday, Wednesday, Saturday
    const currentDay = now.getDay();
    
    let nextDrawDay = drawDays.find(day => day > currentDay);
    if (!nextDrawDay) {
      nextDrawDay = drawDays[0]; // Next Monday
    }
    
    const daysUntilDraw = nextDrawDay > currentDay 
      ? nextDrawDay - currentDay 
      : 7 - currentDay + nextDrawDay;
    
    const nextDraw = new Date(now);
    nextDraw.setDate(now.getDate() + daysUntilDraw);
    nextDraw.setHours(23, 0, 0, 0); // 11 PM ET
    
    return nextDraw.toISOString();
  }

  calculateDateRange(drawings) {
    if (!drawings || drawings.length === 0) return null;
    
    const dates = drawings
      .map(d => d.date)
      .filter(date => date)
      .sort();
    
    return {
      earliest: dates[0],
      latest: dates[dates.length - 1],
      span: `${drawings.length} drawings`
    };
  }

  isCacheValid(timestamp, maxAge = this.cacheTimeout) {
    if (!timestamp) return false;
    return (new Date().getTime() - new Date(timestamp).getTime()) < maxAge;
  }

  async loadCachedData() {
    try {
      const currentCache = getCachedData('current_jackpot');
      const historicalCache = getCachedData('historical_500');
      
      if (currentCache) {
        console.log('📋 Found cached current data');
      }
      
      if (historicalCache) {
        console.log('📋 Found cached historical data');
      }
    } catch (error) {
      console.warn('⚠️ Failed to load cached data:', error);
    }
  }

  generateFallbackHistoricalData() {
    const drawings = [];
    const today = new Date();
    
    // Generate 500 sample drawings going back in time
    for (let i = 0; i < 500; i++) {
      const drawDate = new Date(today);
      drawDate.setDate(today.getDate() - (i * 3)); // Every 3 days
      
      // Generate realistic but random numbers
      const numbers = [];
      while (numbers.length < 5) {
        const num = Math.floor(Math.random() * 69) + 1;
        if (!numbers.includes(num)) {
          numbers.push(num);
        }
      }
      numbers.sort((a, b) => a - b);
      
      const powerball = Math.floor(Math.random() * 26) + 1;
      const jackpot = 50000000 + Math.floor(Math.random() * 500000000);
      
      drawings.push({
        date: drawDate.toISOString().split('T')[0],
        numbers,
        powerball,
        jackpot,
        source: 'fallback'
      });
    }
    
    return {
      drawings,
      totalDrawings: drawings.length,
      dateRange: {
        earliest: drawings[drawings.length - 1].date,
        latest: drawings[0].date
      },
      source: 'fallback',
      lastUpdated: new Date().toISOString()
    };
  }

  // ===========================================================================
  // DIAGNOSTIC METHODS
  // ===========================================================================
  
  getStatus() {
    return {
      initialized: this.initialized,
      lastUpdate: this.lastUpdate,
      errorCount: this.errorCount,
      activeSources: this.getActiveSources().length,
      totalSources: this.dataSources.length,
      sources: this.dataSources.map(source => ({
        id: source.id,
        name: source.name,
        status: source.status || 'unknown',
        isActive: source.isActive,
        lastTested: source.lastTested,
        lastError: source.lastError
      }))
    };
  }

  async runDiagnostics() {
    console.log('🔍 Running PowerballAPI diagnostics...');
    
    await this.testDataSources();
    
    return {
      status: this.getActiveSources().length > 0 ? 'healthy' : 'degraded',
      ...this.getStatus(),
      performance: {
        averageResponseTime: null, // Could implement if needed
        cacheHitRate: null, // Could implement if needed
        lastSuccessfulUpdate: this.lastUpdate
      }
    };
  }
}

// Create and export singleton instance
export const powerballAPI = new EnhancedPowerballAPI();