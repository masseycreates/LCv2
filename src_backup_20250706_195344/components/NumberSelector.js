// LCv2 Number Selector Component - Manual Number Selection
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { LOTTERY_RULES, SUCCESS_MESSAGES } from '../utils/constants.js';
import { 
  isValidMainNumber, 
  isValidPowerball, 
  generateQuickPick, 
  formatNumbers,
  saveToStorage,
  loadFromStorage 
} from '../utils/helpers.js';

export default function NumberSelector({ historicalStats, dataStatus, setDataStatus }) {
  
  // ===========================================================================
  // STATE MANAGEMENT
  // ===========================================================================
  
  // Current selection state
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [powerball, setPowerball] = useState('');
  
  // Saved selections
  const [savedSelections, setSavedSelections] = useState([]);
  
  // UI state
  const [selectionMode, setSelectionMode] = useState('manual'); // 'manual', 'quick-pick', 'pattern'
  const [showStatistics, setShowStatistics] = useState(false);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'hot', 'cold', 'overdue'

  // ===========================================================================
  // EFFECTS
  // ===========================================================================
  
  // Load saved selections on mount
  useEffect(() => {
    const saved = loadFromStorage('lcv2_saved_selections', []);
    setSavedSelections(saved);
  }, []);

  // Save selections when they change
  useEffect(() => {
    saveToStorage('lcv2_saved_selections', savedSelections);
  }, [savedSelections]);

  // ===========================================================================
  // COMPUTED VALUES
  // ===========================================================================
  
  const numberStatistics = useMemo(() => {
    if (!historicalStats || !historicalStats.drawings) return {};
    
    const frequency = {};
    const lastDrawn = {};
    const drawings = historicalStats.drawings;
    
    // Initialize counters
    for (let i = 1; i <= 69; i++) {
      frequency[i] = 0;
      lastDrawn[i] = drawings.length; // Start with max gap
    }
    
    // Count frequencies and track last drawn
    drawings.forEach((drawing, index) => {
      if (drawing.numbers) {
        drawing.numbers.forEach(num => {
          if (num >= 1 && num <= 69) {
            frequency[num]++;
            lastDrawn[num] = Math.min(lastDrawn[num], index);
          }
        });
      }
    });
    
    // Calculate statistics
    const sortedByFreq = Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }));
    
    const hot = sortedByFreq.slice(0, 15);
    const cold = sortedByFreq.slice(-15);
    const overdue = Object.entries(lastDrawn)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([num, gap]) => ({ number: parseInt(num), gap }));
    
    return { frequency, lastDrawn, hot, cold, overdue, total: drawings.length };
  }, [historicalStats]);

  const filteredNumbers = useMemo(() => {
    const allNumbers = Array.from({ length: 69 }, (_, i) => i + 1);
    
    if (filterMode === 'all') return allNumbers;
    
    if (!numberStatistics.hot) return allNumbers;
    
    switch (filterMode) {
      case 'hot':
        return numberStatistics.hot.map(item => item.number);
      case 'cold':
        return numberStatistics.cold.map(item => item.number);
      case 'overdue':
        return numberStatistics.overdue.map(item => item.number);
      default:
        return allNumbers;
    }
  }, [filterMode, numberStatistics]);

  const isSelectionComplete = selectedNumbers.length === 5 && powerball;
  
  const selectionSummary = useMemo(() => {
    if (selectedNumbers.length === 0) return null;
    
    const sum = selectedNumbers.reduce((acc, num) => acc + num, 0);
    const evenCount = selectedNumbers.filter(num => num % 2 === 0).length;
    const lowCount = selectedNumbers.filter(num => num <= 35).length;
    const highCount = selectedNumbers.filter(num => num > 35).length;
    
    return {
      sum,
      evenCount,
      oddCount: selectedNumbers.length - evenCount,
      lowCount,
      highCount,
      range: selectedNumbers.length > 0 ? Math.max(...selectedNumbers) - Math.min(...selectedNumbers) : 0
    };
  }, [selectedNumbers]);

  // ===========================================================================
  // EVENT HANDLERS
  // ===========================================================================
  
  const toggleNumber = useCallback((num) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(prev => prev.filter(n => n !== num));
    } else if (selectedNumbers.length < LOTTERY_RULES.mainNumbers.count) {
      setSelectedNumbers(prev => [...prev, num].sort((a, b) => a - b));
    } else {
      setDataStatus('?? You can only select 5 main numbers');
      setTimeout(() => setDataStatus(''), 3000);
    }
  }, [selectedNumbers, setDataStatus]);

  const selectPowerball = useCallback((num) => {
    setPowerball(num);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNumbers([]);
    setPowerball('');
    setDataStatus('??? Selection cleared');
    setTimeout(() => setDataStatus(''), 2000);
  }, [setDataStatus]);

  const quickPick = useCallback(() => {
    const pick = generateQuickPick();
    setSelectedNumbers(pick.numbers);
    setPowerball(pick.powerball);
    setDataStatus('?? Quick pick generated');
    setTimeout(() => setDataStatus(''), 2000);
  }, [setDataStatus]);

  const saveSelection = useCallback(() => {
    if (!isSelectionComplete) {
      alert('Please select 5 numbers and a Powerball number first.');
      return;
    }
    
    const newSelection = {
      id: Date.now(),
      numbers: [...selectedNumbers],
      powerball: powerball,
      timestamp: new Date().toLocaleString(),
      formatted: formatNumbers(selectedNumbers, powerball),
      name: `Selection ${savedSelections.length + 1}`
    };
    
    setSavedSelections(prev => [newSelection, ...prev.slice(0, 19)]); // Keep max 20
    setDataStatus('?? Selection saved successfully');
    setTimeout(() => setDataStatus(''), 3000);
  }, [isSelectionComplete, selectedNumbers, powerball, savedSelections.length, setDataStatus]);

  const loadSelection = useCallback((selection) => {
    setSelectedNumbers(selection.numbers);
    setPowerball(selection.powerball);
    setDataStatus(`?? Loaded: ${selection.name}`);
    setTimeout(() => setDataStatus(''), 3000);
  }, [setDataStatus]);

  const deleteSelection = useCallback((id) => {
    setSavedSelections(prev => prev.filter(sel => sel.id !== id));
    setDataStatus('??? Selection deleted');
    setTimeout(() => setDataStatus(''), 2000);
  }, [setDataStatus]);

  const copySelection = useCallback((numbers = selectedNumbers, pb = powerball) => {
    if (numbers.length === 5 && pb) {
      const formatted = formatNumbers(numbers, pb);
      navigator.clipboard.writeText(formatted);
      setDataStatus(`?? Copied: ${formatted}`);
      setTimeout(() => setDataStatus(''), 3000);
    } else {
      alert('Please complete your selection first.');
    }
  }, [selectedNumbers, powerball, setDataStatus]);

  const generatePattern = useCallback((patternType) => {
    let numbers = [];
    
    switch (patternType) {
      case 'diagonal':
        numbers = [7, 14, 28, 42, 56];
        break;
      case 'corners':
        numbers = [1, 69, 35, 36, 37];
        break;
      case 'cross':
        numbers = [35, 21, 49, 28, 42];
        break;
      case 'lucky':
        numbers = [7, 11, 21, 33, 47];
        break;
      default:
        numbers = generateQuickPick().numbers;
    }
    
    setSelectedNumbers(numbers);
    setPowerball(Math.floor(Math.random() * 26) + 1);
    setDataStatus(`?? ${patternType} pattern applied`);
    setTimeout(() => setDataStatus(''), 3000);
  }, [setDataStatus]);

  // ===========================================================================
  // RENDER HELPERS
  // ===========================================================================
  
  const renderCurrentSelection = () => (
    <div className="card mb-6">
      <div className="card-header">
        <h3 className="card-title">?? Your Current Selection</h3>
        <p className="card-subtitle">
          Select {5 - selectedNumbers.length} more numbers and {powerball ? '0' : '1'} Powerball
        </p>
      </div>
      
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          {/* Main Numbers */}
          <div className="flex gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div 
                key={i} 
                className={`number-ball ${
                  selectedNumbers[i] ? 'number-ball-selected' : 'border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400'
                }`}
              >
                {selectedNumbers[i] || '?'}
              </div>
            ))}
          </div>
          
          {/* Separator */}
          <div className="text-2xl text-gray-400 font-bold">|</div>
          
          {/* Powerball */}
          <div className={`number-ball ${
            powerball ? 'number-ball-powerball' : 'border-2 border-dashed border-red-300 bg-red-50 text-red-400'
          }`}>
            {powerball || '?'}
          </div>
        </div>
        
        {isSelectionComplete && (
          <div className="text-sm text-green-600 font-medium">
            ? Selection Complete: {formatNumbers(selectedNumbers, powerball)}
          </div>
        )}
      </div>
      
      {/* Selection Summary */}
      {selectionSummary && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">?? Selection Analysis</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-gray-500">Sum:</span>
              <span className="ml-1 font-medium">{selectionSummary.sum}</span>
            </div>
            <div>
              <span className="text-gray-500">Even/Odd:</span>
              <span className="ml-1 font-medium">{selectionSummary.evenCount}/{selectionSummary.oddCount}</span>
            </div>
            <div>
              <span className="text-gray-500">Low/High:</span>
              <span className="ml-1 font-medium">{selectionSummary.lowCount}/{selectionSummary.highCount}</span>
            </div>
            <div>
              <span className="text-gray-500">Range:</span>
              <span className="ml-1 font-medium">{selectionSummary.range}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button onClick={quickPick} className="btn btn-primary">
          ?? Quick Pick
        </button>
        <button 
          onClick={clearSelection} 
          className="btn btn-secondary"
          disabled={selectedNumbers.length === 0 && !powerball}
        >
          ??? Clear
        </button>
        <button 
          onClick={saveSelection} 
          className="btn btn-success"
          disabled={!isSelectionComplete}
        >
          ?? Save
        </button>
        <button 
          onClick={() => copySelection()} 
          className="btn btn-outline"
          disabled={!isSelectionComplete}
        >
          ?? Copy
        </button>
      </div>
    </div>
  );

  const renderSelectionModes = () => (
    <div className="card mb-6">
      <div className="card-header">
        <h3 className="card-title">?? Selection Tools</h3>
        <p className="card-subtitle">Choose how you want to select your numbers</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Filter Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ?? Number Filter
          </label>
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Numbers</option>
            <option value="hot">Hot Numbers (Most Frequent)</option>
            <option value="cold">Cold Numbers (Least Frequent)</option>
            <option value="overdue">Overdue Numbers</option>
          </select>
        </div>
        
        {/* Quick Patterns */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ?? Quick Patterns
          </label>
          <select
            onChange={(e) => e.target.value && generatePattern(e.target.value)}
            value=""
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Pattern...</option>
            <option value="diagonal">Diagonal Pattern</option>
            <option value="corners">Corner Numbers</option>
            <option value="cross">Cross Pattern</option>
            <option value="lucky">Lucky Numbers</option>
          </select>
        </div>
        
        {/* Statistics Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ?? Statistics
          </label>
          <button
            onClick={() => setShowStatistics(!showStatistics)}
            className={`w-full btn ${showStatistics ? 'btn-primary' : 'btn-outline'}`}
          >
            {showStatistics ? 'Hide Stats' : 'Show Stats'}
          </button>
        </div>
        
        {/* Bulk Actions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ? Bulk Actions
          </label>
          <button
            onClick={() => {
              for (let i = 0; i < 5; i++) {
                setTimeout(() => quickPick(), i * 100);
              }
            }}
            className="w-full btn btn-secondary"
          >
            Generate 5 Sets
          </button>
        </div>
      </div>
    </div>
  );

  const renderNumberGrid = () => (
    <div className="card mb-6">
      <div className="card-header">
        <h3 className="card-title">
          ?? Main Numbers (1-69) 
          {filterMode !== 'all' && (
            <span className="text-sm font-normal text-gray-600">
              - Showing {filterMode} numbers
            </span>
          )}
        </h3>
        <p className="card-subtitle">
          Select 5 numbers • {selectedNumbers.length}/5 selected
        </p>
      </div>
      
      <div className="number-grid number-grid-main">
        {Array.from({ length: 69 }, (_, i) => i + 1).map(num => {
          const isSelected = selectedNumbers.includes(num);
          const isDisabled = selectedNumbers.length >= 5 && !isSelected;
          const isFiltered = !filteredNumbers.includes(num);
          const stats = numberStatistics.frequency && numberStatistics.frequency[num];
          
          return (
            <button
              key={num}
              onClick={() => !isDisabled && !isFiltered && toggleNumber(num)}
              disabled={isDisabled || isFiltered}
              className={`number-ball relative ${
                isSelected ? 'number-ball-selected' : 
                isDisabled || isFiltered ? 'number-ball-disabled' : 'number-ball-main'
              }`}
              title={
                stats ? `Frequency: ${stats} (${((stats / numberStatistics.total) * 100).toFixed(1)}%)` : 
                `Number ${num}`
              }
            >
              {num}
              {showStatistics && stats && (
                <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {Math.round((stats / numberStatistics.total) * 100)}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderPowerballGrid = () => (
    <div className="card mb-6">
      <div className="card-header">
        <h3 className="card-title">? Powerball (1-26)</h3>
        <p className="card-subtitle">
          Select 1 Powerball number {powerball && `• Selected: ${powerball}`}
        </p>
      </div>
      
      <div className="number-grid number-grid-powerball">
        {Array.from({ length: 26 }, (_, i) => i + 1).map(num => (
          <button
            key={num}
            onClick={() => selectPowerball(num)}
            className={`number-ball ${
              powerball === num ? 'number-ball-powerball border-red-500 ring-2 ring-red-200' : 
              'border-2 border-red-300 text-red-700 hover:bg-red-50'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );

  const renderSavedSelections = () => (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">?? Saved Selections ({savedSelections.length}/20)</h3>
        <p className="card-subtitle">Your saved number combinations</p>
      </div>
      
      {savedSelections.length > 0 ? (
        <div className="space-y-3">
          {savedSelections.map(selection => (
            <div 
              key={selection.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900 mb-1">
                  {selection.name}
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  {selection.formatted}
                </div>
                <div className="text-xs text-gray-500">
                  Saved: {selection.timestamp}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => loadSelection(selection)}
                  className="btn btn-sm btn-primary"
                  title="Load this selection"
                >
                  ?? Load
                </button>
                <button
                  onClick={() => copySelection(selection.numbers, selection.powerball)}
                  className="btn btn-sm btn-outline"
                  title="Copy to clipboard"
                >
                  ??
                </button>
                <button
                  onClick={() => deleteSelection(selection.id)}
                  className="btn btn-sm btn-secondary text-red-600"
                  title="Delete this selection"
                >
                  ???
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">??</div>
          <p>No saved selections yet</p>
          <p className="text-sm">Complete a selection and click "Save" to store it here</p>
        </div>
      )}
    </div>
  );

  const renderStatistics = () => {
    if (!showStatistics || !numberStatistics.hot) return null;
    
    return (
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="card-title">?? Number Statistics</h3>
          <p className="card-subtitle">Based on {numberStatistics.total} historical drawings</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Hot Numbers */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">?? Hot Numbers</h4>
            <div className="space-y-1">
              {numberStatistics.hot.slice(0, 10).map(item => (
                <div key={item.number} className="flex justify-between text-sm">
                  <span>{item.number}</span>
                  <span className="text-gray-500">{item.frequency}x</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Cold Numbers */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">?? Cold Numbers</h4>
            <div className="space-y-1">
              {numberStatistics.cold.slice(0, 10).map(item => (
                <div key={item.number} className="flex justify-between text-sm">
                  <span>{item.number}</span>
                  <span className="text-gray-500">{item.frequency}x</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Overdue Numbers */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">? Overdue Numbers</h4>
            <div className="space-y-1">
              {numberStatistics.overdue.slice(0, 10).map(item => (
                <div key={item.number} className="flex justify-between text-sm">
                  <span>{item.number}</span>
                  <span className="text-gray-500">{item.gap} draws ago</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ===========================================================================
  // MAIN RENDER
  // ===========================================================================
  
  return (
    <div className="space-y-6">
      
      {/* Current Selection */}
      {renderCurrentSelection()}
      
      {/* Selection Tools */}
      {renderSelectionModes()}
      
      {/* Statistics */}
      {renderStatistics()}
      
      {/* Number Grids */}
      {renderNumberGrid()}
      {renderPowerballGrid()}
      
      {/* Saved Selections */}
      {renderSavedSelections()}
    </div>
  );
}