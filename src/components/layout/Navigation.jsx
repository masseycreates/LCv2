// src/components/layout/Navigation.jsx - Tab Navigation
import React from 'react';
import clsx from 'clsx';

function Navigation({ tabs, activeTab, onTabChange }) {
  return (
    <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
      <div className="flex space-x-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              'flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">{tab.icon}</span>
              <div className="hidden sm:block">
                <div className="font-medium">{tab.label}</div>
                {tab.description && (
                  <div className="text-xs opacity-75">{tab.description}</div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default Navigation;

// ------------------