import React from 'react';
import clsx from 'clsx';

function LoadingSpinner({ 
  size = 'md', 
  variant = 'default',
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

  const variants = {
    default: 'border-gray-300 border-t-blue-600',
    opus4: 'border-purple-300 border-t-purple-600',
    white: 'border-gray-400 border-t-white'
  };

  return (
    <div
      className={clsx(
        'inline-block border-2 border-solid rounded-full animate-spin',
        sizes[size],
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

// Inline spinner with message
LoadingSpinner.Inline = function InlineSpinner({ 
  message = 'Loading...', 
  size = 'md',
  variant = 'default' 
}) {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <LoadingSpinner size={size} variant={variant} />
      <span className="text-sm text-gray-600">{message}</span>
    </div>
  );
};

export default LoadingSpinner;