// src/components/ui/LoadingSpinner.jsx
import React from 'react';

function LoadingSpinner({ size = 'medium', className = '' }) {
  const sizes = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizes[size]} ${className}`}></div>
  );
}

export default LoadingSpinner;