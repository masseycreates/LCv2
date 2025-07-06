// LCv2 Main Lottery System Component - Modular Architecture
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './Header.js';
import QuickSelection from './QuickSelection.js';
import NumberSelector from './NumberSelector.jsx';
import TaxCalculator from './TaxCalculator.js';
import DataAnalysis from './DataAnalysis.js';
import { powerballAPI } from '../services/PowerballAPI.js';
import { lotteryPredictor } from '../services/LotteryPredictor.js';
import { UI_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants.js';

export default function LotterySystem() {
  // ===========================================================================
  // CORE STATE MANAGEMENT
  // ===========================================================================
  
  // Navigation state
  const [activeTab, setActiveTab] = useState('quick-selection');
  
  // Data state
  const [currentJackpot, setCurrentJackpot] = useState(null);
  const [historicalStats, setHistoricalStats] = useState(null);
  const [nextDrawDate, setNextDrawDate] = useState('');
  
  // Status tracking
  const [liveDataAvailable, setLiveDataAvailable] = useState(false);
  const [historicalDataAvailable, setHistoricalDataAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dataStatus, setDataStatus] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  
  // Configuration
  const [historicalRecordsLimit, setHistoricalRecordsLimit] = useState(500);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Performance tracking
  const [systemPerformance, setSystemPerformance] = useState(null);
  const [errorLog, setErrorLog] = useState([]);

  // ===========================================================================
  // TAB CONFIGURATION
  // ===========================================================================
  
  const tabConfig = useMemo(() => [
    {
      id: 'quick-selection',
      label: 'AI Hybrid',
      icon: '???',
      description: 'Claude Sonnet 4 + 6 Algorithms'
    },
    {
      id: 'calculator',
      label: 'Manual Pick',
      icon: '??',
      description: 'Manual number selection'
    },
    {
      id: 'tax-calculator',
      label: 'Tax Calculator',
      icon: '??',
      description: 'Winning tax analysis'
    },
    {
      id: 'analysis',
      label: 'System Analysis',
      icon: '??',
      description: 'Data & diagnostics'
    }
  ], []);

  // ===========================================================================
  // INITIALIZATION & DATA LOADING
  // ===========================================================================
  
  useEffect(() => {
    initializeSystem();
  }, []);

  const initializeSystem = async () => {
    setDataStatus('?? Initializing LCv2 system...');
    
    try {
      // Initialize services
      await initializeServices();
      
      // Load initial data
      await loadInitialData();
      
      // Setup performance monitoring
      setupPerformanceMonitoring();
      
      setDataStatus('? LCv2 system initialized successfully');
      
      // Auto-refresh every 30 minutes
      const refreshInterval = setInterval(refreshAllData, 30 * 60 * 1000);
      return () => clearInterval(refreshInterval);
      
    } catch (error) {
      console.error('System initialization failed:', error);
      logError('System Initialization', error);
      setDataStatus(`? Initialization failed: ${error.message}`);
    }
  };

  const initializeServices = async () => {
    try {
      // Test API connectivity
      const connectivity = await powerballAPI.testConnectivity();
      console.log('?? API Connectivity:', connectivity.success ? 'Connected' : 'Failed');
      
      if (!connectivity.success) {
        throw new Error('API connectivity test failed');
      }
      
      // Initialize predictor
      lotteryPredictor.initialize();
      console.log('?? Lottery predictor initialized');
      
    } catch (error) {
      console.error('Service initialization failed:', error);
      throw error;
    }
  };

  const loadInitialData = async () => {
    setDataStatus('?? Loading lottery data...');
    
    try {
      // Load current jackpot data
      await loadJackpotData();
      
      // Load historical data
      await loadHistoricalData();
      
    } catch (error) {
      console.error('Initial data loading failed:', error);
      logError('Data Loading', error);
      throw error;
    }
  };

  // ===========================================================================
  // DATA LOADING FUNCTIONS
  // ===========================================================================
  
  const loadJackpotData = async () => {
    try {
      setDataStatus('?? Fetching current jackpot...');
      
      const jackpotData = await powerballAPI.fetchCurrentData();
      
      if (jackpotData.success) {
        setCurrentJackpot(jackpotData.data.jackpot);
        setNextDrawDate(jackpotData.data.nextDrawing);
        setLiveDataAvailable(true);
        setLastUpdated(new Date().toLocaleString());
        
        console.log('?? Jackpot data loaded:', jackpotData.data.jackpot?.amount);
      } else {
        throw new Error(jackpotData.error || 'Failed to fetch jackpot data');
      }
      
    } catch (error) {
      console.error('Jackpot data loading failed:', error);
      setLiveDataAvailable(false);
      logError('Jackpot Loading', error);
      
      // Use fallback data
      setCurrentJackpot({
        amount: 100000000,
        cashValue: 50000000,
        source: 'fallback'
      });
    }
  };

  const loadHistoricalData = async () => {
    try {
      setIsLoadingHistory(true);
      setDataStatus('?? Loading historical data...');
      
      const historicalData = await powerballAPI.fetchHistoricalData(historicalRecordsLimit);
      
      if (historicalData.success) {
        setHistoricalStats(historicalData.data);
        setHistoricalDataAvailable(true);
        
        console.log('?? Historical data loaded:', historicalData.data.totalDrawings, 'drawings');
      } else {
        throw new Error(historicalData.error || 'Failed to fetch historical data');
      }
      
    } catch (error) {
      console.error('Historical data loading failed:', error);
      setHistoricalDataAvailable(false);
      logError('Historical Data Loading', error);
      
      // Generate fallback historical stats
      setHistoricalStats(generateFallbackHistoricalStats());
      
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // ===========================================================================
  // DATA REFRESH FUNCTIONS
  // ===========================================================================
  
  const refreshAllData = useCallback(async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    setDataStatus('?? Refreshing all data...');
    
    try {
      // Refresh jackpot data
      await loadJackpotData();
      
      // Refresh historical data if needed
      if (Date.now() - getLastHistoricalRefresh() > 24 * 60 * 60 * 1000) {
        await loadHistoricalData();
      }
      
      setDataStatus('? Data refreshed successfully');
      
    } catch (error) {
      console.error('Data refresh failed:', error);
      logError('Data Refresh', error);
      setDataStatus(`? Refresh failed: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, historicalRecordsLimit]);

  // ===========================================================================
  // CONFIGURATION HANDLERS
  // ===========================================================================
  
  const handleDataLimitChange = useCallback(async (newLimit) => {
    if (newLimit === historicalRecordsLimit) return;
    
    setHistoricalRecordsLimit(newLimit);
    
    // Reload historical data with new limit
    try {
      await loadHistoricalData();
    } catch (error) {
      console.error('Failed to reload historical data:', error);
      logError('Data Limit Change', error);
    }
  }, [historicalRecordsLimit]);

  // ===========================================================================
  // TAB RENDERING SYSTEM
  // ===========================================================================
  
  const renderTabContent = () => {
    const commonProps = {
      liveDataAvailable,
      historicalDataAvailable,
      isUpdating,
      dataStatus,
      setDataStatus,
      lastUpdated,
      systemPerformance
    };

    switch (activeTab) {
      case 'quick-selection':
        return (
          <QuickSelection
            {...commonProps}
            historicalStats={historicalStats}
            currentJackpot={currentJackpot}
            isLoadingHistory={isLoadingHistory}
            historicalRecordsLimit={historicalRecordsLimit}
            onDataLimitChange={handleDataLimitChange}
          />
        );
        
      case 'calculator':
        return (
          <NumberSelector
            {...commonProps}
            historicalStats={historicalStats}
          />
        );
        
      case 'tax-calculator':
        return (
          <TaxCalculator 
            {...commonProps}
            currentJackpot={currentJackpot}
          />
        );
        
      case 'analysis':
        return (
          <DataAnalysis
            {...commonProps}
            historicalStats={historicalStats}
            errorLog={errorLog}
          />
        );
        
      default:
        return (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">??</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Select a Tab
            </h3>
            <p className="text-gray-600">
              Choose a feature from the navigation above to get started
            </p>
          </div>
        );
    }
  };

  // ===========================================================================
  // UTILITY FUNCTIONS
  // ===========================================================================
  
  const setupPerformanceMonitoring = () => {
    const performance = {
      startTime: Date.now(),
      memoryUsage: getMemoryUsage(),
      apiCallCount: 0,
      errorCount: errorLog.length
    };
    
    setSystemPerformance(performance);
    
    // Update performance metrics every minute
    const performanceInterval = setInterval(() => {
      setSystemPerformance(prev => ({
        ...prev,
        uptime: Date.now() - prev.startTime,
        memoryUsage: getMemoryUsage(),
        errorCount: errorLog.length
      }));
    }, 60000);
    
    return () => clearInterval(performanceInterval);
  };

  const logError = (category, error) => {
    const errorEntry = {
      id: Date.now(),
      category,
      message: error.message,
      timestamp: new Date().toISOString(),
      stack: error.stack
    };
    
    setErrorLog(prev => [errorEntry, ...prev.slice(0, 49)]); // Keep last 50 errors
  };

  const getMemoryUsage = () => {
    if (typeof performance !== 'undefined' && performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  };

  const getLastHistoricalRefresh = () => {
    try {
      return parseInt(localStorage.getItem('lcv2_last_historical_refresh') || '0');
    } catch {
      return 0;
    }
  };

  const generateFallbackHistoricalStats = () => {
    return {
      totalDrawings: 500,
      dateRange: {
        earliest: '2022-01-01',
        latest: new Date().toISOString().split('T')[0]
      },
      hotNumbers: [7, 14, 21, 28, 35],
      coldNumbers: [13, 26, 39, 52, 65],
      averageJackpot: 75000000,
      source: 'fallback'
    };
  };

  // ===========================================================================
  // RENDER COMPONENT
  // ===========================================================================
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header Component */}
        <Header
          liveDataAvailable={liveDataAvailable}
          currentJackpot={currentJackpot}
          nextDrawDate={nextDrawDate}
          isUpdating={isUpdating}
          onRefresh={refreshAllData}
          systemPerformance={systemPerformance}
        />

        {/* Status Banner */}
        {dataStatus && (
          <div className={`banner mb-6 ${
            dataStatus.includes('?') ? 'success-banner' :
            dataStatus.includes('?') ? 'error-banner' : 
            dataStatus.includes('??') ? 'warning-banner' : 'info-banner'
          }`}>
            <div className="flex items-center gap-2">
              <span>{dataStatus}</span>
              {isUpdating && (
                <div className="loading-spinner ml-2" />
              )}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            {tabConfig.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'bg-blue-500 text-white shadow-md transform scale-105' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                aria-label={`Switch to ${tab.label} - ${tab.description}`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <main className="animate-fade-in">
          {renderTabContent()}
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500 border-t border-gray-200 pt-6">
          <div className="space-y-2">
            <p className="flex items-center justify-center gap-2">
              <span className="text-lg">??</span>
              <span className="font-semibold">LCv2 - Advanced Lottery Intelligence System</span>
              <span className="claude-badge">v2.0.0</span>
            </p>
            
            <div className="flex items-center justify-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                ?? Data: <span className={liveDataAvailable ? 'text-green-600' : 'text-orange-600'}>
                  {liveDataAvailable ? 'Live Connected' : 'Offline Mode'}
                </span>
              </span>
              
              {historicalStats && (
                <span className="flex items-center gap-1">
                  ?? History: <span className="text-blue-600">
                    {historicalStats.totalDrawings} drawings
                  </span>
                </span>
              )}
              
              {systemPerformance && (
                <span className="flex items-center gap-1">
                  ? Uptime: <span className="text-purple-600">
                    {Math.round((systemPerformance.uptime || 0) / 1000 / 60)}m
                  </span>
                </span>
              )}
            </div>
            
            <p className="text-xs opacity-75">
              ??? Modular Architecture • ? React + Vite • ?? Claude Sonnet 4 Compatible • ?? Educational Use Only
            </p>

          </div>
        </footer>
      </div>
    </div>
  );
}