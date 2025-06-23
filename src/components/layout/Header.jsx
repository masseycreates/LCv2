// src/components/layout/Header.jsx
import React from 'react';
import { useLottery } from '@/contexts/LotteryContext';

function Header() {
  const { isGenerating } = useLottery();

  return (
    <header className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-500 text-white p-4 rounded-xl mx-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🎯✨</div>
          <div>
            <div className="text-sm font-medium opacity-80">LCv2 - Advanced Lottery System</div>
            <div className="text-2xl font-bold">
              {isGenerating ? 'Generating...' : 'System Ready'}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm opacity-80">Modular Architecture</div>
          <div className="text-xs bg-white/20 px-2 py-1 rounded mt-1 font-bold">
            ⚡ OPTIMIZED
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

// ------------------