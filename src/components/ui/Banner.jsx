import React from 'react';
import clsx from 'clsx';

function Banner({ 
  children,
  type = 'info',
  className,
  dismissible = false,
  onDismiss,
  ...props 
}) {
  const types = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    opus4: 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 text-purple-800'
  };

  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    opus4: '🤖✨'
  };

  return (
    <div
      className={clsx(
        'rounded-lg border-2 p-4 relative',
        types[type],
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0 mt-0.5">
          {icons[type]}
        </span>
        
        <div className="flex-1 text-sm font-medium">
          {children}
        </div>
        
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 ml-2 text-current opacity-60 hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default Banner;