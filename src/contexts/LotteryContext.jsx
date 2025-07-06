import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { powerballService } from '@/services/powerballService';

const LotteryContext = createContext();

const initialState = {
  // Current data
  currentJackpot: null,
  nextDrawing: null,
  liveDataAvailable: false,
  
  // Historical data
  historicalStats: null,
  historicalDataAvailable: false,
  historicalRecordsLimit: 2000, // Default to 2000
  isLoadingHistory: false,
  
  // Generated selections
  quickSelectionSets: [],
  isGeneratingSelections: false,
  
  // Manual selection
  selectedNumbers: [],
  selectedPowerball: null,
  
  // Error handling
  dataError: null,
  lastErrorCode: null
};

function lotteryReducer(state, action) {
  switch (action.type) {
    case 'SET_CURRENT_JACKPOT':
      return {
        ...state,
        currentJackpot: action.payload,
        liveDataAvailable: !!action.payload
      };
      
    case 'SET_NEXT_DRAWING':
      return {
        ...state,
        nextDrawing: action.payload
      };
      
    case 'SET_HISTORICAL_STATS':
      return {
        ...state,
        historicalStats: action.payload,
        historicalDataAvailable: !!action.payload,
        dataError: null,
        lastErrorCode: null
      };
      
    case 'SET_LOADING_HISTORY':
      return {
        ...state,
        isLoadingHistory: action.payload
      };
      
    case 'SET_RECORDS_LIMIT':
      return {
        ...state,
        historicalRecordsLimit: action.payload
      };
      
    case 'SET_QUICK_SELECTIONS':
      return {
        ...state,
        quickSelectionSets: action.payload
      };
      
    case 'SET_GENERATING_SELECTIONS':
      return {
        ...state,
        isGeneratingSelections: action.payload
      };
      
    case 'SET_SELECTED_NUMBERS':
      return {
        ...state,
        selectedNumbers: action.payload
      };
      
    case 'SET_SELECTED_POWERBALL':
      return {
        ...state,
        selectedPowerball: action.payload
      };
      
    case 'TOGGLE_NUMBER':
      const { selectedNumbers } = state;
      const number = action.payload;
      
      if (selectedNumbers.includes(number)) {
        return {
          ...state,
          selectedNumbers: selectedNumbers.filter(n => n !== number)
        };
      } else if (selectedNumbers.length < 5) {
        return {
          ...state,
          selectedNumbers: [...selectedNumbers, number].sort((a, b) => a - b)
        };
      }
      return state;
      
    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedNumbers: [],
        selectedPowerball: null
      };

    case 'SET_DATA_ERROR':
      return {
        ...state,
        dataError: action.payload.message,
        lastErrorCode: action.payload.code,
        liveDataAvailable: false
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        dataError: null,
        lastErrorCode: null
      };
      
    default:
      return state;
  }
}

// Helper functions for selection generation
const generateNumbersForSum = (targetSum) => {
  const numbers = [];
  let currentSum = 0;
  const attempts = 1000; // Prevent infinite loops
  
  for (let attempt = 0; attempt < attempts && numbers.length < 5; attempt++) {
    const remainingNumbers = 5 - numbers.length;
    const remainingSum = targetSum - currentSum;
    const avgNeeded = remainingSum / remainingNumbers;
    
    // Generate number around the average needed
    const min = Math.max(1, Math.floor(avgNeeded - 10));
    const max = Math.min(69, Math.ceil(avgNeeded + 10));
    const candidate = Math.floor(Math.random() * (max - min + 1)) + min;
    
    if (!numbers.includes(candidate) && currentSum + candidate <= targetSum) {
      numbers.push(candidate);
      currentSum += candidate;
    }
  }
  
  // Fill remaining slots if needed
  while (numbers.length < 5) {
    const candidate = Math.floor(Math.random() * 69) + 1;
    if (!numbers.includes(candidate)) {
      numbers.push(candidate);
    }
  }
  
  return numbers.sort((a, b) => a - b);
};

