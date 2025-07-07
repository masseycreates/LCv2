// LCv2 Utility Helper Functions - Comprehensive Function Library

import { LOTTERY_RULES, TAX_CONFIG, APP_CONFIG } from './constants.js';

// ===========================================================================
// NUMBER VALIDATION FUNCTIONS
// ===========================================================================

export const isValidMainNumber = (num) => {
  return Number.isInteger(num) && 
         num >= LOTTERY_RULES.mainNumbers.min && 
         num <= LOTTERY_RULES.mainNumbers.max;
};

export const isValidPowerball = (num) => {
  return Number.isInteger(num) && 
         num >= LOTTERY_RULES.powerball.min && 
         num <= LOTTERY_RULES.powerball.max;
};

export const isValidPowerballNumbers = (numbers, powerball) => {
  // Validate numbers array
  if (!Array.isArray(numbers) || numbers.length !== LOTTERY_RULES.mainNumbers.count) {
    return false;
  }
  
  // Validate powerball
  if (!isValidPowerball(powerball)) {
    return false;
  }
  
  // Validate each main number
  for (const num of numbers) {
    if (!isValidMainNumber(num)) {
      return false;
    }
  }
  
  // Check for duplicates
  const uniqueNumbers = new Set(numbers);
  return uniqueNumbers.size === LOTTERY_RULES.mainNumbers.count;
};

export const validateNumberSum = (numbers) => {
  if (!Array.isArray(numbers) || numbers.length !== 5) return false;
  
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const { sumRange } = LOTTERY_RULES.mainNumbers;
  
  return sum >= sumRange.min && sum <= sumRange.max;
};

export const validateNumberDistribution = (numbers) => {
  if (!Array.isArray(numbers) || numbers.length !== 5) return false;
  
  const evenCount = numbers.filter(num => num % 2 === 0).length;
  const lowCount = numbers.filter(num => num <= 35).length;
  const range = Math.max(...numbers) - Math.min(...numbers);
  
  return {
    isValid: evenCount >= 1 && evenCount <= 4 && lowCount >= 1 && lowCount <= 4,
    evenCount,
    oddCount: 5 - evenCount,
    lowCount,
    highCount: 5 - lowCount,
    range,
    sum: numbers.reduce((a, b) => a + b, 0)
  };
};

// ===========================================================================
// FORMATTING FUNCTIONS
// ===========================================================================

