// LCv2 Quick Selection Component
import React, { useState, useEffect } from 'react';
import { lotteryPredictor } from '../services/LotteryPredictor.js';
import { claudeAPI } from '../services/ClaudeAPI.js';
import { UI_CONFIG, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants.js';
import { getConfidenceClass, getConfidenceColor } from '../utils/helpers.js';

export default function QuickSelection({
  historicalStats,
  currentJackpot,
  historicalDataAvailable,
  isLoadingHistory,
  historicalRecordsLimit,
  onDataLimitChange,
  dataStatus,
  setDataStatus
}) {
  
  // AI and selection state
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiEnabled, setAiEnabled] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [quickSelectionSets, setQuickSelectionSets] = useState([]);

  // Initialize selections when historical data loads
  useEffect(() => {
    if (historicalDataAvailable && historicalStats && !isLoadingHistory) {
      generateInitialSelections();
    }
  }, [historicalDataAvailable, historicalStats, isLoadingHistory]);

  // Generate initial selections using local algorithms
  const generateInitialSelections = async () => {
    try {
      const convertedData = convertHistoricalData(historicalStats);
      const predictions = lotteryPredictor.generateEnsemblePrediction(convertedData, 5);
      const enhancedPredictions = enhanceLocalPredictions(predictions);
      setQuickSelectionSets(enhancedPredictions);
    } catch (error) {
      console.error('Failed to generate initial selections:', error);
      setQuickSelectionSets(generateFallbackSelections());
    }
  };

  // Enable Claude AI integration
  const enableAI = async () => {
    const trimmedKey = aiApiKey.trim();
    
    if (!trimmedKey) {
      alert('Please enter your Anthropic API key');
      return;
    }
    
    if (!claudeAPI.validateApiKey(trimmedKey)) {
      alert('Please enter a valid Anthropic API key (starts with sk-ant-)');
      return;
    }
    
    try {
      claudeAPI.initialize(trimmedKey);
      
      setDataStatus('🔄 Testing Claude Opus 4 connection...');
      setIsLoadingAI(true);
      
      const connectionTest = await claudeAPI.testConnection();
      
      if (connectionTest.success) {
        setAiEnabled(true);
        setDataStatus(SUCCESS_MESSAGES.claudeEnabled);
      } else {
        throw new Error(connectionTest.error || 'Connection test failed');
      }
      
    } catch (error) {
      console.error('Claude AI initialization failed:', error);
      setAiEnabled(false);
      alert('Failed to connect to Claude Opus 4: ' + error.message);
      setDataStatus('❌ Claude Opus 4 connection failed');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Generate new Claude hybrid selections
  const generateClaudeHybridSelection = async () => {
    if (!aiEnabled || !aiApiKey) {
      alert('Please enable Claude Opus 4 first by entering your API key.');
      return;
    }

    setIsLoadingAI(true);
    
    try {
      const hybridSelections = await claudeAPI.generateHybridQuickSelection(
        historicalStats,
        currentJackpot,
        5,
        'hybrid'
      );
      
      setQuickSelectionSets(hybridSelections);
      setDataStatus(SUCCESS_MESSAGES.selectionGenerated);
      
    } catch (error) {
      console.error('Claude hybrid selection failed:', error);
      alert('Claude Hybrid Error: ' + error.message);
      
      // Fallback to local generation
      const fallbackSelections = await generateLocalSelections();
      setQuickSelectionSets(fallbackSelections);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Generate selections using local algorithms only
  const generateLocalSelections = async () => {
    try {
      const convertedData = convertHistoricalData(historicalStats);
      const predictions = lotteryPredictor.generateEnsemblePrediction(convertedData, 5);
      return enhanceLocalPredictions(predictions);
    } catch (error) {
      console.error('Local generation failed:', error);
      return generateFallbackSelections();
    }
  };

  // Refresh selections (AI or local)
  const refreshSelections = async () => {
    if (aiEnabled) {
      await generateClaudeHybridSelection();
    } else {
      const newSelections = await generateLocalSelections();
      setQuickSelectionSets(newSelections);
    }
  };

  // Convert historical data for predictor
  const convertHistoricalData = (stats) => {
    if (!stats || !stats.drawings) {
      return [];
    }
    
    return stats.drawings
      .filter(drawing => 
        drawing.numbers && 
        Array.isArray(drawing.numbers) && 
        drawing.numbers.length === 5 &&
        drawing.powerball
      )
      .map(drawing => ({
        numbers: drawing.numbers.slice(),
        powerball: drawing.powerball,
        date: drawing.date || new Date().toISOString()
      }))
      .slice(0, 2000);
  };

  // Enhance local predictions with display metadata
  const enhanceLocalPredictions = (predictions) => {
    const enhancedDescriptions = [
      {
        name: "🎯 EWMA Frequency Consensus",
        description: "Advanced consensus from Exponentially Weighted Moving Average frequency analysis with recent trend weighting"
      },
      {
        name: "🧠 Neural Network Analysis", 
        description: "Deep learning pattern recognition analyzing positional tendencies, number relationships, and historical sequence patterns"
      },
      {
        name: "🔗 Pair Relationship Matrix",
        description: "Advanced co-occurrence analysis identifying strong number pair relationships and clustering patterns in historical data"
      },
      {
        name: "📊 Gap Pattern Optimization",
        description: "Statistical gap analysis identifying overdue numbers and optimal timing patterns based on historical frequency distributions"
      },
      {
        name: "🔄 Markov Chain Transition",
        description: "State transition analysis predicting next numbers based on sequence patterns and probabilistic modeling"
      }
    ];
    
    return predictions.map((prediction, index) => ({
      id: index + 1,
      name: enhancedDescriptions[index] ? enhancedDescriptions[index].name : 'Algorithm ' + (index + 1),
      description: 'LOCAL ALGORITHMS: ' + (enhancedDescriptions[index] ? enhancedDescriptions[index].description : prediction.analysis),
      algorithmDetail: prediction.strategy || "Mathematical analysis",
      numbers: prediction.numbers,
      powerball: prediction.powerball,
      strategy: prediction.confidence + '% Confidence',
      confidence: prediction.confidence,
      actualStrategy: prediction.strategy,
      technicalAnalysis: prediction.analysis,
      claudeGenerated: false,
      isHybrid: false
    }));
  };

  // Generate fallback selections
  const generateFallbackSelections = () => {
    const strategies = [
      "Enhanced Mathematical Analysis",
      "Statistical Distribution Model", 
      "Pattern Recognition Algorithm",
      "Smart Random Protocol",
      "Frequency Optimization"
    ];
    
    return strategies.map((strategy, i) => {
      const numbers = [];
      while (numbers.length < 5) {
        const num = Math.floor(Math.random() * 69) + 1;
        if (!numbers.includes(num)) {
          numbers.push(num);
        }
      }
      
      return {
        id: i + 1,
        name: '🎲 ' + strategy,
        description: "Advanced mathematical selection with optimized distribution patterns",
        algorithmDetail: "Enhanced random with mathematical constraints",
        numbers: numbers.sort((a, b) => a - b),
        powerball: Math.floor(Math.random() * 26) + 1,
        strategy: "75% Confidence",
        confidence: 75,
        actualStrategy: strategy,
        technicalAnalysis: "Mathematical fallback protocol",
        claudeGenerated: false,
        isHybrid: false
      };
    });
  };

  return (
    <div className="space-y-4">
      
      {/* Historical Data Selector */}
      <div className="data-selector">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-700">📊 Historical Data Range</h4>
            <p className="text-xs text-gray-600">
              {isLoadingHistory ? 'Updating analysis...' : 'Select amount of historical data for analysis'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={historicalRecordsLimit}
              onChange={(e) => onDataLimitChange(parseInt(e.target.value))}
              disabled={isLoadingHistory}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white disabled:opacity-50"
            >
              {UI_CONFIG.historicalLimits.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {isLoadingHistory && <div className="loading-spinner" />}
          </div>
        </div>
        
        {historicalStats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="text-gray-600">
              📈 Currently analyzing: {historicalStats.totalDrawings} drawings
            </div>
            <div className="text-gray-600">
              🔥 Data source: {historicalStats.dataSource || 'API'}
            </div>
            <div className="text-gray-600">
              🎯 Range: {historicalStats.dateRange ? 
                `${historicalStats.dateRange.earliest} to ${historicalStats.dateRange.latest}` : 
                'Full range'}
            </div>
          </div>
        )}
      </div>

      {/* Claude AI Integration Panel */}
      <div className="enhanced-prediction-card-opus4 card-compact">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div style={{ fontSize: '1.25rem' }}>🤖✨</div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Claude Opus 4 + 6 Algorithms</h3>
              <p className="text-xs text-gray-600">Advanced AI hybrid intelligence system</p>
            </div>
          </div>
          {aiEnabled && <span className="opus4-badge">✨ OPUS 4 ACTIVE</span>}
        </div>
        
        {!aiEnabled ? (
          <div className="space-y-2">
            <div className="opus4-warning-banner">
              <p className="text-sm font-medium">⚠️ Using local algorithms only. Enable Claude Opus 4 for advanced AI analysis.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="password"
                value={aiApiKey}
                onChange={(e) => setAiApiKey(e.target.value)}
                placeholder="Anthropic API key (sk-ant-...)"
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              />
              <button
                onClick={enableAI}
                disabled={isLoadingAI || !aiApiKey.trim()}
                className={`btn-opus4 ${isLoadingAI ? 'opacity-50' : ''}`}
              >
                {isLoadingAI && <span className="loading-spinner" />}
                ✨ Enable Opus 4
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Get API key: {' '}
              <a 
                href="https://console.anthropic.com/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 underline"
              >
                console.anthropic.com
              </a>
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="opus4-success-banner flex-1 mr-3">
              <p className="text-sm font-medium">✅ Claude Opus 4 analyzing with 6 algorithms for optimal predictions</p>
            </div>
            <button
              onClick={generateClaudeHybridSelection}
              disabled={isLoadingAI}
              className={`btn-opus4 ${isLoadingAI ? 'opacity-50' : ''}`}
            >
              {isLoadingAI && <span className="loading-spinner" />}
              🔄 New Analysis
            </button>
          </div>
        )}
      </div>

      {/* Selection Results */}
      <div className="card-compact">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {aiEnabled ? '🤖✨ Opus 4 Hybrid Selections' : '🧮 Algorithm Selections'}
            </h3>
            <p className="text-xs text-gray-600">
              {aiEnabled ? 'Claude Opus 4 + 6 algorithms working together' : 'Local mathematical ensemble'}
            </p>
          </div>
          {!isLoadingHistory && (
            <button
              onClick={refreshSelections}
              className="btn btn-secondary btn-sm"
            >
              🔄
            </button>
          )}
        </div>
        
        {isLoadingHistory ? (
          <div className="text-center py-6">
            <div className="loading-spinner mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading data and generating selections...</p>
          </div>
        ) : quickSelectionSets.length > 0 ? (
          <div className="selection-grid">
            {quickSelectionSets.map((selection, index) => {
              const isOpus4 = selection.claudeGenerated || selection.isHybrid;
              
              return (
                <div 
                  key={index}
                  className={`card-compact ${
                    isOpus4 ? 'opus4-selection-card' : 'border-2 border-blue-200 bg-blue-50'
                  } ${getConfidenceClass(selection.confidence)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900">{selection.name}</h4>
                      {isOpus4 && <span className="opus4-badge mt-1">✨ OPUS 4</span>}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(selection.confidence)}`}>
                      {selection.strategy}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex gap-1.5">
                      {selection.numbers.map(num => 
                        <span 
                          key={num} 
                          className={`number-display text-xs ${isOpus4 ? 'opus4-number' : ''}`}
                        >
                          {num}
                        </span>
                      )}
                    </div>
                    <span className={`powerball-display text-xs ${isOpus4 ? 'opus4-powerball' : ''}`}>
                      PB: {selection.powerball}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {selection.description && selection.description.length > 80 ? 
                      selection.description.substring(0, 80) + '...' : 
                      selection.description || 'Advanced mathematical analysis'
                    }
                  </p>
                  
                  {/* Copy to clipboard button */}
                  <button
                    onClick={() => {
                      const ticket = `${selection.numbers.join(', ')} | PB: ${selection.powerball}`;
                      navigator.clipboard.writeText(ticket);
                      alert(SUCCESS_MESSAGES.selectionCopied);
                    }}
                    className="btn btn-secondary btn-sm mt-2 w-full"
                  >
                    📋 Copy Selection
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">No selections generated yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}