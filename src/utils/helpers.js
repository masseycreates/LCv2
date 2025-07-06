// LCv2 Utility Helper Functions

import { LOTTERY_RULES } from './constants.js';

// Number validation functions
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
  if (!Array.isArray(numbers) || numbers.length !== LOTTERY_RULES.mainNumbers.count) {
    return false;
  }
  
  if (!isValidPowerball(powerball)) {
    return false;
  }
  
  for (const num of numbers) {
    if (!isValidMainNumber(num)) {
      return false;
    }
  }
  
  // Check for duplicates
  const uniqueNumbers = new Set(numbers);
  return uniqueNumbers.size === LOTTERY_RULES.mainNumbers.count;
};

// Formatting functions
export const formatJackpot = (amount) => {
  if (!amount || amount <= 0) return '$0';
  
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`;
  } else if (amount >= 1000000) {
    return `$${Math.round(amount / 1000000)}M`;
  } else {
    return `$${amount.toLocaleString()}`;
  }
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatPercentage = (rate) => {
  return (rate).toFixed(2) + '%';
};

export const formatNumbers = (numbers, powerball) => {
  if (!numbers || !powerball) return 'Invalid selection';
  const sortedNumbers = [...numbers].sort((a, b) => a - b);
  return `${sortedNumbers.join(', ')} | PB: ${powerball}`;
};

// Date and time functions
export const calculateNextDrawing = () => {
  try {
    const now = new Date();
    const etNow = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    
    const dayOfWeek = etNow.getDay();
    const hour = etNow.getHours();
    
    const { drawingDays, drawingTime } = LOTTERY_RULES;
    
    let nextDrawingDate = new Date(etNow);
    let found = false;
    
    // Check if today is a drawing day and we haven't passed the time
    if (drawingDays.includes(dayOfWeek)) {
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
        
        if (drawingDays.includes(checkDay)) {
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
      timestamp: nextDrawingDate.toISOString()
    };
    
  } catch (error) {
    console.error('Next drawing calculation failed:', error.message);
    return {
      date: 'Check powerball.com',
      time: '10:59 PM ET',
      dayOfWeek: 'Mon/Wed/Sat',
      timestamp: null
    };
  }
};

// Data validation functions
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
  return validityRatio >= 0.8;
};

export const validateJackpotData = (data) => {
  if (!data || typeof data !== 'object') return false;
  
  const amount = data.amount;
  const cashValue = data.cashValue;
  
  if (!amount || amount < 20000000 || amount > 5000000000) return false;
  if (!cashValue || cashValue < 10000000 || cashValue > 3000000000) return false;
  if (cashValue >= amount) return false;
  
  const ratio = cashValue / amount;
  return ratio >= 0.4 && ratio <= 0.8;
};

// API key validation
export const validateApiKey = (key) => {
  return key && 
         typeof key === 'string' && 
         key.startsWith('sk-ant-') && 
         key.length > 20;
};

// Generate random numbers for quick pick
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
    powerball
  };
};

// Confidence level helpers
export const getConfidenceClass = (confidence) => {
  if (confidence >= 85) return 'confidence-opus4-high';
  if (confidence >= 75) return 'confidence-opus4-medium';
  return 'confidence-low';
};

export const getConfidenceColor = (confidence) => {
  if (confidence >= 85) return 'bg-purple-100 text-purple-800 border-purple-300';
  if (confidence >= 75) return 'bg-blue-100 text-blue-800 border-blue-300';
  return 'bg-yellow-100 text-yellow-800 border-yellow-300';
};

// Local storage helpers (with error handling)
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
    return false;
  }
};

export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

// Deep clone utility
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Debounce utility
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Array shuffle utility
export const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Calculate historical depth
export const calculateHistoricalDepth = (drawings) => {
  if (!drawings || drawings.length === 0) return 'No data';
  
  const earliestDate = new Date(drawings[drawings.length - 1].date);
  const latestDate = new Date(drawings[0].date);
  const daysDiff = Math.floor((latestDate - earliestDate) / (1000 * 60 * 60 * 24));
  
  if (daysDiff > 365) {
    return `${Math.floor(daysDiff / 365)} years`;
  } else if (daysDiff > 30) {
    return `${Math.floor(daysDiff / 30)} months`;
  } else {
    return `${daysDiff} days`;
  }
};

// Error handling utility
export const handleApiError = (error, fallbackMessage = 'An error occurred') => {
  if (error.response) {
    return error.response.data?.error || `HTTP ${error.response.status}`;
  } else if (error.request) {
    return 'Network connection error';
  } else {
    return error.message || fallbackMessage;
  }
};