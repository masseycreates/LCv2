import React from 'react';
import clsx from 'clsx';

function Card({ 
  children, 
  className,
  variant = 'default',
  ...props 
}) {
  const baseClasses = 'bg-white rounded-lg shadow-sm border border-gray-200 p-6';
  
  const variants = {
    default: '',
    opus4: 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 relative overflow-hidden',
    success: 'border-green-200 bg-green-50',
    warning: 'border-amber-200 bg-amber-50',
    error: 'border-red-200 bg-red-50'
  };

  return (
    <div
      className={clsx(
        baseClasses,
        variants[variant],
        className
      )}
      {...props}
    >
      {/* Opus 4 special effects */}
      {variant === 'opus4' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <div className="absolute top-2 right-2 text-purple-600 opacity-20">
            ✨
          </div>
        </>
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// Special Opus 4 variant
Card.Opus4 = function Opus4Card({ children, className, ...props }) {
  return (
    <Card 
      variant="opus4" 
      className={clsx('group', className)}
      {...props}
    >
      {children}
    </Card>
  );
};

export default Card;