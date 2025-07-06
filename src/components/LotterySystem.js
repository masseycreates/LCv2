// LCv2 Main Lottery System Component
import React, { useState, useEffect } from 'react';
import Header from './Header.js';
import QuickSelection from './QuickSelection.js';
import NumberSelector from './NumberSelector.js';
import TaxCalculator from './TaxCalculator.js';
import DataAnalysis from './DataAnalysis.js';
import { powerballAPI } from '../services/PowerballAPI.js';
import { lotteryPredictor } from '../services/LotteryPredictor.js';
import { UI_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants.js';

export default function LotterySystem() {
  // Core application state
  const [activeTab, setActiveTab] = useState('quick-selection');
  const [currentJackpot, setCurrentJackpot] = useState(null);
  const [historicalStats, setHistoricalStats] = useState(null);
  const [nextDrawDate, setNextDrawDate] = useState('');
  
  // Data status tracking
  const [liveDataAvailable, setLiveDataAvailable] = useState(false);
  const [historicalDataAvailable, setHistoricalDataAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dataStatus, setDataStatus] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  
  // Historical data configuration
  const [historicalRecordsLimit, setHistoricalRecordsLimit] = useState(500);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // System performance tracking
  const [systemPerformance, setSystemPerformance] = useState(null);

  // Initialize application data
  useEffect(() => {
    initializeData();
  }, []);

  // Initialize all data sources
  const initializeData = async () => {
    setDataStatus('🚀 Initializing LCv2 system...');
    
    try {
      // Test API connectivity first
      const connectivity = await powerballAPI.testConnectivity();
      console.log('📡 API Connectivity:', connectivity.success ? 'OK' : 'Failed');
      
      // Load current data
      await fetchCurrentData();
      
      // Load historical data
      await fetchHistoricalData();
      
      // Get system performance metrics
      const performance = lotteryPredictor.getSystemStatus();
      setSystemPerformance(performance);
      
      setDataStatus('✅ LCv2 system initialized successfully');
      
    } catch (error) {
      console.error('❌ System initialization failed:', error);
      setDataStatus('⚠️ System initialization completed with warnings');
    }
  };

  // Fetch current Powerball data
  const fetchCurrentData = async () => {
    setIsUpdating(true);
    setDataStatus('🔄 Fetching live Powerball data...');
    
    try {
      const data = await powerballAPI.fetchCurrentData();
      
      if (data.success && data.dataAvailable && data.jackpot) {
        setCurrentJackpot(data.jackpot);
        setLiveDataAvailable(true);
        
        if (data.nextDrawing) {
          setNextDrawDate(`${data.nextDrawing.date} @ ${data.nextDrawing.time}`);
        }
        
        setDataStatus(`✅ Live data from ${data.source}`);
        setLastUpdated(new Date().toLocaleString());
        
        // Make jackpot globally available for tax calculator
        window.currentJackpotData = data.jackpot;
        
      } else {
        setCurrentJackpot(null);
        setLiveDataAvailable(false);
        window.currentJackpotData = null;
        setDataStatus(data.message || ERROR_MESSAGES.dataUnavailable);
        
        if (data.nextDrawing) {
          setNextDrawDate(`${data.nextDrawing.date} @ ${data.nextDrawing.time}`);
        }
      }
      
    } catch (error) {
      console.error('Current data fetch failed:', error);
      setCurrentJackpot(null);
      setLiveDataAvailable(false);
      window.currentJackpotData = null;
      setDataStatus(ERROR_MESSAGES.networkError);
    }
    
    setIsUpdating(false);
  };

  // Fetch historical data with specified limit
  const fetchHistoricalData = async (customLimit) => {
    const limit = customLimit || historicalRecordsLimit;
    setIsLoadingHistory(true);
    
    try {
      const data = await powerballAPI.fetchHistoricalData(limit);
      
      if (data.success && data.dataAvailable && data.statistics) {
        setHistoricalStats(data.statistics);
        setHistoricalDataAvailable(true);
        console.log(`📊 Historical data loaded: ${data.statistics.totalDrawings} drawings`);
      } else {
        setHistoricalStats(null);
        setHistoricalDataAvailable(false);
        console.warn('⚠️ Historical data not available');
      }
      
    } catch (error) {
      console.error('Historical data fetch failed:', error);
      setHistoricalStats(null);
      setHistoricalDataAvailable(false);
    }
    
    setIsLoadingHistory(false);
  };

  // Handle historical data limit changes
  const handleDataLimitChange = async (newLimit) => {
    setHistoricalRecordsLimit(newLimit);
    await fetchHistoricalData(newLimit);
  };

  // Refresh all data
  const refreshAllData = async () => {
    await fetchCurrentData();
    
    // Update system performance
    const performance = lotteryPredictor.getSystemStatus();
    setSystemPerformance(performance);
  };

  // Get tab configuration with dynamic labels
  const getTabConfig = () => {
    return UI_CONFIG.tabs.map(tab => {
      if (tab.id === 'quick-selection') {
        return {
          ...tab,
          label: 'AI Hybrid',
          icon: '🤖✨'
        };
      }
      return tab;
    });
  };

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'quick-selection':
        return (
          <QuickSelection
            historicalStats={historicalStats}
            currentJackpot={currentJackpot}
            historicalDataAvailable={historicalDataAvailable}
            isLoadingHistory={isLoadingHistory}
            historicalRecordsLimit={historicalRecordsLimit}
            onDataLimitChange={handleDataLimitChange}
            dataStatus={dataStatus}
            setDataStatus={setDataStatus}
          />
        );
        
      case 'calculator':
        return (
          <NumberSelector />
        );
        
      case 'tax-calculator':
        return (
          <TaxCalculator 
            currentJackpot={currentJackpot}
          />
        );
        
      case 'analysis':
        return (
          <DataAnalysis
            liveDataAvailable={liveDataAvailable}
            historicalDataAvailable={historicalDataAvailable}
            historicalStats={historicalStats}
            lastUpdated={lastUpdated}
            systemPerformance={systemPerformance}
          />
        );
        
      default:
        return (
          <div className="card text-center py-8">
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-gray-600">Select a tab to view content</p>
          </div>
        );
    }
  };

  const tabConfig = getTabConfig();

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem' }}>
      {/* Header Component */}
      <Header
        liveDataAvailable={liveDataAvailable}
        currentJackpot={currentJackpot}
        nextDrawDate={nextDrawDate}
        isUpdating={isUpdating}
        onRefresh={refreshAllData}
      />

      {/* Status Banner */}
      {dataStatus && (
        <div className={`mb-3 p-2 rounded-lg text-xs ${
          dataStatus.includes('✅') ? 'success-banner' :
          dataStatus.includes('❌') ? 'error-banner' : 'warning-banner'
        }`}>
          {dataStatus}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-4">
        <div className="flex border-b border-gray-200">
          {tabConfig.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {renderTabContent()}
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>
          🎰 LCv2 - Advanced Lottery Intelligence System • Educational purposes only
        </p>
        <p className="mt-1">
          Data: {' '}
          <span className={liveDataAvailable ? 'text-green-600' : 'text-orange-600'}>
            {liveDataAvailable ? 'Live Connected' : 'Offline'}
          </span>
          {historicalStats && ` • Using ${historicalStats.totalDrawings} drawings`}
        </p>
        <p className="mt-1 text-xs">
          Version 2.0.0 • Modular Architecture • React + Vite
        </p>
      </div>
    </div>
  );
}