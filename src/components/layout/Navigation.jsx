import React from 'react';
import { useApp } from '@/contexts/AppContext';
import clsx from 'clsx';

function Navigation({ tabs, activeTab, onTabChange }) {
  const { isClaudeEnabled } = useApp();

  return (
    <div className="border-b border-gray-200 bg-white rounded-lg shadow-sm">
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={clsx(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2',
                isActive
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}
            >
              <span className="text-base">{tab.icon}</span>
              <span>
                {tab.id === 'quick-selection' && isClaudeEnabled 
                  ? '🤖✨ AI Hybrid' 
                  : tab.label
                }
              </span>
              
              {/* Claude indicator for AI tab */}
              {tab.id === 'quick-selection' && isClaudeEnabled && (
                <span className="px-1.5 py-0.5 text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full">
                  ✨ OPUS 4
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Navigation;