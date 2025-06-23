import React from 'react';
import clsx from 'clsx';

function Card({ 
  children, 
  variant = 'default',
  size = 'default',
  className,
  hover = false,
  ...props 
}) {
  const baseClasses = 'bg-white border border-gray-200 rounded-xl shadow-sm';
  
  const variants = {
    default: 'border-gray-200',
    opus4: 'border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 shadow-purple-100',
    success: 'border-green-200 bg-green-50',
    warning: 'border-amber-200 bg-amber-50',
    error: 'border-red-200 bg-red-50',
    lottery: 'border-blue-200 bg-blue-50',
    enhanced: 'border-2 border-transparent bg-gradient-to-br from-white to-gray-50 shadow-lg'
  };
  
  const sizes = {
    sm: 'p-3',
    default: 'p-4',
    lg: 'p-6'
  };
  
  const hoverClasses = hover 
    ? 'transition-all duration-200 hover:shadow-lg hover:-translate-y-1' 
    : '';

  return (
    <div
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        hoverClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Enhanced card for special lottery selections
function EnhancedCard({ children, className, ...props }) {
  return (
    <div 
      className={clsx(
        'relative bg-white rounded-xl overflow-hidden',
        'border-2 border-transparent',
        'bg-gradient-to-br from-white to-gray-50',
        'shadow-lg hover:shadow-xl transition-all duration-300',
        'before:absolute before:inset-0 before:p-[2px] before:bg-gradient-to-r before:from-purple-600 before:via-blue-600 before:to-green-500 before:rounded-xl',
        'before:content-[""] before:-z-10',
        className
      )}
      {...props}
    >
      <div className="relative bg-white rounded-lg p-4 h-full">
        {children}
      </div>
    </div>
  );
}

// Opus 4 specific card variant
function Opus4Card({ children, className, ...props }) {
  return (
    <div 
      className={clsx(
        'relative bg-gradient-to-br from-purple-50 to-blue-50',
        'border-2 border-purple-200 rounded-xl',
        'shadow-lg shadow-purple-100',
        'hover:shadow-xl hover:shadow-purple-200',
        'transition-all duration-300',
        'overflow-hidden',
        className
      )}
      {...props}
    >
      {/* Sparkle effect */}
      <div className="absolute top-2 right-2 text-purple-400 animate-pulse">
        ✨
      </div>
      
      <div className="relative p-4">
        {children}
      </div>
    </div>
  );
}

Card.Enhanced = EnhancedCard;
Card.Opus4 = Opus4Card;

export default Card;