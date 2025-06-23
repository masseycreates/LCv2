// src/components/features/lottery/QuickSelection.jsx - Enhanced with Claude AI
import React, { useState } from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Banner from '../../ui/Banner';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { useApp } from '../../../contexts/AppContext';
import { useLottery } from '../../../contexts/LotteryContext';
import { lotteryPredictor } from '../../../services/algorithms/predictor';
import { dataAnalysisService } from '../../../services/analysis/dataAnalysisService';

function QuickSelection() {
  const { 
    isClaudeEnabled, 
    claudeConnectionStatus,
    systemPerformance,
    testClaudeConnection,
    generateClaudeAnalysis,
    disconnectClaude,
    addNotification
  } = useApp();
  
  const { selections, setSelections, isGenerating, setIsGenerating } = useLottery();
  
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [requestedSets, setRequestedSets] = useState(3);
  const [analysisType, setAnalysisType] = useState('hybrid');

  const handleConnectClaude = async () => {
    const trimmedKey = claudeApiKey.trim();
    
    if (!trimmedKey) {
      addNotification({
        type: 'error',
        title: 'API Key Required',
        message: 'Please enter your Anthropic API key'
      });
      return;
    }
    
    setIsConnecting(true);
    
    try {
      const result = await testClaudeConnection(trimmedKey);
      
      if (result.success) {
        setClaudeApiKey(''); // Clear the input for security
      }
    } catch (error) {
      console.error('Claude connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const generateNumbers = async () => {
    setIsGenerating(true);
    
    try {
      let newSelections = [];
      
      if (isClaudeEnabled && analysisType === 'claude') {
        // Pure Claude AI analysis
        const historicalStats = dataAnalysisService.getHistoricalStats(100);
        const claudeResult = await generateClaudeAnalysis({
          historicalData: historicalStats,
          requestedSets,
          analysisType: 'advanced'
        });
        
        if (claudeResult.success) {
          newSelections = claudeResult.sets;
        } else {
          throw new Error('Claude analysis failed');
        }
      } else if (isClaudeEnabled && analysisType === 'hybrid') {
        // Hybrid: Local algorithms + Claude analysis
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const localSets = lotteryPredictor.generateQuickPick(Math.ceil(requestedSets / 2));
        const historicalStats = dataAnalysisService.getHistoricalStats(100);
        
        const claudeResult = await generateClaudeAnalysis({
          historicalData: historicalStats,
          requestedSets: Math.floor(requestedSets / 2),
          analysisType: 'hybrid'
        });
        
        if (claudeResult.success) {
          newSelections = [
            ...localSets.map(set => ({ ...set, strategy: `🔬 ${set.strategy}`, isHybrid: false })),
            ...claudeResult.sets.map(set => ({ ...set, strategy: `🤖 ${set.strategy}`, isHybrid: true }))
          ].slice(0, requestedSets);
        } else {
          newSelections = localSets;
        }
      } else {
        // Local algorithms only
        await new Promise(resolve => setTimeout(resolve, 1500));
        newSelections = lotteryPredictor.generateQuickPick(requestedSets);
      }
      
      setSelections(newSelections);
    } catch (error) {
      console.error('Number generation failed:', error);
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: error.message
      });
      
      // Fallback to local generation
      const fallbackSets = lotteryPredictor.generateQuickPick(requestedSets);
      setSelections(fallbackSets);
    } finally {
      setIsGenerating(false);
    }
  };

  const getConnectionStatusColor = () => {
    switch (claudeConnectionStatus) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConnectionStatusText = () => {
    switch (claudeConnectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Connection Failed';
      default: return 'Disconnected';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Claude AI Status & Connection */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🤖✨</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Claude AI Integration</h3>
              <p className="text-sm text-gray-600">Advanced AI-powered lottery analysis</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-sm font-medium ${getConnectionStatusColor()}`}>
              {getConnectionStatusText()}
            </div>
            {isClaudeEnabled && (
              <div className="text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-1 rounded mt-1 font-bold">
                🚀 AI ACTIVE
              </div>
            )}
          </div>
        </div>

        {!isClaudeEnabled ? (
          <div className="space-y-4">
            <Banner type="warning">
              🔑 Connect your Anthropic API key to unlock Claude AI analysis
            </Banner>
            
            <div className="flex gap-4">
              <input
                type="password"
                value={claudeApiKey}
                onChange={(e) => setClaudeApiKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isConnecting}
              />
              <Button
                onClick={handleConnectClaude}
                loading={isConnecting}
                variant="claude"
                disabled={!claudeApiKey.trim()}
              >
                Connect Claude
              </Button>
            </div>
            
            <div className="text-xs text-gray-600">
              Get your API key from{' '}
              <a 
                href="https://console.anthropic.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline"
              >
                console.anthropic.com
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Banner type="claude">
              🚀 Claude AI is connected and ready for advanced lottery analysis!
            </Banner>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <strong>Model:</strong> claude-3-5-sonnet • <strong>Analyses:</strong> {systemPerformance.claudeAnalyses}
              </div>
              <Button
                onClick={disconnectClaude}
                variant="outline"
                size="small"
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Generation Controls */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">🎯 Number Generation</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Sets
            </label>
            <select 
              value={requestedSets}
              onChange={(e) => setRequestedSets(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
            >
              <option value={1}>1 Set</option>
              <option value={3}>3 Sets</option>
              <option value={5}>5 Sets</option>
              <option value={10}>10 Sets</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Analysis Type
            </label>
            <select 
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
            >
              <option value="local">🔬 Local Algorithms Only</option>
              {isClaudeEnabled && (
                <>
                  <option value="claude">🤖 Pure Claude AI</option>
                  <option value="hybrid">⚡ Hybrid (Local + Claude)</option>
                </>
              )}
            </select>
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={generateNumbers}
              disabled={isGenerating}
              loading={isGenerating}
              variant={isClaudeEnabled && analysisType !== 'local' ? "claude" : "primary"}
              className="w-full"
            >
              {isGenerating ? 'Generating...' : `Generate ${requestedSets} Set${requestedSets > 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>

        {isGenerating && (
          <div className="flex items-center justify-center py-8 bg-gray-50 rounded-lg">
            <LoadingSpinner size="large" />
            <div className="ml-4">
              <div className="font-medium">
                {analysisType === 'claude' ? 'Claude AI analyzing patterns...' :
                 analysisType === 'hybrid' ? 'Running hybrid analysis...' :
                 'Running local algorithms...'}
              </div>
              <div className="text-sm text-gray-600">
                {analysisType !== 'local' ? 'Advanced AI processing' : 'Mathematical analysis'}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Generated Selections */}
      {selections.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">🎲 Generated Numbers</h3>
          
          <div className="space-y-4">
            {selections.map((selection, index) => (
              <div key={selection.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      Set {index + 1}
                      {selection.isHybrid && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-bold">
                          AI ENHANCED
                        </span>
                      )}
                    </h4>
                    <div className="text-sm text-gray-600">{selection.strategy}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{selection.confidence}% confidence</div>
                    <div className="text-xs text-gray-500">
                      {selection.claudeGenerated ? 'Claude AI' : 'Local Algorithm'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex gap-2">
                    {selection.numbers.map((num, numIndex) => (
                      <span 
                        key={numIndex}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white ${
                          selection.isHybrid ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-blue-600'
                        }`}
                      >
                        {num}
                      </span>
                    ))}
                    <span className="text-gray-400 mx-2">+</span>
                    <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white ${
                      selection.isHybrid ? 'bg-gradient-to-r from-red-600 to-pink-600' : 'bg-red-600'
                    }`}>
                      {selection.powerball}
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <div className="mb-1">
                    <strong>Analysis:</strong> {selection.reasoning || selection.analysis}
                  </div>
                  {selection.technical_analysis && (
                    <div className="text-xs text-gray-500">
                      <strong>Technical:</strong> {selection.technical_analysis}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* System Performance */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">⚙️ System Performance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {systemPerformance.predictionsGenerated || 0}
            </div>
            <div className="text-xs text-gray-600">Total Predictions</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {systemPerformance.claudeAnalyses || 0}
            </div>
            <div className="text-xs text-gray-600">Claude Analyses</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {isClaudeEnabled ? 'HYBRID' : 'LOCAL'}
            </div>
            <div className="text-xs text-gray-600">Current Mode</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {systemPerformance.status?.toUpperCase() || 'READY'}
            </div>
            <div className="text-xs text-gray-600">System Status</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default QuickSelection;