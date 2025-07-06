// LCv2 Claude API Service - AI Integration for Enhanced Predictions
import { API_ENDPOINTS, CLAUDE_CONFIG, ERROR_MESSAGES } from '../utils/constants.js';
import { validateApiKey, handleApiError } from '../utils/helpers.js';
import { lotteryPredictor } from './LotteryPredictor.js';

export class ClaudeAPI {
  constructor() {
    this.apiKey = null;
    this.baseURL = 'https://api.anthropic.com/v1/messages';
    this.isEnabled = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.hybridMode = true;
    this.requestCount = 0;
    this.lastRequestTime = 0;
    this.rateLimitDelay = 1000; // 1 second between requests
  }

  // ===========================================================================
  // INITIALIZATION & AUTHENTICATION
  // ===========================================================================

  initialize(apiKey) {
    if (!validateApiKey(apiKey)) {
      throw new Error(ERROR_MESSAGES.invalidApiKey);
    }
    
    this.apiKey = apiKey;
    this.isEnabled = true;
    this.requestCount = 0;
    
    console.log('?? Claude Sonnet 4 initialized with hybrid system');
    console.log('?? API endpoint configured:', this.baseURL);
  }

  validateApiKey(key) {
    return validateApiKey(key);
  }

  disconnect() {
    this.apiKey = null;
    this.isEnabled = false;
    this.requestCount = 0;
    console.log('?? Claude API disconnected');
  }

  // ===========================================================================
  // CONNECTION TESTING
  // ===========================================================================

  async testConnection() {
    if (!this.apiKey || !this.isEnabled) {
      return { 
        success: false, 
        error: ERROR_MESSAGES.apiKeyRequired,
        status: 'disabled'
      };
    }

    try {
      console.log('?? Testing Claude Sonnet 4 connection...');
      
      const testPayload = {
        model: CLAUDE_CONFIG.model,
        max_tokens: 100,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: 'Hello! Please respond with just "Connected" to confirm the API is working.'
        }]
      };

      const response = await this.makeAPIRequest(testPayload);
      
