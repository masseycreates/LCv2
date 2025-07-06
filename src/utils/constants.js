// LCv2 Constants and Configuration

export const APP_CONFIG = {
  name: 'LCv2 - Advanced Lottery Intelligence System',
  version: '2.0.0',
  description: 'Claude Opus 4 + 6 Algorithms Hybrid',
  maxRetries: 3,
  cacheTimeout: 1800000, // 30 minutes
};

export const API_ENDPOINTS = {
  powerball: '/api/powerball',
  history: '/api/powerball-history',
  claude: '/api/claude',
  test: '/api/test',
  diagnose: '/api/diagnose'
};

export const CLAUDE_CONFIG = {
  model: 'claude-3-opus-20240229',
  maxTokens: {
    hybrid: 2000,
    quick: 1500,
    insights: 800
  },
  temperature: 0.3,
  version: '2023-06-01'
};

export const LOTTERY_RULES = {
  mainNumbers: {
    min: 1,
    max: 69,
    count: 5
  },
  powerball: {
    min: 1,
    max: 26,
    count: 1
  },
  drawingDays: [1, 3, 6], // Monday, Wednesday, Saturday
  drawingTime: { hour: 22, minute: 59 } // 10:59 PM ET
};

export const ALGORITHM_CONFIG = {
  ewmaAlpha: 0.3,
  performanceWindow: 50,
  algorithms: [
    {
      id: 'ewma',
      name: 'EWMA Frequency Consensus',
      weight: 0.2,
      description: 'Exponentially Weighted Moving Average frequency analysis'
    },
    {
      id: 'neural',
      name: 'Neural Network Pattern Recognition',
      weight: 0.17,
      description: 'Multi-layer neural network analyzing positional patterns'
    },
    {
      id: 'pairs',
      name: 'Pair Relationship Analysis',
      weight: 0.18,
      description: 'Co-occurrence pattern analysis identifying number relationships'
    },
    {
      id: 'gaps',
      name: 'Gap Pattern Optimization',
      weight: 0.16,
      description: 'Overdue number identification using gap pattern analysis'
    },
    {
      id: 'markov',
      name: 'Markov Chain Transition',
      weight: 0.14,
      description: 'State transition analysis predicting next numbers'
    },
    {
      id: 'sum',
      name: 'Sum Range Analysis',
      weight: 0.15,
      description: 'Statistical sum range optimization'
    }
  ]
};

export const TAX_CONFIG = {
  currentYear: new Date().getFullYear(),
  federalWithholdingRate: 0.24,
  annuityYears: 30,
  lumpSumRatio: 0.6,
  annualIncrease: 0.05,
  
  federalBrackets: [
    { min: 0, max: 11000, rate: 0.10 },
    { min: 11000, max: 44725, rate: 0.12 },
    { min: 44725, max: 95375, rate: 0.22 },
    { min: 95375, max: 182050, rate: 0.24 },
    { min: 182050, max: 231250, rate: 0.32 },
    { min: 231250, max: 578125, rate: 0.35 },
    { min: 578125, max: Infinity, rate: 0.37 }
  ],
  
  stateTaxRates: {
    'AL': 0.05, 'AK': 0.00, 'AZ': 0.045, 'AR': 0.066, 'CA': 0.133,
    'CO': 0.044, 'CT': 0.0699, 'DE': 0.066, 'FL': 0.00, 'GA': 0.0575,
    'HI': 0.11, 'ID': 0.058, 'IL': 0.0495, 'IN': 0.0323, 'IA': 0.0853,
    'KS': 0.057, 'KY': 0.05, 'LA': 0.06, 'ME': 0.0715, 'MD': 0.0575,
    'MA': 0.05, 'MI': 0.0425, 'MN': 0.0985, 'MS': 0.05, 'MO': 0.054,
    'MT': 0.0675, 'NE': 0.0684, 'NV': 0.00, 'NH': 0.05, 'NJ': 0.1075,
    'NM': 0.059, 'NY': 0.1090, 'NC': 0.0499, 'ND': 0.029, 'OH': 0.0399,
    'OK': 0.05, 'OR': 0.099, 'PA': 0.0307, 'RI': 0.0599, 'SC': 0.07,
    'SD': 0.00, 'TN': 0.00, 'TX': 0.00, 'UT': 0.0495, 'VT': 0.0875,
    'VA': 0.0575, 'WA': 0.00, 'WV': 0.065, 'WI': 0.0765, 'WY': 0.00
  },
  
  stateNames: {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
  }
};

export const UI_CONFIG = {
  tabs: [
    { id: 'quick-selection', label: 'AI Hybrid', icon: '🤖✨' },
    { id: 'calculator', label: 'Calculator', icon: '🎯' },
    { id: 'tax-calculator', label: 'Tax Calculator', icon: '💰' },
    { id: 'analysis', label: 'Analysis', icon: '📊' }
  ],
  
  historicalLimits: [
    { value: 50, label: '50 drawings (2 months)' },
    { value: 100, label: '100 drawings (4 months)' },
    { value: 250, label: '250 drawings (1 year)' },
    { value: 500, label: '500 drawings (2 years)' },
    { value: 1000, label: '1000 drawings (4 years)' },
    { value: 1500, label: '1500 drawings (6 years)' },
    { value: 2000, label: '2000 drawings (8+ years)' }
  ],
  
  confidenceLevels: {
    high: 85,
    medium: 75,
    low: 65
  }
};

export const ERROR_MESSAGES = {
  apiKeyRequired: 'Claude API key is required',
  invalidApiKey: 'Invalid Anthropic API key format',
  connectionFailed: 'Failed to connect to Claude API',
  dataUnavailable: 'Live data temporarily unavailable',
  historyUnavailable: 'Historical data unavailable',
  invalidJackpot: 'Please enter a valid jackpot amount',
  networkError: 'Network connection error'
};

export const SUCCESS_MESSAGES = {
  claudeEnabled: 'Claude Opus 4 hybrid system enabled successfully',
  dataRefreshed: 'Live data refreshed successfully',
  selectionGenerated: 'New selections generated successfully',
  selectionCopied: 'Selection copied to clipboard'
};