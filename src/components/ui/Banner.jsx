// src/components/ui/Banner.jsx
import React from 'react';

function Banner({ children, type = 'info', dismissible = false, onDismiss, className = '' }) {
  const baseClasses = 'rounded-lg p-4 mb-4';
  
  const types = {
    info: 'bg-blue-50 text-blue-800 border border-blue-200',
    success: 'bg-green-50 text-green-800 border border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
    error: 'bg-red-50 text-red-800 border border-red-200',
    claude: 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-800 border border-purple-200'
  };

  const icons = {
    info: '??',
    success: '?',
    warning: '??',
    error: '?',
    claude: '??'
  };

  return (
    <div className={`${baseClasses} ${types[type]} ${className}`}>
      <div className="flex items-start">
        <span className="text-lg mr-3 mt-0.5">{icons[type]}</span>
        <div className="flex-1">{children}</div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-3 text-current opacity-60 hover:opacity-100"
          >
            ?
          </button>
        )}
      </div>
    </div>
  );
}

export default Banner;

// ------------------