import React from 'react';
import clsx from 'clsx';

function Banner({ 
  children, 
  type = 'info',
  size = 'md',
  className,
  onClose,
  ...props 
}) {
  const baseClasses = 'rounded-lg border font-medium';
  
  const types = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    opus4Warning: 'bg-purple-50 border-purple-200 text-purple-800',
    opus4Success: 'bg-green-50 border-green-200 text-green-800'
  };
  
  const sizes = {
    sm: 'p-2 text-xs',
    md: 'p-3 text-sm',
    lg: 'p-4 text-base'
  };

  return (
    <div
      className={clsx(
        baseClasses,
        types[type],
        sizes[size],
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {children}
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 text-current opacity-70 hover:opacity-100 transition-opacity"
          >
            <span className="sr-only">Close</span>
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default Banner;