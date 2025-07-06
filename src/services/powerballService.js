// src/services/powerballService.js - CORS Fixed Version

/**
 * Powerball Data Service - CORS Issues Fixed
 * Now uses internal API endpoints instead of external APIs
 */

class PowerballDataError extends Error {
  constructor(message, code = 'UNKNOWN', details = null) {
    super(message);
    this.name = 'PowerballDataError';
    this.code = code;
    this.details = details;
  }
}

export class PowerballService {
  constructor() {
    // Use your own API endpoints instead of external APIs
    this.apiBase = window.location.origin; // This will be https://lcv2.vercel.app in production
    this.currentJackpotEndpoint = `${this.apiBase}/api/powerball`;
    this.historicalDataEndpoint = `${this.apiBase}/api/powerball-history`;
    this.testEndpoint = `${this.apiBase}/api/test`;
  }

  /**
   * Test API connectivity
   */
  async testConnection() {
    try {
      const response = await fetch(this.testEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Test endpoint returned ${response.status}`);
      }

      const data = await response.json();
      console.log('API Test Result:', data);
      return data;
    } catch (error) {
      console.error('API Test Failed:', error);
      throw new PowerballDataError(
        'Cannot connect to internal API',
        'API_CONNECTION_FAILED',
        { originalError: error.message }
      );
    }
  }

  /**
   * Fetches current jackpot information using internal API
   */
  async getCurrentJackpot() {
    try {
      console.log('Fetching current jackpot from internal API...');
      
      const response = await fetch(this.currentJackpotEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new PowerballDataError(
          data.message || 'Failed to fetch jackpot data',
          'API_ERROR',
          data
        );
      }

      // Set next drawing info if available
      if (data.nextDrawing) {
        // You can dispatch this to your context if needed
        console.log('Next drawing:', data.nextDrawing);
      }

      return {
        success: true,
        jackpot: data.jackpot,
        latestNumbers: data.latestNumbers,
        nextDrawing: data.nextDrawing,
        source: data.source,
        timestamp: data.timestamp
      };

    } catch (error) {
      console.error('Jackpot fetch error:', error);
      
      // Don't throw CORS errors anymore since we're using internal API
      throw new PowerballDataError(
        error.message || 'Failed to fetch current jackpot data',
        'API_ERROR',
        { 
          suggestion: 'Please check your internet connection and try again.',
          nextDrawing: this.getNextDrawingInfo()
        }
      );
    }
  }

  /**
   * Fetches historical drawing data using internal API
   */
  async getHistoricalData(limit = 100) {
    try {
      console.log(`Fetching ${limit} historical drawings from internal API...`);
      
      const response = await fetch(`${this.historicalDataEndpoint}?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Historical API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new PowerballDataError(
          data.message || 'Failed to fetch historical data',
          'API_ERROR',
          data
        );
      }

      console.log(`Successfully fetched ${data.drawings?.length || 0} historical drawings`);
      
      return {
        drawings: data.drawings || [],
        analysis: data.analysis || null,
        source: data.source,
        timestamp: data.timestamp,
        processingInfo: data.processingInfo
      };

    } catch (error) {
      console.error('Historical data fetch error:', error);
      
      throw new PowerballDataError(
        error.message || 'Failed to fetch historical lottery data',
        'API_ERROR',
        { 
          suggestion: 'The lottery data service may be temporarily unavailable. Please try again in a few minutes.',
          fallbackMessage: 'Historical analysis requires real drawing data to function properly.'
        }
      );
    }
  }

  /**
   * Get next drawing information (fallback method)
   */
  getNextDrawingInfo() {
    const now = new Date();
    const nextWednesday = new Date(now);
    const nextSaturday = new Date(now);
    
    // Set to next Wednesday
    nextWednesday.setDate(now.getDate() + (3 - now.getDay() + 7) % 7);
    nextWednesday.setHours(23, 0, 0, 0); // 11:00 PM ET
    
    // Set to next Saturday  
    nextSaturday.setDate(now.getDate() + (6 - now.getDay() + 7) % 7);
    nextSaturday.setHours(23, 0, 0, 0); // 11:00 PM ET
    
    const nextDraw = nextWednesday < nextSaturday ? nextWednesday : nextSaturday;
    const dayName = nextDraw.getDay() === 3 ? 'Wednesday' : 'Saturday';
    
    return {
      date: nextDraw.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: '11:00 PM ET',
      day: dayName,
      timestamp: nextDraw.getTime()
    };
  }

