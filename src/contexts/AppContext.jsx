// src/contexts/AppContext.jsx - Updated with Claude integration
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { claudeApiService } from '../services/api/claudeApiService';

const initialState = {
  systemStatus: 'initializing',
  dataStatus: 'Initializing system...',
  
  // Claude AI Integration
  isClaudeEnabled: false,
  claudeApiKey: '',
  claudeConnectionStatus: 'disconnected', // 'disconnected' | 'connecting' | 'connected' | 'error'
  claudeModel: 'claude-3-5-sonnet-20241022',
  
  systemPerformance: {
    isLearning: false,
    predictionsGenerated: 0,
    averageHitRate: 0,
    status: 'initializing',
    claudeAnalyses: 0,
    hybridMode: false
  },
  
  notifications: [],
  isLoading: false,
  lastUpdated: null
};

const ActionTypes = {
  SET_SYSTEM_STATUS: 'SET_SYSTEM_STATUS',
  SET_DATA_STATUS: 'SET_DATA_STATUS',
  
  // Claude Actions
  SET_CLAUDE_ENABLED: 'SET_CLAUDE_ENABLED',
  SET_CLAUDE_API_KEY: 'SET_CLAUDE_API_KEY',
  SET_CLAUDE_CONNECTION_STATUS: 'SET_CLAUDE_CONNECTION_STATUS',
  INCREMENT_CLAUDE_ANALYSES: 'INCREMENT_CLAUDE_ANALYSES',
  
  UPDATE_PERFORMANCE_METRICS: 'UPDATE_PERFORMANCE_METRICS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_LOADING: 'SET_LOADING',
  SET_LAST_UPDATED: 'SET_LAST_UPDATED'
};

function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_SYSTEM_STATUS:
      return { ...state, systemStatus: action.payload };
      
    case ActionTypes.SET_DATA_STATUS:
      return { ...state, dataStatus: action.payload };
      
    case ActionTypes.SET_CLAUDE_ENABLED:
      return { 
        ...state, 
        isClaudeEnabled: action.payload,
        systemPerformance: {
          ...state.systemPerformance,
          hybridMode: action.payload
        }
      };
      
    case ActionTypes.SET_CLAUDE_API_KEY:
      return { 
        ...state, 
        claudeApiKey: action.payload
      };
      
    case ActionTypes.SET_CLAUDE_CONNECTION_STATUS:
      return { 
        ...state, 
        claudeConnectionStatus: action.payload,
        isClaudeEnabled: action.payload === 'connected'
      };
      
    case ActionTypes.INCREMENT_CLAUDE_ANALYSES:
      return {
        ...state,
        systemPerformance: {
          ...state.systemPerformance,
          claudeAnalyses: state.systemPerformance.claudeAnalyses + 1,
          predictionsGenerated: state.systemPerformance.predictionsGenerated + action.payload
        }
      };
      
    case ActionTypes.UPDATE_PERFORMANCE_METRICS:
      return {
        ...state,
        systemPerformance: { ...state.systemPerformance, ...action.payload }
      };
      
    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...action.payload
        }]
      };
      
    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
      
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
      
    case ActionTypes.SET_LAST_UPDATED:
      return { ...state, lastUpdated: action.payload || new Date().toISOString() };
      
    default:
      return state;
  }
}