const generatePatternNumbers = (analysis) => {
  const recentDrawings = analysis.drawings?.slice(0, 10) || [];
  const numbers = [];
  
  // Look for patterns in recent drawings
  if (recentDrawings.length > 0) {
    // Get numbers that appeared in last 3 drawings
    const recentNumbers = new Set();
    recentDrawings.slice(0, 3).forEach(drawing => {
      drawing.numbers.forEach(num => recentNumbers.add(num));
    });
    
    // Pick 2-3 from recent numbers
    const recentArray = Array.from(recentNumbers);
    for (let i = 0; i < Math.min(3, recentArray.length); i++) {
      if (Math.random() > 0.5) {
        numbers.push(recentArray[i]);
      }
    }
  }
  
  // Fill remaining with hot numbers and randoms
  const hotNumbers = analysis.numberAnalysis.hotNumbers || [];
  while (numbers.length < 5) {
    let candidate;
    if (numbers.length < 3 && hotNumbers.length > 0) {
      candidate = hotNumbers[Math.floor(Math.random() * Math.min(10, hotNumbers.length))];
    } else {
      candidate = Math.floor(Math.random() * 69) + 1;
    }
    
    if (!numbers.includes(candidate)) {
      numbers.push(candidate);
    }
  }
  
  return numbers.sort((a, b) => a - b);
};

const generateConstrainedRandom = (analysis) => {
  const numbers = [];
  const avgSum = analysis.patterns.averageSum;
  const minSum = avgSum - 30;
  const maxSum = avgSum + 30;
  
  let attempts = 0;
  while (numbers.length < 5 && attempts < 1000) {
    const candidate = Math.floor(Math.random() * 69) + 1;
    if (!numbers.includes(candidate)) {
      const tempNumbers = [...numbers, candidate];
      const currentSum = tempNumbers.reduce((sum, num) => sum + num, 0);
      
      if (tempNumbers.length === 5) {
        if (currentSum >= minSum && currentSum <= maxSum) {
          numbers.push(candidate);
        }
      } else {
        numbers.push(candidate);
      }
    }
    attempts++;
  }
  
  // Fallback if constraints too strict
  while (numbers.length < 5) {
    const candidate = Math.floor(Math.random() * 69) + 1;
    if (!numbers.includes(candidate)) {
      numbers.push(candidate);
    }
  }
  
  return numbers.sort((a, b) => a - b);
};

