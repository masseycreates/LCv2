import React from 'react';
import { useLottery } from '@/contexts/LotteryContext';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import NumberDisplay from '@components/ui/NumberDisplay';

function NumberSelector() {
  const {
    selectedNumbers,
    selectedPowerball,
    historicalStats,
    toggleNumber,
    setPowerball,
    clearSelection,
    quickPick
  } = useLottery();

  const copySelection = () => {
    if (selectedNumbers.length === 5 && selectedPowerball) {
      const ticket = `${selectedNumbers.join(', ')} | PB: ${selectedPowerball}`;
      navigator.clipboard.writeText(ticket);
      alert('Selection copied to clipboard!');
    }
  };

  const isSelectionComplete = selectedNumbers.length === 5 && selectedPowerball;

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">🎯 Manual Number Selection</h3>
        
        {/* Current Selection Display */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3 text-gray-700">Your Selection:</h4>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex gap-2">
              {selectedNumbers.length > 0 ? (
                selectedNumbers.map(num => (
                  <NumberDisplay 
                    key={num} 
                    number={num}
                    variant="selected"
                  />
                ))
              ) : (
                <span className="text-gray-400 text-sm">Select 5 numbers</span>
              )}
            </div>
            
            <div>
              {selectedPowerball ? (
                <NumberDisplay 
                  number={selectedPowerball}
                  variant="powerball"
                  isPowerball
                />
              ) : (
                <span className="text-gray-400 text-sm">Select Powerball</span>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={quickPick} variant="primary">
              🎲 Quick Pick
            </Button>
            
            <Button onClick={clearSelection} variant="secondary">
              🗑️ Clear
            </Button>
            
            {isSelectionComplete && (
              <Button onClick={copySelection} variant="ghost">
                📋 Copy
              </Button>
            )}
          </div>
        </div>

        {/* Main Numbers Selection */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3 text-gray-700">Main Numbers (1-69):</h4>
          <NumberDisplay.Grid
            range={[1, 69]}
            selectedNumbers={selectedNumbers}
            onNumberClick={toggleNumber}
            maxSelections={5}
            hotNumbers={historicalStats?.hotNumbers?.slice(0, 15) || []}
            coldNumbers={historicalStats?.coldNumbers?.slice(0, 15) || []}
          />
        </div>

        {/* Powerball Selection */}
        <div>
          <h4 className="text-sm font-medium mb-3 text-gray-700">Powerball (1-26):</h4>
          <NumberDisplay.PowerballGrid
            selectedPowerball={selectedPowerball}
            onPowerballClick={setPowerball}
          />
        </div>
      </Card>

      {/* Selection Stats */}
      {historicalStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h4 className="font-medium text-sm mb-3 text-gray-900">🔥 Hot Numbers (Most Frequent)</h4>
            <div className="flex flex-wrap gap-2">
              {historicalStats.hotNumbers?.slice(0, 15).map(num => (
                <NumberDisplay
                  key={num}
                  number={num}
                  variant="hot"
                  size="sm"
                />
              ))}
            </div>
          </Card>

          <Card>
            <h4 className="font-medium text-sm mb-3 text-gray-900">❄️ Cold Numbers (Least Frequent)</h4>
            <div className="flex flex-wrap gap-2">
              {historicalStats.coldNumbers?.slice(0, 15).map(num => (
                <NumberDisplay
                  key={num}
                  number={num}
                  variant="cold"
                  size="sm"
                />
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default NumberSelector;