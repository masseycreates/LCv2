import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { useLottery } from '@/contexts/LotteryContext';

function Footer() {
  const { isClaudeEnabled, systemPerformance } = useApp();
  const { liveDataAvailable, historicalStats } = useLottery();

  return (
    <footer className="mt-12 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Main Footer Content */}
        <div className="text-center text-sm text-gray-600 space-y-2">
          <p className="flex items-center justify-center gap-2">
            <span>🎰</span>
            <span>Claude Opus 4 + 6 Algorithms Hybrid Lottery System</span>
            <span>•</span>
            <span>Educational purposes only</span>
          </p>
          
          {/* System Status */}
          <div className="flex items-center justify-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              Data: 
              <span className={liveDataAvailable ? 'text-green-600' : 'text-orange-600'}>
                {liveDataAvailable ? 'Live Connected' : 'Offline'}
              </span>
            </span>
            
            <span className="flex items-center gap-1">
              AI: 
              <span className={isClaudeEnabled ? 'text-purple-600' : 'text-gray-600'}>
                {isClaudeEnabled ? 'Opus 4 Active' : 'Local Only'}
              </span>
            </span>
            
            {historicalStats && (
              <span className="flex items-center gap-1">
                Using {historicalStats.totalDrawings} drawings
              </span>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        {systemPerformance && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs">
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {systemPerformance.averageHitRate}%
                </div>
                <div className="text-gray-600">Avg Hit Rate</div>
              </div>
              
              <div>
                <div className="text-lg font-bold text-green-600">
                  {systemPerformance.predictionsGenerated}
                </div>
                <div className="text-gray-600">Predictions</div>
              </div>
              
              <div>
                <div className="text-lg font-bold text-purple-600">
                  {isClaudeEnabled ? 'OPUS 4' : 'LOCAL'}
                </div>
                <div className="text-gray-600">Mode</div>
              </div>
              
              <div>
                <div className="text-lg font-bold text-orange-600">
                  {systemPerformance.status.toUpperCase()}
                </div>
                <div className="text-gray-600">Status</div>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
          <p>
            This system is for educational and entertainment purposes only. 
            Lottery games involve risk and no system can guarantee winnings. 
            Please play responsibly.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;