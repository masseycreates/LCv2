// src/services/powerballService.js

/**
 * Real Powerball Data Service
 * Fetches actual data from legitimate sources - NO MOCK DATA
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
    // NY Lottery API is one of the most reliable sources
    this.baseURL = 'https://data.ny.gov/resource/d6yy-54nr.json';
    this.backup1URL = 'https://www.powerball.com/api/v1/estimates/powerball';
    this.backup2URL = 'https://api.lottery.com/api/v2/drawings/powerball';
  }

  /**
   * Fetches current jackpot information
   */
  async getCurrentJackpot() {
    const errors = [];

    // Try multiple sources for current jackpot
    const sources = [
      {
        name: 'Powerball Official',
        fetch: () => this.fetchFromPowerballOfficial()
      },
      {
        name: 'NY Lottery API',
        fetch: () => this.fetchFromNYLottery()
      },
      {
        name: 'Lottery.com API',
        fetch: () => this.fetchFromLotteryDotCom()
      }
    ];

    for (const source of sources) {
      try {
        const result = await source.fetch();
        if (result) return result;
      } catch (error) {
        errors.push(`${source.name}: ${error.message}`);
      }
    }

    throw new PowerballDataError(
      'Unable to fetch current jackpot information from any source',
      'JACKPOT_FETCH_FAILED',
      { attemptedSources: errors }
    );
  }

  /**
   * Fetches historical drawing data
   */
  async getHistoricalData(limit = 100) {
    try {
      // NY Lottery has reliable historical data
      const response = await fetch(`${this.baseURL}?$limit=${limit}&$order=draw_date DESC`);
      
      if (!response.ok) {
        throw new PowerballDataError(
          `NY Lottery API returned ${response.status}: ${response.statusText}`,
          'API_ERROR'
        );
      }

      const data = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new PowerballDataError(
          'No historical data available from NY Lottery API',
          'NO_DATA'
        );
      }

      return this.processHistoricalData(data, limit);
    } catch (error) {
      if (error instanceof PowerballDataError) throw error;
      
      throw new PowerballDataError(
        `Failed to fetch historical data: ${error.message}`,
        'NETWORK_ERROR',
        { originalError: error.message }
      );
    }
  }

  /**
   * Analyzes historical data for patterns
   */
  analyzeHistoricalData(drawings) {
    if (!drawings || drawings.length === 0) {
      throw new PowerballDataError(
        'Cannot analyze patterns: No historical data provided',
        'INSUFFICIENT_DATA'
      );
    }

    try {
      const numberFrequency = {};
      const powerballFrequency = {};
      const consecutiveNumbers = [];
      const sumAnalysis = [];

      drawings.forEach(drawing => {
        // Main numbers frequency
        drawing.numbers.forEach(num => {
          numberFrequency[num] = (numberFrequency[num] || 0) + 1;
        });
        
        // Powerball frequency
        powerballFrequency[drawing.powerball] = (powerballFrequency[drawing.powerball] || 0) + 1;
        
        // Sum analysis
        const sum = drawing.numbers.reduce((a, b) => a + b, 0);
        sumAnalysis.push(sum);
        
        // Consecutive number analysis
        const sorted = [...drawing.numbers].sort((a, b) => a - b);
        let consecutive = 0;
        for (let i = 1; i < sorted.length; i++) {
          if (sorted[i] === sorted[i-1] + 1) consecutive++;
        }
        consecutiveNumbers.push(consecutive);
      });

      // Sort by frequency
      const hotNumbers = Object.entries(numberFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 15)
        .map(([num]) => parseInt(num));

      const coldNumbers = Object.entries(numberFrequency)
        .sort(([,a], [,b]) => a - b)
        .slice(0, 15)
        .map(([num]) => parseInt(num));

      const hotPowerballs = Object.entries(powerballFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([num]) => parseInt(num));

      return {
        totalDrawings: drawings.length,
        dateRange: {
          earliest: drawings[drawings.length - 1]?.date,
          latest: drawings[0]?.date
        },
        numberAnalysis: {
          hotNumbers,
          coldNumbers,
          frequency: numberFrequency
        },
        powerballAnalysis: {
          hotPowerballs,
          frequency: powerballFrequency
        },
        patterns: {
          averageSum: sumAnalysis.reduce((a, b) => a + b, 0) / sumAnalysis.length,
          sumRange: {
            min: Math.min(...sumAnalysis),
            max: Math.max(...sumAnalysis)
          },
          averageConsecutive: consecutiveNumbers.reduce((a, b) => a + b, 0) / consecutiveNumbers.length
        },
        dataSource: 'NY Lottery API',
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      throw new PowerballDataError(
        `Failed to analyze historical data: ${error.message}`,
        'ANALYSIS_ERROR'
      );
    }
  }

  // Private methods for different data sources

  async fetchFromPowerballOfficial() {
    try {
      const response = await fetch('https://www.powerball.com/api/v1/estimates/powerball');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return this.formatJackpotData(data, 'Powerball Official');
    } catch (error) {
      throw new Error(`Powerball official API error: ${error.message}`);
    }
  }

  async fetchFromNYLottery() {
    try {
      const response = await fetch(`${this.baseURL}?$limit=1&$order=draw_date DESC`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      if (!data || data.length === 0) throw new Error('No data returned');
      
      return this.formatJackpotData(data[0], 'NY Lottery');
    } catch (error) {
      throw new Error(`NY Lottery API error: ${error.message}`);
    }
  }

  async fetchFromLotteryDotCom() {
    try {
      const response = await fetch('https://api.lottery.com/api/v2/drawings/powerball?limit=1');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return this.formatJackpotData(data, 'Lottery.com');
    } catch (error) {
      throw new Error(`Lottery.com API error: ${error.message}`);
    }
  }

  processHistoricalData(rawData, requestedLimit) {
    try {
      const processedDrawings = rawData
        .slice(0, requestedLimit)
        .map(drawing => {
          // Parse numbers from different possible formats
          let numbers, powerball;
          
          if (drawing.winning_numbers) {
            // NY Lottery format: "01 02 03 04 05 PB:06"
            const parts = drawing.winning_numbers.split(' PB:');
            numbers = parts[0].split(' ').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
            powerball = parseInt(parts[1]);
          } else if (drawing.numbers) {
            numbers = drawing.numbers;
            powerball = drawing.powerball;
          }

          if (!numbers || numbers.length !== 5 || !powerball) {
            throw new Error(`Invalid drawing data format: ${JSON.stringify(drawing)}`);
          }

          return {
            numbers: numbers.sort((a, b) => a - b),
            powerball: powerball,
            date: drawing.draw_date || drawing.date,
            multiplier: drawing.multiplier || null
          };
        })
        .filter(drawing => drawing.numbers.length === 5 && drawing.powerball);

      if (processedDrawings.length === 0) {
        throw new PowerballDataError(
          'No valid drawings found in the data',
          'INVALID_DATA_FORMAT'
        );
      }

      return {
        drawings: processedDrawings,
        analysis: this.analyzeHistoricalData(processedDrawings)
      };
    } catch (error) {
      throw new PowerballDataError(
        `Error processing historical data: ${error.message}`,
        'DATA_PROCESSING_ERROR'
      );
    }
  }

  formatJackpotData(data, source) {
    // This would need to be adapted based on each API's actual response format
    // Since we don't have access to real APIs, we'll return a clear error
    throw new PowerballDataError(
      `Real jackpot data integration requires API access. Source: ${source}`,
      'API_ACCESS_REQUIRED',
      { 
        message: 'This app requires valid API endpoints or web scraping capabilities to fetch real jackpot data.',
        suggestion: 'Consider using a lottery data service or implementing web scraping with a backend service.'
      }
    );
  }

  /**
   * Get next drawing information
   */
  getNextDrawingInfo() {
    // Powerball draws on Monday, Wednesday, Saturday at 10:59 PM ET
    const now = new Date();
    const days = [1, 3, 6]; // Mon, Wed, Sat
    
    let nextDrawing = new Date(now);
    nextDrawing.setHours(22, 59, 0, 0); // 10:59 PM
    
    // Find next drawing day
    while (!days.includes(nextDrawing.getDay()) || nextDrawing <= now) {
      nextDrawing.setDate(nextDrawing.getDate() + 1);
      nextDrawing.setHours(22, 59, 0, 0);
    }
    
    return {
      date: nextDrawing.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: '10:59 PM ET',
      timestamp: nextDrawing.getTime()
    };
  }
}

export const powerballService = new PowerballService();
export { PowerballDataError };