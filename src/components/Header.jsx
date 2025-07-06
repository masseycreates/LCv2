// LCv2 Header Component - Enhanced & Modular
import React, { useState, useEffect, useMemo } from 'react';
import { formatJackpot, formatCurrency, calculateNextDrawing } from '../utils/helpers.js';

export default function Header({ 
  liveDataAvailable, 
  currentJackpot, 
  nextDrawDate, 
  isUpdating, 
  onRefresh,
  systemPerformance 
}) {
  
  // ===========================================================================
  // LOCAL STATE
  // ===========================================================================
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSystemInfo, setShowSystemInfo] = useState(false);

  // ===========================================================================
  // EFFECTS
  // ===========================================================================
  
  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // ===========================================================================
  // COMPUTED VALUES
  // ===========================================================================
  
  const jackpotDisplay = useMemo(() => {
    if (!currentJackpot) {
      return {
        amount: 'Loading...',
        cashValue: 'Loading...',
        isLoading: true
      };
    }
    
    return {
      amount: formatJackpot(currentJackpot.amount),
      cashValue: formatCurrency(currentJackpot.cashValue || currentJackpot.amount * 0.6),
      isLoading: false,
      isLive: liveDataAvailable && !currentJackpot.source
    };
  }, [currentJackpot, liveDataAvailable]);

  const drawingInfo = useMemo(() => {
    if (nextDrawDate) {
      return {
        date: nextDrawDate.date || nextDrawDate,
        time: nextDrawDate.time || '10:59 PM ET',
        dayOfWeek: nextDrawDate.dayOfWeek || 'Mon/Wed/Sat'
      };
    }
    
    const calculated = calculateNextDrawing();
    return {
      date: calculated.date,
      time: calculated.time,
      dayOfWeek: calculated.dayOfWeek
    };
  }, [nextDrawDate]);

  const systemStatusDisplay = useMemo(() => {
    if (!systemPerformance) return null;
    
    const { uptime, memoryUsage, errorCount } = systemPerformance;
    
    return {
      uptime: uptime ? `${Math.round(uptime / 1000 / 60)}m` : '0m',
      memory: memoryUsage ? `${memoryUsage.used}MB` : 'N/A',
      errors: errorCount || 0,
      status: errorCount > 5 ? 'warning' : 'healthy'
    };
  }, [systemPerformance]);

  // ===========================================================================
  // EVENT HANDLERS
  // ===========================================================================
  
  const handleRefresh = () => {
    if (isUpdating || !onRefresh) return;
    onRefresh();
  };

  const toggleSystemInfo = () => {
    setShowSystemInfo(!showSystemInfo);
  };

  // ===========================================================================
  // RENDER HELPERS
  // ===========================================================================
  
  const renderJackpotSection = () => (
    <div className="text-center md:text-left">
      <div className="mb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
          Current Powerball Jackpot
        </h1>
        <div className="flex items-center justify-center md:justify-start gap-2 text-sm">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            jackpotDisplay.isLive 
              ? 'bg-green-500/20 text-green-100' 
              : 'bg-yellow-500/20 text-yellow-100'
          }`}>
            {jackpotDisplay.isLive ? '?? Live Data' : '?? Offline'}
          </span>
          <span className="text-white/80">
            Updated: {currentTime.toLocaleTimeString()}
          </span>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className={`text-4xl md:text-5xl font-black text-white transition-all duration-300 ${
          jackpotDisplay.isLoading ? 'animate-pulse' : ''
        }`}>
          {jackpotDisplay.amount}
        </div>
        
        <div className="text-lg text-white/90">
          Cash Value: <span className="font-semibold">{jackpotDisplay.cashValue}</span>
        </div>
      </div>
    </div>
  );

  const renderDrawingInfo = () => (
    <div className="text-center md:text-right">
      <div className="space-y-2">
        <div>
          <div className="text-lg font-semibold text-white mb-1">
            Next Drawing
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white">
              {drawingInfo.date}
            </div>
            <div className="text-sm text-white/90">
              {drawingInfo.time}
            </div>
            <div className="text-xs text-white/80">
              Drawings: {drawingInfo.dayOfWeek}
            </div>
          </div>
        </div>
        
        <div className="flex justify-center md:justify-end">
          <button
            onClick={handleRefresh}
            disabled={isUpdating}
            className={`btn btn-sm px-3 py-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all duration-200 ${
              isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
            }`}
            aria-label={isUpdating ? 'Refreshing data...' : 'Refresh lottery data'}
          >
            <span className={`text-sm ${isUpdating ? 'animate-spin' : ''}`}>
              {isUpdating ? '??' : '??'}
            </span>
            <span className="hidden sm:inline ml-1">
              {isUpdating ? 'Updating...' : 'Refresh'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderSystemStatus = () => (
    <div className="mt-4 pt-4 border-t border-white/20">
      <button
        onClick={toggleSystemInfo}
        className="flex items-center justify-between w-full text-left text-white/90 hover:text-white transition-colors"
      >
        <span className="text-sm font-medium">System Status</span>
        <span className={`text-xs transition-transform duration-200 ${
          showSystemInfo ? 'rotate-180' : ''
        }`}>
          ?
        </span>
      </button>
      
      {showSystemInfo && systemStatusDisplay && (
        <div className="mt-3 grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-xs text-white/70">Uptime</div>
            <div className="text-sm font-semibold text-white">
              {systemStatusDisplay.uptime}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-white/70">Memory</div>
            <div className="text-sm font-semibold text-white">
              {systemStatusDisplay.memory}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-white/70">Errors</div>
            <div className={`text-sm font-semibold ${
              systemStatusDisplay.errors === 0 ? 'text-green-300' : 'text-yellow-300'
            }`}>
              {systemStatusDisplay.errors}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ===========================================================================
  // MAIN RENDER
  // ===========================================================================
  
  return (
    <header className="mb-8">
      <div className={`card overflow-hidden ${
        liveDataAvailable ? 'gradient-bg' : 'gradient-bg-unavailable'
      }`}>
        <div className="relative z-10">
          
          {/* Main Header Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {renderJackpotSection()}
            {renderDrawingInfo()}
          </div>

          {/* System Information (Collapsible) */}
          {systemPerformance && renderSystemStatus()}

          {/* Architecture Badge */}
          <div className="absolute top-4 right-4 hidden lg:block">
            <div className="flex flex-col items-end space-y-1">
              <div className="hybrid-badge">
                ??? Modular Architecture
              </div>
              <div className="claude-badge">
                ?? Claude Sonnet 4 Ready
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Architecture Info */}
      <div className="lg:hidden mt-4 flex justify-center space-x-2">
        <div className="hybrid-badge text-xs">
          ??? Modular
        </div>
        <div className="claude-badge text-xs">
          ?? Sonnet 4
        </div>
      </div>
    </header>
  );
}