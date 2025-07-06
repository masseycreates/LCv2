import React, { useEffect } from 'react';
import { useLottery } from '@/contexts/LotteryContext';

function Header() {
  const {
    currentJackpot,
    nextDrawing,
    isLoading,
    error,
    dataSource,
    fetchCurrentData,
    clearError
  } = useLottery();

  // Fetch data on component mount
  useEffect(() => {
    fetchCurrentData();
  }, [fetchCurrentData]);

  const handleRefresh = async () => {
    clearError();
    await fetchCurrentData();
  };

  return (
    <div className={`sticky top-0 z-50 mb-6 rounded-xl p-4 shadow-lg ${
      currentJackpot ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600' : 'bg-gradient-to-r from-gray-600 to-gray-700'
    }`}>
      <div className="flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="bg-white bg-opacity-20 p-2 rounded-full">
            {currentJackpot ? '??' : error ? '??' : '??'}
          </div>
          <div>
            <div className="text-sm font-medium opacity-80">
              Enhanced Powerball System
            </div>
            <div className="text-xl font-bold">
              {currentJackpot ? currentJackpot.formatted : 'Visit powerball.com'}
            </div>
            <div className="text-xs opacity-70">
              {currentJackpot ? `Cash: ${currentJackpot.cashFormatted} • ` : 'For current jackpot • '}
              {nextDrawing || 'Next drawing TBD'}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={`
              bg-white bg-opacity-20 text-white border-none px-3 py-2 rounded-lg text-sm
              transition-all duration-200 flex items-center gap-2
              ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-opacity-30 cursor-pointer'}
            `}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              '??'
            )}
            Refresh
          </button>
          
          {dataSource && (
            <div className="text-xs opacity-70 mt-1">
              {error ? 'Data unavailable' : `Source: ${dataSource}`}
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-3 p-2 rounded-lg bg-red-500 bg-opacity-20 border border-red-300 border-opacity-30">
          <div className="text-xs text-red-100">
            <strong>Data Error:</strong> {error.message || error}
          </div>
        </div>
      )}
    </div>
  );
}

export default Header;