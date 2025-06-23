import React from 'react';
import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';
import NumberDisplay from '@components/ui/NumberDisplay';
import Button from '@components/ui/Button';
import clsx from 'clsx';

function SelectionDisplay({ selections, isClaudeEnabled }) {
  const copyToClipboard = (selection) => {
    const ticket = `${selection.numbers.join(', ')} | PB: ${selection.powerball}`;
    navigator.clipboard.writeText(ticket);
    
    // Could add a toast notification here
    console.log('Selection copied to clipboard:', ticket);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 85) return 'success';
    if (confidence >= 75) return 'primary';
    return 'warning';
  };

  const getConfidenceBorder = (confidence) => {
    if (confidence >= 85) return 'border-l-green-500';
    if (confidence >= 75) return 'border-l-blue-500';
    return 'border-l-amber-500';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {selections.map((selection, index) => {
        const isOpus4Selection = selection.claudeGenerated || selection.isHybrid;
        
        return (
          <div
            key={selection.id || index}
            className={clsx(
              'p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md',
              isOpus4Selection 
                ? 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-400' 
                : 'bg-blue-50 border-blue-400',
              getConfidenceBorder(selection.confidence)
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-gray-900 mb-1">
                  {selection.name}
                </h4>
                
                <div className="flex items-center gap-2 mb-2">
                  {isOpus4Selection && (
                    <Badge variant="opus4" size="sm">
                      ✨ OPUS 4
                    </Badge>
                  )}
                  
                  <Badge 
                    variant={getConfidenceColor(selection.confidence)}
                    size="sm"
                  >
                    {selection.strategy}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Numbers Display */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex gap-2">
                {selection.numbers.map(num => (
                  <NumberDisplay 
                    key={num} 
                    number={num}
                    variant={isOpus4Selection ? 'opus4' : 'default'}
                    size="sm"
                  />
                ))}
              </div>
              
              <NumberDisplay 
                number={selection.powerball}
                variant={isOpus4Selection ? 'opus4' : 'powerball'}
                size="sm"
                isPowerball
              />
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {selection.description && selection.description.length > 80 ? 
                `${selection.description.substring(0, 80)}...` : 
                selection.description || 'Advanced mathematical analysis'
              }
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {selection.algorithmDetail || selection.actualStrategy}
              </div>
              
              <Button
                onClick={() => copyToClipboard(selection)}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                📋 Copy
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SelectionDisplay;