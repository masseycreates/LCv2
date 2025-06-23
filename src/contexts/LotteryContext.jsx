// src/contexts/LotteryContext.jsx - Minimal working context
import React, { createContext, useContext, useState } from 'react';

const LotteryContext = createContext();

export function LotteryProvider({ children }) {
  const [selections, setSelections] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const value = {
    selections,
    setSelections,
    isGenerating,
    setIsGenerating,
    historicalStats: {
      totalDrawings: 100,
      hotNumbers: [7, 23, 32, 16, 43, 58, 2, 35, 44, 19],
      coldNumbers: [13, 34, 61, 26, 49, 55, 11, 39, 48, 3]
    },
    liveDataAvailable: true
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