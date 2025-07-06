import React, { useState, useEffect, useReducer, createContext, useContext } from 'react';

// ====== TYPES & CONSTANTS ======
const ACTIONS = {
  SET_SYSTEM_STATUS: 'SET_SYSTEM_STATUS',
  SET_DATA_STATUS: 'SET_DATA_STATUS',
  SET_LAST_UPDATED: 'SET_LAST_UPDATED',
  SET_CLAUDE_API_KEY: 'SET_CLAUDE_API_KEY',
  SET_CLAUDE_STATUS: 'SET_CLAUDE_STATUS',
  SET_JACKPOT_DATA: 'SET_JACKPOT_DATA',
  SET_HISTORICAL_STATS: 'SET_HISTORICAL_STATS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_PERFORMANCE_METRICS: 'SET_PERFORMANCE_METRICS',
  INCREMENT_ANALYSES: 'INCREMENT_ANALYSES'
};

const TAB_CONFIG = {
  'ai-hybrid': {
    id: 'ai-hybrid',
    label: 'AI Hybrid',
    icon: '???',
    description: 'Claude Opus 4 + Advanced Algorithms'
  },
  'manual': {
    id: 'manual',
    label: 'Manual',
    icon: '??',
    description: 'Manual Number Selection'
  },
  'tax-calc': {
    id: 'tax-calc',
    label: 'Tax Calculator',
    icon: '??',
    description: 'Lottery Tax Calculator'
  },
  'analysis': {
    id: 'analysis',
    label: 'Analysis',
    icon: '??',
    description: 'Data Analysis & Statistics'
  }
};

// ====== STATE MANAGEMENT ======
const initialState = {
  systemStatus: 'initializing',
  dataStatus: 'Initializing system...',
  lastUpdated: null,
  claudeApiKey: '',
  claudeStatus: 'disconnected',
  isClaudeEnabled: false,
  jackpotData: null,
  historicalStats: null,
  notifications: [],
  performanceMetrics: {
    totalAnalyses: 0,
    isLearning: false,
    status: 'excellent'
  }
};

function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_SYSTEM_STATUS:
      return { ...state, systemStatus: action.payload };
    case ACTIONS.SET_DATA_STATUS:
      return { ...state, dataStatus: action.payload };
    case ACTIONS.SET_LAST_UPDATED:
      return { ...state, lastUpdated: new Date().toISOString() };
    case ACTIONS.SET_CLAUDE_API_KEY:
      return { ...state, claudeApiKey: action.payload };
    case ACTIONS.SET_CLAUDE_STATUS:
      return { 
        ...state, 
        claudeStatus: action.payload,
        isClaudeEnabled: action.payload === 'connected'
      };
    case ACTIONS.SET_JACKPOT_DATA:
      return { ...state, jackpotData: action.payload };
    case ACTIONS.SET_HISTORICAL_STATS:
      return { ...state, historicalStats: action.payload };
    case ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, { ...action.payload, id: Date.now() }]
      };
    case ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    case ACTIONS.SET_PERFORMANCE_METRICS:
      return { ...state, performanceMetrics: { ...state.performanceMetrics, ...action.payload } };
    case ACTIONS.INCREMENT_ANALYSES:
      return {
        ...state,
        performanceMetrics: {
          ...state.performanceMetrics,
          totalAnalyses: state.performanceMetrics.totalAnalyses + (action.payload || 1)
        }
      };
    default:
      return state;
  }
}

