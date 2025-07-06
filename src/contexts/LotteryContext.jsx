// src/contexts/LotteryContext.jsx - CORS Fixed Version

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { PowerballService } from '../services/powerballService';

// Initialize the fixed service
const powerballService = new PowerballService();

// Initial state
const initialState = {
  currentJackpot: null,
  latestNumbers: null,
  nextDrawing: null,
  historicalStats: null,
  quickSelections: [],
  isLoading: false,
  isLoadingHistory: false,
  isGeneratingSelections: false,
  error: null,
  lastUpdated: null,
  dataSource: null,
  historicalRecordsLimit: 150,
  apiConnected: false,
  apiTestResult: null
};

// Reducer
function lotteryReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    
    case 'SET_LOADING_HISTORY':
      return { ...state, isLoadingHistory: action.payload };
    
    case 'SET_GENERATING_SELECTIONS':
      return { ...state, isGeneratingSelections: action.payload };
    
    case 'SET_CURRENT_JACKPOT':
      return { 
        ...state, 
        currentJackpot: action.payload,
        lastUpdated: new Date().toISOString()
      };
    
    case 'SET_LATEST_NUMBERS':
      return { 
        ...state, 
        latestNumbers: action.payload,
        lastUpdated: new Date().toISOString()
      };
    
    case 'SET_NEXT_DRAWING':
      return { ...state, nextDrawing: action.payload };
    
    case 'SET_HISTORICAL_STATS':
      return { ...state, historicalStats: action.payload };
    
    case 'SET_QUICK_SELECTIONS':
      return { ...state, quickSelections: action.payload };
    
    case 'SET_DATA_ERROR':
      return { 
        ...state, 
        error: action.payload,
        isLoading: false,
        isLoadingHistory: false,
        isGeneratingSelections: false
      };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'SET_DATA_SOURCE':
      return { ...state, dataSource: action.payload };
    
    case 'SET_API_STATUS':
      return { 
        ...state, 
        apiConnected: action.payload.connected,
        apiTestResult: action.payload.result
      };
    
    case 'UPDATE_RECORDS_LIMIT':
      return { ...state, historicalRecordsLimit: action.payload };
    
    default:
      return state;
  }
}

// Context
const LotteryContext = createContext();

