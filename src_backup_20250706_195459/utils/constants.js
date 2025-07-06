// LCv2 Constants and Configuration - Centralized App Settings

// ===========================================================================
// APPLICATION CONFIGURATION
// ===========================================================================

export const APP_CONFIG = {
  name: 'LCv2 - Advanced Lottery Intelligence System',
  version: '2.0.0',
  description: 'Claude Sonnet 4 + 6 Algorithms Hybrid Architecture',
  author: 'LCv2 Development Team',
  maxRetries: 3,
  cacheTimeout: 1800000, // 30 minutes in milliseconds
  requestTimeout: 10000,  // 10 seconds
  maxHistoricalRecords: 2000,
  minHistoricalRecords: 50,
  environment: typeof import.meta !== 'undefined' ? import.meta.env.MODE : 'development'
};

// ===========================================================================
// API ENDPOINTS & CONFIGURATION
// ===========================================================================

export const API_ENDPOINTS = {
  // Primary data sources
  powerball: '/api/powerball',
  history: '/api/powerball-history',
  claude: '/api/claude',
  
  // Diagnostic endpoints
  test: '/api/test',
  diagnose: '/api/diagnose',
  status: '/api/status',
  
  // External data sources (fallback)
  nyLottery: 'https://data.ny.gov/resource/5xaw-6ayf.json',
  powerballCom: 'https://www.powerball.com/api',
  lotteryUSA: 'https://www.lotteryusa.com/api',
  
  // CDN resources
  tailwindCDN: 'https://cdn.tailwindcss.com'
};

// ===========================================================================
// CLAUDE AI CONFIGURATION
// ===========================================================================

export const CLAUDE_CONFIG = {
  model: 'claude-3-sonnet-20240229', // Claude Sonnet 4 model identifier
  fallbackModel: 'claude-3-haiku-20240307',
  version: '2023-06-01',
  
  maxTokens: {
    hybrid: 2000,        // For complex hybrid analysis
    quick: 1500,         // For quick selections
    insights: 800,       // For prediction insights
    test: 100           // For connection testing
  },
  
  temperature: 0.3,      // Lower = more focused, Higher = more creative
  topP: 0.9,            // Nucleus sampling parameter
  
  retryConfig: {
    maxRetries: 3,
    baseDelay: 1000,     // 1 second base delay
    maxDelay: 10000,     // 10 second max delay
    exponentialBackoff: true
  },
  
  rateLimits: {
    requestsPerMinute: 30,
    requestsPerHour: 1000,
    tokensPerMinute: 40000
  }
};

// ===========================================================================
// LOTTERY RULES & CONSTRAINTS
// ===========================================================================

export const LOTTERY_RULES = {
  mainNumbers: {
    min: 1,
    max: 69,
    count: 5,
    sumRange: {
      min: 75,           // Theoretical minimum sum (1+2+3+4+5)
      max: 325,          // Theoretical maximum sum (65+66+67+68+69)
      optimal: {
        min: 100,        // Practical minimum for balanced selection
        max: 275         // Practical maximum for balanced selection
      }
    }
  },
  
  powerball: {
    min: 1,
    max: 26,
    count: 1
  },
  
  drawings: {
    daysOfWeek: [1, 3, 6],        // Monday, Wednesday, Saturday (0=Sunday)
    drawingTime: {
      hour: 22,                    // 10 PM
      minute: 59,                  // 10:59 PM
      timezone: 'America/New_York' // Eastern Time
    },
    frequency: 'bi-weekly'         // Approximately twice per week
  },
  
  validation: {
    allowDuplicates: false,
    requireSorted: false,         // We'll sort them automatically
    enforceRange: true
  }
};

// ===========================================================================
// ALGORITHM CONFIGURATION
// ===========================================================================

