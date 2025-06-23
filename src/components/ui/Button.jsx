import React from 'react';
import clsx from 'clsx';
import LoadingSpinner from './LoadingSpinner';

const Button = React.forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  className,
  type = 'button',
  ...props 
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 relative overflow-hidden';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 focus:ring-blue-500 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white border border-gray-600 focus:ring-gray-500 shadow-sm hover:shadow-md',
    purple: 'bg-purple-600 hover:bg-purple-700 text-white border border-purple-600 focus:ring-purple-500 shadow-sm hover:shadow-md',
    opus4: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border border-purple-600 focus:ring-purple-500 shadow-lg hover:shadow-xl font-bold',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300 focus:ring-gray-500',
    outline: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-gray-500 shadow-sm',
    danger: 'bg-red-600 hover:bg-red-700 text-white border border-red-600 focus:ring-red-500 shadow-sm hover:shadow-md'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  const disabledClasses = disabled || loading
    ? 'opacity-50 cursor-not-allowed hover:transform-none'
    : 'hover:-translate-y-0.5 active:translate-y-0';

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        disabledClasses,
        className
      )}
      {...props}
    >
      {/* Shimmer effect for opus4 variant */}
      {variant === 'opus4' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      )}
      
      {loading && (
        <LoadingSpinner size="sm" className="mr-2" />
      )}
      
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </button>
  );
});

Button.displayName = 'Button';

export default Button;