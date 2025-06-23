import React from 'react';
import clsx from 'clsx';

function LoadingSpinner({ 
  size = 'md', 
  color = 'current',
  className,
  ...props 
}) {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4', 
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };
  
  const colors = {
    current: 'text-current',
    white: 'text-white',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600'
  };

  return (
    <div
      className={clsx(
        'inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]',
        sizes[size],
        colors[color],
        className
      )}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Full page loading component
function FullPageLoader({ message = "Loading..." }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <LoadingSpinner size="xl" color="purple" />
        </div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

// Inline loading with text
function InlineLoader({ message, size = 'sm' }) {
  return (
    <div className="flex items-center gap-2 text-gray-600">
      <LoadingSpinner size={size} />
      <span className="text-sm">{message}</span>
    </div>
  );
}

LoadingSpinner.FullPage = FullPageLoader;
LoadingSpinner.Inline = InlineLoader;

export default LoadingSpinner;