export function LotteryProvider({ children }) {
  const [state, dispatch] = useReducer(lotteryReducer, initialState);

  // Action creators with real data integration
  const actions = {
    // Fetch current jackpot and next drawing
    async fetchCurrentData() {
      dispatch({ type: 'CLEAR_ERROR' });
      
      try {
        const jackpotData = await powerballService.getCurrentJackpot();
        dispatch({ type: 'SET_CURRENT_JACKPOT', payload: jackpotData });
        
        // Get next drawing info
        const nextDrawing = powerballService.getNextDrawingInfo();
        dispatch({ 
          type: 'SET_NEXT_DRAWING', 
          payload: `${nextDrawing.date} @ ${nextDrawing.time}`
        });
        
        return { success: true };
      } catch (error) {
        // Handle CORS restrictions gracefully
        if (error.code === 'CORS_RESTRICTION') {
          // Set next drawing info even when jackpot fetch fails
          const nextDrawing = powerballService.getNextDrawingInfo();
          dispatch({ 
            type: 'SET_NEXT_DRAWING', 
            payload: `${nextDrawing.date} @ ${nextDrawing.time}`
          });
          
          // Don't treat CORS as a fatal error - just inform user
          console.warn('Jackpot fetch limited by CORS policy');
          return { success: true, warning: error.message };
        }
        
        dispatch({ 
          type: 'SET_DATA_ERROR', 
          payload: { 
            message: error.message, 
            code: error.code || 'UNKNOWN' 
          } 
        });
        throw error;
      }
    },
    
    // Fetch and analyze historical data
    async fetchHistoricalStats(limit = state.historicalRecordsLimit) {
      dispatch({ type: 'SET_LOADING_HISTORY', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      try {
        const result = await powerballService.getHistoricalData(limit);
        dispatch({ type: 'SET_HISTORICAL_STATS', payload: result.analysis });
        return { success: true, data: result };
      } catch (error) {
        dispatch({ 
          type: 'SET_DATA_ERROR', 
          payload: { 
            message: error.message, 
            code: error.code || 'UNKNOWN' 
          } 
        });
        dispatch({ type: 'SET_HISTORICAL_STATS', payload: null });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING_HISTORY', payload: false });
      }
    },
    
    // Generate mathematical selections (fallback when Claude not available)
    async generateQuickSelections() {
      dispatch({ type: 'SET_GENERATING_SELECTIONS', payload: true });
      
      try {
        if (!state.historicalStats) {
          throw new Error('Historical data is required for selection generation');
        }

        const selections = [];
        const analysis = state.historicalStats;
        
        // Strategy 1: Hot Numbers Focus
        const hotNumbers = analysis.numberAnalysis.hotNumbers.slice(0, 5);
        selections.push({
          id: `hot-${Date.now()}`,
          name: 'Hot Numbers Strategy',
          numbers: hotNumbers.sort((a, b) => a - b),
          powerball: analysis.powerballAnalysis.hotPowerballs[0],
          strategy: 'Frequency Analysis',
          confidence: 78,
          description: `Top 5 most frequent numbers from ${analysis.totalDrawings} drawings`,
          factors: ['High frequency', 'Historical performance'],
          claudeGenerated: false,
          isHybrid: false
        });

        // Strategy 2: Cold Numbers (Due for selection)
        const coldNumbers = analysis.numberAnalysis.coldNumbers.slice(0, 5);
        selections.push({
          id: `cold-${Date.now()}`,
          name: 'Cold Numbers Strategy', 
          numbers: coldNumbers.sort((a, b) => a - b),
          powerball: analysis.powerballAnalysis.hotPowerballs[1] || Math.floor(Math.random() * 26) + 1,
          strategy: 'Overdue Analysis',
          confidence: 72,
          description: 'Least frequent numbers that may be due for selection',
          factors: ['Low frequency', 'Statistical probability'],
          claudeGenerated: false,
          isHybrid: false
        });

        // Strategy 3: Balanced Range Distribution
        const ranges = [[1, 14], [15, 28], [29, 42], [43, 56], [57, 69]];
        const balancedNumbers = ranges.map(([min, max]) => {
          const rangeHotNumbers = analysis.numberAnalysis.hotNumbers.filter(n => n >= min && n <= max);
          return rangeHotNumbers.length > 0 
            ? rangeHotNumbers[0] 
            : Math.floor(Math.random() * (max - min + 1)) + min;
        });
        
        selections.push({
          id: `balanced-${Date.now()}`,
          name: 'Balanced Range Strategy',
          numbers: balancedNumbers.sort((a, b) => a - b),
          powerball: analysis.powerballAnalysis.hotPowerballs[2] || Math.floor(Math.random() * 26) + 1,
          strategy: 'Range Distribution',
          confidence: 75,
          description: 'Numbers distributed evenly across all ranges',
          factors: ['Range balance', 'Even distribution'],
          claudeGenerated: false,
          isHybrid: false
        });

        // Strategy 4: Sum-Based Selection
        const targetSum = Math.round(analysis.patterns.averageSum);
        const sumNumbers = generateNumbersForSum(targetSum);
        selections.push({
          id: `sum-${Date.now()}`,
          name: 'Sum Analysis Strategy',
          numbers: sumNumbers,
          powerball: analysis.powerballAnalysis.hotPowerballs[3] || Math.floor(Math.random() * 26) + 1,
          strategy: 'Mathematical Sum',
          confidence: 73,
          description: `Numbers targeting average sum of ${targetSum}`,
          factors: ['Sum analysis', 'Mathematical modeling'],
          claudeGenerated: false,
          isHybrid: false
        });

        // Strategy 5: Pattern-Based
        const patternNumbers = generatePatternNumbers(analysis);
        selections.push({
          id: `pattern-${Date.now()}`,
          name: 'Pattern Analysis Strategy',
          numbers: patternNumbers,
          powerball: analysis.powerballAnalysis.hotPowerballs[4] || Math.floor(Math.random() * 26) + 1,
          strategy: 'Pattern Recognition',
          confidence: 71,
          description: 'Based on recent drawing patterns and sequences',
          factors: ['Pattern analysis', 'Sequence detection'],
          claudeGenerated: false,
          isHybrid: false
        });

        // Strategy 6: Random with Constraints
        const constrainedNumbers = generateConstrainedRandom(analysis);
        selections.push({
          id: `constrained-${Date.now()}`,
          name: 'Constrained Random Strategy',
          numbers: constrainedNumbers,
          powerball: Math.floor(Math.random() * 26) + 1,
          strategy: 'Statistical Random',
          confidence: 70,
          description: 'Random selection within statistical constraints',
          factors: ['Controlled randomness', 'Statistical bounds'],
          claudeGenerated: false,
          isHybrid: false
        });

        dispatch({ type: 'SET_QUICK_SELECTIONS', payload: selections });
        return selections;
      } catch (error) {
        throw new Error(`Failed to generate selections: ${error.message}`);
      } finally {
        dispatch({ type: 'SET_GENERATING_SELECTIONS', payload: false });
      }
    },
    
    // Manual selection methods
    toggleNumber: (number) => {
      dispatch({ type: 'TOGGLE_NUMBER', payload: number });
    },
    
    setPowerball: (powerball) => {
      dispatch({ type: 'SET_SELECTED_POWERBALL', payload: powerball });
    },
    
    clearSelection: () => {
      dispatch({ type: 'CLEAR_SELECTION' });
    },
    
    quickPick: () => {
      const numbers = [];
      while (numbers.length < 5) {
        const num = Math.floor(Math.random() * 69) + 1;
        if (!numbers.includes(num)) {
          numbers.push(num);
        }
      }
      const powerball = Math.floor(Math.random() * 26) + 1;
      
      dispatch({ type: 'SET_SELECTED_NUMBERS', payload: numbers.sort((a, b) => a - b) });
      dispatch({ type: 'SET_SELECTED_POWERBALL', payload: powerball });
    },
    
    // Settings and configuration
    setRecordsLimit: (limit) => {
      dispatch({ type: 'SET_RECORDS_LIMIT', payload: limit });
    },

    setQuickSelections: (selections) => {
      dispatch({ type: 'SET_QUICK_SELECTIONS', payload: selections });
    },

    clearError: () => {
      dispatch({ type: 'CLEAR_ERROR' });
    }
  };

  // Initialize with real data fetch on mount
  useEffect(() => {
    const initializeLotteryData = async () => {
      try {
        // Try to fetch current jackpot data first
        await actions.fetchCurrentData();
      } catch (error) {
        console.warn('Failed to fetch current jackpot data:', error.message);
      }
      
      try {
        // Then try to fetch historical data
        await actions.fetchHistoricalStats();
      } catch (error) {
        console.warn('Failed to fetch historical data:', error.message);
      }
    };
    
    initializeLotteryData();
  }, []);

  const value = {
    ...state,
    ...actions
  };

  return (
    <LotteryContext.Provider value={value}>
      {children}
    </LotteryContext.Provider>
  );
}

export function useLottery() {
  const context = useContext(LotteryContext);
  if (!context) {
    throw new Error('useLottery must be used within a LotteryProvider');
  }
  return context;
}

export default LotteryContext;