  /**
   * Process and validate historical data
   */
  processHistoricalData(rawData, requestedLimit) {
    try {
      if (!Array.isArray(rawData) || rawData.length === 0) {
        throw new Error('No historical data available');
      }

      const processedDrawings = rawData
        .slice(0, requestedLimit)
        .map(drawing => this.validateDrawingData(drawing))
        .filter(drawing => drawing !== null);

      if (processedDrawings.length === 0) {
        throw new Error('No valid drawings found in data');
      }

      // Generate analysis
      const analysis = this.generateAnalysis(processedDrawings);

      return {
        drawings: processedDrawings,
        analysis,
        totalDrawings: processedDrawings.length,
        requestedLimit,
        processingDate: new Date().toISOString()
      };

    } catch (error) {
      throw new PowerballDataError(
        `Failed to process historical data: ${error.message}`,
        'PROCESSING_ERROR'
      );
    }
  }

  /**
   * Validate individual drawing data
   */
  validateDrawingData(drawing) {
    try {
      // Handle different data formats
      let numbers, powerball, drawDate;
      
      if (drawing.winning_numbers || drawing.numbers) {
        const numbersStr = drawing.winning_numbers || drawing.numbers;
        const allNumbers = numbersStr
          .replace(/\s*PB:\s*/, ' ')
          .split(/\s+/)
          .map(n => parseInt(n.trim()))
          .filter(n => !isNaN(n));

        if (allNumbers.length >= 6) {
          numbers = allNumbers.slice(0, 5).sort((a, b) => a - b);
          powerball = allNumbers[5];
          
          // Validate ranges
          if (numbers.every(n => n >= 1 && n <= 69) && powerball >= 1 && powerball <= 26) {
            drawDate = drawing.draw_date || drawing.date || drawing.drawDate;
            
            return {
              numbers,
              powerball,
              drawDate: drawDate ? drawDate.split('T')[0] : null,
              jackpot: drawing.jackpot || null,
              multiplier: drawing.multiplier || null,
              cashValue: drawing.cash_value || drawing.cashValue || null
            };
          }
        }
      }
      
      return null; // Invalid drawing
    } catch (error) {
      console.warn('Failed to validate drawing:', error);
      return null;
    }
  }


  /**
   * Generate statistical analysis of historical data
   */
  generateAnalysis(drawings) {
    if (!drawings || drawings.length === 0) {
      return null;
    }

    try {
      // Number frequency analysis
      const numberFreq = {};
      const powerballFreq = {};
      
      drawings.forEach(drawing => {
        drawing.numbers.forEach(num => {
          numberFreq[num] = (numberFreq[num] || 0) + 1;
        });
        powerballFreq[drawing.powerball] = (powerballFreq[drawing.powerball] || 0) + 1;
      });

      // Sort by frequency
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

      return {
        totalDrawings: drawings.length,
        dateRange: {
          earliest: drawings[drawings.length - 1]?.drawDate,
          latest: drawings[0]?.drawDate
        },
        hotNumbers,
        coldNumbers,
        hotPowerballs,
        averageJackpot: this.calculateAverageJackpot(drawings),
        lastUpdate: new Date().toISOString()
      };

    } catch (error) {
      console.warn('Failed to generate analysis:', error);
      return null;
    }
  }

  /**
   * Calculate average jackpot from drawings
   */
  calculateAverageJackpot(drawings) {
    const jackpots = drawings
      .map(d => d.jackpot)
      .filter(j => j && !isNaN(parseFloat(j)))
      .map(j => parseFloat(j.toString().replace(/[$,]/g, '')));

    if (jackpots.length === 0) return null;

    const average = jackpots.reduce((sum, j) => sum + j, 0) / jackpots.length;
    return Math.round(average);
  }
}