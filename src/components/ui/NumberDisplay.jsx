export default NumberDisplay;import React from 'react';
import clsx from 'clsx';

function NumberDisplay({ 
  number, 
  variant = 'default',
  size = 'md',
  isPowerball = false,
  className,
  ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center font-mono font-bold rounded-lg transition-all duration-200 hover:scale-105';
  
  const variants = {
    default: isPowerball 
      ? 'bg-red-600 text-white border border-red-700' 
      : 'bg-gray-100 text-gray-900 border border-gray-300',
    opus4: isPowerball
      ? 'bg-gradient-to-br from-red-600 to-red-700 text-white border border-red-800 shadow-lg'
      : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 border border-purple-300 shadow-md',
    powerball: 'bg-red-600 text-white border border-red-700',
    selected: 'bg-blue-600 text-white border border-blue-700',
    hot: 'bg-orange-500 text-white border border-orange-600',
    cold: 'bg-blue-500 text-white border border-blue-600'
  };
  
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm', 
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  return (
    <div
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isPowerball && <span className="sr-only">Powerball: </span>}
      {number}
    </div>
  );
}

// Grid of numbers for selection
function NumberGrid({ 
  range = [1, 69],
  selectedNumbers = [],
  onNumberClick,
  maxSelections = 5,
  disabled = false,
  hotNumbers = [],
  coldNumbers = []
}) {
  const [start, end] = range;
  const numbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  
  const getNumberVariant = (num) => {
    if (selectedNumbers.includes(num)) return 'selected';
    if (hotNumbers.includes(num)) return 'hot';
    if (coldNumbers.includes(num)) return 'cold';
    return 'default';
  };
  
  const isNumberDisabled = (num) => {
    return disabled || (selectedNumbers.length >= maxSelections && !selectedNumbers.includes(num));
  };

  return (
    <div className="grid grid-cols-10 gap-2">
      {numbers.map(num => (
        <button
          key={num}
          onClick={() => onNumberClick && onNumberClick(num)}
          disabled={isNumberDisabled(num)}
          className={clsx(
            'w-10 h-10 text-sm border rounded font-bold transition-all duration-200',
            selectedNumbers.includes(num)
              ? 'bg-blue-500 text-white border-blue-500 shadow-md'
              : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-900 hover:border-gray-400',
            isNumberDisabled(num) && 'opacity-50 cursor-not-allowed',
            !isNumberDisabled(num) && 'hover:scale-105 cursor-pointer'
          )}
        >
          {num}
        </button>
      ))}
    </div>
  );
}

// Powerball specific grid
function PowerballGrid({ 
  selectedPowerball,
  onPowerballClick,
  disabled = false
}) {
  const numbers = Array.from({ length: 26 }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-13 gap-2">
      {numbers.map(num => (
        <button
          key={num}
          onClick={() => onPowerballClick && onPowerballClick(num)}
          disabled={disabled}
          className={clsx(
            'w-10 h-10 text-sm border rounded font-bold transition-all duration-200',
            selectedPowerball === num
              ? 'bg-red-500 text-white border-red-500 shadow-md'
              : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-900 hover:border-gray-400',
            disabled && 'opacity-50 cursor-not-allowed',
            !disabled && 'hover:scale-105 cursor-pointer'
          )}
        >
          {num}
        </button>
      ))}
    </div>
  );
}

NumberDisplay.Grid = NumberGrid;
NumberDisplay.PowerballGrid = PowerballGrid;