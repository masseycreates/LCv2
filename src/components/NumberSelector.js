// LCv2 Number Selector Component
import React, { useState } from 'react';
import { LOTTERY_RULES, SUCCESS_MESSAGES } from '../utils/constants.js';
import { isValidMainNumber, isValidPowerball, generateQuickPick, formatNumbers } from '../utils/helpers.js';

export default function NumberSelector() {
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [powerball, setPowerball] = useState('');
  const [savedSelections, setSavedSelections] = useState([]);

  // Toggle number selection
  const toggleNumber = (num) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else if (selectedNumbers.length < LOTTERY_RULES.mainNumbers.count) {
      setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
    }
  };

  // Set powerball number
  const selectPowerball = (num) => {
    setPowerball(num);
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedNumbers([]);
    setPowerball('');
  };

  // Generate quick pick
  const quickPick = () => {
    const pick = generateQuickPick();
    setSelectedNumbers(pick.numbers);
    setPowerball(pick.powerball);
  };

  // Save current selection
  const saveSelection = () => {
    if (selectedNumbers.length === 5 && powerball) {
      const newSelection = {
        id: Date.now(),
        numbers: [...selectedNumbers],
        powerball: powerball,
        timestamp: new Date().toLocaleString(),
        formatted: formatNumbers(selectedNumbers, powerball)
      };
      
      setSavedSelections([newSelection, ...savedSelections.slice(0, 9)]); // Keep max 10
      alert('Selection saved!');
    } else {
      alert('Please select 5 numbers and a Powerball number first.');
    }
  };

  // Copy selection to clipboard
  const copySelection = (numbers, pb) => {
    const ticket = formatNumbers(numbers || selectedNumbers, pb || powerball);
    navigator.clipboard.writeText(ticket);
    alert(SUCCESS_MESSAGES.selectionCopied);
  };

  // Load saved selection
  const loadSelection = (selection) => {
    setSelectedNumbers(selection.numbers);
    setPowerball(selection.powerball);
  };

  // Delete saved selection
  const deleteSelection = (id) => {
    setSavedSelections(savedSelections.filter(sel => sel.id !== id));
  };

  // Check if current selection is complete
  const isSelectionComplete = selectedNumbers.length === 5 && powerball;

  return (
    <div className="space-y-6">
      
      {/* Main Selection Card */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">🎯 Manual Number Selection</h3>
        
        {/* Current Selection Display */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2 text-gray-700">Your Selection:</h4>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex gap-2">
              {selectedNumbers.length > 0 ? selectedNumbers.map(num => 
                <span key={num} className="number-display">
                  {num}
                </span>
              ) : (
                <span className="text-gray-400 text-sm">Select 5 numbers (1-69)</span>
              )}
            </div>
            <div>
              {powerball ? (
                <span className="powerball-display">PB: {powerball}</span>
              ) : (
                <span className="text-gray-400 text-sm">Select Powerball (1-26)</span>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={quickPick}
              className="btn btn-primary"
            >
              🎲 Quick Pick
            </button>
            <button
              onClick={clearSelection}
              className="btn btn-secondary"
            >
              🗑️ Clear
            </button>
            {isSelectionComplete && (
              <>
                <button
                  onClick={() => copySelection()}
                  className="btn btn-secondary"
                >
                  📋 Copy
                </button>
                <button
                  onClick={saveSelection}
                  className="btn btn-purple"
                >
                  💾 Save
                </button>
              </>
            )}
          </div>
          
          {/* Selection Status */}
          <div className="mt-3 text-xs text-gray-600">
            {selectedNumbers.length > 0 && (
              <p>
                {selectedNumbers.length}/5 numbers selected
                {powerball && ', Powerball selected'}
                {isSelectionComplete && ' ✅ Complete!'}
              </p>
            )}
          </div>
        </div>

        {/* Main Numbers Grid */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2 text-gray-700">
            Main Numbers (1-69): {selectedNumbers.length}/5
          </h4>
          <div className="grid grid-cols-10 gap-2">
            {Array.from({ length: 69 }, (_, i) => i + 1).map(num => {
              const isSelected = selectedNumbers.includes(num);
              const isDisabled = selectedNumbers.length >= 5 && !isSelected;
              
              return (
                <button
                  key={num}
                  onClick={() => toggleNumber(num)}
                  disabled={isDisabled}
                  className={`w-10 h-10 text-sm border rounded transition-all ${
                    isSelected 
                      ? 'bg-blue-500 text-white border-blue-500 shadow-md' 
                      : isDisabled
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-300 text-gray-900 cursor-pointer'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Powerball Grid */}
        <div>
          <h4 className="text-sm font-medium mb-2 text-gray-700">
            Powerball (1-26): {powerball ? '1/1' : '0/1'}
          </h4>
          <div className="grid grid-cols-13 gap-2">
            {Array.from({ length: 26 }, (_, i) => i + 1).map(num => {
              const isSelected = powerball === num;
              
              return (
                <button
                  key={num}
                  onClick={() => selectPowerball(num)}
                  className={`w-10 h-10 text-sm border rounded transition-all ${
                    isSelected 
                      ? 'bg-red-500 text-white border-red-500 shadow-md' 
                      : 'bg-white border-gray-300 hover:bg-red-50 hover:border-red-300 text-gray-900 cursor-pointer'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Selection Helpers */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">🎯 Quick Selection Helpers</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Birthdate Helper */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">📅 Birthday Numbers</h4>
            <p className="text-xs text-gray-600 mb-2">Use special dates (limited to 1-31)</p>
            <button
              onClick={() => {
                const today = new Date();
                const numbers = [
                  today.getDate(),
                  today.getMonth() + 1,
                  Math.min(today.getFullYear() % 100, 31),
                  Math.min(Math.floor(Math.random() * 31) + 1, 69),
                  Math.min(Math.floor(Math.random() * 31) + 1, 69)
                ].slice(0, 5);
                
                // Ensure no duplicates and fill to 5
                const uniqueNumbers = [...new Set(numbers)];
                while (uniqueNumbers.length < 5) {
                  const num = Math.floor(Math.random() * 69) + 1;
                  if (!uniqueNumbers.includes(num)) {
                    uniqueNumbers.push(num);
                  }
                }
                
                setSelectedNumbers(uniqueNumbers.sort((a, b) => a - b));
                setPowerball(Math.floor(Math.random() * 26) + 1);
              }}
              className="btn btn-secondary btn-sm w-full"
            >
              Use Today's Date
            </button>
          </div>
          
          {/* Lucky 7s */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">🍀 Lucky 7s Pattern</h4>
            <p className="text-xs text-gray-600 mb-2">Numbers with 7 or multiples of 7</p>
            <button
              onClick={() => {
                const luckyNumbers = [7, 14, 17, 21, 27, 35, 42, 49, 56, 63];
                const selected = [];
                
                while (selected.length < 5) {
                  const randomLucky = luckyNumbers[Math.floor(Math.random() * luckyNumbers.length)];
                  if (!selected.includes(randomLucky)) {
                    selected.push(randomLucky);
                  }
                }
                
                setSelectedNumbers(selected.sort((a, b) => a - b));
                setPowerball(7);
              }}
              className="btn btn-secondary btn-sm w-full"
            >
              Lucky 7s
            </button>
          </div>
          
          {/* High/Low Balance */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">⚖️ Balanced Pick</h4>
            <p className="text-xs text-gray-600 mb-2">Mix of high (36-69) and low (1-35) numbers</p>
            <button
              onClick={() => {
                const lowNumbers = [];
                const highNumbers = [];
                
                // Select 2-3 low numbers
                while (lowNumbers.length < 3) {
                  const num = Math.floor(Math.random() * 35) + 1;
                  if (!lowNumbers.includes(num)) lowNumbers.push(num);
                }
                
                // Select 2-3 high numbers
                while (highNumbers.length < 2) {
                  const num = Math.floor(Math.random() * 34) + 36;
                  if (!highNumbers.includes(num)) highNumbers.push(num);
                }
                
                const balanced = [...lowNumbers, ...highNumbers].sort((a, b) => a - b);
                setSelectedNumbers(balanced);
                setPowerball(Math.floor(Math.random() * 26) + 1);
              }}
              className="btn btn-secondary btn-sm w-full"
            >
              Balanced Mix
            </button>
          </div>
          
          {/* Even/Odd Mix */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">🔢 Even/Odd Mix</h4>
            <p className="text-xs text-gray-600 mb-2">Balanced even and odd numbers</p>
            <button
              onClick={() => {
                const evenNumbers = [];
                const oddNumbers = [];
                
                // Select 2-3 even numbers
                while (evenNumbers.length < 3) {
                  const num = (Math.floor(Math.random() * 34) + 1) * 2;
                  if (num <= 69 && !evenNumbers.includes(num)) evenNumbers.push(num);
                }
                
                // Select 2-3 odd numbers
                while (oddNumbers.length < 2) {
                  const num = (Math.floor(Math.random() * 35) * 2) + 1;
                  if (num <= 69 && !oddNumbers.includes(num)) oddNumbers.push(num);
                }
                
                const mixed = [...evenNumbers, ...oddNumbers].sort((a, b) => a - b);
                setSelectedNumbers(mixed);
                setPowerball(Math.floor(Math.random() * 26) + 1);
              }}
              className="btn btn-secondary btn-sm w-full"
            >
              Even/Odd Mix
            </button>
          </div>
        </div>
      </div>

      {/* Saved Selections */}
      {savedSelections.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">💾 Saved Selections</h3>
          
          <div className="space-y-2">
            {savedSelections.map((selection) => (
              <div 
                key={selection.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {selection.numbers.map(num => (
                      <span key={num} className="number-display text-xs">
                        {num}
                      </span>
                    ))}
                    <span className="powerball-display text-xs">
                      PB: {selection.powerball}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Saved: {selection.timestamp}
                  </p>
                </div>
                
                <div className="flex gap-1">
                  <button
                    onClick={() => loadSelection(selection)}
                    className="btn btn-secondary btn-sm"
                    title="Load this selection"
                  >
                    📥
                  </button>
                  <button
                    onClick={() => copySelection(selection.numbers, selection.powerball)}
                    className="btn btn-secondary btn-sm"
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                  <button
                    onClick={() => deleteSelection(selection.id)}
                    className="btn btn-secondary btn-sm"
                    title="Delete this selection"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {savedSelections.length >= 10 && (
            <p className="text-xs text-gray-500 mt-2">
              ℹ️ Maximum 10 selections saved. Oldest will be removed when adding new ones.
            </p>
          )}
        </div>
      )}
    </div>
  );
}