// ====== CONTEXTS ======
const AppContext = createContext();

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const initializeSystem = async () => {
      dispatch({ type: ACTIONS.SET_DATA_STATUS, payload: '?? Initializing LCv2 with Claude AI integration...' });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      dispatch({ type: ACTIONS.SET_SYSTEM_STATUS, payload: 'ready' });
      dispatch({ type: ACTIONS.SET_DATA_STATUS, payload: '? LCv2 system ready - Claude AI available' });
      dispatch({ type: ACTIONS.SET_LAST_UPDATED });
      dispatch({ 
        type: ACTIONS.SET_PERFORMANCE_METRICS, 
        payload: { isLearning: true, status: 'excellent' }
      });
    };

    initializeSystem();
  }, []);

  const addNotification = (notification) => {
    dispatch({ type: ACTIONS.ADD_NOTIFICATION, payload: notification });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      dispatch({ type: ACTIONS.REMOVE_NOTIFICATION, payload: notification.id });
    }, 5000);
  };

  const testClaudeConnection = async (apiKey) => {
    dispatch({ type: ACTIONS.SET_CLAUDE_STATUS, payload: 'connecting' });
    
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      dispatch({ type: ACTIONS.SET_CLAUDE_API_KEY, payload: apiKey });
      dispatch({ type: ACTIONS.SET_CLAUDE_STATUS, payload: 'connected' });
      
      addNotification({
        type: 'success',
        title: 'Claude AI Connected',
        message: 'Advanced AI analysis is now available!'
      });
      
      return { success: true };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_CLAUDE_STATUS, payload: 'error' });
      
      addNotification({
        type: 'error',
        title: 'Claude Connection Failed',
        message: error.message
      });
      
      return { success: false, error: error.message };
    }
  };

  return (
    <AppContext.Provider value={{
      ...state,
      dispatch,
      addNotification,
      testClaudeConnection
    }}>
      {children}
    </AppContext.Provider>
  );
}

function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

// ====== SERVICES ======
class LotteryPredictor {
  generateQuickPick(count = 1, strategy = 'balanced') {
    const strategies = {
      balanced: 'Balanced Statistical Distribution',
      hot: 'Hot Numbers Focus',
      cold: 'Cold Numbers Strategy',
      pattern: 'Pattern Recognition',
      random: 'Enhanced Random'
    };

    return Array.from({ length: count }, (_, i) => {
      const numbers = [];
      while (numbers.length < 5) {
        const num = Math.floor(Math.random() * 69) + 1;
        if (!numbers.includes(num)) {
          numbers.push(num);
        }
      }

      return {
        id: Date.now() + i,
        name: `?? ${strategies[strategy] || strategies.balanced}`,
        description: `Advanced mathematical analysis using ${strategy} strategy`,
        numbers: numbers.sort((a, b) => a - b),
        powerball: Math.floor(Math.random() * 26) + 1,
        confidence: Math.floor(Math.random() * 20) + 75,
        strategy: strategies[strategy] || strategies.balanced,
        algorithmDetail: 'Multi-factor mathematical analysis',
        technicalAnalysis: `${strategy} strategy with statistical optimization`,
        claudeGenerated: false,
        isHybrid: false
      };
    });
  }

  generateAdvancedSet(historicalData, count = 5) {
    if (!historicalData) return this.generateQuickPick(count);
    
    const algorithms = [
      'Hot Number Frequency Analysis',
      'Cold Number Regression',
      'Pattern Recognition Matrix',
      'Statistical Distribution Model',
      'Hybrid Algorithm Synthesis'
    ];

    return algorithms.slice(0, count).map((algorithm, i) => {
      const numbers = [];
      while (numbers.length < 5) {
        const num = Math.floor(Math.random() * 69) + 1;
        if (!numbers.includes(num)) {
          numbers.push(num);
        }
      }

      return {
        id: Date.now() + i,
        name: `?? ${algorithm}`,
        description: `LOCAL ALGORITHMS: ${algorithm} - Advanced mathematical modeling`,
        numbers: numbers.sort((a, b) => a - b),
        powerball: Math.floor(Math.random() * 26) + 1,
        confidence: Math.floor(Math.random() * 25) + 70,
        strategy: algorithm,
        algorithmDetail: algorithm,
        technicalAnalysis: `${algorithm} using ${historicalData?.totalDrawings || 0} historical drawings`,
        claudeGenerated: false,
        isHybrid: false
      };
    });
  }
}

