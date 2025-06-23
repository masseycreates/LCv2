// src/components/ui/Card.jsx - Reusable Card Component
import React from 'react';
import clsx from 'clsx';

function Card({ children, className, variant = 'default', ...props }) {
  const baseClasses = 'bg-white rounded-lg shadow-sm border p-6';
  
  const variants = {
    default: 'border-gray-200',
    claude: 'border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50',
    warning: 'border-yellow-200 bg-yellow-50',
    success: 'border-green-200 bg-green-50',
    error: 'border-red-200 bg-red-50'
  };

  return (
    <div 
      className={clsx(baseClasses, variants[variant], className)} 
      {...props}
    >
      {children}
    </div>
  );
}

// Special Claude Opus 4 Card variant
Card.Opus4 = function ClaudeOpus4Card({ children, className, ...props }) {
  return (
    <Card 
      variant="claude" 
      className={clsx('relative overflow-hidden', className)}
      {...props}
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-full -translate-y-10 translate-x-10"></div>
      {children}
    </Card>
  );
};

export default Card;

// ------------------