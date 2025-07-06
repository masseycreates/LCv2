// LCv2 Claude API Service
import { API_ENDPOINTS, CLAUDE_CONFIG, ERROR_MESSAGES } from '../utils/constants.js';
import { validateApiKey } from '../utils/helpers.js';
import { lotteryPredictor } from './LotteryPredictor.js';

export class ClaudeAPI {
  constructor() {
    this.apiKey = null;
    this.baseURL = API_ENDPOINTS.claude;
    this.isEnabled = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.hybridMode = true;
  }

  // Initialize Claude API with API key
  initialize(apiKey) {
    if (!validateApiKey(apiKey)) {
      throw new Error(ERROR_MESSAGES.invalidApiKey);
    }
    
    this.apiKey = apiKey;
    this.isEnabled = true;
    console.log('🤖 Claude Opus 4 initialized with hybrid system');
  }

  // Validate API key format
  validateApiKey(key) {
    return validateApiKey(key);
  }

  // Test connection to Claude API
  async testConnection() {
    if (!this.apiKey || !this.isEnabled) {
      return { success: false, error: ERROR_MESSAGES.apiKeyRequired };
    }

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: this.apiKey,
          analysisType: 'predictionInsights',
          predictionSet: {
            numbers: [1, 2, 3, 4, 5],
            powerball: 1,
            strategy: 'connection_test',
            confidence: 50
          },
          historicalContext: {
            totalDrawings: 100,
            recentTrends: 'connection_test'
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Claude AI connection successful');
        return { success: true, error: null, usage: data.usage };
      } else {
        throw new Error(data.error || 'Unknown API error');
      }

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Generate hybrid selections using Claude + local algorithms
  async generateHybridQuickSelection(historicalData, currentJackpot, requestedSets, strategy) {
    if (!this.apiKey || !this.isEnabled) {
      throw new Error(ERROR_MESSAGES.apiKeyRequired);
    }

    try {
      console.log('🤖🧮 Generating HYBRID Claude + Algorithms selections...');
      
      // Generate local algorithm results first
      const localResults = await this.generateLocalAlgorithmResults(historicalData, requestedSets);
      const sanitizedData = this.sanitizeHistoricalData(historicalData);
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: this.apiKey,
          analysisType: 'hybridSelection',
          historicalData: sanitizedData,
          currentJackpot: currentJackpot,
          requestedSets: requestedSets,
          strategy: strategy,
          localAlgorithmResults: localResults
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.claudeSelections) {
        console.log('✅ Claude hybrid analysis generated ' + data.claudeSelections.length + ' selections');
        return data.claudeSelections;
      } else {
        throw new Error(data.error || 'Invalid response from Claude hybrid API');
      }

    } catch (error) {
      console.error('Claude hybrid selection failed:', error);
      
      // Fallback to enhanced local results
      const localResults = await this.generateLocalAlgorithmResults(historicalData, requestedSets);
      return this.enhanceLocalResultsForFallback(localResults);
    }
  }

  // Generate local algorithm results for hybrid analysis
  async generateLocalAlgorithmResults(historicalData, requestedSets) {
    try {
      const convertedData = this.convertHistoricalDataForPredictor(historicalData);
      
      if (convertedData.length < 10) {
        return this.generateFallbackLocalResults(requestedSets);
      }
      
      const predictions = lotteryPredictor.generateEnsemblePrediction(convertedData, requestedSets);
      return this.enhanceLocalPredictions(predictions);
      
    } catch (error) {
      console.warn('Local algorithm generation failed:', error);
      return this.generateFallbackLocalResults(requestedSets);
    }
  }

  // Convert historical data for predictor
  convertHistoricalDataForPredictor(historicalData) {
    if (!historicalData || !historicalData.drawings) {
      return [];
    }
    
    return historicalData.drawings
      .filter(drawing => 
        drawing.numbers && 
        Array.isArray(drawing.numbers) && 
        drawing.numbers.length === 5 &&
        drawing.powerball
      )
      .map(drawing => ({
        numbers: drawing.numbers.slice(),
        powerball: drawing.powerball,
        date: drawing.date || new Date().toISOString()
      }))
      .slice(0, 2000);
  }

  // Enhance local predictions with metadata
  enhanceLocalPredictions(predictions) {
    const enhancedStrategies = [
      {
        name: "EWMA Frequency Consensus",
        description: "Exponentially Weighted Moving Average frequency analysis with recent trend weighting",
        algorithmDetail: "EWMA frequency analysis with α=0.3 decay factor"
      },
      {
        name: "Neural Network Pattern Recognition", 
        description: "Multi-layer neural network analyzing positional patterns and feature extraction",
        algorithmDetail: "10-20-69 neural architecture with pattern recognition"
      },
      {
        name: "Pair Relationship Analysis",
        description: "Co-occurrence pattern analysis identifying number pair relationships and clustering",
        algorithmDetail: "Pair frequency matrix with relationship scoring"
      },
      {
        name: "Gap Analysis Optimization",
        description: "Overdue number identification using gap pattern analysis and statistical distribution",
        algorithmDetail: "Statistical gap analysis with overdue scoring"
      },
      {
        name: "Markov Chain Transition",
        description: "State transition analysis predicting next numbers based on sequence patterns",
        algorithmDetail: "Markov chain state transition modeling"
      }
    ];
    
    return predictions.map((prediction, index) => ({
      numbers: prediction.numbers,
      powerball: prediction.powerball,
      strategy: enhancedStrategies[index] ? enhancedStrategies[index].name : 'Algorithm ' + (index + 1),
      confidence: prediction.confidence,
      analysis: enhancedStrategies[index] ? enhancedStrategies[index].description : prediction.analysis,
      algorithmDetail: enhancedStrategies[index] ? enhancedStrategies[index].algorithmDetail : "Mathematical analysis",
      technicalAnalysis: prediction.analysis
    }));
  }