export const formatJackpot = (amount) => {
  if (!amount || amount <= 0) return '$0';
  
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`;
  } else if (amount >= 1000000) {
    return `$${Math.round(amount / 1000000)}M`;
  } else if (amount >= 1000) {
    return `$${Math.round(amount / 1000)}K`;
  } else {
    return `$${Math.round(amount)}`;
  }
};

export const formatCurrency = (amount, options = {}) => {
  const defaultOptions = {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  try {
    return new Intl.NumberFormat('en-US', formatOptions).format(amount);
  } catch (error) {
    // Fallback for older browsers
    return `$${Math.round(amount).toLocaleString()}`;
  }
};

export const formatPercentage = (rate, decimals = 2) => {
  if (typeof rate !== 'number' || isNaN(rate)) return '0%';
  return `${rate.toFixed(decimals)}%`;
};

export const formatNumbers = (numbers, powerball) => {
  if (!numbers || !powerball) return 'Invalid selection';
  
  try {
    const sortedNumbers = [...numbers].sort((a, b) => a - b);
    return `${sortedNumbers.join(', ')} | PB: ${powerball}`;
  } catch (error) {
    return 'Format error';
  }
};

export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', formatOptions);
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatTime = (date, options = {}) => {
  const defaultOptions = {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-US', formatOptions);
  } catch (error) {
    return 'Invalid time';
  }
};

// ===========================================================================
// DATE AND TIME FUNCTIONS
// ===========================================================================

export const calculateNextDrawing = () => {
  try {
    const now = new Date();
    const etNow = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    
    const dayOfWeek = etNow.getDay();
    const hour = etNow.getHours();
    const minute = etNow.getMinutes();
    
    const { daysOfWeek, drawingTime } = LOTTERY_RULES.drawings;
    
    let nextDrawingDate = new Date(etNow);
    let found = false;
    
    // Check if today is a drawing day and we haven't passed the time
    if (daysOfWeek.includes(dayOfWeek)) {
      const todayDrawingTime = new Date(etNow);
      todayDrawingTime.setHours(drawingTime.hour, drawingTime.minute, 0, 0);
      
      if (etNow <= todayDrawingTime) {
        nextDrawingDate = todayDrawingTime;
        found = true;
      }
    }
    
    // Find next drawing day
    if (!found) {
      let daysToAdd = 1;
      
      while (daysToAdd <= 7 && !found) {
        const checkDate = new Date(etNow);
        checkDate.setDate(etNow.getDate() + daysToAdd);
        checkDate.setHours(drawingTime.hour, drawingTime.minute, 0, 0);
        
        const checkDay = checkDate.getDay();
        
        if (daysOfWeek.includes(checkDay)) {
          nextDrawingDate = checkDate;
          found = true;
        }
        
        daysToAdd++;
      }
    }
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const nextDrawingDayName = dayNames[nextDrawingDate.getDay()];
    
    return {
      date: nextDrawingDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric',
        timeZone: 'America/New_York'
      }),
      time: '10:59 PM ET',
      dayOfWeek: nextDrawingDayName,
      timestamp: nextDrawingDate.toISOString(),
      daysUntil: Math.ceil((nextDrawingDate - etNow) / (1000 * 60 * 60 * 24))
    };
    
  } catch (error) {
    console.error('Next drawing calculation failed:', error.message);
    return {
      date: 'Check powerball.com',
      time: '10:59 PM ET',
      dayOfWeek: 'Mon/Wed/Sat',
      timestamp: null,
      daysUntil: null
    };
  }
};

export const getTimeSince = (date) => {
  try {
    const now = new Date();
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const diffMs = now - targetDate;
    
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    return 'Just now';
    
  } catch (error) {
    return 'Unknown';
  }
};

export const isWithinTimeRange = (date, hours = 24) => {
  try {
    const now = new Date();
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const diffMs = now - targetDate;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return diffHours <= hours && diffHours >= 0;
  } catch (error) {
    return false;
  }
};

// ===========================================================================
// DATA VALIDATION FUNCTIONS
// ===========================================================================

export const validateHistoricalData = (drawings) => {
  if (!Array.isArray(drawings) || drawings.length < 10) {
    return false;
  }
  
  const validDrawings = drawings.filter(drawing => {
    return drawing.date && 
           drawing.numbers && 
           drawing.powerball &&
           isValidPowerballNumbers(drawing.numbers, drawing.powerball);
  });
  
  const validityRatio = validDrawings.length / drawings.length;
  return validityRatio >= 0.8; // At least 80% valid data
};

export const validateJackpotData = (data) => {
  if (!data || typeof data !== 'object') return false;
  
  const amount = data.amount || data.jackpot;
  const cashValue = data.cashValue || data.cash_value;
  
  // Validate amount
  if (!amount || amount < 20000000 || amount > 5000000000) return false;
  
  // Validate cash value if present
  if (cashValue) {
    if (cashValue < 10000000 || cashValue > 3000000000) return false;
    if (cashValue >= amount) return false;
    
    const ratio = cashValue / amount;
    if (ratio < 0.4 || ratio > 0.8) return false;
  }
  
  return true;
};

export const validateApiResponse = (response, expectedStructure = {}) => {
  if (!response || typeof response !== 'object') return false;
  
  // Check required fields
  for (const [key, type] of Object.entries(expectedStructure)) {
    if (!(key in response)) return false;
    if (type && typeof response[key] !== type) return false;
  }
  
  return true;
};

// ===========================================================================
// API KEY VALIDATION
// ===========================================================================

export const validateApiKey = (key) => {
  return key && 
         typeof key === 'string' && 
         key.startsWith('sk-ant-') && 
         key.length > 20 &&
         key.length < 200;
};

export const maskApiKey = (key) => {
  if (!key || typeof key !== 'string') return '';
  if (key.length < 12) return '***';
  
  return key.substring(0, 7) + '...' + key.substring(key.length - 4);
};

// ===========================================================================
// RANDOM NUMBER GENERATION
// ===========================================================================

export const generateQuickPick = () => {
  const numbers = [];
  while (numbers.length < LOTTERY_RULES.mainNumbers.count) {
    const num = Math.floor(Math.random() * LOTTERY_RULES.mainNumbers.max) + 1;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  
  const powerball = Math.floor(Math.random() * LOTTERY_RULES.powerball.max) + 1;
  
  return {
    numbers: numbers.sort((a, b) => a - b),
    powerball,
    timestamp: new Date().toISOString()
  };
};

export const generateRandomInRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateWeightedRandom = (items, weights) => {
  if (!Array.isArray(items) || !Array.isArray(weights) || items.length !== weights.length) {
    throw new Error('Items and weights arrays must have the same length');
  }
  
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const randomValue = Math.random() * totalWeight;
  
  let cumulativeWeight = 0;
  for (let i = 0; i < items.length; i++) {
    cumulativeWeight += weights[i];
    if (randomValue <= cumulativeWeight) {
      return items[i];
    }
  }
  
  return items[items.length - 1]; // Fallback
};

// ===========================================================================
// CONFIDENCE AND SCORING HELPERS
// ===========================================================================

export const getConfidenceClass = (confidence) => {
  if (confidence >= 85) return 'confidence-high';
  if (confidence >= 75) return 'confidence-medium';
  return 'confidence-low';
};

export const getConfidenceColor = (confidence) => {
  if (confidence >= 90) return 'bg-green-100 text-green-800 border-green-300';
  if (confidence >= 85) return 'bg-blue-100 text-blue-800 border-blue-300';
  if (confidence >= 75) return 'bg-purple-100 text-purple-800 border-purple-300';
  if (confidence >= 65) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  return 'bg-gray-100 text-gray-800 border-gray-300';
};

export const calculateAlgorithmScore = (predicted, actual) => {
  if (!predicted || !actual) return 0;
  
  let score = 0;
  const maxScore = 6; // 5 main numbers + 1 powerball
  
  // Score main numbers
  if (predicted.numbers && actual.numbers) {
    const matches = predicted.numbers.filter(num => actual.numbers.includes(num)).length;
    score += matches;
  }
  
  // Score powerball
  if (predicted.powerball === actual.powerball) {
    score += 1;
  }
  
  return (score / maxScore) * 100; // Return as percentage
};

export const normalizeConfidence = (confidence, min = 65, max = 95) => {
  if (typeof confidence !== 'number') return min;
  return Math.max(min, Math.min(max, Math.round(confidence)));
};

// ===========================================================================
// LOCAL STORAGE HELPERS
// ===========================================================================

export const saveToStorage = (key, data) => {
  try {
    const serializedData = JSON.stringify({
      data,
      timestamp: Date.now(),
      version: APP_CONFIG.version
    });
    localStorage.setItem(`lcv2_${key}`, serializedData);
    return true;
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
    return false;
  }
};

export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(`lcv2_${key}`);
    if (!item) return defaultValue;
    
    const parsed = JSON.parse(item);
    
    // Check if data is stale (older than cache timeout)
    if (Date.now() - parsed.timestamp > APP_CONFIG.cacheTimeout) {
      localStorage.removeItem(`lcv2_${key}`);
      return defaultValue;
    }
    
    return parsed.data;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(`lcv2_${key}`);
    return true;
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
    return false;
  }
};

export const clearAllStorage = () => {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('lcv2_')) {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
    return false;
  }
};

// ===========================================================================
// ARRAY AND OBJECT UTILITIES
// ===========================================================================

export const deepClone = (obj) => {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.warn('Deep clone failed, returning original:', error);
    return obj;
  }
};

export const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const removeDuplicates = (array, keyFn = (item) => item) => {
  const seen = new Set();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export const sortBy = (array, keyFn, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = keyFn(a);
    const bVal = keyFn(b);
    
    if (direction === 'desc') {
      return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
    } else {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    }
  });
};

export const groupBy = (array, keyFn) => {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
};

export const chunk = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// ===========================================================================
// PERFORMANCE AND OPTIMIZATION HELPERS
// ===========================================================================

export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const memoize = (func, keyGenerator = (...args) => JSON.stringify(args)) => {
  const cache = new Map();
  
  return function memoizedFunction(...args) {
    const key = keyGenerator(...args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func.apply(this, args);
    cache.set(key, result);
    
    // Prevent memory leaks by limiting cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
};

// ===========================================================================
// DATA ANALYSIS HELPERS
// ===========================================================================

export const calculateHistoricalDepth = (drawings) => {
  if (!drawings || drawings.length === 0) return 'No data';
  
  try {
    const dates = drawings
      .map(d => d.date)
      .filter(date => date)
      .map(date => new Date(date))
      .sort((a, b) => a - b);
    
    if (dates.length === 0) return 'No dates';
    
    const earliestDate = dates[0];
    const latestDate = dates[dates.length - 1];
    const daysDiff = Math.floor((latestDate - earliestDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 365) {
      return `${Math.floor(daysDiff / 365)} years`;
    } else if (daysDiff > 30) {
      return `${Math.floor(daysDiff / 30)} months`;
    } else {
      return `${daysDiff} days`;
    }
  } catch (error) {
    return 'Invalid data';
  }
};

export const calculateStatistics = (numbers) => {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    return { mean: 0, median: 0, mode: 0, stdDev: 0 };
  }
  
  const sorted = [...numbers].sort((a, b) => a - b);
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const mean = sum / numbers.length;
  
  // Median
  const median = sorted.length % 2 === 0 
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  
  // Mode
  const frequency = {};
  numbers.forEach(num => {
    frequency[num] = (frequency[num] || 0) + 1;
  });
  const mode = Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 0;
  
  // Standard deviation
  const variance = numbers.reduce((acc, num) => acc + Math.pow(num - mean, 2), 0) / numbers.length;
  const stdDev = Math.sqrt(variance);
  
  return { mean, median, mode: parseInt(mode), stdDev };
};

export const findTrends = (data, windowSize = 5) => {
  if (!Array.isArray(data) || data.length < windowSize * 2) {
    return { trend: 'insufficient_data', confidence: 0 };
  }
  
  const recentWindow = data.slice(0, windowSize);
  const previousWindow = data.slice(windowSize, windowSize * 2);
  
  const recentAvg = recentWindow.reduce((a, b) => a + b, 0) / recentWindow.length;
  const previousAvg = previousWindow.reduce((a, b) => a + b, 0) / previousWindow.length;
  
  const difference = recentAvg - previousAvg;
  const percentChange = Math.abs(difference / previousAvg) * 100;
  
  let trend = 'stable';
  if (difference > 0 && percentChange > 5) trend = 'increasing';
  if (difference < 0 && percentChange > 5) trend = 'decreasing';
  
  return {
    trend,
    confidence: Math.min(100, percentChange * 2),
    recentAvg,
    previousAvg,
    change: difference
  };
};

// ===========================================================================
// ERROR HANDLING UTILITIES
// ===========================================================================

export const handleApiError = (error, fallbackMessage = 'An error occurred') => {
  if (error?.response) {
    // HTTP error response
    const status = error.response.status;
    const data = error.response.data;
    
    if (status === 429) return 'Rate limit exceeded. Please wait before retrying.';
    if (status === 401) return 'Authentication failed. Please check your API key.';
    if (status === 403) return 'Access forbidden. Please check your permissions.';
    if (status === 404) return 'Requested resource not found.';
    if (status >= 500) return 'Server error. Please try again later.';
    
    return data?.error || data?.message || `HTTP ${status} error`;
  } else if (error?.request) {
    // Network error
    return 'Network connection error. Please check your internet connection.';
  } else if (error?.message) {
    // JavaScript error
    return error.message;
  } else {
    // Unknown error
    return fallbackMessage;
  }
};

export const createErrorReport = (error, context = {}) => {
  return {
    message: error.message || 'Unknown error',
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    context,
    errorType: error.constructor.name
  };
};

export const logError = (error, context = {}) => {
  const report = createErrorReport(error, context);
  
  // Log to console in development
  if (APP_CONFIG.environment === 'development') {
    console.error('Error Report:', report);
  }
  
  // In production, you might send to an error tracking service
  // Example: sendToErrorTracker(report);
  
  return report;
};

// ===========================================================================
// BROWSER COMPATIBILITY HELPERS
// ===========================================================================

export const isModernBrowser = () => {
  try {
    return !!(
      window.fetch &&
      window.Promise &&
      window.Map &&
      window.Set &&
      Array.prototype.includes &&
      Object.assign
    );
  } catch (error) {
    return false;
  }
};

export const supportsLocalStorage = () => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, 'test');
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
};

export const supportsClipboard = () => {
  return !!(navigator.clipboard && navigator.clipboard.writeText);
};

export const copyToClipboard = async (text) => {
  try {
    if (supportsClipboard()) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.warn('Failed to copy to clipboard:', error);
    return false;
  }
};

// ===========================================================================
// URL AND QUERY PARAMETER HELPERS
// ===========================================================================

export const getQueryParameters = () => {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  
  for (const [key, value] of params) {
    result[key] = value;
  }
  
  return result;
};

export const setQueryParameter = (key, value) => {
  const url = new URL(window.location);
  url.searchParams.set(key, value);
  window.history.replaceState({}, '', url);
};

export const removeQueryParameter = (key) => {
  const url = new URL(window.location);
  url.searchParams.delete(key);
  window.history.replaceState({}, '', url);
};

// ===========================================================================
// EXPORT ALL FUNCTIONS
// ===========================================================================

export default {
  // Validation
  isValidMainNumber,
  isValidPowerball,
  isValidPowerballNumbers,
  validateNumberSum,
  validateNumberDistribution,
  validateHistoricalData,
  validateJackpotData,
  validateApiResponse,
  validateApiKey,
  
  // Formatting
  formatJackpot,
  formatCurrency,
  formatPercentage,
  formatNumbers,
  formatDate,
  formatTime,
  
  // Date/Time
  calculateNextDrawing,
  getTimeSince,
  isWithinTimeRange,
  
  // Random Generation
  generateQuickPick,
  generateRandomInRange,
  generateWeightedRandom,
  
  // Confidence/Scoring
  getConfidenceClass,
  getConfidenceColor,
  calculateAlgorithmScore,
  normalizeConfidence,
  
  // Storage
  saveToStorage,
  loadFromStorage,
  removeFromStorage,
  clearAllStorage,
  
  // Array/Object Utils
  deepClone,
  shuffleArray,
  removeDuplicates,
  sortBy,
  groupBy,
  chunk,
  
  // Performance
  debounce,
  throttle,
  memoize,
  
  // Data Analysis
  calculateHistoricalDepth,
  calculateStatistics,
  findTrends,
  
  // Error Handling
  handleApiError,
  createErrorReport,
  logError,
  
  // Browser Compatibility
  isModernBrowser,
  supportsLocalStorage,
  supportsClipboard,
  copyToClipboard,
  
  // URL Utils
  getQueryParameters,
  setQueryParameter,
  removeQueryParameter
};

// ===========================================================================
// INITIALIZATION
// ===========================================================================

// Run compatibility checks on import
if (typeof window !== 'undefined') {
  const compatibility = {
    modern: isModernBrowser(),
    localStorage: supportsLocalStorage(),
    clipboard: supportsClipboard()
  };
  
  console.log('🔧 Browser compatibility:', compatibility);
  
  if (!compatibility.modern) {
    console.warn('⚠️ Some features may not work in this browser. Please update to a modern browser.');
  }
}