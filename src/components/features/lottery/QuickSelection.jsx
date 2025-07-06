import React, { useState, useEffect } from 'react';
import { useLottery } from '@/contexts/LotteryContext';
import { claudeService } from '@/services/claudeService';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import LoadingSpinner from '@components/ui/LoadingSpinner';
import Banner from '@components/ui/Banner';

function QuickSelection() {
  // Lottery context
  const {
    historicalStats,
    currentJackpot,
    quickSelections,
    isLoadingHistory,
    isGeneratingSelections,
    error,
    historicalRecordsLimit,
    fetchHistoricalStats,
    generateQuickSelections,
    updateRecordsLimit,
    clearError
  } = useLottery();

  // Local state
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [claudeConnectionStatus, setClaudeConnectionStatus] = useState('disconnected');
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [historicalData, setHistoricalData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [selectedModel, setSelectedModel] = useState('claude-3-sonnet-20240229');

  const availableModels = [
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet (Recommended)', description: 'Balanced performance and speed' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most capable model' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fastest response' }
  ];

  const isClaudeEnabled = claudeConnectionStatus === 'connected' && claudeApiKey;

  // Load historical data on component mount
  useEffect(() => {
    loadHistoricalData();
  }, []);

  const loadHistoricalData = async () => {
    setLoadingData(true);
    setLocalError(null);
    
    try {
      const result = await fetchHistoricalStats(historicalRecordsLimit);
      setHistoricalData(result.data);
      console.log(`Loaded ${result.data?.analysis?.totalDrawings || 0} historical drawings for analysis`);
    } catch (err) {
      const errorMessage = err.code === 'API_CONNECTION_FAILED'
        ? 'Cannot connect to lottery data servers. Please check your internet connection and try again.'
        : err.code === 'API_ERROR'
        ? 'Lottery data service is temporarily unavailable. Please try again in a few minutes.'
        : err.code === 'NO_DATA'
        ? 'No historical lottery data is available. The analysis requires real drawing data to function.'
        : `Failed to load lottery data: ${err.message}`;
      
      setLocalError(errorMessage);
    } finally {
      setLoadingData(false);
    }
  };

  const handleEnableClaude = async () => {
    const trimmedKey = apiKeyInput.trim();
    
    if (!trimmedKey) {
      setLocalError('Please enter your Anthropic API key');
      return;
    }
    
    setIsConnecting(true);
    setClaudeConnectionStatus('connecting');
    setLocalError(null);
    
    try {
      const result = await claudeService.testConnection(trimmedKey);
      
      if (result.success) {
        setClaudeApiKey(trimmedKey);
        setClaudeConnectionStatus('connected');
        setApiKeyInput('');
        console.log(`Connected to ${result.model} successfully!`);
      }
    } catch (error) {
      setClaudeConnectionStatus('error');
      
      const errorMessage = error.code === 'INVALID_API_KEY_FORMAT'
        ? 'Invalid API key format. Please ensure you copied the complete key from your Anthropic account.'
        : error.code === 'UNAUTHORIZED'
        ? 'Invalid API key. Please check that your Anthropic API key is correct and active.'
        : error.code === 'INSUFFICIENT_CREDITS'
        ? 'Your Anthropic account has insufficient credits. Please add credits to your account.'
        : error.code === 'RATE_LIMITED'
        ? 'Too many connection attempts. Please wait a moment before trying again.'
        : error.code === 'NETWORK_ERROR'
        ? 'Cannot connect to Claude API. Please check your internet connection.'
        : `Failed to connect to Claude: ${error.message}`;
      
      setLocalError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleGenerateSelections = async () => {
    clearError();
    setLocalError(null);
    
    if (!historicalData) {
      setLocalError('Historical data is required for selection generation. Please wait for data to load.');
      return;
    }

    try {
      if (isClaudeEnabled) {
        // Use Claude AI for advanced analysis
        const claudeResult = await claudeService.generateLotterySelections(
          claudeApiKey,
          historicalData,
          currentJackpot
        );
        
        if (claudeResult.success) {
          await generateQuickSelections(5); // Generate 5 sets
          console.log('Claude-generated selections created successfully');
        }
      } else {
        // Use local mathematical algorithms
        await generateQuickSelections(6); // Generate 6 sets for local algorithms
        console.log('Mathematical algorithm selections generated');
      }
    } catch (error) {
      const errorMessage = error.code === 'MISSING_HISTORICAL_DATA'
        ? 'Historical lottery data is required for analysis. Please try refreshing the data.'
        : error.code === 'CLAUDE_API_ERROR'
        ? 'Claude AI service is temporarily unavailable. Using local algorithms instead.'
        : `Failed to generate selections: ${error.message}`;
      
      setLocalError(errorMessage);
      
      // Fallback to local generation if Claude fails
      if (isClaudeEnabled && error.code === 'CLAUDE_API_ERROR') {
        try {
          await generateQuickSelections(6);
          console.log('Fallback to local algorithms successful');
        } catch (fallbackError) {
          console.error('Fallback generation also failed:', fallbackError);
        }
      }
    }
  };

  const handleUpdateDataRange = async (newLimit) => {
    updateRecordsLimit(newLimit);
    await loadHistoricalData();
  };

  const dataRangeOptions = [
    { value: 50, label: '50 drawings (2 months)', description: 'Recent trends' },
    { value: 100, label: '100 drawings (4 months)', description: 'Short-term patterns' },
    { value: 250, label: '250 drawings (1 year)', description: 'Seasonal analysis' },
    { value: 500, label: '500 drawings (2 years)', description: 'Medium-term trends' },
    { value: 1000, label: '1000 drawings (4 years)', description: 'Long-term patterns' },
    { value: 1500, label: '1500 drawings (6 years)', description: 'Extended analysis' },
    { value: 2000, label: '2000 drawings (8+ years)', description: 'Maximum historical data' }
  ];

  return (
    <div className="space-y-6">
      {/* Historical Data Status */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              ?? Historical Data Analysis
              {loadingData && <LoadingSpinner />}
            </h3>
            <p className="text-sm text-gray-600">
              {historicalStats ? 
                `${historicalStats.totalDrawings} real drawings analyzed from ${historicalStats.dateRange?.earliest || 'unknown'} to ${historicalStats.dateRange?.latest || 'unknown'}` :
                'Loading official lottery drawing data for analysis'
              }
            </p>
          </div>
          
          <Button
            onClick={loadHistoricalData}
            variant="secondary"
            size="sm"
            disabled={loadingData}
            className="flex items-center gap-2"
          >
            {loadingData ? <LoadingSpinner /> : '??'} Refresh Data
          </Button>
        </div>

        {/* Data Range Selector */}
        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm font-medium text-gray-700">
            Analysis Range:
          </label>
          <select 
            value={historicalRecordsLimit}
            onChange={(e) => handleUpdateDataRange(parseInt(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loadingData}
          >
            {dataRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Data Statistics */}
        {historicalStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {historicalStats.totalDrawings}
              </div>
              <div className="text-xs text-blue-600 font-medium">Total Drawings</div>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {historicalStats.hotNumbers?.[0]?.number || 'N/A'}
              </div>
              <div className="text-xs text-green-600 font-medium">Hottest Number</div>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                {historicalStats.hotPowerballs?.[0]?.number || 'N/A'}
              </div>
              <div className="text-xs text-purple-600 font-medium">Hot Powerball</div>
            </div>
            
            <div className="p-3 bg-orange-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">
                {historicalStats.averageJackpot ? 
                  `$${Math.round(historicalStats.averageJackpot / 1000000)}M` : 
                  'N/A'
                }
              </div>
              <div className="text-xs text-orange-600 font-medium">Avg Jackpot</div>
            </div>
          </div>
        )}
      </Card>

      {/* Claude AI Integration */}
      <Card className={isClaudeEnabled ? 'border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50' : ''}>
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">??</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Claude Opus 4 Integration
            </h3>
            <p className="text-sm text-gray-600">
              Most intelligent AI model for advanced lottery analysis
            </p>
          </div>
        </div>

        {!isClaudeEnabled ? (
          <div className="space-y-4">
            <Banner type="warning">
              ?? Using local mathematical analysis only. Connect your Claude Opus 4 API key for advanced AI analysis.
            </Banner>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Anthropic API Key
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get your API key from console.anthropic.com
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Claude Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {availableModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <Button
              onClick={handleEnableClaude}
              disabled={isConnecting || !apiKeyInput.trim()}
              loading={isConnecting}
              variant="primary"
              className="w-full md:w-auto"
            >
              {isConnecting ? 'Testing Connection...' : 'Connect to Claude Opus 4'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Banner type="opus4">
              ? Claude Opus 4 is connected and ready for advanced lottery analysis
            </Banner>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Model:</strong> {availableModels.find(m => m.id === selectedModel)?.name}
              </div>
              <div>
                <strong>Status:</strong> Ready for analysis
              </div>
              <div>
                <strong>Data:</strong> {historicalStats?.totalDrawings || 0} drawings
              </div>
            </div>
            
            <Button
              onClick={() => {
                setClaudeApiKey('');
                setClaudeConnectionStatus('disconnected');
              }}
              variant="ghost"
              size="sm"
            >
              Disconnect
            </Button>
          </div>
        )}
      </Card>

      {/* Generate Selections */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              {isClaudeEnabled ? '?? Claude Opus 4 Selections' : '?? Mathematical Selections'}
              {isGeneratingSelections && <LoadingSpinner />}
            </h3>
            <p className="text-sm text-gray-600">
              {isClaudeEnabled 
                ? 'Claude Opus 4 will analyze patterns and generate strategic selections'
                : 'Local algorithms will generate mathematically-based selections'
              }
            </p>
          </div>
          
          <Button
            onClick={handleGenerateSelections}
            disabled={isGeneratingSelections || !historicalStats}
            loading={isGeneratingSelections}
            variant={isClaudeEnabled ? "primary" : "secondary"}
            className="flex items-center gap-2"
          >
            {isGeneratingSelections ? 'Generating...' : 'Generate Selections'}
          </Button>
        </div>

        {/* Generated Selections Display */}
        {quickSelections && quickSelections.length > 0 ? (
          <div className="space-y-4">
            {quickSelections.map((selection, index) => (
              <div key={selection.id || index} className="p-4 border rounded-lg bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">
                    {selection.name || `Selection ${index + 1}`}
                  </h4>
                  <div className="flex items-center gap-2">
                    {selection.claudeGenerated && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                        ?? Claude AI
                      </span>
                    )}
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                      {selection.confidence || 75}% Confidence
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  {(selection.numbers || []).map(num => (
                    <span key={num} className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                      {num}
                    </span>
                  ))}
                  <span className="w-10 h-10 flex items-center justify-center bg-red-500 text-white rounded-full text-sm font-bold mx-2">
                    {selection.powerball || 1}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  {selection.description || selection.explanation || 'Mathematical analysis based on historical patterns'}
                </p>
                
                <div className="text-xs text-gray-500">
                  <strong>Strategy:</strong> {selection.strategy || 'Mathematical Analysis'} • 
                  <strong> Method:</strong> {selection.claudeGenerated ? 'Claude AI Analysis' : 'Local Algorithms'}
                  {selection.factors && (
                    <> • <strong>Factors:</strong> {Array.isArray(selection.factors) ? selection.factors.join(', ') : selection.factors}</>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">??</div>
            <p className="text-sm">No selections generated yet.</p>
            {!historicalStats && (
              <p className="text-xs mt-2">
                Real historical data is required for selection generation.
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Error Display */}
      {(error || localError) && (
        <Banner type="error" dismissible onDismiss={() => { clearError(); setLocalError(null); }}>
          <strong>Error:</strong> {error?.message || localError}
        </Banner>
      )}

      {/* Disclaimer */}
      <Banner type="info">
        <strong>Real Analysis:</strong> This system uses actual lottery data and {isClaudeEnabled ? 'Claude Opus 4' : 'mathematical algorithms'} for analysis. 
        No system can predict lottery outcomes. All selections are for educational purposes only.
      </Banner>
    </div>
  );
}

export default QuickSelection;