export const ALGORITHM_CONFIG = {
  ewmaAlpha: 0.3,                // EWMA decay factor (0-1, higher = more recent weight)
  performanceWindow: 50,         // Number of predictions to track for performance
  confidenceRange: {
    min: 65,
    max: 95
  },
  
  algorithms: [
    {
      id: 'ewma',
      name: 'EWMA Frequency Consensus',
      weight: 0.2,
      description: 'Exponentially Weighted Moving Average frequency analysis with recent trend weighting',
      category: 'frequency',
      complexity: 'medium'
    },
    {
      id: 'neural',
      name: 'Neural Network Pattern Recognition',
      weight: 0.17,
      description: 'Multi-layer neural network analyzing positional patterns and feature extraction',
      category: 'pattern',
      complexity: 'high'
    },
    {
      id: 'pairs',
      name: 'Pair Relationship Analysis',
      weight: 0.18,
      description: 'Co-occurrence pattern analysis identifying number pair relationships and clustering',
      category: 'relationship',
      complexity: 'medium'
    },
    {
      id: 'gaps',
      name: 'Gap Pattern Optimization',
      weight: 0.16,
      description: 'Overdue number identification using gap pattern analysis and statistical distribution',
      category: 'temporal',
      complexity: 'medium'
    },
    {
      id: 'markov',
      name: 'Markov Chain Transition',
      weight: 0.14,
      description: 'State transition analysis predicting next numbers based on sequence patterns',
      category: 'sequential',
      complexity: 'high'
    },
    {
      id: 'sum',
      name: 'Sum Range Optimization',
      weight: 0.15,
      description: 'Sum distribution analysis targeting optimal total ranges based on historical patterns',
      category: 'mathematical',
      complexity: 'low'
    }
  ],
  
  ensemble: {
    votingMethod: 'weighted',     // 'weighted', 'majority', 'rank'
    diversityBonus: 0.1,         // Bonus for algorithms that produce diverse results
    performanceDecay: 0.95       // How quickly to forget old performance data
  }
};

// ===========================================================================
// UI CONFIGURATION & THEMES
// ===========================================================================

export const UI_CONFIG = {
  theme: {
    primary: '#3b82f6',          // Blue
    secondary: '#6b7280',        // Gray
    success: '#10b981',          // Green
    warning: '#f59e0b',          // Orange/Yellow
    error: '#ef4444',            // Red
    claude: '#8b5cf6',           // Purple for Claude AI
    
    gradients: {
      primary: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 30%, #10b981 60%, #f59e0b 100%)',
      claude: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
      unavailable: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 50%, #d1d5db 100%)'
    }
  },
  
  animations: {
    duration: {
      fast: '0.2s',
      normal: '0.3s',
      slow: '0.5s'
    },
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px'
  },
  
  layout: {
    maxWidth: '1280px',
    padding: '1rem',
    cardBorderRadius: '12px',
    buttonBorderRadius: '8px'
  }
};

// ===========================================================================
// TAX CALCULATION CONSTANTS
// ===========================================================================

export const TAX_CONFIG = {
  federal: {
    withholding: 0.24,           // 24% automatic withholding for lottery winnings over $5,000
    brackets2024: {
      single: [
        { min: 0, max: 11000, rate: 0.10 },
        { min: 11000, max: 44725, rate: 0.12 },
        { min: 44725, max: 95375, rate: 0.22 },
        { min: 95375, max: 182050, rate: 0.24 },
        { min: 182050, max: 231250, rate: 0.32 },
        { min: 231250, max: 578125, rate: 0.35 },
        { min: 578125, max: Infinity, rate: 0.37 }
      ],
      married: [
        { min: 0, max: 22000, rate: 0.10 },
        { min: 22000, max: 89450, rate: 0.12 },
        { min: 89450, max: 190750, rate: 0.22 },
        { min: 190750, max: 364200, rate: 0.24 },
        { min: 364200, max: 462500, rate: 0.32 },
        { min: 462500, max: 693750, rate: 0.35 },
        { min: 693750, max: Infinity, rate: 0.37 }
      ]
    }
  },
  
  state: {
    // Common state tax rates for lottery winnings
    rates: {
      'no_tax': 0.0,             // AL, AK, FL, NV, NH, SD, TN, TX, WA, WY
      'california': 0.133,        // Highest state tax
      'new_york': 0.1082,
      'pennsylvania': 0.0307,
      'illinois': 0.0495,
      'ohio': 0.0399,
      'michigan': 0.0425,
      'georgia': 0.0575,
      'north_carolina': 0.0499,
      'arizona': 0.045,
      'colorado': 0.0455
    }
  },
  
  calculations: {
    lumpSumRatio: 0.6,          // Typical lump sum is ~60% of advertised jackpot
    annuityYears: 30,           // Standard 30-year annuity
    inflationRate: 0.03,        // 3% average inflation assumption
    investmentReturn: 0.07      // 7% average investment return assumption
  }
};

