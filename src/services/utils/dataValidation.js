// src/services/utils/dataValidation.js - Data validation utilities
export class DataValidator {
  static validateLotteryNumbers(numbers) {
    if (!Array.isArray(numbers) || numbers.length !== 5) {
      return { valid: false, error: 'Must provide exactly 5 numbers' };
    }
    
    for (const num of numbers) {
      if (!Number.isInteger(num) || num < 1 || num > 69) {
        return { valid: false, error: 'Numbers must be integers between 1 and 69' };
      }
    }
    
    const unique = new Set(numbers);
    if (unique.size !== 5) {
      return { valid: false, error: 'All numbers must be unique' };
    }
    
    return { valid: true };
  }

  static validatePowerball(powerball) {
    if (!Number.isInteger(powerball) || powerball < 1 || powerball > 26) {
      return { valid: false, error: 'Powerball must be an integer between 1 and 26' };
    }
    
    return { valid: true };
  }

  static validateApiKey(key) {
    if (!key || typeof key !== 'string') {
      return { valid: false, error: 'API key must be a non-empty string' };
    }
    
    if (!key.startsWith('sk-ant-')) {
      return { valid: false, error: 'Invalid API key format' };
    }
    
    if (key.length < 20) {
      return { valid: false, error: 'API key appears to be too short' };
    }
    
    return { valid: true };
  }
}

// Export instances for easy use
export const lotteryPredictor = new LotteryPredictor();
export const claudeApi = new ClaudeApiService();
export const lotteryApi = new LotteryApiService();