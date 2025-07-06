// LCv2 Quick Selection Component - Claude Sonnet 4 + 6 Algorithms Hybrid
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { lotteryPredictor } from '../services/LotteryPredictor.js';
import { claudeAPI } from '../services/ClaudeAPI.js';
import { UI_CONFIG, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants.js';
import { getConfidenceClass, getConfidenceColor, formatNumbers, generateQuickPick } from '../utils/helpers.js';

export default function QuickSelection({
  historicalStats,
  currentJackpot,
  historicalDataAvailable,
  isLoadingHistory,
  historicalRecordsLimit,
  onDataLimitChange,
  dataStatus,
  setDataStatus,
  liveDataAvailable
}) {
  
  // ===========================================================================
  // STATE MANAGEMENT
  // ===========================================================================
  
  // AI Integration State
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiEnabled, setAiEnabled] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiConnectionStatus, setAiConnectionStatus] = useState('disconnected');
  
  // Selection State
  const [quickSelectionSets, setQuickSelectionSets] = useState([]);
  const [isGeneratingSelections, setIsGeneratingSelections] = useState(false);
  const [selectedSetIds, setSelectedSetIds] = useState([]);
  const [lastGenerationTime, setLastGenerationTime] = useState(null);
  
  // Configuration State
  const [selectionMode, setSelectionMode] = useState('hybrid'); // 'hybrid', 'ai-only', 'algorithms-only'
  const [numberOfSets, setNumberOfSets] = useState(5);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // ===========================================================================
  // EFFECTS
  // ===========================================================================
  
  // Initialize selections when historical data loads
  useEffect(() => {
    if (historicalDataAvailable && historicalStats && !isLoadingHistory && quickSelectionSets.length === 0) {
      generateInitialSelections();
    }
  }, [historicalDataAvailable, historicalStats, isLoadingHistory]);

  // Auto-refresh selections if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    
    const refreshInterval = setInterval(() => {
      if (aiEnabled) {
        generateClaudeHybridSelections();
      } else {
        generateAlgorithmSelections();
      }
    }, 5 * 60 * 1000); // Every 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, [autoRefresh, aiEnabled]);

  // ===========================================================================
  // CONFIGURATION OPTIONS
  // ===========================================================================
  
  const historicalDataOptions = useMemo(() => [
    { value: 100, label: '100 drawings (3 months)', recommended: false },
    { value: 250, label: '250 drawings (8 months)', recommended: true },
    { value: 500, label: '500 drawings (16 months)', recommended: false },
    { value: 750, label: '750 drawings (2 years)', recommended: false },
    { value: 1000, label: '1000 drawings (3 years)', recommended: false }
  ], []);

  const selectionModeOptions = useMemo(() => [
    { 
      value: 'hybrid', 
      label: 'AI + Algorithms Hybrid', 
      icon: '???',
      description: 'Claude Sonnet 4 enhanced with 6 mathematical algorithms',
      requiresAI: true
    },
    { 
      value: 'ai-only', 
      label: 'Claude AI Only', 
      icon: '??',
      description: 'Pure Claude Sonnet 4 analysis and predictions',
      requiresAI: true
    },
    { 
      value: 'algorithms-only', 
      label: 'Algorithms Only', 
      icon: '??',
      description: '6 mathematical algorithms without AI enhancement',
      requiresAI: false
    }
  ], []);

  // ===========================================================================
  // AI INTEGRATION FUNCTIONS
  // ===========================================================================
  
  const enableClaudeAI = useCallback(async () => {
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
      setIsLoadingAI(true);
      setDataStatus('?? Testing Claude Sonnet 4 connection...');
      setAiConnectionStatus('connecting');
      
      claudeAPI.initialize(trimmedKey);
      
      const connectionTest = await claudeAPI.testConnection();
      
      if (connectionTest.success) {
        setAiEnabled(true);
        setAiConnectionStatus('connected');
        setDataStatus('? Claude Sonnet 4 connected successfully');
        
        // Generate initial AI-enhanced selections
        await generateClaudeHybridSelections();
        
      } else {
        throw new Error(connectionTest.error || 'Connection test failed');
      }
      
    } catch (error) {
      console.error('Claude AI initialization failed:', error);
      setAiEnabled(false);
      setAiConnectionStatus('error');
      alert(`Failed to connect to Claude Sonnet 4: ${error.message}`);
      setDataStatus('? Claude Sonnet 4 connection failed');
    } finally {
      setIsLoadingAI(false);
    }
  }, [aiApiKey, setDataStatus]);

  const disconnectClaudeAI = useCallback(() => {
    setAiEnabled(false);
    setAiConnectionStatus('disconnected');
    setAiApiKey('');
    setSelectionMode('algorithms-only');
    setDataStatus('?? Claude Sonnet 4 disconnected');
    
    // Regenerate with algorithms only
    generateAlgorithmSelections();
  }, [setDataStatus]);

  // ===========================================================================
  // SELECTION GENERATION FUNCTIONS
  // ===========================================================================
  
  const generateInitialSelections = useCallback(async () => {
    try {
      setIsGeneratingSelections(true);
      
      if (aiEnabled && selectionMode !== 'algorithms-only') {
        await generateClaudeHybridSelections();
      } else {
        await generateAlgorithmSelections();
      }
      
    } catch (error) {
      console.error('Failed to generate initial selections:', error);
      setDataStatus(`? Selection generation failed: ${error.message}`);
      generateFallbackSelections();
    } finally {
      setIsGeneratingSelections(false);
    }
  }, [aiEnabled, selectionMode]);

  const generateAlgorithmSelections = useCallback(async () => {
    try {
      setIsGeneratingSelections(true);
      setDataStatus('?? Generating algorithm-based selections...');
      
      const convertedData = convertHistoricalDataForPredictor(historicalStats);
      const predictions = lotteryPredictor.generateEnsemblePrediction(convertedData, numberOfSets);
      const enhancedPredictions = enhanceAlgorithmPredictions(predictions);
      
      setQuickSelectionSets(enhancedPredictions);
      setLastGenerationTime(new Date());
      setDataStatus('? Algorithm selections generated');
      
    } catch (error) {
      console.error('Algorithm selection generation failed:', error);
      setDataStatus(`? Algorithm generation failed: ${error.message}`);
      generateFallbackSelections();
    } finally {
      setIsGeneratingSelections(false);
    }
  }, [historicalStats, numberOfSets, setDataStatus]);

  const generateClaudeHybridSelections = useCallback(async () => {
    if (!aiEnabled || !aiApiKey) {
      alert('Please enable Claude Sonnet 4 first by entering your API key.');
      return;
    }
    
    try {
      setIsGeneratingSelections(true);
      setDataStatus('??? Generating Claude Sonnet 4 hybrid selections...');
      
      // First generate algorithm predictions
      const convertedData = convertHistoricalDataForPredictor(historicalStats);
      const algorithmPredictions = lotteryPredictor.generateEnsemblePrediction(convertedData, numberOfSets);
      
      // Enhance with Claude AI
      const claudeResponse = await claudeAPI.generateHybridSelection({
        historicalData: sanitizeHistoricalDataForAPI(historicalStats),
        currentJackpot: currentJackpot,
        requestedSets: numberOfSets,
        strategy: selectionMode,
        localAlgorithmResults: algorithmPredictions.slice(0, 3) // Send top 3 algorithm results
      });
      
      if (claudeResponse.success) {
        const hybridSelections = processClaudeHybridResponse(claudeResponse.data, algorithmPredictions);
        setQuickSelectionSets(hybridSelections);
        setLastGenerationTime(new Date());
        setDataStatus('? Claude Sonnet 4 hybrid selections generated');
      } else {
        throw new Error(claudeResponse.error || 'Claude AI generation failed');
      }
      
    } catch (error) {
      console.error('Claude hybrid selection generation failed:', error);
      setDataStatus(`? Claude generation failed: ${error.message}`);
      
      // Fallback to algorithm-only selections
      await generateAlgorithmSelections();
    } finally {
      setIsGeneratingSelections(false);
    }
  }, [aiEnabled, aiApiKey, historicalStats, currentJackpot, numberOfSets, selectionMode, setDataStatus]);

  const generateFallbackSelections = useCallback(() => {
    const fallbackSets = Array.from({ length: numberOfSets }, (_, i) => {
      const quickPick = generateQuickPick();
      return {
        id: i + 1,
        name: `?? Quick Pick ${i + 1}`,
        description: 'Random selection with mathematical constraints',
        algorithmDetail: 'Enhanced random generation',
        numbers: quickPick.numbers,
        powerball: quickPick.powerball,
        strategy: '70% Base Confidence',
        confidence: 70,
        actualStrategy: 'Fallback Random',
        technicalAnalysis: 'Mathematical fallback protocol',
        claudeGenerated: false,
        isHybrid: false,
        source: 'fallback'
      };
    });
    
    setQuickSelectionSets(fallbackSets);
    setLastGenerationTime(new Date());
  }, [numberOfSets]);

  // ===========================================================================
  // HELPER FUNCTIONS
  // ===========================================================================
  
  const convertHistoricalDataForPredictor = (stats) => {
    if (!stats || !stats.drawings) return [];
    
    return stats.drawings
      .filter(drawing => drawing.numbers && drawing.powerball)
      .map(drawing => ({
        numbers: [...drawing.numbers],
        powerball: drawing.powerball,
        date: drawing.date || new Date().toISOString()
      }))
      .slice(0, historicalRecordsLimit);
  };

  const enhanceAlgorithmPredictions = (predictions) => {
    const algorithmNames = [
      'EWMA Frequency Consensus',
      'Neural Network Pattern Recognition',
      'Pair Relationship Analysis',
      'Gap Analysis Optimization',
      'Markov Chain Transition',
      'Sum Range Optimization'
    ];
    
    return predictions.map((prediction, index) => ({
      id: index + 1,
      name: `?? ${algorithmNames[index] || `Algorithm ${index + 1}`}`,
      description: `Mathematical analysis using ${algorithmNames[index]?.toLowerCase() || 'advanced algorithms'}`,
      algorithmDetail: prediction.strategy || 'Mathematical pattern analysis',
      numbers: prediction.numbers,
      powerball: prediction.powerball,
      strategy: `${prediction.confidence}% Algorithm Confidence`,
      confidence: prediction.confidence,
      actualStrategy: algorithmNames[index] || prediction.strategy,
      technicalAnalysis: prediction.analysis || 'Statistical pattern recognition',
      claudeGenerated: false,
      isHybrid: false,
      source: 'algorithm'
    }));
  };

  const sanitizeHistoricalDataForAPI = (stats) => {
    if (!stats || !stats.drawings) return { drawings: [], totalDrawings: 0 };
    
    const maxDrawings = 50; // Limit for API transmission
    const sanitizedDrawings = stats.drawings
      .slice(0, maxDrawings)
      .filter(drawing => drawing.numbers && drawing.powerball)
      .map(drawing => ({
        numbers: drawing.numbers,
        powerball: drawing.powerball,
        date: drawing.date || 'Unknown'
      }));
    
    return {
      drawings: sanitizedDrawings,
      totalDrawings: stats.totalDrawings || sanitizedDrawings.length,
      hotNumbers: (stats.hotNumbers || []).slice(0, 10),
      coldNumbers: (stats.coldNumbers || []).slice(0, 10)
    };
  };

  const processClaudeHybridResponse = (claudeData, algorithmPredictions) => {
    try {
      // Process Claude's enhanced selections
      const claudeSelections = claudeData.selections || [];
      const hybridSelections = [];
      
      // Add Claude-enhanced selections
      claudeSelections.forEach((selection, index) => {
        hybridSelections.push({
          id: index + 1,
          name: `??? ${selection.name || `Claude Hybrid ${index + 1}`}`,
          description: selection.description || 'Claude Sonnet 4 enhanced prediction',
          algorithmDetail: selection.algorithmDetail || 'AI-enhanced mathematical analysis',
          numbers: selection.numbers,
          powerball: selection.powerball,
          strategy: `${selection.confidence}% Claude Confidence`,
          confidence: selection.confidence,
          actualStrategy: selection.actualStrategy || 'Claude AI Enhanced',
          technicalAnalysis: selection.technicalAnalysis || claudeData.analysis,
          claudeGenerated: true,
          isHybrid: true,
          claudeInsights: selection.insights,
          source: 'claude-hybrid'
        });
      });
      
      // Add remaining algorithm selections if needed
      const remainingSlots = numberOfSets - hybridSelections.length;
      if (remainingSlots > 0) {
        const enhancedAlgorithms = enhanceAlgorithmPredictions(algorithmPredictions.slice(0, remainingSlots));
        hybridSelections.push(...enhancedAlgorithms.map(sel => ({ ...sel, id: hybridSelections.length + sel.id })));
      }
      
      return hybridSelections.slice(0, numberOfSets);
      
    } catch (error) {
      console.error('Failed to process Claude response:', error);
      return enhanceAlgorithmPredictions(algorithmPredictions);
    }
  };

  // ===========================================================================
  // SELECTION MANAGEMENT
  // ===========================================================================
  
  const toggleSelection = useCallback((setId) => {
    setSelectedSetIds(prev => 
      prev.includes(setId) 
        ? prev.filter(id => id !== setId)
        : [...prev, setId]
    );
  }, []);

  const copySelection = useCallback((selection) => {
    const formattedNumbers = formatNumbers(selection.numbers, selection.powerball);
    navigator.clipboard.writeText(formattedNumbers);
    setDataStatus(`?? Copied: ${formattedNumbers}`);
    setTimeout(() => setDataStatus(''), 3000);
  }, [setDataStatus]);

  const copyAllSelections = useCallback(() => {
    const allFormatted = quickSelectionSets
      .map((selection, index) => `Set ${index + 1}: ${formatNumbers(selection.numbers, selection.powerball)}`)
      .join('\n');
    
    navigator.clipboard.writeText(allFormatted);
    setDataStatus(`?? Copied all ${quickSelectionSets.length} selections`);
    setTimeout(() => setDataStatus(''), 3000);
  }, [quickSelectionSets, setDataStatus]);

  // ===========================================================================
  // RENDER HELPERS
  // ===========================================================================
  
  const renderAISetupSection = () => (
    <div className="card mb-6">
      <div className="card-header">
        <h3 className="card-title">?? Claude Sonnet 4 AI Integration</h3>
        <p className="card-subtitle">Enable AI-enhanced predictions with Claude Sonnet 4</p>
      </div>
      
      {!aiEnabled ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="ai-api-key" className="block text-sm font-medium text-gray-700 mb-2">
              Anthropic API Key
            </label>
            <div className="flex gap-3">
              <input
                id="ai-api-key"
                type="password"
                value={aiApiKey}
                onChange={(e) => setAiApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={enableClaudeAI}
                disabled={isLoadingAI || !aiApiKey.trim()}
                className="btn btn-claude px-4"
              >
                {isLoadingAI ? (
                  <>
                    <div className="loading-spinner" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <span>??</span>
                    <span>Enable AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-blue-500 text-lg">??</span>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Get your Anthropic API key:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Visit <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="underline">console.anthropic.com</a></li>
                  <li>Create an account or sign in</li>
                  <li>Navigate to API Keys and create a new key</li>
                  <li>Copy the key and paste it above</li>
                </ol>
                <p className="mt-2 text-xs">Your API key is stored locally and never sent to our servers.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-green-500 text-xl">?</span>
              <div>
                <p className="font-medium text-green-800">Claude Sonnet 4 Connected</p>
                <p className="text-sm text-green-600">AI-enhanced predictions are active</p>
              </div>
            </div>
            <button
              onClick={disconnectClaudeAI}
              className="btn btn-sm btn-outline text-red-600 border-red-300 hover:bg-red-50"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderConfigurationSection = () => (
    <div className="card mb-6">
      <div className="card-header">
        <h3 className="card-title">?? Selection Configuration</h3>
        <p className="card-subtitle">Customize your prediction settings</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Historical Data Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ?? Historical Data Range
          </label>
          <select
            value={historicalRecordsLimit}
            onChange={(e) => onDataLimitChange(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoadingHistory}
          >
            {historicalDataOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} {option.recommended ? '?' : ''}
              </option>
            ))}
          </select>
          {isLoadingHistory && (
            <p className="text-xs text-gray-500 mt-1">Loading historical data...</p>
          )}
        </div>

        {/* Selection Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ?? Selection Mode
          </label>
          <select
            value={selectionMode}
            onChange={(e) => setSelectionMode(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {selectionModeOptions.map(option => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.requiresAI && !aiEnabled}
              >
                {option.icon} {option.label}
                {option.requiresAI && !aiEnabled ? ' (Requires AI)' : ''}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {selectionModeOptions.find(opt => opt.value === selectionMode)?.description}
          </p>
        </div>

        {/* Number of Sets */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ?? Number of Sets
          </label>
          <select
            value={numberOfSets}
            onChange={(e) => setNumberOfSets(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[3, 4, 5, 6, 7, 8].map(num => (
              <option key={num} value={num}>{num} sets</option>
            ))}
          </select>
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="auto-refresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="auto-refresh" className="text-xs text-gray-600">
              Auto-refresh every 5 minutes
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSelectionCard = (selection) => (
    <div 
      key={selection.id}
      className={`card cursor-pointer transition-all duration-200 ${
        selectedSetIds.includes(selection.id) ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
      }`}
      onClick={() => toggleSelection(selection.id)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-gray-900 text-sm">
            {selection.name}
          </h4>
          {selection.claudeGenerated && (
            <span className="claude-badge">Claude</span>
          )}
          {selection.isHybrid && (
            <span className="hybrid-badge">Hybrid</span>
          )}
        </div>
        
        <div className={`confidence-indicator ${getConfidenceClass(selection.confidence)}`}>
          {selection.confidence}%
        </div>
      </div>

      {/* Numbers */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {selection.numbers.map((num, index) => (
          <div key={index} className="number-ball number-ball-main">
            {num}
          </div>
        ))}
        <div className="mx-2 text-gray-400 font-bold">|</div>
        <div className="number-ball number-ball-powerball">
          {selection.powerball}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-600 mb-3 text-center">
        {selection.description}
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            copySelection(selection);
          }}
          className="btn btn-sm btn-outline flex-1"
        >
          ?? Copy
        </button>
        
        {selection.claudeGenerated && selection.claudeInsights && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              alert(selection.claudeInsights);
            }}
            className="btn btn-sm btn-claude"
          >
            ?? Insights
          </button>
        )}
      </div>

      {/* Technical Details (Expandable) */}
      <details className="mt-3 text-xs">
        <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
          Technical Details
        </summary>
        <div className="mt-2 p-2 bg-gray-50 rounded text-gray-600">
          <p><strong>Strategy:</strong> {selection.actualStrategy}</p>
          <p><strong>Analysis:</strong> {selection.technicalAnalysis}</p>
          <p><strong>Source:</strong> {selection.source || 'algorithm'}</p>
        </div>
      </details>
    </div>
  );

  const renderGenerationControls = () => (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div className="flex items-center gap-3">
        <button
          onClick={aiEnabled ? generateClaudeHybridSelections : generateAlgorithmSelections}
          disabled={isGeneratingSelections}
          className={`btn ${aiEnabled ? 'btn-claude' : 'btn-primary'}`}
        >
          {isGeneratingSelections ? (
            <>
              <div className="loading-spinner" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span>{aiEnabled ? '???' : '??'}</span>
              <span>Generate New Sets</span>
            </>
          )}
        </button>
        
        {quickSelectionSets.length > 0 && (
          <button
            onClick={copyAllSelections}
            className="btn btn-secondary"
          >
            ?? Copy All
          </button>
        )}
      </div>
      
      {lastGenerationTime && (
        <div className="text-xs text-gray-500">
          Last generated: {lastGenerationTime.toLocaleTimeString()}
        </div>
      )}
    </div>
  );

  // ===========================================================================
  // MAIN RENDER
  // ===========================================================================
  
  return (
    <div className="space-y-6">
      
      {/* AI Setup Section */}
      {renderAISetupSection()}

      {/* Configuration Section */}
      {renderConfigurationSection()}

      {/* Generation Controls */}
      {renderGenerationControls()}

      {/* Selection Grid */}
      {quickSelectionSets.length > 0 ? (
        <div className="selection-grid">
          {quickSelectionSets.map(renderSelectionCard)}
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">
            {aiEnabled ? '???' : '??'}
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {isGeneratingSelections ? 'Generating Selections...' : 'Ready to Generate'}
          </h3>
          <p className="text-gray-600 mb-6">
            {aiEnabled 
              ? 'Click "Generate New Sets" to create Claude Sonnet 4 enhanced predictions'
              : 'Click "Generate New Sets" to create algorithm-based predictions'
            }
          </p>
          {!isGeneratingSelections && (
            <button
              onClick={aiEnabled ? generateClaudeHybridSelections : generateAlgorithmSelections}
              className={`btn btn-lg ${aiEnabled ? 'btn-claude' : 'btn-primary'}`}
            >
              <span>{aiEnabled ? '???' : '??'}</span>
              <span>Generate Selections</span>
            </button>
          )}
        </div>
      )}

      {/* Selected Sets Summary */}
      {selectedSetIds.length > 0 && (
        <div className="card bg-blue-50 border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">
            ?? Selected Sets ({selectedSetIds.length})
          </h4>
          <div className="space-y-1 text-sm">
            {selectedSetIds.map(setId => {
              const selection = quickSelectionSets.find(s => s.id === setId);
              return selection ? (
                <p key={setId} className="text-blue-700">
                  {selection.name}: {formatNumbers(selection.numbers, selection.powerball)}
                </p>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}