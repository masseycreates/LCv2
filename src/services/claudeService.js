// src/services/claudeService.js

/**
 * Real Claude API Integration Service
 * NO MOCK DATA - only real API calls with proper error handling
 */

class ClaudeAPIError extends Error {
  constructor(message, code = 'UNKNOWN', details = null) {
    super(message);
    this.name = 'ClaudeAPIError';
    this.code = code;
    this.details = details;
  }
}

export class ClaudeService {
  constructor() {
    this.baseURL = 'https://api.anthropic.com/v1/messages';
    this.model = 'claude-3-5-sonnet-20241022'; // Latest Sonnet model
    this.maxTokens = 4000;
  }

  /**
   * Tests Claude API connection with provided API key
   */
  async testConnection(apiKey) {
    if (!apiKey) {
      throw new ClaudeAPIError(
        'API key is required to test Claude connection',
        'MISSING_API_KEY'
      );
    }

    if (!apiKey.startsWith('sk-ant-')) {
      throw new ClaudeAPIError(
        'Invalid API key format. Claude API keys should start with "sk-ant-"',
        'INVALID_API_KEY_FORMAT'
      );
    }

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 100,
          messages: [{
            role: 'user',
            content: 'Please respond with just "Connection successful" to test the API.'
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        switch (response.status) {
          case 401:
            throw new ClaudeAPIError(
              'Invalid API key. Please check your Anthropic API key is correct.',
              'UNAUTHORIZED'
            );
          case 402:
            throw new ClaudeAPIError(
              'Insufficient credits. Please check your Anthropic account billing.',
              'INSUFFICIENT_CREDITS'
            );
          case 429:
            throw new ClaudeAPIError(
              'Rate limit exceeded. Please wait a moment before trying again.',
              'RATE_LIMITED'
            );
          case 500:
            throw new ClaudeAPIError(
              'Anthropic API is experiencing issues. Please try again later.',
              'API_ERROR'
            );
          default:
            throw new ClaudeAPIError(
              `API request failed: ${errorData.error?.message || response.statusText}`,
              'REQUEST_FAILED',
              { status: response.status, error: errorData }
            );
        }
      }

      const data = await response.json();
      
      if (!data.content || !data.content[0] || !data.content[0].text) {
        throw new ClaudeAPIError(
          'Unexpected response format from Claude API',
          'INVALID_RESPONSE'
        );
      }

      return {
        success: true,
        model: data.model,
        message: 'Claude API connection successful',
        usage: data.usage
      };

    } catch (error) {
      if (error instanceof ClaudeAPIError) throw error;
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new ClaudeAPIError(
          'Network error: Unable to connect to Claude API. Check your internet connection.',
          'NETWORK_ERROR'
        );
      }
      
      throw new ClaudeAPIError(
        `Connection test failed: ${error.message}`,
        'UNKNOWN_ERROR',
        { originalError: error.message }
      );
    }
  }

  /**
   * Generates lottery number selections using Claude's analysis
   */
  async generateLotterySelections(apiKey, historicalData, currentJackpot = null) {
    if (!apiKey) {
      throw new ClaudeAPIError(
        'API key is required for Claude analysis',
        'MISSING_API_KEY'
      );
    }

    if (!historicalData || !historicalData.drawings || historicalData.drawings.length === 0) {
      throw new ClaudeAPIError(
        'Historical lottery data is required for Claude analysis',
        'MISSING_HISTORICAL_DATA'
      );
    }

    try {
      const prompt = this.buildAnalysisPrompt(historicalData, currentJackpot);
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: this.maxTokens,
          temperature: 0.7,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ClaudeAPIError(
          `Claude API error: ${errorData.error?.message || response.statusText}`,
          'API_REQUEST_FAILED',
          { status: response.status, error: errorData }
        );
      }

      const data = await response.json();
      
      if (!data.content || !data.content[0] || !data.content[0].text) {
        throw new ClaudeAPIError(
          'Claude API returned invalid response format',
          'INVALID_RESPONSE'
        );
      }

      return this.parseClaudeResponse(data.content[0].text, data.usage);

    } catch (error) {
      if (error instanceof ClaudeAPIError) throw error;
      
      throw new ClaudeAPIError(
        `Failed to generate Claude selections: ${error.message}`,
        'GENERATION_ERROR',
        { originalError: error.message }
      );
    }
  }

  /**
   * Builds a comprehensive analysis prompt for Claude
   */
  buildAnalysisPrompt(historicalData, currentJackpot) {
    const recentDrawings = historicalData.drawings.slice(0, 20);
    const analysis = historicalData.analysis;
    
    return `You are an expert lottery analyst. Analyze the following Powerball historical data and generate 4 strategic number selections.

HISTORICAL DATA ANALYSIS:
- Total drawings analyzed: ${analysis.totalDrawings}
- Date range: ${analysis.dateRange.earliest} to ${analysis.dateRange.latest}
- Hot numbers (most frequent): ${analysis.numberAnalysis.hotNumbers.join(', ')}
- Cold numbers (least frequent): ${analysis.numberAnalysis.coldNumbers.join(', ')}
- Hot Powerballs: ${analysis.powerballAnalysis.hotPowerballs.join(', ')}
- Average sum of winning numbers: ${Math.round(analysis.patterns.averageSum)}
- Sum range: ${analysis.patterns.sumRange.min} - ${analysis.patterns.sumRange.max}
- Average consecutive numbers: ${analysis.patterns.averageConsecutive.toFixed(2)}

RECENT DRAWINGS (last 20):
${recentDrawings.map(d => `${d.date}: ${d.numbers.join(' ')} PB:${d.powerball}`).join('\n')}

${currentJackpot ? `CURRENT JACKPOT: ${currentJackpot.formatted || 'Unknown'}` : ''}

Please generate exactly 4 strategic Powerball selections using different analytical approaches:

1. **Hot Numbers Strategy**: Focus on frequently drawn numbers
2. **Pattern Analysis**: Based on recent drawing patterns and trends  
3. **Mathematical Balance**: Optimal distribution across number ranges
4. **Hybrid Intelligence**: Combination of multiple factors

For each selection, provide:
- 5 main numbers (1-69) and 1 Powerball (1-26)
- Strategy name
- Confidence level (70-99%)
- Brief explanation of the approach
- Key factors considered

Format your response as JSON:
{
  "selections": [
    {
      "id": 1,
      "name": "Strategy Name",
      "numbers": [1, 2, 3, 4, 5],
      "powerball": 1,
      "strategy": "Brief strategy name",
      "confidence": 85,
      "explanation": "Detailed explanation of approach and reasoning",
      "factors": ["factor1", "factor2", "factor3"]
    }
  ],
  "analysis_summary": "Overall analysis summary",
  "methodology": "Description of analytical methodology used"
}

Important: Ensure all numbers are valid (main: 1-69, powerball: 1-26) and provide genuine analysis based on the data provided.`;
  }

  /**
   * Parses Claude's response and formats it for the app
   */
  parseClaudeResponse(responseText, usage = null) {
    try {
      // Extract JSON from Claude's response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new ClaudeAPIError(
          'Claude response does not contain valid JSON',
          'INVALID_RESPONSE_FORMAT'
        );
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!parsed.selections || !Array.isArray(parsed.selections)) {
        throw new ClaudeAPIError(
          'Claude response missing required selections array',
          'MISSING_SELECTIONS'
        );
      }

      // Validate and format each selection
      const validatedSelections = parsed.selections.map((selection, index) => {
        this.validateSelection(selection, index + 1);
        
        return {
          id: `claude-${Date.now()}-${index}`,
          name: selection.name || `Claude Selection ${index + 1}`,
          numbers: selection.numbers.sort((a, b) => a - b),
          powerball: selection.powerball,
          strategy: selection.strategy || 'Claude Analysis',
          confidence: Math.min(Math.max(selection.confidence || 75, 70), 99),
          description: selection.explanation || 'Advanced AI analysis',
          factors: selection.factors || [],
          claudeGenerated: true,
          isHybrid: true,
          timestamp: new Date().toISOString()
        };
      });

      return {
        selections: validatedSelections,
        analysisSummary: parsed.analysis_summary || 'Claude AI analysis completed',
        methodology: parsed.methodology || 'AI-powered pattern analysis',
        usage: usage,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      if (error instanceof ClaudeAPIError) throw error;
      
      throw new ClaudeAPIError(
        `Failed to parse Claude response: ${error.message}`,
        'RESPONSE_PARSING_ERROR',
        { response: responseText.substring(0, 500) }
      );
    }
  }

  /**
   * Validates a single selection from Claude
   */
  validateSelection(selection, index) {
    if (!selection.numbers || !Array.isArray(selection.numbers) || selection.numbers.length !== 5) {
      throw new ClaudeAPIError(
        `Selection ${index}: Must have exactly 5 main numbers`,
        'INVALID_SELECTION'
      );
    }

    if (!selection.powerball || typeof selection.powerball !== 'number') {
      throw new ClaudeAPIError(
        `Selection ${index}: Must have a valid Powerball number`,
        'INVALID_POWERBALL'
      );
    }

    // Validate number ranges
    const invalidMain = selection.numbers.find(n => n < 1 || n > 69 || !Number.isInteger(n));
    if (invalidMain) {
      throw new ClaudeAPIError(
        `Selection ${index}: Invalid main number ${invalidMain}. Must be 1-69.`,
        'INVALID_NUMBER_RANGE'
      );
    }

    if (selection.powerball < 1 || selection.powerball > 26 || !Number.isInteger(selection.powerball)) {
      throw new ClaudeAPIError(
        `Selection ${index}: Invalid Powerball ${selection.powerball}. Must be 1-26.`,
        'INVALID_POWERBALL_RANGE'
      );
    }

    // Check for duplicates in main numbers
    const uniqueNumbers = new Set(selection.numbers);
    if (uniqueNumbers.size !== 5) {
      throw new ClaudeAPIError(
        `Selection ${index}: Duplicate numbers not allowed in main selection`,
        'DUPLICATE_NUMBERS'
      );
    }
  }

  /**
   * Gets available Claude models
   */
  getAvailableModels() {
    return [
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        description: 'Most capable model for complex analysis',
        recommended: true
      },
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        description: 'Highest intelligence for maximum accuracy',
        recommended: false
      },
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        description: 'Fastest model for quick analysis',
        recommended: false
      }
    ];
  }
}

export const claudeService = new ClaudeService();
export { ClaudeAPIError };