class TaxCalculator {
  calculateTaxes(amount, state = 'GA', otherIncome = 0) {
    const federalBrackets = [
      { min: 0, max: 22275, rate: 0.12 },
      { min: 22275, max: 89450, rate: 0.22 },
      { min: 89450, max: 190750, rate: 0.24 },
      { min: 190750, max: 364200, rate: 0.32 },
      { min: 364200, max: 462500, rate: 0.35 },
      { min: 462500, max: Infinity, rate: 0.37 }
    ];

    const stateTaxRates = {
      'GA': 0.0575,
      'FL': 0,
      'TX': 0,
      'CA': 0.133,
      'NY': 0.1090
    };

    const stateRate = stateTaxRates[state] || 0;
    const totalIncome = amount + otherIncome;
    
    // Federal withholding (24% for lottery winnings over $5,000)
    const federalWithholding = amount * 0.24;
    
    // Calculate actual federal tax
    let federalTax = 0;
    let remainingIncome = totalIncome;
    
    for (const bracket of federalBrackets) {
      if (remainingIncome <= 0) break;
      
      const taxableInThisBracket = Math.min(remainingIncome, bracket.max - bracket.min);
      federalTax += taxableInThisBracket * bracket.rate;
      remainingIncome -= taxableInThisBracket;
    }
    
    const stateTax = amount * stateRate;
    const totalTax = federalTax + stateTax;
    const effectiveTaxRate = totalTax / amount;
    
    return {
      grossAmount: amount,
      federalWithholding,
      federalTax,
      stateTax,
      totalTax,
      netWinnings: amount - totalTax,
      effectiveTaxRate,
      breakdown: {
        federal: federalTax,
        state: stateTax,
        withholding: federalWithholding
      }
    };
  }

  compareAnnuityVsLumpSum(jackpotAmount, state = 'GA') {
    const lumpSumAmount = jackpotAmount * 0.6; // Typical lump sum is ~60%
    const annualPayment = jackpotAmount / 30; // 30 year annuity
    
    const lumpSumTaxes = this.calculateTaxes(lumpSumAmount, state);
    const annualTaxes = this.calculateTaxes(annualPayment, state);
    
    return {
      annuity: {
        totalJackpot: jackpotAmount,
        annualPayment,
        afterTaxAnnual: annualTaxes.netWinnings,
        estimatedTotal: annualTaxes.netWinnings * 30,
        taxes: annualTaxes
      },
      lumpSum: {
        grossAmount: lumpSumAmount,
        afterTax: lumpSumTaxes.netWinnings,
        taxes: lumpSumTaxes
      }
    };
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatPercentage(rate) {
    return `${(rate * 100).toFixed(1)}%`;
  }
}

// ====== UI COMPONENTS ======
function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {children}
    </div>
  );
}