// ===========================================================================
// ERROR MESSAGES & USER FEEDBACK
// ===========================================================================

export const ERROR_MESSAGES = {
  // API & Connection Errors
  networkError: 'Network connection failed. Please check your internet connection.',
  apiKeyRequired: 'Anthropic API key is required for Claude AI features.',
  invalidApiKey: 'Invalid API key format. Please check your Anthropic API key.',
  rateLimitExceeded: 'Rate limit exceeded. Please wait before making another request.',
  serverError: 'Server error occurred. Please try again later.',
  
  // Data Validation Errors
  invalidNumbers: 'Please select exactly 5 numbers between 1 and 69.',
  invalidPowerball: 'Please select a Powerball number between 1 and 26.',
  duplicateNumbers: 'Duplicate numbers are not allowed.',
  invalidJackpot: 'Please enter a valid jackpot amount (minimum $1,000,000).',
  
  // Algorithm Errors
  algorithmFailed: 'Algorithm calculation failed. Using fallback method.',
  insufficientData: 'Insufficient historical data for analysis.',
  predictionFailed: 'Prediction generation failed. Please try again.',
  
  // General Errors
  unexpectedError: 'An unexpected error occurred. Please refresh and try again.',
  dataCorrupted: 'Data integrity check failed. Please refresh the application.',
  featureUnavailable: 'This feature is temporarily unavailable.'
};

export const SUCCESS_MESSAGES = {
  // Data & API Success
  dataLoaded: 'Lottery data loaded successfully.',
  dataRefreshed: 'Data refreshed successfully.',
  claudeEnabled: 'Claude Sonnet 4 connected successfully.',
  
  // User Actions
  selectionSaved: 'Number selection saved successfully.',
  selectionCopied: 'Selection copied to clipboard.',
  calculationComplete: 'Tax calculation completed.',
  
  // System Operations
  systemInitialized: 'LCv2 system initialized successfully.',
  predictionsGenerated: 'Predictions generated successfully.',
  analysisComplete: 'Analysis completed successfully.'
};

export const WARNING_MESSAGES = {
  // Data Quality Warnings
  limitedData: 'Limited historical data available. Results may be less accurate.',
  offlineMode: 'Operating in offline mode. Using cached data.',
  fallbackData: 'Live data unavailable. Using fallback data.',
  
  // Feature Warnings
  claudeDisabled: 'Claude AI features disabled. Using local algorithms only.',
  expertMode: 'Expert mode enabled. Advanced features available.',
  betaFeature: 'This is a beta feature. Results may vary.',
  
  // Performance Warnings
  slowConnection: 'Slow network detected. Some features may be delayed.',
  highMemoryUsage: 'High memory usage detected. Consider refreshing the app.'
};

// ===========================================================================
// FEATURE FLAGS & EXPERIMENTAL SETTINGS
// ===========================================================================

export const FEATURE_FLAGS = {
  // AI Features
  claudeIntegration: true,
  hybridPredictions: true,
  advancedInsights: true,
  
  // Algorithm Features
  neuralNetworks: true,
  markovChains: true,
  ensembleLearning: true,
  
  // UI Features
  darkMode: false,              // Not implemented yet
  animations: true,
  mobileOptimizations: true,
  
  // Data Features
  realTimeData: true,
  historicalAnalysis: true,
  patternRecognition: true,
  
  // Experimental Features
  quantumAlgorithms: false,     // Future feature
  blockchainIntegration: false, // Future feature
  socialFeatures: false         // Future feature
};

// ===========================================================================
// PERFORMANCE & MONITORING
// ===========================================================================

