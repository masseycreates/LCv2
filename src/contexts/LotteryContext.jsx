// src/contexts/LotteryContext.jsx - Lottery-specific state management
import React, { createContext, useContext, useState, useEffect } from 'react';

const LotteryContext = createContext();

export function LotteryProvider({ children }) {
  const [lotteryData, setLotteryData] = useState({
    currentJackpot: null,
    nextDrawing: null,
    historicalStats: null,
    liveDataAvailable: false,
    historicalDataAvailable: false,
    lastUpdated: null
  });

  const [selections, setSelections] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize lottery data
  useEffect(() => {
    const initializeLotteryData = async () => {
      try {
        // Mock initialization - replace with real API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setLotteryData({
          currentJackpot: {
            amount: 50000000,
            cashValue: 25000000,
            formatted: '$50,000,000',
            cashFormatted: '$25,000,000'
          },
          nextDrawing: 'Wednesday 10:59 PM ET',
          historicalStats: {
            totalDrawings: 500,
            hotNumbers: [7, 23, 32, 16, 43, 58, 2, 35, 44, 19],
            coldNumbers: [13, 34, 61, 26, 49, 55, 11, 39, 48, 3],
            dateRange: {
              earliest: '2020-01-01',
              latest: '2024-12-31'
            }
          },
          liveDataAvailable: true,
          historicalDataAvailable: true,
          lastUpdated: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to initialize lottery data:', error);
      }
    };

    initializeLotteryData();
  }, []);

  const value = {
    ...lotteryData,
    selections,
    setSelections,
    isGenerating,
    setIsGenerating,
    refreshLotteryData: () => {
      // Implement refresh logic
      setLotteryData(prev => ({
        ...prev,
        lastUpdated: new Date().toISOString()
      }));
    }
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