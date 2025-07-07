// src/components/Header.jsx - Enhanced Header with Modern Design
import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/helpers.js';
import { APP_CONFIG } from '../utils/constants.js';

export default function Header({
  liveDataAvailable,
  currentJackpot,
  nextDrawDate,
  isUpdating,
  onRefresh,
  systemPerformance
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeUntilDraw, setTimeUntilDraw] = useState('');

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate time until next drawing
  useEffect(() => {
    if (!nextDrawDate) return;

    const calculateTimeUntilDraw = () => {
      const now = new Date();
      const draw = new Date(nextDrawDate);
      const diff = draw.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeUntilDraw('Drawing completed');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeUntilDraw(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeUntilDraw(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeUntilDraw(`${minutes}m ${seconds}s`);
      }
    };

    calculateTimeUntilDraw();
    const timer = setInterval(calculateTimeUntilDraw, 1000);

    return () => clearInterval(timer);
  }, [nextDrawDate]);

  const formatJackpotAmount = (amount) => {
    if (!amount) return 'Loading...';
    
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(0)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    } else {
      return formatCurrency(amount);
    }
  };

  const getConnectionStatusInfo = () => {
    if (liveDataAvailable) {
      return {
        icon: '🟢',
        text: 'Live Data',
        className: 'text-green-600 font-medium',
        description: 'Connected to live lottery data sources'
      };
    } else {
      return {
        icon: '🟡',
        text: 'Offline Mode',
        className: 'text-amber-600 font-medium',
        description: 'Using cached or fallback data'
      };
    }
  };

  const getNextDrawInfo = () => {
    if (!nextDrawDate) return null;

    const drawDate = new Date(nextDrawDate);
    const dayName = drawDate.toLocaleDateString('en-US', { weekday: 'long' });
    const timeString = drawDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      timeZoneName: 'short'
    });

    return {
      dayName,
      timeString,
      timeUntilDraw
    };
  };

  const connectionStatus = getConnectionStatusInfo();
  const drawInfo = getNextDrawInfo();

  return (
    <header className="mb-8">
      {/* Main Header Card */}
      <div className="gradient-bg rounded-2xl p-8 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-4 right-4 w-24 h-24 border-2 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-white rounded-full"></div>
        </div>

        <div className="relative z-10">
          {/* Top Row: Branding and Status */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="flex items-center gap-3 mb-4 lg:mb-0">
              <div className="text-4xl">🎰</div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-shadow">
                  Advanced Lottery Intelligence
                </h1>
                <p className="text-white/80 text-sm lg:text-base">
                  Powered by Claude Sonnet 4 • Modular Architecture
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div 
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2"
                title={connectionStatus.description}
              >
                <span className="text-lg">{connectionStatus.icon}</span>
                <span className="text-sm font-medium">{connectionStatus.text}</span>
              </div>

              {/* Refresh Button */}
              <button
                onClick={onRefresh}
                disabled={isUpdating}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2 transition-all duration-200 disabled:opacity-50"
                title="Refresh data from live sources"
              >
                <span className={`text-lg ${isUpdating ? 'animate-spin' : ''}`}>
                  {isUpdating ? '⟳' : '🔄'}
                </span>
                <span className="text-sm font-medium hidden sm:inline">
                  {isUpdating ? 'Updating...' : 'Refresh'}
                </span>
              </button>
            </div>
          </div>

          {/* Main Content: Jackpot and Draw Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Jackpot */}
            <div className="lg:col-span-2">
              <div className="mb-2">
                <span className="text-white/80 text-sm uppercase tracking-wider font-medium">
                  Current Jackpot
                </span>
              </div>
              <div className="text-4xl lg:text-6xl font-black tracking-tight text-shadow mb-2">
                {formatJackpotAmount(currentJackpot?.amount)}
              </div>
              {currentJackpot?.cashValue && (
                <div className="text-white/90 text-sm lg:text-base">
                  Cash Value: <span className="font-semibold">
                    {formatJackpotAmount(currentJackpot.cashValue)}
                  </span>
                </div>
              )}
              {currentJackpot?.source && (
                <div className="text-white/60 text-xs mt-1">
                  Source: {currentJackpot.source === 'fallback' ? 'Offline Mode' : 'Live Data'}
                </div>
              )}
            </div>

            {/* Next Drawing Info */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-white/80 text-sm uppercase tracking-wider font-medium mb-3">
                Next Drawing
              </div>
              
              {drawInfo ? (
                <div className="space-y-2">
                  <div className="text-white font-semibold text-lg">
                    {drawInfo.dayName}
                  </div>
                  <div className="text-white/90 text-sm">
                    {drawInfo.timeString}
                  </div>
                  {drawInfo.timeUntilDraw && (
                    <div className="text-white/80 text-xs font-mono bg-white/10 rounded px-2 py-1 inline-block">
                      {drawInfo.timeUntilDraw}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-white/60">
                  Loading draw information...
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row: System Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 pt-4 border-t border-white/20">
            <div className="flex items-center gap-4 text-white/80 text-xs mb-2 sm:mb-0">
              <span>v{APP_CONFIG.version}</span>
              <span>•</span>
              <span>
                {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </span>
              {systemPerformance?.uptime && (
                <>
                  <span>•</span>
                  <span>
                    Uptime: {Math.round(systemPerformance.uptime / 1000 / 60)}m
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 text-white/60 text-xs">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span>System Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20 hover:bg-white/90 transition-colors">
          <div className="text-2xl mb-1">📊</div>
          <div className="text-sm text-gray-600 font-medium">Data Sources</div>
          <div className="text-lg font-bold text-gray-800">
            {liveDataAvailable ? 'Live' : 'Cached'}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20 hover:bg-white/90 transition-colors">
          <div className="text-2xl mb-1">🧠</div>
          <div className="text-sm text-gray-600 font-medium">AI Engine</div>
          <div className="text-lg font-bold text-gray-800">Ready</div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20 hover:bg-white/90 transition-colors">
          <div className="text-2xl mb-1">⚡</div>
          <div className="text-sm text-gray-600 font-medium">Algorithms</div>
          <div className="text-lg font-bold text-gray-800">6 Active</div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20 hover:bg-white/90 transition-colors">
          <div className="text-2xl mb-1">🎯</div>
          <div className="text-sm text-gray-600 font-medium">Accuracy</div>
          <div className="text-lg font-bold text-gray-800">
            {liveDataAvailable ? 'Live' : 'Sim'}
          </div>
        </div>
      </div>
    </header>
  );
}