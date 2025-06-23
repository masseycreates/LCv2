import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { useLottery } from '@/contexts/LotteryContext';
import Button from '@components/ui/Button';
import LoadingSpinner from '@components/ui/LoadingSpinner';

function Header() {
  const { 
    isClaudeEnabled, 
    isUpdating, 
    dataStatus,
    lastUpdated 
  } = useApp();
  
  const { 
    currentJackpot, 
    nextDrawing, 
    liveDataAvailable,
    fetchCurrentData
  } = useLottery();

  const handleRefresh = async () => {
    try {
      await fetchCurrentData();
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 mb-4">
      <div 
        className={`
          ${liveDataAvailable 
            ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-green-500' 
            : 'bg-gradient-to-r from-gray-600 via-gray-500 to-gray-400'
          }
          relative overflow-hidden rounded-xl mx-4 mt-4 shadow-xl
        `}
      >
        {/* Animated shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        
        <div className="relative flex items-center justify-between p-4 text-white">
          {/* Left side - Icon and title */}
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              {isClaudeEnabled ? '🤖✨' : liveDataAvailable ? '🎯' : '⚠️'}
            </div>
            
            <div>
              <div className="text-sm font-medium opacity-80">
                {isClaudeEnabled 
                  ? 'Claude Opus 4 + 6 Algorithms Hybrid' 
                  : 'Enhanced Powerball System'
                }
              </div>
              
              <div className="text-2xl font-bold">
                {liveDataAvailable && currentJackpot 
                  ? currentJackpot.formatted 
                  : 'Visit powerball.com'
                }
              </div>
              
              <div className="text-xs opacity-70">
                {liveDataAvailable && currentJackpot 
                  ? `Cash: ${currentJackpot.cashFormatted} • ` 
                  : 'For current jackpot • '
                }
                {nextDrawing || 'Next drawing TBD'}
              </div>
            </div>
          </div>

          {/* Right side - Refresh button */}
          <div className="text-right">
            <Button
              onClick={handleRefresh}
              disabled={isUpdating}
              variant="ghost"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              {isUpdating ? <LoadingSpinner size="sm" /> : '🔄'}
              <span className="ml-2">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Status banner */}
      {dataStatus && (
        <div className="mx-4 mt-2">
          <div className={`
            p-2 rounded-lg text-sm font-medium
            ${dataStatus.includes('✅') 
              ? 'bg-green-50 text-green-700 border-2 border-green-200' 
              : dataStatus.includes('❌') 
                ? 'bg-red-50 text-red-700 border-2 border-red-200'
                : 'bg-amber-50 text-amber-700 border-2 border-amber-200'
            }
          `}>
            {dataStatus}
          </div>
        </div>
      )}
    </header>
  );
}

// Custom CSS for shimmer animation (add to your CSS file)
const shimmerStyles = `
@keyframes shimmer {
  0%, 100% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
}

.animate-shimmer {
  animation: shimmer 7s ease-in-out infinite;
}
`;

export default Header;