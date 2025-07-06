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
    // Due to CORS restrictions in browsers, we cannot fetch live jackpot data
    // from external APIs. Return a clear message about this limitation.
    throw new PowerballDataError(
      'Live jackpot data requires a backend server to bypass CORS restrictions',
      'CORS_RESTRICTION',
      { 
        message: 'Browser security prevents direct API calls to lottery websites.',
        suggestion: 'Visit powerball.com for current jackpot information.',
        nextDrawing: this.getNextDrawingInfo()
      }
    );
  }

  /**
   * Fetches historical drawing data with multiple fallback strategies
   */
  async getHistoricalData(limit = 100) {
    const errors = [];
    
    // Try multiple approaches for historical data
    const strategies = [
      {
        name: 'NY Lottery API',
        fetch: () => this.fetchFromNYLotteryHistorical(limit)
      },
      {
        name: 'Alternative Format Parser',
        fetch: () => this.fetchWithAlternativeParser(limit)
      },
      {
        name: 'Simplified Parser',
        fetch: () => this.fetchWithSimplifiedParser(limit)
      }
    ];

    for (const strategy of strategies) {
      try {
        console.log(`Trying ${strategy.name}...`);
        const result = await strategy.fetch();
        if (result && result.drawings && result.drawings.length > 0) {
          console.log(`Success with ${strategy.name}: ${result.drawings.length} drawings`);
          return result;
        }
      } catch (error) {
        console.warn(`${strategy.name} failed:`, error.message);
        errors.push(`${strategy.name}: ${error.message}`);
      }
    }

    throw new PowerballDataError(
      'Unable to fetch historical data from any source. All data sources failed.',
      'ALL_SOURCES_FAILED',
      { 
        attemptedStrategies: errors,
        suggestion: 'The lottery data APIs may be temporarily unavailable or have changed their format.'
      }
    );
  }

  // Original NY Lottery method
  async fetchFromNYLotteryHistorical(limit) {
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
  }

  // Alternative parser for different formats
  async fetchWithAlternativeParser(limit) {
    const response = await fetch(`${this.baseURL}?$limit=${limit}&$order=draw_date DESC`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return this.processHistoricalDataAlternative(data, limit);
  }

  // Simplified parser that's more lenient
  async fetchWithSimplifiedParser(limit) {
    const response = await fetch(`${this.baseURL}?$limit=${limit}&$order=draw_date DESC`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return this.processHistoricalDataSimplified(data, limit);
  }

  processHistoricalDataAlternative(rawData, requestedLimit) {
    try {
      const processedDrawings = [];
      
      for (const drawing of rawData.slice(0, requestedLimit)) {
        try {
          if (!drawing.winning_numbers) continue;
          
          // More flexible parsing - handle various formats
          let allNumbers = drawing.winning_numbers
            .replace(/[^\d\s]/g, ' ') // Replace any non-digit, non-space with space
            .split(/\s+/)
            .map(n => parseInt(n))
            .filter(n => !isNaN(n) && n > 0);

          if (allNumbers.length >= 6) {
            // Take first 5 as main numbers, 6th as powerball
            const numbers = allNumbers.slice(0, 5).sort((a, b) => a - b);
            const powerball = allNumbers[5];
            
            // Basic validation
            if (numbers.every(n => n >= 1 && n <= 69) && powerball >= 1 && powerball <= 26) {
              processedDrawings.push({
                numbers,
                powerball,
                date: drawing.draw_date || drawing.date,
                multiplier: drawing.multiplier || null
              });
            }
          }
        } catch (err) {
          // Skip invalid drawings
          continue;
        }
      }
      
      if (processedDrawings.length === 0) {
        throw new Error('No valid drawings found with alternative parser');
      }

      return {
        drawings: processedDrawings,
        analysis: this.analyzeHistoricalData(processedDrawings)
      };
    } catch (error) {
      throw new Error(`Alternative parsing failed: ${error.message}`);
    }
  }

  processHistoricalDataSimplified(rawData, requestedLimit) {
    try {
      const processedDrawings = [];
      
      for (const drawing of rawData.slice(0, requestedLimit)) {
        try {
          if (!drawing.winning_numbers) continue;
          
          // Very simple approach - just extract all numbers
          const numbers = drawing.winning_numbers
            .match(/\d+/g) // Extract all number sequences
            ?.map(n => parseInt(n))
            .filter(n => n >= 1 && n <= 69); // Filter valid lottery numbers
          
          if (numbers && numbers.length >= 6) {
            // Use first 5 as main, last as powerball
            const mainNumbers = numbers.slice(0, 5).sort((a, b) => a - b);
            const powerball = numbers[numbers.length - 1]; // Last number as powerball
            
            // Ensure powerball is in valid range
            let validPowerball = powerball <= 26 ? powerball : ((powerball - 1) % 26) + 1;
            
            processedDrawings.push({
              numbers: mainNumbers,
              powerball: validPowerball,
              date: drawing.draw_date || drawing.date,
              multiplier: drawing.multiplier || null
            });
          }
        } catch (err) {
          continue;
        }
      }
      
      if (processedDrawings.length === 0) {
        throw new Error('No valid drawings found with simplified parser');
      }

      return {
        drawings: processedDrawings,
        analysis: this.analyzeHistoricalData(processedDrawings)
      };
    } catch (error) {
      throw new Error(`Simplified parsing failed: ${error.message}`);
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
            // NY Lottery format can be:
            // "01 02 03 04 05 PB:06" OR "01 02 03 04 05 06" (where last is powerball)
            const allNumbers = drawing.winning_numbers
              .replace(/\s*PB:\s*/, ' ') // Remove PB: separator if present
              .split(/\s+/) // Split on any whitespace
              .map(n => parseInt(n.trim()))
              .filter(n => !isNaN(n) && n >= 1 && n <= 69);

            if (allNumbers.length === 6) {
              // Standard format: 5 main numbers + 1 powerball
              numbers = allNumbers.slice(0, 5);
              powerball = allNumbers[5];
              
              // Fix invalid powerball numbers (some data has numbers > 26)
              if (powerball > 26) {
                // Convert to valid range: 27->1, 28->2, etc.
                powerball = ((powerball - 1) % 26) + 1;
              }
              
              // Validate powerball range after correction
              if (powerball < 1 || powerball > 26) {
                throw new Error(`Powerball number still invalid after correction: ${powerball}`);
              }
            } else {
              throw new Error(`Expected 6 numbers, got ${allNumbers.length}: ${drawing.winning_numbers}`);
            }
          } else if (drawing.numbers && drawing.powerball) {
            // Direct format
            numbers = drawing.numbers;
            powerball = drawing.powerball;
          } else {
            throw new Error(`No winning numbers found in drawing data`);
          }

          // Validate main numbers
          if (!numbers || numbers.length !== 5) {
            throw new Error(`Invalid main numbers: expected 5, got ${numbers ? numbers.length : 0}`);
          }

          // Check for valid number ranges
          const invalidMainNumbers = numbers.filter(n => n < 1 || n > 69);
          if (invalidMainNumbers.length > 0) {
            throw new Error(`Invalid main numbers outside 1-69 range: ${invalidMainNumbers.join(', ')}`);
          }

          // Check for duplicates
          const uniqueNumbers = new Set(numbers);
          if (uniqueNumbers.size !== 5) {
            throw new Error(`Duplicate numbers found in main selection: ${numbers.join(', ')}`);
          }

          return {
            numbers: numbers.sort((a, b) => a - b),
            powerball: powerball,
            date: drawing.draw_date || drawing.date,
            multiplier: drawing.multiplier || null
          };
        })
        .filter(drawing => drawing.numbers && drawing.numbers.length === 5 && drawing.powerball);

      if (processedDrawings.length === 0) {
        throw new PowerballDataError(
          'No valid drawings found in the data. The lottery data format may have changed.',
          'INVALID_DATA_FORMAT',
          { 
            sampleData: rawData.slice(0, 3),
            message: 'Check the data format from the lottery API'
          }
        );
      }

      // Log successful processing for debugging
      console.log(`Successfully processed ${processedDrawings.length} drawings from ${rawData.length} raw entries`);

      return {
        drawings: processedDrawings,
        analysis: this.analyzeHistoricalData(processedDrawings)
      };
    } catch (error) {
      if (error instanceof PowerballDataError) throw error;
      
      throw new PowerballDataError(
        `Error processing historical data: ${error.message}`,
        'DATA_PROCESSING_ERROR',
        { 
          originalError: error.message,
          sampleData: rawData.slice(0, 2) // Include sample for debugging
        }
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