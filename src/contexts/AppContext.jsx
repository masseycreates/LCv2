import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext();

const initialState = {
  // Claude AI Integration
  claudeApiKey: '',
  isClaudeEnabled: false,
  isClaudeLoading: false,
  claudeConnectionStatus: 'disconnected', // 'disconnected', 'connecting', 'connected', 'error'
  
  // System Status
  systemStatus: 'initializing', // 'initializing', 'ready', 'error'
  lastUpdated: null,
  dataStatus: '',
  
  // UI State
  notifications: [],
  isUpdating: false,
  
  // Performance Metrics
  systemPerformance: {
    isLearning: false,
    predictionsGenerated: 0,
    averageHitRate: 16.5,
    status: 'excellent'
  }
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_CLAUDE_API_KEY':
      return {
        ...state,
        claudeApiKey: action.payload,
        isClaudeEnabled: action.payload.trim().length > 0
      };
      
    case 'SET_CLAUDE_CONNECTION_STATUS':
      return {
        ...state,
        claudeConnectionStatus: action.payload,
        isClaudeLoading: action.payload === 'connecting'
      };
      
    case 'SET_SYSTEM_STATUS':
      return {
        ...state,
        systemStatus: action.payload,
        lastUpdated: new Date().toISOString()
      };
      
    case 'SET_DATA_STATUS':
      return {
        ...state,
        dataStatus: action.payload
      };
      
    case 'SET_UPDATING':
      return {
        ...state,
        isUpdating: action.payload
      };
      
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, {
          id: Date.now(),
          ...action.payload
        }]
      };
      
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
      
    case 'UPDATE_PERFORMANCE_METRICS':
      return {
        ...state,
        systemPerformance: {
          ...state.systemPerformance,
          ...action.payload
        }
      };
      
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize app on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        dispatch({ type: 'SET_DATA_STATUS', payload: '🚀 Initializing hybrid Claude Opus 4 + 6 algorithms system...' });
        
        // Simulate initialization delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        dispatch({ type: 'SET_SYSTEM_STATUS', payload: 'ready' });
        dispatch({ type: 'SET_DATA_STATUS', payload: '✅ System initialized and ready' });
        
        // Update performance metrics
        dispatch({ 
          type: 'UPDATE_PERFORMANCE_METRICS', 
          payload: {
            isLearning: true,
            predictionsGenerated: 0,
            status: 'excellent'
          }
        });
        
      } catch (error) {
        console.error('App initialization failed:', error);
        dispatch({ type: 'SET_SYSTEM_STATUS', payload: 'error' });
        dispatch({ type: 'SET_DATA_STATUS', payload: '❌ System initialization failed' });
      }
    };

    initializeApp();
  }, []);

  // Action creators
  const actions = {
    setClaudeApiKey: (apiKey) => {
      dispatch({ type: 'SET_CLAUDE_API_KEY', payload: apiKey });
    },
    
    setClaudeConnectionStatus: (status) => {
      dispatch({ type: 'SET_CLAUDE_CONNECTION_STATUS', payload: status });
    },
    
    setDataStatus: (status) => {
      dispatch({ type: 'SET_DATA_STATUS', payload: status });
    },
    
    setUpdating: (isUpdating) => {
      dispatch({ type: 'SET_UPDATING', payload: isUpdating });
    },
    
    addNotification: (notification) => {
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
      
      // Auto-remove after 5 seconds if not persistent
      if (!notification.persistent) {
        setTimeout(() => {
          dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id });
        }, 5000);
      }
    },
    
    removeNotification: (id) => {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    },
    
    updatePerformanceMetrics: (metrics) => {
      dispatch({ type: 'UPDATE_PERFORMANCE_METRICS', payload: metrics });
    }
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

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;