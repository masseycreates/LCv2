import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { usePowerballData } from '@hooks/usePowerballData';

const LotteryContext = createContext();

const initialState = {
  // Current Jackpot Data
  currentJackpot: null,
  nextDrawing: null,
  liveDataAvailable: false,
  
  // Historical Data
  historicalStats: null,
  historicalDataAvailable: false,
  historicalRecordsLimit: 500,
  isLoadingHistory: false,
  
  // Quick Selections
  quickSelectionSets: [],
  isGeneratingSelections: false,
  
  // Manual Selection
  selectedNumbers: [],
  selectedPowerball: null,
  
  // AI Integration Status
  aiEnabled: false,
  isLoadingAI: false
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
        historicalDataAvailable: !!action.payload
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
      
    case 'SET_AI_ENABLED':
      return {
        ...state,
        aiEnabled: action.payload
      };
      
    case 'SET_LOADING_AI':
      return {
        ...state,
        isLoadingAI: action.payload
      };
      
    default:
      return state;
  }
}

export function LotteryProvider({ children }) {
  const [state, dispatch] = useReducer(lotteryReducer, initialState);
  
  // Use the powerball data hook
  const {
    fetchPowerballData,
    fetchHistoricalData,
    generateQuickSelection
  } = usePowerballData();

  // Action creators
  const actions = {
    // Data fetching
    async fetchCurrentData() {
      try {
        const data = await fetchPowerballData();
        
        if (data.success && data.jackpot) {
          dispatch({ type: 'SET_CURRENT_JACKPOT', payload: data.jackpot });
          
          if (data.nextDrawing) {
            dispatch({ 
              type: 'SET_NEXT_DRAWING', 
              payload: `${data.nextDrawing.date} @ ${data.nextDrawing.time}`
            });
          }
        }
        
        return data;
      } catch (error) {
        console.error('Failed to fetch current data:', error);
        dispatch({ type: 'SET_CURRENT_JACKPOT', payload: null });
        throw error;
      }
    },
    
    async fetchHistoricalStats(limit = state.historicalRecordsLimit) {
      dispatch({ type: 'SET_LOADING_HISTORY', payload: true });
      
      try {
        const data = await fetchHistoricalData(limit);
        
        if (data.success && data.statistics) {
          dispatch({ type: 'SET_HISTORICAL_STATS', payload: data.statistics });
        }
        
        return data;
      } catch (error) {
        console.error('Failed to fetch historical data:', error);
        dispatch({ type: 'SET_HISTORICAL_STATS', payload: null });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING_HISTORY', payload: false });
      }
    },
    
    async generateQuickSelections() {
      dispatch({ type: 'SET_GENERATING_SELECTIONS', payload: true });
      
      try {
        const selections = await generateQuickSelection(state.historicalStats);
        dispatch({ type: 'SET_QUICK_SELECTIONS', payload: selections });
        return selections;
      } catch (error) {
        console.error('Failed to generate selections:', error);
        throw error;
      } finally {
        dispatch({ type: 'SET_GENERATING_SELECTIONS', payload: false });
      }
    },
    
    // Manual selection
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
    
    // Settings
    setRecordsLimit: (limit) => {
      dispatch({ type: 'SET_RECORDS_LIMIT', payload: limit });
    },
    
    // AI Integration
    setAiEnabled: (enabled) => {
      dispatch({ type: 'SET_AI_ENABLED', payload: enabled });
    },
    
    setLoadingAI: (loading) => {
      dispatch({ type: 'SET_LOADING_AI', payload: loading });
    }
  };

  // Initialize with data fetch on mount
  useEffect(() => {
    const initializeLotteryData = async () => {
      try {
        await actions.fetchCurrentData();
        await actions.fetchHistoricalStats();
      } catch (error) {
        console.error('Failed to initialize lottery data:', error);
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