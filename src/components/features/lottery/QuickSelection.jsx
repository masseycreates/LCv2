import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useLottery } from '@/contexts/LotteryContext';
import { usePowerballData } from '@hooks/usePowerballData';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import LoadingSpinner from '@components/ui/LoadingSpinner';
import SelectionDisplay from './SelectionDisplay';
import Banner from '@components/ui/Banner';

function QuickSelection() {
  const { 
    isClaudeEnabled, 
    claudeApiKey,
    setClaudeApiKey,
    setClaudeConnectionStatus 
  } = useApp();
  
  const {
    historicalStats,
    historicalDataAvailable,
    historicalRecordsLimit,
    quickSelectionSets,
    isGeneratingSelections,
    isLoadingHistory,
    currentJackpot,
    fetchHistoricalStats,
    setRecordsLimit,
    generateQuickSelections
  } = useLottery();

  const { testClaudeConnection, generateClaudeHybridSelection } = usePowerballData();
  
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Data range options
  const dataRangeOptions = [
    { value: 50, label: '50 drawings (2 months)' },
    { value: 100, label: '100 drawings (4 months)' },
    { value: 250, label: '250 drawings (1 year)' },
    { value: 500, label: '500 drawings (2 years)' },
    { value: 1000, label: '1000 drawings (4 years)' },
    { value: 1500, label: '1500 drawings (6 years)' },
    { value: 2000, label: '2000 drawings (8+ years)' }
  ];

  const handleDataLimitChange = async (newLimit) => {
    setRecordsLimit(newLimit);
    await fetchHistoricalStats(newLimit);
  };

  const handleEnableClaude = async () => {
    const trimmedKey = apiKeyInput.trim();
    
    if (!trimmedKey) {
      alert('Please enter your Anthropic API key');
      return;
    }
    
    if (!trimmedKey.startsWith('sk-ant-') || trimmedKey.length < 20) {
      alert('Please enter a valid Anthropic API key (starts with sk-ant-)');
      return;
    }
    
    setIsConnecting(true);
    setClaudeConnectionStatus('connecting');
    
    try {
      const result = await testClaudeConnection(trimmedKey);
      
      if (result.success) {
        setClaudeApiKey(trimmedKey);
        setClaudeConnectionStatus('connected');
      } else {
        setClaudeConnectionStatus('error');
        alert(`Failed to connect to Claude Opus 4: ${result.error}`);
      }
    } catch (error) {
      setClaudeConnectionStatus('error');
      alert(`Connection failed: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleGenerateSelections = async () => {
    try {
      if (isClaudeEnabled && claudeApiKey) {
        await generateClaudeHybridSelection(claudeApiKey, historicalStats, currentJackpot);
      } else {
        await generateQuickSelections();
      }
    } catch (error) {
      console.error('Failed to generate selections:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Historical Data Range Selector */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">📊 Historical Data Range</h4>
            <p className="text-xs text-gray-600">
              {isLoadingHistory ? 'Updating analysis...' : 'Select amount of historical data for analysis'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={historicalRecordsLimit}
              onChange={(e) => handleDataLimitChange(parseInt(e.target.value))}
              disabled={isLoadingHistory}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {dataRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            {isLoadingHistory && <LoadingSpinner size="sm" />}
          </div>
        </div>
        
        {historicalStats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600">
            <div>📈 Analyzing: {historicalStats.totalDrawings} drawings</div>
            <div>🔥 Source: {historicalStats.dataSource || 'API'}</div>
            <div>
              🎯 Range: {historicalStats.dateRange ? 
                `${historicalStats.dateRange.earliest} to ${historicalStats.dateRange.latest}` : 
                'Full range'
              }
            </div>
          </div>
        )}
      </Card>

      {/* Claude Opus 4 Integration */}
      <Card.Opus4>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🤖✨</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Claude Opus 4 + 6 Algorithms</h3>
              <p className="text-sm text-gray-600">Advanced AI hybrid intelligence system</p>
            </div>
          </div>
          
          {isClaudeEnabled && (
            <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded-full">
              ✨ OPUS 4 ACTIVE
            </span>
          )}
        </div>

        {!isClaudeEnabled ? (
          <div className="space-y-4">
            <Banner type="warning">
              ⚠️ Using local algorithms only. Enable Claude Opus 4 for advanced AI analysis.
            </Banner>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Anthropic API key (sk-ant-...)"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              
              <Button
                onClick={handleEnableClaude}
                disabled={isConnecting || !apiKeyInput.trim()}
                loading={isConnecting}
                variant="opus4"
              >
                ✨ Enable Opus 4
              </Button>
            </div>
            
            <p className="text-xs text-gray-500">
              Get API key: {' '}
              <a 
                href="https://console.anthropic.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 underline hover:text-purple-700"
              >
                console.anthropic.com
              </a>
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <Banner type="success" className="flex-1 mr-4">
              ✅ Claude Opus 4 analyzing with 6 algorithms for optimal predictions
            </Banner>
            
            <Button
              onClick={handleGenerateSelections}
              disabled={isGeneratingSelections}
              loading={isGeneratingSelections}
              variant="opus4"
            >
              🔄 New Analysis
            </Button>
          </div>
        )}
      </Card.Opus4>

      {/* Generated Selections */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isClaudeEnabled ? '🤖✨ Opus 4 Hybrid Selections' : '🧮 Algorithm Selections'}
            </h3>
            <p className="text-sm text-gray-600">
              {isClaudeEnabled ? 'Claude Opus 4 + 6 algorithms working together' : 'Local mathematical ensemble'}
            </p>
          </div>
          
          {!isLoadingHistory && historicalDataAvailable && (
            <Button
              onClick={handleGenerateSelections}
              disabled={isGeneratingSelections}
              loading={isGeneratingSelections}
              variant="secondary"
              size="sm"
            >
              🔄 Refresh
            </Button>
          )}
        </div>

        {isLoadingHistory ? (
          <div className="text-center py-12">
            <LoadingSpinner.Inline message="Loading data and generating selections..." />
          </div>
        ) : quickSelectionSets.length > 0 ? (
          <SelectionDisplay 
            selections={quickSelectionSets}
            isClaudeEnabled={isClaudeEnabled}
          />
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-sm">No selections generated yet.</p>
            {historicalDataAvailable && (
              <Button
                onClick={handleGenerateSelections}
                disabled={isGeneratingSelections}
                loading={isGeneratingSelections}
                variant="primary"
                className="mt-4"
              >
                Generate Selections
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

export default QuickSelection;