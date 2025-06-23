// src/components/features/lottery/QuickSelection.jsx - Modular Feature Component
import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import Card from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Banner } from '@components/ui/Banner';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';

function QuickSelection() {
  const { isClaudeEnabled, claudeApiKey, systemPerformance, isLoading } = useApp();
  const [selections, setSelections] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [requestedSets, setRequestedSets] = useState(3);

  const generateSelections = async () => {
    setGenerating(true);
    
    try {
      // Simulate generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data for demonstration
      const mockSelections = Array.from({ length: requestedSets }, (_, index) => ({
        id: Date.now() + index,
        numbers: Array.from({ length: 5 }, () => Math.floor(Math.random() * 69) + 1).sort((a, b) => a - b),
        powerball: Math.floor(Math.random() * 26) + 1,
        strategy: isClaudeEnabled ? `Claude Opus 4 Algorithm ${index + 1}` : `Local Algorithm ${index + 1}`,
        confidence: Math.floor(Math.random() * 30) + 70,
        analysis: isClaudeEnabled 
          ? `Advanced AI hybrid analysis with ${Math.floor(Math.random() * 50) + 50} data points`
          : `Mathematical pattern analysis with local algorithms`
      }));
      
      setSelections(mockSelections);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Claude Opus 4 Status */}
      <Card.Opus4>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🤖✨</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Claude Opus 4 + Hybrid Algorithms</h3>
              <p className="text-sm text-gray-600">Advanced AI lottery intelligence system</p>
            </div>
          </div>
          
          {isClaudeEnabled && (
            <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded-full">
              ✨ OPUS 4 ACTIVE
            </span>
          )}
        </div>

        {!isClaudeEnabled ? (
          <Banner type="warning">
            ⚠️ Using local algorithms only. Enable Claude Opus 4 for advanced AI analysis.
          </Banner>
        ) : (
          <Banner type="claude">
            🚀 Claude Opus 4 hybrid system ready! Using 6 advanced algorithms with AI analysis.
          </Banner>
        )}
      </Card.Opus4>

      {/* Generation Controls */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Quick Number Generation</h3>
        
        <div className="flex items-center gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Sets
            </label>
            <select 
              value={requestedSets}
              onChange={(e) => setRequestedSets(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              disabled={generating}
            >
              <option value={1}>1 Set</option>
              <option value={3}>3 Sets</option>
              <option value={5}>5 Sets</option>
              <option value={10}>10 Sets</option>
            </select>
          </div>
          
          <div className="flex-1 flex justify-end">
            <Button
              variant={isClaudeEnabled ? "claude" : "primary"}
              onClick={generateSelections}
              disabled={generating || isLoading}
              loading={generating}
            >
              {generating ? 'Generating...' : `Generate ${requestedSets} Set${requestedSets > 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>

        {generating && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="large" />
            <span className="ml-3 text-gray-600">
              {isClaudeEnabled ? 'Claude Opus 4 analyzing patterns...' : 'Running local algorithms...'}
            </span>
          </div>
        )}
      </Card>

      {/* Generated Selections */}
      {selections.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Generated Numbers</h3>
          
          <div className="space-y-4">
            {selections.map((selection, index) => (
              <div key={selection.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Set {index + 1}</h4>
                  <div className="text-sm text-gray-600">
                    {selection.confidence}% confidence
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    {selection.numbers.map((num, numIndex) => (
                      <span 
                        key={numIndex}
                        className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm"
                      >
                        {num}
                      </span>
                    ))}
                    <span className="text-gray-400 mx-2">+</span>
                    <span className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {selection.powerball}
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <div className="font-medium">{selection.strategy}</div>
                  <div>{selection.analysis}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* System Performance */}
      {systemPerformance && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">System Performance</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {systemPerformance.predictionsGenerated || 0}
              </div>
              <div className="text-xs text-gray-600">Predictions Generated</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {isClaudeEnabled ? 'OPUS 4' : 'LOCAL'}
              </div>
              <div className="text-xs text-gray-600">Mode</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {systemPerformance.status?.toUpperCase() || 'READY'}
              </div>
              <div className="text-xs text-gray-600">Status</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default QuickSelection;