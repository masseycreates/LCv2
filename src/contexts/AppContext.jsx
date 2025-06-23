// src/contexts/AppContext.jsx - Global app state management
import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  // System status
  systemStatus: 'initializing', // 'initializing' | 'ready' | 'error'
  dataStatus: 'Initializing system...',
  
  // Claude Opus 4 integration
  isClaudeEnabled: false,
  claudeApiKey: '',
  
  // Performance metrics
  systemPerformance: {
    isLearning: false,
    predictionsGenerated: 0,
    averageHitRate: 0,
    status: 'initializing'
  },
  
  // Notifications
  notifications: [],
  
  // UI state
  isLoading: false,
  lastUpdated: null
};

// Action types
const ActionTypes = {
  SET_SYSTEM_STATUS: 'SET_SYSTEM_STATUS',
  SET_DATA_STATUS: 'SET_DATA_STATUS',
  SET_CLAUDE_ENABLED: 'SET_CLAUDE_ENABLED',
  SET_CLAUDE_API_KEY: 'SET_CLAUDE_API_KEY',
  UPDATE_PERFORMANCE_METRICS: 'UPDATE_PERFORMANCE_METRICS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_LOADING: 'SET_LOADING',
  SET_LAST_UPDATED: 'SET_LAST_UPDATED'
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_SYSTEM_STATUS:
      return {
        ...state,
        systemStatus: action.payload
      };
      
    case ActionTypes.SET_DATA_STATUS:
      return {
        ...state,
        dataStatus: action.payload
      };
      
    case ActionTypes.SET_CLAUDE_ENABLED:
      return {
        ...state,
        isClaudeEnabled: action.payload
      };
      
    case ActionTypes.SET_CLAUDE_API_KEY:
      return {
        ...state,
        claudeApiKey: action.payload,
        isClaudeEnabled: action.payload ? true : false
      };
      
    case ActionTypes.UPDATE_PERFORMANCE_METRICS:
      return {
        ...state,
        systemPerformance: {
          ...state.systemPerformance,
          ...action.payload
        }
      };
      
    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...action.payload
          }
        ]
      };
      
    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
      
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
      
    case ActionTypes.SET_LAST_UPDATED:
      return {
        ...state,
        lastUpdated: action.payload || new Date().toISOString()
      };
      
    default:
      return state;
  }
}

// Create context
const AppContext = createContext();

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize app on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        dispatch({ 
          type: ActionTypes.SET_DATA_STATUS, 
          payload: '🚀 Initializing LCv2 modular system...' 
        });
        
        // Simulate initialization delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        dispatch({ type: ActionTypes.SET_SYSTEM_STATUS, payload: 'ready' });
        dispatch({ 
          type: ActionTypes.SET_DATA_STATUS, 
          payload: '✅ LCv2 system initialized and ready' 
        });
        dispatch({ type: ActionTypes.SET_LAST_UPDATED });
        
        // Update performance metrics
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

  // Action creators
  const actions = {
    setSystemStatus: (status) => dispatch({ type: ActionTypes.SET_SYSTEM_STATUS, payload: status }),
    setDataStatus: (status) => dispatch({ type: ActionTypes.SET_DATA_STATUS, payload: status }),
    setClaudeEnabled: (enabled) => dispatch({ type: ActionTypes.SET_CLAUDE_ENABLED, payload: enabled }),
    setClaudeApiKey: (key) => dispatch({ type: ActionTypes.SET_CLAUDE_API_KEY, payload: key }),
    updatePerformanceMetrics: (metrics) => dispatch({ type: ActionTypes.UPDATE_PERFORMANCE_METRICS, payload: metrics }),
    addNotification: (notification) => dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: notification }),
    removeNotification: (id) => dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id }),
    setLoading: (loading) => dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),
    setLastUpdated: () => dispatch({ type: ActionTypes.SET_LAST_UPDATED })
  };

  const value = {
    ...state,
    ...actions
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;