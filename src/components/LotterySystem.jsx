// src/components/LotterySystem.jsx - Enhanced LCv2 Main Application
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { powerballAPI } from '../services/PowerballAPI.js';
import { lotteryPredictor } from '../services/LotteryPredictor.js';
import { claudeAPI } from '../services/ClaudeAPI.js';
import { formatCurrency, formatPercentage, debounce } from '../utils/helpers.js';
import { APP_CONFIG, FEATURE_FLAGS } from '../utils/constants.js';

// Import components
import Header from './Header.jsx';
import JackpotDisplay from './JackpotDisplay.jsx';
import QuickSelection from './QuickSelection.jsx';
import DataAnalysis from './DataAnalysis.jsx';
import TaxCalculator from './TaxCalculator.jsx';
import About from './About.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';

export default function LotterySystem() {
  // ===========================================================================
  // ENHANCED STATE MANAGEMENT
  // ===========================================================================
  
  const [currentTab, setCurrentTab] = useState('quick');
  const [isUpdating, setIsUpdating] = useState(false);
  const [dataStatus, setDataStatus] = useState('?? Initializing lottery intelligence system...');
  const [error, setError] = useState(null);
  
  // Data state
  const [currentJackpot, setCurrentJackpot] = useState(null);
  const [nextDrawDate, setNextDrawDate] = useState(null);
  const [historicalStats, setHistoricalStats] = useState(null);
  const [liveDataAvailable, setLiveDataAvailable] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Performance monitoring
  const [systemPerformance, setSystemPerformance] = useState(null);
  const [errorLog, setErrorLog] = useState([]);
  const updateCountRef = useRef(0);
  const initStartTime = useRef(performance.now());

  // ===========================================================================
  // ENHANCED TAB CONFIGURATION
  // ===========================================================================
  
  const tabs = [
    {
      id: 'quick',
      label: 'Quick Selection',
      icon: '?',
      description: 'AI-powered number generation with 6 algorithms',
      component: QuickSelection
    },
    {
      id: 'analysis',
      label: 'Data Analysis',
      icon: '??',
      description: 'Historical patterns and system diagnostics',
      component: DataAnalysis
    },
    {
      id: 'tax',
      label: 'Tax Calculator',
      icon: '??',
      description: 'Prize calculations and tax estimations',
      component: TaxCalculator
    },
    {
      id: 'about',
      label: 'About',
      icon: '??',
      description: 'System information and usage guide',
      component: About
    }
  ];

  // ===========================================================================
  // ENHANCED DATA FETCHING
  // ===========================================================================
  
  const fetchAllData = useCallback(async (forceRefresh = false) => {
    if (isUpdating && !forceRefresh) return;
    
    setIsUpdating(true);
    setError(null);
    updateCountRef.current++;
    
    const updateId = updateCountRef.current;
    const startTime = performance.now();
    
    try {
      setDataStatus('?? Connecting to data sources...');
      
      // Parallel data fetching with enhanced error handling
      const [jackpotResult, historicalResult] = await Promise.allSettled([
        powerballAPI.fetchCurrentData().catch(err => {
          console.warn('Jackpot fetch failed:', err);
          return { 
            success: false, 
            error: err.message,
            fallback: {
              jackpot: {
                amount: 100000000 + Math.floor(Math.random() * 400000000),
                cashValue: null,
                nextDrawing: getNextDrawDate(),
                source: 'fallback'
              }
            }
          };
        }),
        powerballAPI.fetchHistoricalData(500).catch(err => {
          console.warn('Historical fetch failed:', err);
          return {
            success: false,
            error: err.message,
            fallback: generateFallbackHistoricalData()
          };
        })
      ]);

      // Check if this update is still current
      if (updateCountRef.current !== updateId) {
        console.log('?? Update superseded, ignoring results');
        return;
      }

      // Process jackpot data
      if (jackpotResult.status === 'fulfilled') {
        const jackpotData = jackpotResult.value;
        if (jackpotData.success && jackpotData.data) {
          setCurrentJackpot(jackpotData.data.jackpot);
          setNextDrawDate(jackpotData.data.jackpot.nextDrawing);
          setLiveDataAvailable(true);
          setDataStatus('? Live data connected');
        } else if (jackpotData.fallback) {
          setCurrentJackpot(jackpotData.fallback.jackpot);
          setNextDrawDate(jackpotData.fallback.jackpot.nextDrawing);
          setLiveDataAvailable(false);
          setDataStatus('?? Using fallback data - live data unavailable');
        }
      }

      // Process historical data
      if (historicalResult.status === 'fulfilled') {
        const historicalData = historicalResult.value;
        if (historicalData.success && historicalData.data) {
          setHistoricalStats({
            totalDrawings: historicalData.data.drawings.length,
            dateRange: historicalData.data.dateRange,
            source: historicalData.source
          });
        } else if (historicalData.fallback) {
          setHistoricalStats(historicalData.fallback);
        }
      }

      // Update performance metrics
      const endTime = performance.now();
      setSystemPerformance({
        lastUpdate: new Date().toISOString(),
        updateDuration: Math.round(endTime - startTime),
        totalUpdates: updateCountRef.current,
        uptime: Math.round(endTime - initStartTime.current),
        dataAccuracy: liveDataAvailable ? 'live' : 'fallback',
        memoryUsage: getMemoryUsage()
      });

      setLastUpdated(new Date().toISOString());
      
    } catch (error) {
      console.error('? Data fetch failed:', error);
      setError(error);
      setDataStatus('? Data fetch failed');
      addToErrorLog(error);
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, liveDataAvailable]);

  // Debounced refresh function
  const debouncedRefresh = useCallback(
    debounce(() => fetchAllData(true), 1000),
    [fetchAllData]
  );

  // ===========================================================================
  // UTILITY FUNCTIONS
  // ===========================================================================
  
  const getNextDrawDate = () => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = now.getDay();
    
    // Powerball draws on Monday, Wednesday, and Saturday
    const drawDays = [1, 3, 6]; // Monday, Wednesday, Saturday
    
    let nextDrawDay = drawDays.find(day => day > currentDay);
    if (!nextDrawDay) {
      nextDrawDay = drawDays[0]; // Next Monday
    }
    
    const daysUntilDraw = nextDrawDay > currentDay 
      ? nextDrawDay - currentDay 
      : 7 - currentDay + nextDrawDay;
    
    const nextDraw = new Date(now);
    nextDraw.setDate(now.getDate() + daysUntilDraw);
    nextDraw.setHours(23, 0, 0, 0); // 11 PM ET
    
    return nextDraw.toISOString();
  };

  const getMemoryUsage = () => {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  };

  const addToErrorLog = (error) => {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      type: error.name || 'Unknown'
    };
    
    setErrorLog(prev => [errorEntry, ...prev.slice(0, 9)]); // Keep last 10 errors
  };

  const generateFallbackHistoricalData = () => {
    return {
      totalDrawings: 500,
      dateRange: {
        earliest: '2022-01-01',
        latest: new Date().toISOString().split('T')[0]
      },
      source: 'fallback',
      lastUpdated: new Date().toISOString()
    };
  };

  // ===========================================================================
  // EFFECTS
  // ===========================================================================
  
  useEffect(() => {
    // Initial data load
    fetchAllData();
    
    // Auto-refresh every 30 minutes
    const refreshInterval = setInterval(() => {
      fetchAllData(false);
    }, 30 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [fetchAllData]);

  useEffect(() => {
    // Initialize performance monitoring
    initStartTime.current = performance.now();
    
    // Cleanup on unmount
    return () => {
      console.log('?? LotterySystem component unmounted');
    };
  }, []);

  // ===========================================================================
  // RENDER METHODS
  // ===========================================================================
  
  const renderCurrentTab = () => {
    const currentTabConfig = tabs.find(tab => tab.id === currentTab);
    if (!currentTabConfig) return null;

    const Component = currentTabConfig.component;
    
    const commonProps = {
      liveDataAvailable,
      historicalStats,
      lastUpdated,
      systemPerformance,
      errorLog,
      dataStatus,
      setDataStatus,
      onRefresh: debouncedRefresh
    };

    switch (currentTab) {
      case 'quick':
        return (
          <Component
            {...commonProps}
            currentJackpot={currentJackpot}
            nextDrawDate={nextDrawDate}
            isUpdating={isUpdating}
          />
        );
      case 'analysis':
        return (
          <Component
            {...commonProps}
            historicalDataAvailable={!!historicalStats}
          />
        );
      case 'tax':
        return (
          <Component
            {...commonProps}
            currentJackpot={currentJackpot}
          />
        );
      case 'about':
        return (
          <Component
            {...commonProps}
          />
        );
      default:
        return null;
    }
  };

  // ===========================================================================
  // MAIN RENDER
  // ===========================================================================
  
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Enhanced Header */}
          <Header
            liveDataAvailable={liveDataAvailable}
            currentJackpot={currentJackpot}
            nextDrawDate={nextDrawDate}
            isUpdating={isUpdating}
            onRefresh={debouncedRefresh}
            systemPerformance={systemPerformance}
          />

          {/* Status Banner */}
          {dataStatus && (
            <div className={`status-banner mb-6 ${
              dataStatus.includes('?') ? 'success-banner' :
              dataStatus.includes('?') ? 'error-banner' :
              dataStatus.includes('??') ? 'warning-banner' : 'info-banner'
            }`}>
              <div className="flex items-center justify-center gap-2">
                <span>{dataStatus}</span>
                {isUpdating && <div className="loading-spinner ml-2" />}
              </div>
            </div>
          )}

          {/* Enhanced Navigation */}
          <div className="mb-8">
            <nav className="flex space-x-1 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-lg font-medium text-sm transition-all duration-300 ${
                    currentTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105 shadow-blue-200'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/60 hover:shadow-md'
                  }`}
                  aria-label={`Switch to ${tab.label} - ${tab.description}`}
                  title={tab.description}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="hidden sm:inline font-semibold">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content Area */}
          <main className="animate-fade-in">
            {renderCurrentTab()}
          </main>

          {/* Enhanced Footer */}
          <footer className="mt-12 text-center text-sm text-gray-500 border-t border-gray-200/50 pt-8 bg-white/30 backdrop-blur-sm rounded-lg">
            <div className="space-y-3">
              <p className="flex items-center justify-center gap-2">
                <span className="text-lg">??</span>
                <span className="font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  LCv2 - Advanced Lottery Intelligence System
                </span>
                <span className="claude-badge bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs">
                  v{APP_CONFIG.version}
                </span>
              </p>
              
              <div className="flex items-center justify-center gap-6 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600"></span>
                  Data: <span className={liveDataAvailable ? 'text-green-600 font-medium' : 'text-orange-600'}>
                    {liveDataAvailable ? 'Live Connected' : 'Offline Mode'}
                  </span>
                </span>
                
                {historicalStats && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"></span>
                    History: <span className="text-blue-600 font-medium">
                      {historicalStats.totalDrawings} drawings
                    </span>
                  </span>
                )}
                
                {systemPerformance && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-purple-600"></span>
                    Uptime: <span className="text-purple-600 font-medium">
                      {Math.round((systemPerformance.uptime || 0) / 1000 / 60)}m
                    </span>
                  </span>
                )}
              </div>
              
              <p className="text-xs opacity-75 bg-gradient-to-r from-gray-500 to-gray-600 bg-clip-text text-transparent">
                ??? Modular Architecture • ? React + Vite • ?? Claude Sonnet 4 Compatible • ?? Educational Use Only
              </p>
            </div>
          </footer>
        </div>
      </div>
    </ErrorBoundary>
  );
}