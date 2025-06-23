import React from 'react';
import clsx from 'clsx';

function Badge({ 
  children, 
  variant = 'default',
  size = 'md',
  className,
  ...props 
}) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    error: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800',
    opus4: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md',
    claude: 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md'
  };
  
  const sizes = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  };

  return (
    <span
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;