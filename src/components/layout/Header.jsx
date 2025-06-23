// src/components/layout/Header.jsx - App Header
import React from 'react';
import { useApp } from '@/contexts/AppContext';

function Header() {
  const { systemStatus, dataStatus, isClaudeEnabled } = useApp();

  const getStatusColor = () => {
    switch (systemStatus) {
      case 'ready': return 'from-green-600 to-blue-600';
      case 'error': return 'from-red-600 to-orange-600';
      default: return 'from-purple-600 via-blue-600 to-green-500';
    }
  };

  return (
    <header className={`bg-gradient-to-r ${getStatusColor()} text-white p-4 rounded-xl mx-4 mt-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">???</div>
          <div>
            <div className="text-sm font-medium opacity-80">LCv2 - Modular Lottery System</div>
            <div className="text-2xl font-bold">
              {systemStatus === 'ready' ? 'System Ready' : 'Initializing...'}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm opacity-80">{dataStatus}</div>
          {isClaudeEnabled && (
            <div className="text-xs bg-white/20 px-2 py-1 rounded mt-1 font-bold">
              ?? CLAUDE OPUS 4 ACTIVE
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;

// ------------------