      if (response.success && response.data.content) {
        const responseText = response.data.content[0]?.text || '';
        
        return {
          success: true,
          message: 'Claude Sonnet 4 connection successful',
          model: CLAUDE_CONFIG.model,
          responseTime: response.responseTime,
          usage: response.data.usage
        };
      } else {
        throw new Error(response.error || 'Invalid response format');
      }

    } catch (error) {
      console.error('? Claude connection test failed:', error);
      return {
        success: false,
        error: error.message,
        status: 'error'
      };
    }
  }

  // ===========================================================================
  // HYBRID SELECTION GENERATION
  // ===========================================================================

  async generateHybridSelection(params) {
    if (!this.isEnabled) {
      throw new Error('Claude API not enabled');
    }

    const {
      historicalData,
      currentJackpot,
      requestedSets = 5,
      strategy = 'hybrid',
      localAlgorithmResults = []
    } = params;

    try {
      console.log(`??? Generating ${requestedSets} Claude hybrid selections...`);
      
      const prompt = this.buildHybridSelectionPrompt({
        historicalData,
        currentJackpot,
        requestedSets,
        strategy,
        localAlgorithmResults
      });

      const claudePayload = {
        model: CLAUDE_CONFIG.model,
        max_tokens: CLAUDE_CONFIG.maxTokens.hybrid,
        temperature: CLAUDE_CONFIG.temperature,
        messages: [{
          role: 'user',
          content: prompt
        }]
      };

      const response = await this.makeAPIRequest(claudePayload);
      

      if (response.success) {
        const processedResponse = this.processHybridSelectionResponse(
          response.data.content[0].text,
          requestedSets,
          localAlgorithmResults
        );
        
        return {
          success: true,
          data: processedResponse,
          usage: response.data.usage,
          model: CLAUDE_CONFIG.model
        };
      } else {
        throw new Error(response.error);
      }

    } catch (error) {
      console.error('? Claude hybrid selection failed:', error);
      return {
        success: false,
        error: error.message,
        fallbackUsed: true
      };
    }
  }

  buildHybridSelectionPrompt(params) {
    const { historicalData, currentJackpot, requestedSets, localAlgorithmResults } = params;
    
    return `You are an advanced lottery analysis AI assistant. I need you to generate ${requestedSets} Powerball lottery number sets by combining mathematical algorithms with AI insights.

POWERBALL RULES:
- Select 5 main numbers from 1-69 (no duplicates)
- Select 1 Powerball number from 1-26
- Numbers must be realistic and mathematically sound

CURRENT CONTEXT:
- Current Jackpot: $${currentJackpot?.amount ? (currentJackpot.amount / 1000000).toFixed(0) + 'M' : '100M'}
- Historical Data: ${historicalData?.totalDrawings || 0} drawings analyzed
- Analysis Date: ${new Date().toLocaleDateString()}

LOCAL ALGORITHM RESULTS:
${localAlgorithmResults.map((result, i) => 
  `Algorithm ${i + 1}: ${result.numbers?.join(', ')} | PB: ${result.powerball} (${result.confidence}% confidence)`
).join('\n')}

HISTORICAL PATTERNS:
${historicalData?.hotNumbers ? `Hot Numbers: ${historicalData.hotNumbers.slice(0, 10).map(h => h.number).join(', ')}` : ''}
${historicalData?.coldNumbers ? `Cold Numbers: ${historicalData.coldNumbers.slice(0, 10).map(c => c.number).join(', ')}` : ''}

TASK:
Generate ${requestedSets} optimized Powerball selections that:
1. Consider the mathematical algorithm results above
2. Apply AI pattern recognition and intuition
3. Balance statistical probability with creative insights
4. Ensure variety across the ${requestedSets} sets

For each selection, provide:
- 5 main numbers (1-69)
- 1 Powerball number (1-26)  
- Confidence level (65-95%)
- Brief strategy explanation
- AI insights or reasoning

Format your response as a JSON array like this:
[
  {
    "numbers": [1, 2, 3, 4, 5],
    "powerball": 1,
    "confidence": 85,
    "name": "Claude Enhanced Pattern",
    "description": "AI-enhanced prediction combining algorithm insights",
    "insights": "Key reasoning for this selection",
    "algorithmDetail": "Specific mathematical approach used"
  }
]

Focus on quality over quantity. Each selection should be thoughtfully crafted with clear reasoning.`;
  }

  processHybridSelectionResponse(claudeText, requestedSets, localAlgorithmResults) {
    try {
      // Extract JSON from Claude's response
      const jsonMatch = claudeText.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Claude response');
      }

      const claudeSelections = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(claudeSelections)) {
        throw new Error('Invalid JSON format from Claude');
      }

      // Process and validate Claude's selections
      const processedSelections = claudeSelections
        .filter(selection => this.validateClaudeSelection(selection))
        .slice(0, requestedSets)
        .map((selection, index) => ({
          numbers: selection.numbers.sort((a, b) => a - b),
          powerball: selection.powerball,
          confidence: Math.min(95, Math.max(65, selection.confidence || 80)),
          name: selection.name || `Claude Enhanced ${index + 1}`,
          description: selection.description || 'AI-enhanced prediction',
          algorithmDetail: selection.algorithmDetail || 'Claude Sonnet 4 analysis',
          insights: selection.insights || 'Advanced pattern recognition',
          actualStrategy: 'Claude AI Enhanced',
          technicalAnalysis: claudeText.substring(0, 200) + '...',
          claudeGenerated: true,
          isHybrid: true,
          source: 'claude-ai'
        }));

      // If we don't have enough selections, fill with enhanced algorithm results
      while (processedSelections.length < requestedSets && localAlgorithmResults.length > 0) {
        const algorithmIndex = processedSelections.length % localAlgorithmResults.length;
        const algoResult = localAlgorithmResults[algorithmIndex];
        
        processedSelections.push({
          numbers: algoResult.numbers,
          powerball: algoResult.powerball,
          confidence: algoResult.confidence || 75,
          name: `Enhanced ${algoResult.strategy || 'Algorithm'}`,
          description: 'Mathematical algorithm enhanced by Claude AI context',
          algorithmDetail: algoResult.analysis || 'Mathematical analysis',
          insights: 'Fallback from local algorithms',
          actualStrategy: algoResult.strategy || 'Algorithm',
          technicalAnalysis: algoResult.analysis || 'Mathematical analysis',
          claudeGenerated: false,
          isHybrid: true,
          source: 'algorithm-fallback'
        });
      }

      return {
        selections: processedSelections,
        analysis: this.extractAnalysisFromResponse(claudeText),
        model: CLAUDE_CONFIG.model,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Failed to process Claude response:', error);
      
      // Return enhanced algorithm results as fallback
      return this.createFallbackHybridResponse(localAlgorithmResults, requestedSets);
    }
  }

  validateClaudeSelection(selection) {
    return selection &&
           Array.isArray(selection.numbers) &&
           selection.numbers.length === 5 &&
           selection.numbers.every(n => Number.isInteger(n) && n >= 1 && n <= 69) &&
           Number.isInteger(selection.powerball) &&
           selection.powerball >= 1 &&
           selection.powerball <= 26 &&
           new Set(selection.numbers).size === 5; // No duplicates
  }

  extractAnalysisFromResponse(claudeText) {
    // Extract any analysis text that's not part of the JSON
    const jsonMatch = claudeText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return claudeText.substring(0, 500);
    
    const beforeJson = claudeText.substring(0, jsonMatch.index).trim();
    const afterJson = claudeText.substring(jsonMatch.index + jsonMatch[0].length).trim();
    
    return (beforeJson + ' ' + afterJson).trim().substring(0, 500);
  }

  createFallbackHybridResponse(localAlgorithmResults, requestedSets) {
    const fallbackSelections = localAlgorithmResults.slice(0, requestedSets).map((result, index) => ({
      numbers: result.numbers,
      powerball: result.powerball,
      confidence: result.confidence || 75,
      name: `Enhanced ${result.strategy || `Algorithm ${index + 1}`}`,
      description: 'Local algorithm with AI enhancement context',
      algorithmDetail: result.analysis || 'Mathematical analysis',
      insights: 'Processed through Claude AI framework',
      actualStrategy: result.strategy || 'Algorithm',
      technicalAnalysis: result.analysis || 'Mathematical analysis',
      claudeGenerated: false,
      isHybrid: true,
      source: 'algorithm-enhanced'
    }));

    return {
      selections: fallbackSelections,
      analysis: 'Claude AI processing failed, using enhanced algorithm results',
      model: 'fallback',
      timestamp: new Date().toISOString()
    };
  }

  // ===========================================================================
  // QUICK SELECTION GENERATION
  // ===========================================================================

  async generateQuickSelection(params) {
    if (!this.isEnabled) {
      throw new Error('Claude API not enabled');
    }

    const { historicalData, currentJackpot, requestedSets = 3, strategy = 'quick' } = params;

    try {
      const prompt = this.buildQuickSelectionPrompt({
        historicalData,
        currentJackpot,
        requestedSets,
        strategy
      });

      const claudePayload = {
        model: CLAUDE_CONFIG.model,
        max_tokens: CLAUDE_CONFIG.maxTokens.quick,
        temperature: CLAUDE_CONFIG.temperature + 0.1, // Slightly more creative
        messages: [{
          role: 'user',
          content: prompt
        }]
      };

      const response = await this.makeAPIRequest(claudePayload);
      
      if (response.success) {
        const processedResponse = this.processQuickSelectionResponse(
          response.data.content[0].text,
          requestedSets
        );
        
        return {
          success: true,
          data: processedResponse,
          usage: response.data.usage
        };
      } else {
        throw new Error(response.error);
      }

    } catch (error) {
      console.error('? Claude quick selection failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  buildQuickSelectionPrompt(params) {
    const { historicalData, currentJackpot, requestedSets } = params;
    
    return `Generate ${requestedSets} quick Powerball lottery selections using AI analysis.

RULES: 5 numbers (1-69) + 1 Powerball (1-26)
JACKPOT: $${currentJackpot?.amount ? (currentJackpot.amount / 1000000).toFixed(0) + 'M' : '100M'}
DATA: ${historicalData?.totalDrawings || 0} historical drawings

Use your AI capabilities to identify patterns and generate mathematically sound selections.

Return only a JSON array:
[{"numbers": [1,2,3,4,5], "powerball": 1, "confidence": 80}]`;
  }

  processQuickSelectionResponse(claudeText, requestedSets) {
    try {
      const jsonMatch = claudeText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON found');

      const selections = JSON.parse(jsonMatch[0]);
      
      return {
        selections: selections
          .filter(s => this.validateClaudeSelection(s))
          .slice(0, requestedSets)
          .map((s, i) => ({
            ...s,
            numbers: s.numbers.sort((a, b) => a - b),
            name: `Claude Quick ${i + 1}`,
            claudeGenerated: true
          })),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return this.generateFallbackQuickSelections(requestedSets);
    }
  }

  // ===========================================================================
  // PREDICTION INSIGHTS
  // ===========================================================================

  async generatePredictionInsights(params) {
    if (!this.isEnabled) {
      throw new Error('Claude API not enabled');
    }

    const { predictionSet, historicalContext } = params;

    try {
      const prompt = this.buildInsightsPrompt(predictionSet, historicalContext);

      const claudePayload = {
        model: CLAUDE_CONFIG.model,
        max_tokens: CLAUDE_CONFIG.maxTokens.insights,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: prompt
        }]
      };

      const response = await this.makeAPIRequest(claudePayload);
      
      if (response.success) {
        return {
          success: true,
          data: {
            insights: response.data.content[0].text,
            analysis: this.extractKeyInsights(response.data.content[0].text),
            timestamp: new Date().toISOString()
          },
          usage: response.data.usage
        };
      } else {
        throw new Error(response.error);
      }

    } catch (error) {
      console.error('? Claude insights generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  buildInsightsPrompt(predictionSet, historicalContext) {
    return `Analyze this Powerball prediction and provide insights:

PREDICTION: ${predictionSet.numbers.join(', ')} | Powerball: ${predictionSet.powerball}
STRATEGY: ${predictionSet.strategy}
CONFIDENCE: ${predictionSet.confidence}%

HISTORICAL CONTEXT:
- Total drawings analyzed: ${historicalContext.totalDrawings}
- Recent trends: ${historicalContext.recentTrends || 'Standard patterns'}

Provide a brief analysis covering:
1. Mathematical soundness of the selection
2. Pattern recognition insights
3. Statistical probability assessment
4. Strategic reasoning

Keep the response concise (2-3 paragraphs) and focused on actionable insights.`;
  }

  extractKeyInsights(insightsText) {
    // Extract key points from Claude's insights
    const sentences = insightsText.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    return {
      summary: sentences[0]?.trim() || 'AI analysis completed',
      keyPoints: sentences.slice(1, 4).map(s => s.trim()).filter(s => s.length > 0),
      recommendation: sentences[sentences.length - 1]?.trim() || 'Consider mathematical patterns'
    };
  }

  // ===========================================================================
  // API REQUEST HANDLING
  // ===========================================================================

  async makeAPIRequest(payload) {
    // Rate limiting
    await this.enforceRateLimit();
    
    const startTime = performance.now();
    
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': CLAUDE_CONFIG.version,
          'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseTime = performance.now() - startTime;
      this.requestCount++;
      this.lastRequestTime = Date.now();

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error && errorData.error.message) {
            errorMessage = errorData.error.message;
          }
        } catch (e) {
          // Keep original error if not JSON
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      return {
        success: true,
        data,
        responseTime,
        requestCount: this.requestCount
      };

    } catch (error) {
      console.error('Claude API request failed:', error);
      return {
        success: false,
        error: handleApiError(error),
        responseTime: performance.now() - startTime
      };
    }
  }

  async enforceRateLimit() {
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const delay = this.rateLimitDelay - timeSinceLastRequest;
      console.log(`? Rate limiting: waiting ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // ===========================================================================
  // FALLBACK METHODS
  // ===========================================================================

  generateFallbackQuickSelections(count) {
    const selections = [];
    
    for (let i = 0; i < count; i++) {
      const numbers = [];
      while (numbers.length < 5) {
        const num = Math.floor(Math.random() * 69) + 1;
        if (!numbers.includes(num)) {
          numbers.push(num);
        }
      }
      
      selections.push({
        numbers: numbers.sort((a, b) => a - b),
        powerball: Math.floor(Math.random() * 26) + 1,
        confidence: 70 + Math.floor(Math.random() * 15),
        name: `Fallback Quick ${i + 1}`,
        claudeGenerated: false
      });
    }
    
    return {
      selections,
      timestamp: new Date().toISOString(),
      fallback: true
    };
  }

  // ===========================================================================
  // STATUS & DIAGNOSTICS
  // ===========================================================================

  getStatus() {
    return {
      isEnabled: this.isEnabled,
      model: CLAUDE_CONFIG.model,
      requestCount: this.requestCount,
      lastRequestTime: this.lastRequestTime,
      rateLimitDelay: this.rateLimitDelay,
      maxRetries: this.maxRetries,
      hybridMode: this.hybridMode
    };
  }

  getDiagnostics() {
    return {
      status: this.isEnabled ? 'enabled' : 'disabled',
      model: CLAUDE_CONFIG.model,
      version: CLAUDE_CONFIG.version,
      features: ['hybridSelection', 'quickSelection', 'predictionInsights'],
      requestCount: this.requestCount,
      lastRequestTime: this.lastRequestTime ? new Date(this.lastRequestTime).toISOString() : null,
      configuration: {
        maxTokens: CLAUDE_CONFIG.maxTokens,
        temperature: CLAUDE_CONFIG.temperature,
        rateLimitDelay: this.rateLimitDelay
      }
    };
  }

  // ===========================================================================
  // CONFIGURATION
  // ===========================================================================

  setRateLimit(delayMs) {
    this.rateLimitDelay = Math.max(500, delayMs); // Minimum 500ms
    console.log(`?? Claude API rate limit set to ${this.rateLimitDelay}ms`);
  }

  enableHybridMode(enabled = true) {
    this.hybridMode = enabled;
    console.log(`?? Claude hybrid mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  resetRequestCount() {
    this.requestCount = 0;
    console.log('?? Claude API request count reset');
  }
}

// Create and export singleton instance
export const claudeAPI = new ClaudeAPI();

console.log('?? ClaudeAPI service initialized');
console.log(`?? Model: ${CLAUDE_CONFIG.model}`);
console.log(`?? Features: Hybrid Selection, Quick Selection, Prediction Insights`);