// Provider component
export function LotteryProvider({ children }) {
  const [state, dispatch] = useReducer(lotteryReducer, initialState);

  // Test API connectivity
  const testApiConnection = useCallback(async () => {
    try {
      console.log('Testing API connection...');
      const result = await powerballService.testConnection();
      
      dispatch({ 
        type: 'SET_API_STATUS', 
        payload: { connected: true, result } 
      });
      
      return { success: true, result };
    } catch (error) {
      console.error('API connection test failed:', error);
      
      dispatch({ 
        type: 'SET_API_STATUS', 
        payload: { connected: false, result: null } 
      });
      
      dispatch({ 
        type: 'SET_DATA_ERROR', 
        payload: { 
          message: 'Cannot connect to lottery data API',
          code: 'API_CONNECTION_FAILED',
          details: error.message
        } 
      });
      
      throw error;
    }
  }, []);

  // Fetch current data (jackpot + latest numbers)
  const fetchCurrentData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      console.log('Fetching current lottery data...');
      const result = await powerballService.getCurrentJackpot();
      
      // Update all current data
      if (result.jackpot) {
        dispatch({ type: 'SET_CURRENT_JACKPOT', payload: result.jackpot });
      }
      
      if (result.latestNumbers) {
        dispatch({ type: 'SET_LATEST_NUMBERS', payload: result.latestNumbers });
      }
      
      if (result.nextDrawing) {
        dispatch({ type: 'SET_NEXT_DRAWING', payload: result.nextDrawing });
      }
      
      if (result.source) {
        dispatch({ type: 'SET_DATA_SOURCE', payload: result.source });
      }
      
      return { success: true, data: result };
      
    } catch (error) {
      console.error('Failed to fetch current data:', error);
      
      // Set specific error based on error type
      const errorMessage = error.code === 'API_CONNECTION_FAILED'
        ? 'Cannot connect to lottery data servers. Please check your internet connection and try again.'
        : error.code === 'API_ERROR'
        ? 'Lottery data service is temporarily unavailable. Please try again in a few minutes.'
        : `Failed to load current lottery data: ${error.message}`;
      
      dispatch({ 
        type: 'SET_DATA_ERROR', 
        payload: { 
          message: errorMessage,
          code: error.code || 'UNKNOWN',
          details: error.details
        } 
      });
      
      // Still set next drawing info if available
      if (error.details?.nextDrawing) {
        const nextDrawing = error.details.nextDrawing;
        dispatch({ 
          type: 'SET_NEXT_DRAWING', 
          payload: `${nextDrawing.date} @ ${nextDrawing.time}`
        });
      }
      
      throw error;
      
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Fetch and analyze historical data
  const fetchHistoricalStats = useCallback(async (limit = state.historicalRecordsLimit) => {
    dispatch({ type: 'SET_LOADING_HISTORY', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      console.log(`Fetching historical stats for ${limit} drawings...`);
      const result = await powerballService.getHistoricalData(limit);
      
      dispatch({ type: 'SET_HISTORICAL_STATS', payload: result.analysis });
      dispatch({ type: 'SET_DATA_SOURCE', payload: result.source });
      
      return { success: true, data: result };
      
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
      
      const errorMessage = error.code === 'API_CONNECTION_FAILED'
        ? 'Cannot connect to lottery data servers. Please check your internet connection and try again.'
        : error.code === 'API_ERROR'
        ? 'Historical lottery data service is temporarily unavailable. Please try again in a few minutes.'
        : error.code === 'PROCESSING_ERROR'
        ? 'Failed to process historical lottery data. The data format may have changed.'
        : `Failed to load historical lottery data: ${error.message}`;
      
      dispatch({ 
        type: 'SET_DATA_ERROR', 
        payload: { 
          message: errorMessage,
          code: error.code || 'UNKNOWN',
          details: error.details
        } 
      });
      
      dispatch({ type: 'SET_HISTORICAL_STATS', payload: null });
      throw error;
      
    } finally {
      dispatch({ type: 'SET_LOADING_HISTORY', payload: false });
    }
  }, [state.historicalRecordsLimit]);

  // Generate quick selections (local algorithm)
  const generateQuickSelections = useCallback(async (count = 5) => {
    dispatch({ type: 'SET_GENERATING_SELECTIONS', payload: true });
    
    try {
      console.log(`Generating ${count} quick selections...`);
      
      // Simple random generation as fallback
      const selections = [];
      
      for (let i = 0; i < count; i++) {
        const numbers = [];
        const used = new Set();
        
        // Generate 5 unique main numbers (1-69)
        while (numbers.length < 5) {
          const num = Math.floor(Math.random() * 69) + 1;
          if (!used.has(num)) {
            numbers.push(num);
            used.add(num);
          }
        }
        
        // Generate powerball (1-26)
        const powerball = Math.floor(Math.random() * 26) + 1;
        
        numbers.sort((a, b) => a - b);
        
        selections.push({
          id: `quick-${Date.now()}-${i}`,
          numbers,
          powerball,
          type: 'quick',
          generated: new Date().toISOString()
        });
      }
      
      dispatch({ type: 'SET_QUICK_SELECTIONS', payload: selections });
      return { success: true, selections };
      
    } catch (error) {
      console.error('Failed to generate selections:', error);
      
      dispatch({ 
        type: 'SET_DATA_ERROR', 
        payload: { 
          message: `Failed to generate quick selections: ${error.message}`,
          code: 'SELECTION_GENERATION_FAILED'
        } 
      });
      
      throw error;
      
    } finally {
      dispatch({ type: 'SET_GENERATING_SELECTIONS', payload: false });
    }
  }, []);

  // Update historical records limit
  const updateRecordsLimit = useCallback((newLimit) => {
    const limit = Math.min(Math.max(newLimit, 25), 2000);
    dispatch({ type: 'UPDATE_RECORDS_LIMIT', payload: limit });
  }, []);

  // Clear all errors
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    testApiConnection,
    fetchCurrentData,
    fetchHistoricalStats,
    generateQuickSelections,
    updateRecordsLimit,
    clearError
  };

  return (
    <LotteryContext.Provider value={value}>
      {children}
    </LotteryContext.Provider>
  );
}

// Hook to use the context
export function useLottery() {
  const context = useContext(LotteryContext);
  if (!context) {
    throw new Error('useLottery must be used within a LotteryProvider');
  }
  return context;
}