export const PERFORMANCE_CONFIG = {
  // Monitoring thresholds
  thresholds: {
    apiResponseTime: 5000,      // 5 seconds
    memoryUsage: 100,           // 100MB
    errorRate: 0.05,            // 5%
    cacheHitRate: 0.8           // 80%
  },
  
  // Optimization settings
  optimization: {
    enableCaching: true,
    enableCompression: true,
    enableLazyLoading: true,
    enablePreloading: false
  },
  
  // Logging levels
  logging: {
    level: APP_CONFIG.environment === 'development' ? 'debug' : 'info',
    enableConsoleLogging: true,
    enableRemoteLogging: false,
    enablePerformanceLogging: true
  }
};

// ===========================================================================
// ACCESSIBILITY & INTERNATIONALIZATION
// ===========================================================================

export const ACCESSIBILITY_CONFIG = {
  // ARIA labels and roles
  labels: {
    numberSelection: 'Select lottery numbers',
    powerballSelection: 'Select Powerball number',
    generatePredictions: 'Generate AI predictions',
    calculateTaxes: 'Calculate tax breakdown'
  },
  
  // Keyboard navigation
  keyboard: {
    enableTabNavigation: true,
    enableArrowKeyNavigation: true,
    enableEnterToActivate: true
  },
  
  // Screen reader support
  screenReader: {
    announceUpdates: true,
    describeNumbers: true,
    explainAlgorithms: true
  }
};

export const I18N_CONFIG = {
  defaultLocale: 'en-US',
  supportedLocales: ['en-US'],  // Future: add more languages
  dateFormat: 'MM/dd/yyyy',
  timeFormat: 'h:mm a',
  numberFormat: 'en-US',
  currencyFormat: 'USD'
};

// ===========================================================================
// DEVELOPMENT & DEBUGGING
// ===========================================================================

export const DEBUG_CONFIG = {
  enabled: APP_CONFIG.environment === 'development',
  
  // Debug features
  features: {
    showAlgorithmDetails: true,
    showPerformanceMetrics: true,
    showApiRequests: true,
    showStateChanges: false,    // Can be verbose
    mockApiResponses: false     // For testing without API
  },
  
  // Test data
  testData: {
    generateMockHistoricalData: true,
    mockJackpotAmount: 100000000,
    mockApiResponses: false
  }
};

// ===========================================================================
// EXPORT ALL CONFIGURATIONS
// ===========================================================================

export default {
  APP_CONFIG,
  API_ENDPOINTS,
  CLAUDE_CONFIG,
  LOTTERY_RULES,
  ALGORITHM_CONFIG,
  UI_CONFIG,
  TAX_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  WARNING_MESSAGES,
  FEATURE_FLAGS,
  PERFORMANCE_CONFIG,
  ACCESSIBILITY_CONFIG,
  I18N_CONFIG,
  DEBUG_CONFIG
};

// ===========================================================================
// RUNTIME CONFIGURATION VALIDATION
// ===========================================================================

// Validate critical configuration on import
if (typeof window !== 'undefined') {
  // Browser environment validation
  console.log('?? LCv2 Configuration loaded');
  console.log(`?? Version: ${APP_CONFIG.version}`);
  console.log(`??? Environment: ${APP_CONFIG.environment}`);
  console.log(`?? Algorithms: ${ALGORITHM_CONFIG.algorithms.length} configured`);
  console.log(`?? Claude Model: ${CLAUDE_CONFIG.model}`);
  
  // Validate essential features
  const essentialFeatures = ['claudeIntegration', 'hybridPredictions', 'realTimeData'];
  const enabledFeatures = essentialFeatures.filter(feature => FEATURE_FLAGS[feature]);
  
  if (enabledFeatures.length !== essentialFeatures.length) {
    console.warn('?? Some essential features are disabled:', 
      essentialFeatures.filter(f => !FEATURE_FLAGS[f])
    );
  }
  
  // Environment-specific warnings
  if (APP_CONFIG.environment === 'development') {
    console.log('?? Development mode: Additional debugging features enabled');
  }
}