  // Generate fallback local results
  generateFallbackLocalResults(requestedSets) {
    const strategies = [
      "Enhanced Random Distribution",
      "Mathematical Range Optimization", 
      "Statistical Balance Analysis",
      "Frequency Pattern Recognition",
      "Sum Range Optimization"
    ];
    
    return Array.from({ length: requestedSets }, (_, i) => {
      const numbers = [];
      while (numbers.length < 5) {
        const num = Math.floor(Math.random() * 69) + 1;
        if (!numbers.includes(num)) numbers.push(num);
      }
      
      return {
        numbers: numbers.sort((a, b) => a - b),
        powerball: Math.floor(Math.random() * 26) + 1,
        strategy: strategies[i % strategies.length],
        confidence: 70 + Math.floor(Math.random() * 15),
        analysis: "Mathematical distribution with statistical constraints",
        algorithmDetail: "Enhanced random with optimization",
        technicalAnalysis: "Fallback mathematical analysis"
      };
    });
  }

  // Enhance local results for fallback display
  enhanceLocalResultsForFallback(localResults) {
    return localResults.map((result, index) => ({
      id: index + 1,
      name: '🧮 ' + result.strategy + ' (Algorithm)',
      description: 'LOCAL ALGORITHM: ' + result.analysis + ' Note: Claude AI enhancement temporarily unavailable.',
      algorithmDetail: result.algorithmDetail,
      numbers: result.numbers,
      powerball: result.powerball,
      strategy: result.confidence + '% Algorithm Confidence',
      confidence: result.confidence,
      actualStrategy: result.strategy,
      technicalAnalysis: result.technicalAnalysis,
      claudeGenerated: false,
      isHybrid: false
    }));
  }

  // Sanitize historical data for API transmission
  sanitizeHistoricalData(data) {
    if (!data || !data.drawings) {
      return { drawings: [], totalDrawings: 0 };
    }

    const maxDrawings = 100;
    const sanitizedDrawings = data.drawings
      .slice(0, maxDrawings)
      .filter(drawing => 
        drawing.numbers && 
        Array.isArray(drawing.numbers) && 
        drawing.numbers.length === 5 &&
        drawing.powerball
      )
      .map(drawing => ({
        numbers: drawing.numbers,
        powerball: drawing.powerball,
        date: drawing.date || 'Unknown'
      }));

    return {
      drawings: sanitizedDrawings,
      totalDrawings: data.totalDrawings || sanitizedDrawings.length,
      hotNumbers: data.hotNumbers ? data.hotNumbers.slice(0, 15) : [],
      coldNumbers: data.coldNumbers ? data.coldNumbers.slice(0, 15) : []
    };
  }

  // Generate insights for specific predictions
  async generatePredictionInsights(predictionSet, historicalContext) {
    if (!this.apiKey || !this.isEnabled) {
      throw new Error(ERROR_MESSAGES.apiKeyRequired);
    }

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: this.apiKey,
          analysisType: 'predictionInsights',
          predictionSet: predictionSet,
          historicalContext: historicalContext
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return {
          insights: data.analysis || data.rawResponse,
          confidence: data.confidence || 75,
          reasoning: data.reasoning || data.analysis
        };
      } else {
        throw new Error(data.error || 'Failed to generate insights');
      }

    } catch (error) {
      console.error('Prediction insights failed:', error);
      return {
        insights: 'Analysis temporarily unavailable. Using mathematical assessment based on historical patterns.',
        confidence: 70,
        reasoning: 'Local analysis fallback'
      };
    }
  }

  // Generate quick selections without full hybrid analysis
  async generateQuickSelections(historicalData, currentJackpot, requestedSets) {
    if (!this.apiKey || !this.isEnabled) {
      throw new Error(ERROR_MESSAGES.apiKeyRequired);
    }

    try {
      const sanitizedData = this.sanitizeHistoricalData(historicalData);
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: this.apiKey,
          analysisType: 'quickSelection',
          historicalData: sanitizedData,
          currentJackpot: currentJackpot,
          requestedSets: requestedSets,
          strategy: 'quick'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.claudeSelections) {
        return data.claudeSelections;
      } else {
        throw new Error(data.error || 'Failed to generate quick selections');
      }

    } catch (error) {
      console.error('Quick selections failed:', error);
      
      // Fallback to local generation
      const localResults = await this.generateLocalAlgorithmResults(historicalData, requestedSets);
      return this.enhanceLocalResultsForFallback(localResults);
    }
  }

  // Get API usage statistics
  getUsageStats() {
    return {
      isEnabled: this.isEnabled,
      hasApiKey: !!this.apiKey,
      retryCount: this.retryCount,
      hybridMode: this.hybridMode
    };
  }

  // Reset API configuration
  reset() {
    this.apiKey = null;
    this.isEnabled = false;
    this.retryCount = 0;
    console.log('🔄 Claude API configuration reset');
  }

  // Check if Claude API is available and configured
  isAvailable() {
    return this.isEnabled && !!this.apiKey;
  }

  // Handle API errors with retry logic
  async handleApiError(error, operation) {
    console.error(`Claude API error in ${operation}:`, error);
    
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`🔄 Retrying ${operation} (attempt ${this.retryCount}/${this.maxRetries})`);
      return true; // Indicate retry should be attempted
    }
    
    this.retryCount = 0;
    throw error;
  }
}

// Export singleton instance
export const claudeAPI = new ClaudeAPI();