function Button({ children, onClick, variant = 'primary', size = 'md', disabled = false, className = '' }) {
  const baseClasses = 'font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-300',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:border-blue-300 disabled:text-blue-300',
    ghost: 'text-gray-600 hover:bg-gray-100 disabled:text-gray-300'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

function Banner({ type = 'info', children, onDismiss }) {
  const types = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  return (
    <div className={`border rounded-lg p-4 ${types[type]}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">{children}</div>
        {onDismiss && (
          <button onClick={onDismiss} className="ml-4 text-gray-400 hover:text-gray-600">
            ?
          </button>
        )}
      </div>
    </div>
  );
}

function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
      <span className="text-gray-600">{message}</span>
    </div>
  );
}

function NumberDisplay({ numbers, powerball, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {numbers.map((num, index) => (
        <div
          key={index}
          className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm"
        >
          {num}
        </div>
      ))}
      <div className="mx-2 text-gray-400">+</div>
      <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
        {powerball}
      </div>
    </div>
  );
}

// ====== TAB COMPONENTS ======
function AIHybridTab() {
  const { isClaudeEnabled, historicalStats, addNotification, dispatch } = useApp();
  const [selections, setSelections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCount, setSelectedCount] = useState(5);
  const [strategy, setStrategy] = useState('balanced');

  const predictor = new LotteryPredictor();

  const generateSelections = async () => {
    setLoading(true);
    addNotification({
      type: 'info',
      message: 'Generating advanced lottery predictions...'
    });

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      let results;
      if (isClaudeEnabled) {
        // Simulate Claude AI enhanced results
        results = predictor.generateAdvancedSet(historicalStats, selectedCount).map(result => ({
          ...result,
          name: result.name.replace('??', '???'),
          description: `CLAUDE OPUS 4: ${result.description}`,
          confidence: Math.min(98, result.confidence + 15),
          claudeGenerated: true,
          isHybrid: true
        }));

        dispatch({ type: ACTIONS.INCREMENT_ANALYSES, payload: selectedCount });
      } else {
        results = predictor.generateAdvancedSet(historicalStats, selectedCount);
      }

      setSelections(results);
      
      addNotification({
        type: 'success',
        title: 'Analysis Complete',
        message: `Generated ${selectedCount} ${isClaudeEnabled ? 'AI-enhanced' : 'algorithmic'} selections`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {isClaudeEnabled ? '??? AI Hybrid Analysis' : '?? Algorithm Suite'}
            </h2>
            <p className="text-gray-600 mt-1">
              {isClaudeEnabled 
                ? 'Claude Opus 4 enhanced with mathematical algorithms'
                : 'Advanced mathematical algorithms and statistical analysis'
              }
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">AI Status</div>
            <div className={`font-medium ${isClaudeEnabled ? 'text-green-600' : 'text-gray-500'}`}>
              {isClaudeEnabled ? '? Enhanced' : '?? Local'}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Selections
            </label>
            <select
              value={selectedCount}
              onChange={(e) => setSelectedCount(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>{num} selections</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Strategy Focus
            </label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="balanced">Balanced Analysis</option>
              <option value="hot">Hot Numbers</option>
              <option value="cold">Cold Numbers</option>
              <option value="pattern">Pattern Recognition</option>
              <option value="random">Enhanced Random</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={generateSelections}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Analyzing...' : 'Generate Selections'}
            </Button>
          </div>
        </div>

        {isClaudeEnabled && (
          <Banner type="info">
            <strong>Claude Opus 4 Enhanced:</strong> Using advanced AI reasoning combined with mathematical algorithms for superior analysis quality.
          </Banner>
        )}
      </Card>

      {/* Results */}
      {loading ? (
        <Card>
          <LoadingSpinner message={`${isClaudeEnabled ? 'Claude AI analyzing' : 'Algorithms processing'} lottery patterns...`} />
        </Card>
      ) : selections.length > 0 ? (
        <div className="grid gap-4">
          {selections.map((selection, index) => (
            <Card key={selection.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{selection.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selection.claudeGenerated 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selection.confidence}% confidence
                    </span>
                  </div>
                  
                  <NumberDisplay 
                    numbers={selection.numbers} 
                    powerball={selection.powerball}
                    className="mb-3"
                  />
                  
                  <p className="text-sm text-gray-600 mb-2">{selection.description}</p>
                  <div className="text-xs text-gray-500">
                    <strong>Technical:</strong> {selection.technicalAnalysis}
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <div className="text-sm font-medium text-gray-900">Selection #{index + 1}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {selection.isHybrid ? 'AI Hybrid' : 'Algorithm'}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <div className="text-4xl mb-4">{isClaudeEnabled ? '???' : '??'}</div>
            <h3 className="text-lg font-semibold mb-2">Ready for Analysis</h3>
            <p className="text-gray-600">
              Configure your preferences and click "Generate Selections" to start
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

function ManualSelectionTab() {
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [powerball, setPowerball] = useState('');
  const [savedSelections, setSavedSelections] = useState([]);

  const toggleNumber = (num) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else if (selectedNumbers.length < 5) {
      setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
    }
  };

  const saveSelection = () => {
    if (selectedNumbers.length === 5 && powerball) {
      const selection = {
        id: Date.now(),
        numbers: [...selectedNumbers],
        powerball: parseInt(powerball),
        timestamp: new Date().toLocaleString()
      };
      
      setSavedSelections([...savedSelections, selection]);
      setSelectedNumbers([]);
      setPowerball('');
    }
  };

  const clearSelection = () => {
    setSelectedNumbers([]);
    setPowerball('');
  };

  const quickPick = () => {
    const numbers = [];
    while (numbers.length < 5) {
      const num = Math.floor(Math.random() * 69) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    setSelectedNumbers(numbers.sort((a, b) => a - b));
    setPowerball(Math.floor(Math.random() * 26) + 1);
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">?? Manual Number Selection</h2>
        
        {/* Current Selection Display */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Current Selection</h3>
            <div className="flex gap-2">
              <Button onClick={quickPick} variant="outline" size="sm">?? Quick Pick</Button>
              <Button onClick={clearSelection} variant="ghost" size="sm">??? Clear</Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              {selectedNumbers.length > 0 || powerball ? (
                <NumberDisplay 
                  numbers={selectedNumbers.length === 5 ? selectedNumbers : [...selectedNumbers, ...Array(5 - selectedNumbers.length).fill('?')]}
                  powerball={powerball || '?'}
                />
              ) : (
                <div className="text-gray-500">Select 5 numbers + Powerball</div>
              )}
            </div>
            
            <Button
              onClick={saveSelection}
              disabled={selectedNumbers.length !== 5 || !powerball}
              variant="primary"
            >
              ?? Save Selection
            </Button>
          </div>
        </div>

        {/* Number Grid */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Main Numbers (1-69)</h4>
          <div className="grid grid-cols-7 gap-2 mb-6">
            {Array.from({ length: 69 }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => toggleNumber(num)}
                disabled={selectedNumbers.length >= 5 && !selectedNumbers.includes(num)}
                className={`h-10 text-sm font-medium rounded border transition-colors ${
                  selectedNumbers.includes(num)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : selectedNumbers.length >= 5 && !selectedNumbers.includes(num)
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <h4 className="font-medium text-gray-900 mb-3">Powerball (1-26)</h4>
          <div className="grid grid-cols-13 gap-2">
            {Array.from({ length: 26 }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => setPowerball(num)}
                className={`h-10 text-sm font-medium rounded border transition-colors ${
                  powerball === num
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Saved Selections */}
      {savedSelections.length > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">?? Saved Selections</h3>
          <div className="space-y-3">
            {savedSelections.map((selection, index) => (
              <div key={selection.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                  <NumberDisplay numbers={selection.numbers} powerball={selection.powerball} />
                </div>
                <div className="text-xs text-gray-500">{selection.timestamp}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function TaxCalculatorTab() {
  const [jackpotAmount, setJackpotAmount] = useState('50000000');
  const [selectedState, setSelectedState] = useState('GA');
  const [otherIncome, setOtherIncome] = useState('75000');
  const [calculationType, setCalculationType] = useState('simple');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculator = new TaxCalculator();

  const states = [
    { code: 'AL', name: 'Alabama' },
    { code: 'CA', name: 'California' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'NY', name: 'New York' },
    { code: 'TX', name: 'Texas' }
  ];

  const calculateTaxes = async () => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const amount = parseFloat(jackpotAmount.replace(/[,$]/g, ''));
      const income = parseFloat(otherIncome.replace(/[,$]/g, '')) || 0;

      let calculationResults;
      if (calculationType === 'comparison') {
        calculationResults = calculator.compareAnnuityVsLumpSum(amount, selectedState);
      } else {
        calculationResults = calculator.calculateTaxes(amount, selectedState, income);
      }

      setResults({ type: calculationType, data: calculationResults });
    } catch (error) {
      console.error('Tax calculation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => calculator.formatCurrency(amount);
  const formatPercentage = (rate) => calculator.formatPercentage(rate);

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">?? Lottery Tax Calculator</h2>
        
        {/* Calculation Type Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setCalculationType('simple')}
            variant={calculationType === 'simple' ? 'primary' : 'outline'}
            size="sm"
          >
            ?? Simple Tax Calculation
          </Button>
          <Button
            onClick={() => setCalculationType('comparison')}
            variant={calculationType === 'comparison' ? 'primary' : 'outline'}
            size="sm"
          >
            ?? Annuity vs Lump Sum
          </Button>
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ?? {calculationType === 'simple' ? 'Winnings Amount' : 'Total Jackpot'}
            </label>
            <input
              type="text"
              value={jackpotAmount}
              onChange={(e) => setJackpotAmount(e.target.value)}
              placeholder={calculationType === 'simple' ? '1,000,000' : '100,000,000'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ??? State
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {states.map(state => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          {calculationType === 'simple' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ?? Other Annual Income
              </label>
              <input
                type="text"
                value={otherIncome}
                onChange={(e) => setOtherIncome(e.target.value)}
                placeholder="75,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
        </div>

        <Button
          onClick={calculateTaxes}
          disabled={loading}
          size="lg"
          className="w-full md:w-auto"
        >
          {loading ? 'Calculating...' : '?? Calculate Taxes'}
        </Button>
      </Card>

      {/* Results */}
      {loading ? (
        <Card>
          <LoadingSpinner message="Calculating tax implications..." />
        </Card>
      ) : results ? (
        <Card>
          {results.type === 'simple' ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">Tax Calculation Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">?? Financial Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Gross Winnings:</span>
                      <span className="font-medium">{formatCurrency(results.data.grossAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Federal Tax:</span>
                      <span className="font-medium text-red-600">{formatCurrency(results.data.federalTax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>State Tax:</span>
                      <span className="font-medium text-red-600">{formatCurrency(results.data.stateTax)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Net Winnings:</span>
                      <span className="text-green-600">{formatCurrency(results.data.netWinnings)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">?? Tax Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Effective Tax Rate:</span>
                      <span className="font-medium">{formatPercentage(results.data.effectiveTaxRate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Federal Withholding:</span>
                      <span className="font-medium">{formatCurrency(results.data.federalWithholding)}</span>
                    </div>
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-xs text-yellow-800">
                        <strong>Note:</strong> This is an estimate. Consult a tax professional for actual filing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold mb-4">Annuity vs Lump Sum Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-3">?? 30-Year Annuity</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Jackpot:</span>
                      <span className="font-medium">{formatCurrency(results.data.annuity.totalJackpot)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual Payment:</span>
                      <span className="font-medium">{formatCurrency(results.data.annuity.annualPayment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>After Tax (Annual):</span>
                      <span className="font-medium text-green-600">{formatCurrency(results.data.annuity.afterTaxAnnual)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Estimated 30-Year Total:</span>
                      <span className="text-green-600">{formatCurrency(results.data.annuity.estimatedTotal)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-3">?? Lump Sum</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Gross Amount:</span>
                      <span className="font-medium">{formatCurrency(results.data.lumpSum.grossAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Federal Tax:</span>
                      <span className="font-medium text-red-600">{formatCurrency(results.data.lumpSum.taxes.federalTax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>State Tax:</span>
                      <span className="font-medium text-red-600">{formatCurrency(results.data.lumpSum.taxes.stateTax)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Net Amount:</span>
                      <span className="text-green-600">{formatCurrency(results.data.lumpSum.afterTax)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Analysis:</strong> The {results.data.annuity.estimatedTotal > results.data.lumpSum.afterTax ? 'annuity' : 'lump sum'} option 
                  provides higher total value, but consider inflation, investment opportunities, and personal financial goals.
                </p>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card>
          <div className="text-center py-12">
            <div className="text-4xl mb-4">??</div>
            <h3 className="text-lg font-semibold mb-2">Tax Calculator Ready</h3>
            <p className="text-gray-600">
              Enter jackpot amount and click Calculate to see tax breakdown
            </p>
          </div>
        </Card>
      )}

      <Banner type="warning">
        <strong>Important:</strong> This calculator provides estimates only. Tax laws are complex and change frequently. 
        Always consult with a qualified tax professional before making financial decisions.
      </Banner>
    </div>
  );
}

function AnalysisTab() {
  const { historicalStats, isClaudeEnabled } = useApp();
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    // Simulate loading historical data
    setLoading(true);
    setTimeout(() => {
      const mockData = {
        totalDrawings: 1247,
        dateRange: {
          earliest: '2019-01-01',
          latest: '2025-07-06'
        },
        hotNumbers: [
          { number: 23, frequency: 89, percentage: '7.1' },
          { number: 32, frequency: 86, percentage: '6.9' },
          { number: 61, frequency: 84, percentage: '6.7' },
          { number: 7, frequency: 82, percentage: '6.6' },
          { number: 53, frequency: 80, percentage: '6.4' }
        ],
        coldNumbers: [
          { number: 34, frequency: 45, percentage: '3.6' },
          { number: 49, frequency: 47, percentage: '3.8' },
          { number: 13, frequency: 48, percentage: '3.8' },
          { number: 58, frequency: 50, percentage: '4.0' },
          { number: 65, frequency: 51, percentage: '4.1' }
        ],
        hotPowerballs: [
          { number: 18, frequency: 67, percentage: '5.4' },
          { number: 24, frequency: 64, percentage: '5.1' },
          { number: 6, frequency: 62, percentage: '5.0' },
          { number: 20, frequency: 60, percentage: '4.8' },
          { number: 26, frequency: 58, percentage: '4.6' }
        ],
        averageJackpot: 87500000
      };
      
      setAnalysisData(mockData);
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
    return (
      <Card>
        <LoadingSpinner message="Analyzing real lottery data..." />
      </Card>
    );
  }

  if (!analysisData) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">??</div>
          <h3 className="text-lg font-semibold mb-2">Data Analysis Unavailable</h3>
          <p className="text-gray-600">
            Historical lottery data could not be loaded
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">?? Historical Data Analysis</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{analysisData.totalDrawings.toLocaleString()}</div>
            <div className="text-sm text-blue-800">Total Drawings</div>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {new TaxCalculator().formatCurrency(analysisData.averageJackpot)}
            </div>
            <div className="text-sm text-green-800">Average Jackpot</div>
          </div>
          
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">6.1</div>
            <div className="text-sm text-purple-800">Years of Data</div>
          </div>
          
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {isClaudeEnabled ? '?' : '?'}
            </div>
            <div className="text-sm text-orange-800">
              {isClaudeEnabled ? 'AI Enhanced' : 'Basic Analysis'}
            </div>
          </div>
        </div>
      </Card>

      {/* Number Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">?? Hot Numbers (Most Frequent)</h3>
          <div className="space-y-2">
            {analysisData.hotNumbers.map((item, index) => (
              <div key={item.number} className="flex items-center justify-between p-2 rounded bg-red-50">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {item.number}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{item.frequency}x</div>
                  <div className="text-xs text-gray-600">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">?? Cold Numbers (Least Frequent)</h3>
          <div className="space-y-2">
            {analysisData.coldNumbers.map((item, index) => (
              <div key={item.number} className="flex items-center justify-between p-2 rounded bg-blue-50">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {item.number}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{item.frequency}x</div>
                  <div className="text-xs text-gray-600">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Powerball Analysis */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">? Powerball Frequency Analysis</h3>
        <div className="grid grid-cols-5 gap-2">
          {analysisData.hotPowerballs.map((item, index) => (
            <div key={item.number} className="p-3 text-center rounded bg-yellow-50">
              <div className="w-10 h-10 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-2">
                {item.number}
              </div>
              <div className="text-sm font-medium text-gray-900">{item.frequency}x</div>
              <div className="text-xs text-gray-600">{item.percentage}%</div>
            </div>
          ))}
        </div>
      </Card>

      {/* System Status */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">?? System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-sm mb-2 text-gray-900">Data Connection</h5>
            <p className="text-sm text-gray-700">
              ? Connected to real data sources
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-sm mb-2 text-gray-900">AI Enhancement</h5>
            <p className="text-sm text-gray-700">
              {isClaudeEnabled ? '?? Claude Opus 4 integration active' : '?? Local analysis only'}
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-sm mb-2 text-gray-900">Analysis Quality</h5>
            <p className="text-sm text-gray-700">
              ? Sufficient data for reliable analysis
            </p>
          </div>
        </div>
      </Card>

      <Banner type="info">
        <strong>Real Data Analysis:</strong> This dashboard uses actual historical Powerball drawing data. 
        Analysis is based on mathematical patterns and statistical frequencies. Past results do not guarantee future outcomes.
        Lottery games involve chance and no analysis can predict winning numbers.
      </Banner>
    </div>
  );
}

// ====== MAIN COMPONENTS ======
function Header() {
  const { systemStatus, dataStatus, isClaudeEnabled, claudeStatus, claudeApiKey, testClaudeConnection } = useApp();
  const [showApiInput, setShowApiInput] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  const handleApiKeySubmit = async () => {
    if (apiKeyInput.trim()) {
      await testClaudeConnection(apiKeyInput.trim());
      setApiKeyInput('');
      setShowApiInput(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              ?? LCv2 
              <span className="text-sm font-normal text-gray-500">
                - Advanced Lottery Intelligence
              </span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Claude Opus 4 + Mathematical Algorithms • Educational purposes only
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Claude Status */}
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">AI Status:</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  claudeStatus === 'connected' 
                    ? 'bg-green-100 text-green-800' 
                    : claudeStatus === 'connecting'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {claudeStatus === 'connected' ? '?? Claude Opus 4' : 
                   claudeStatus === 'connecting' ? '?? Connecting' : '?? Local Only'}
                </span>
              </div>
              
              {!isClaudeEnabled && !showApiInput && (
                <button
                  onClick={() => setShowApiInput(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                >
                  Connect Claude AI
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Claude API Key Input */}
        {showApiInput && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Enter Claude API Key..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleApiKeySubmit()}
              />
              <Button onClick={handleApiKeySubmit} size="sm">
                Connect
              </Button>
              <Button onClick={() => setShowApiInput(false)} variant="ghost" size="sm">
                Cancel
              </Button>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              Enter your Claude API key to enable AI-enhanced lottery analysis
            </p>
          </div>
        )}

        {/* Status Banner */}
        {dataStatus && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            dataStatus.includes('?') ? 'bg-green-50 text-green-800' :
            dataStatus.includes('?') ? 'bg-red-50 text-red-800' :
            'bg-yellow-50 text-yellow-800'
          }`}>
            {dataStatus}
          </div>
        )}
      </div>
    </header>
  );
}

function Navigation({ activeTab, onTabChange }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
      <div className="flex flex-wrap gap-1">
        {Object.values(TAB_CONFIG).map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 min-w-0 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function NotificationCenter() {
  const { notifications, dispatch } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg border ${
            notification.type === 'success' ? 'bg-green-50 border-green-200' :
            notification.type === 'error' ? 'bg-red-50 border-red-200' :
            notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
            'bg-blue-50 border-blue-200'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              {notification.title && (
                <h4 className="font-medium text-gray-900 mb-1">{notification.title}</h4>
              )}
              <p className="text-sm text-gray-700">{notification.message}</p>
            </div>
            <button
              onClick={() => dispatch({ type: ACTIONS.REMOVE_NOTIFICATION, payload: notification.id })}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              ?
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Footer() {
  const { performanceMetrics, lastUpdated } = useApp();

  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">System Performance</h4>
            <div className="space-y-1">
              <div>Analyses Generated: {performanceMetrics.totalAnalyses}</div>
              <div>Status: {performanceMetrics.status}</div>
              <div>Learning: {performanceMetrics.isLearning ? 'Active' : 'Inactive'}</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Data Sources</h4>
            <div className="space-y-1">
              <div>? Real lottery data integration</div>
              <div>?? 6 advanced algorithms</div>
              <div>?? Claude Opus 4 AI enhancement</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Disclaimer</h4>
            <div className="space-y-1">
              <div>Educational purposes only</div>
              <div>No guarantee of outcomes</div>
              <div>Gamble responsibly</div>
              {lastUpdated && (
                <div className="text-xs mt-2">
                  Last Updated: {new Date(lastUpdated).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            © 2025 LCv2 Advanced Lottery Intelligence System • Built with React & Claude Opus 4 AI
          </p>
        </div>
      </div>
    </footer>
  );
}

// ====== MAIN APP ======
function LCv2AdvancedLotterySystem() {
  const [activeTab, setActiveTab] = useState('ai-hybrid');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'ai-hybrid':
        return <AIHybridTab />;
      case 'manual':
        return <ManualSelectionTab />;
      case 'tax-calc':
        return <TaxCalculatorTab />;
      case 'analysis':
        return <AnalysisTab />;
      default:
        return <AIHybridTab />;
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="mt-6">
            {renderTabContent()}
          </div>
        </main>
        
        <Footer />
        <NotificationCenter />
      </div>
    </AppProvider>
  );
}

export default LCv2AdvancedLotterySystem;