const AppContext = createContext();

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        dispatch({ 
          type: ActionTypes.SET_DATA_STATUS, 
          payload: '🚀 Initializing LCv2 with Claude AI integration...' 
        });
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        dispatch({ type: ActionTypes.SET_SYSTEM_STATUS, payload: 'ready' });
        dispatch({ 
          type: ActionTypes.SET_DATA_STATUS, 
          payload: '✅ LCv2 system ready - Claude AI available' 
        });
        dispatch({ type: ActionTypes.SET_LAST_UPDATED });
        
        dispatch({ 
          type: ActionTypes.UPDATE_PERFORMANCE_METRICS, 
          payload: {
            isLearning: true,
            status: 'excellent'
          }
        });
        
      } catch (error) {
        console.error('App initialization failed:', error);
        dispatch({ type: ActionTypes.SET_SYSTEM_STATUS, payload: 'error' });
        dispatch({ 
          type: ActionTypes.SET_DATA_STATUS, 
          payload: '❌ System initialization failed' 
        });
      }
    };

    initializeApp();
  }, []);

  // Claude API functions
  const testClaudeConnection = async (apiKey) => {
    dispatch({ type: ActionTypes.SET_CLAUDE_CONNECTION_STATUS, payload: 'connecting' });
    
    try {
      const result = await claudeApiService.testConnection(apiKey);
      
      if (result.success) {
        claudeApiService.setApiKey(apiKey);
        dispatch({ type: ActionTypes.SET_CLAUDE_API_KEY, payload: apiKey });
        dispatch({ type: ActionTypes.SET_CLAUDE_CONNECTION_STATUS, payload: 'connected' });
        
        addNotification({
          type: 'success',
          title: 'Claude AI Connected',
          message: 'Advanced AI analysis is now available!'
        });
        
        return { success: true, message: result.message };
      } else {
        dispatch({ type: ActionTypes.SET_CLAUDE_CONNECTION_STATUS, payload: 'error' });
        
        addNotification({
          type: 'error',
          title: 'Claude Connection Failed',
          message: result.error
        });
        
        return { success: false, error: result.error };
      }
    } catch (error) {
      dispatch({ type: ActionTypes.SET_CLAUDE_CONNECTION_STATUS, payload: 'error' });
      return { success: false, error: error.message };
    }
  };

  const generateClaudeAnalysis = async (options) => {
    if (!state.isClaudeEnabled) {
      throw new Error('Claude AI not connected');
    }

    try {
      const result = await claudeApiService.generateLotteryAnalysis(options);
      
      if (result.success) {
        dispatch({ 
          type: ActionTypes.INCREMENT_CLAUDE_ANALYSES, 
          payload: result.sets.length 
        });
        
        addNotification({
          type: 'success',
          title: 'Claude Analysis Complete',
          message: `Generated ${result.sets.length} AI-optimized number sets`
        });
      }
      
      return result;
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Claude Analysis Failed',
        message: error.message
      });
      throw error;
    }
  };

  const disconnectClaude = () => {
    claudeApiService.setApiKey(null);
    dispatch({ type: ActionTypes.SET_CLAUDE_API_KEY, payload: '' });
    dispatch({ type: ActionTypes.SET_CLAUDE_CONNECTION_STATUS, payload: 'disconnected' });
    
    addNotification({
      type: 'info',
      title: 'Claude Disconnected',
      message: 'AI features disabled'
    });
  };

  // Other action creators
  const addNotification = (notification) => {
    dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: notification });
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: notification.id || Date.now() });
    }, 5000);
  };

  const actions = {
    setSystemStatus: (status) => dispatch({ type: ActionTypes.SET_SYSTEM_STATUS, payload: status }),
    setDataStatus: (status) => dispatch({ type: ActionTypes.SET_DATA_STATUS, payload: status }),
    updatePerformanceMetrics: (metrics) => dispatch({ type: ActionTypes.UPDATE_PERFORMANCE_METRICS, payload: metrics }),
    addNotification,
    removeNotification: (id) => dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id }),
    setLoading: (loading) => dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),
    setLastUpdated: () => dispatch({ type: ActionTypes.SET_LAST_UPDATED }),
    
    // Claude actions
    testClaudeConnection,
    generateClaudeAnalysis,
    disconnectClaude,
    setClaudeConnectionStatus: (status) => dispatch({ type: ActionTypes.SET_CLAUDE_CONNECTION_STATUS, payload: status })
  };

  const value = { ...state, ...actions };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;