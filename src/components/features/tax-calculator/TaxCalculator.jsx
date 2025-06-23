// src/components/features/tax-calculator/TaxCalculator.jsx
import React from 'react';
import Card from '@components/ui/Card';

function TaxCalculator() {
  return (
    <div className="space-y-6">
      <Card>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🧮</div>
          <h3 className="text-lg font-semibold mb-2">Tax Calculator</h3>
          <p className="text-gray-600">Coming soon - Calculate taxes on lottery winnings</p>
        </div>
      </Card>
    </div>
  );
}

export default TaxCalculator;

// src/components/features/analysis/DataAnalysis.jsx
import React from 'react';
import { useLottery } from '@/contexts/LotteryContext';
import { useApp } from '@/contexts/AppContext';
import Card from '@components/ui/Card';

function DataAnalysis() {
  const { historicalStats, liveDataAvailable } = useLottery();
  const { systemPerformance, isClaudeEnabled } = useApp();

  return (
    <div className="space-y-6">
      {/* System Status */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">📊 Data Analysis & Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2 text-gray-900">Live Data Status</h4>
            <p className="text-sm text-gray-700">
              {liveDataAvailable ? '✅ Connected' : '❌ Unavailable'}
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2 text-gray-900">Historical Data</h4>
            <p className="text-sm text-gray-700">
              {historicalStats ? `✅ ${historicalStats.totalDrawings} drawings` : '❌ Limited'}
            </p>
          </div>
        </div>

        {/* Hot/Cold Numbers */}
        {historicalStats && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-3 text-gray-900">🔥 Hot Numbers (Most Frequent)</h4>
              <div className="flex flex-wrap gap-2">
                {historicalStats.hotNumbers?.slice(0, 15).map(num => (
                  <span 
                    key={num}
                    className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm font-medium"
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-sm mb-3 text-gray-900">❄️ Cold Numbers (Least Frequent)</h4>
              <div className="flex flex-wrap gap-2">
                {historicalStats.coldNumbers?.slice(0, 15).map(num => (
                  <span 
                    key={num}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium"
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Performance Metrics */}
      {systemPerformance && (
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">⚙️ System Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {systemPerformance.averageHitRate}%
              </div>
              <div className="text-xs text-gray-600">Avg Hit Rate</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {systemPerformance.predictionsGenerated}
              </div>
              <div className="text-xs text-gray-600">Predictions</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {isClaudeEnabled ? 'OPUS 4' : 'LOCAL'}
              </div>
              <div className="text-xs text-gray-600">Mode</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {systemPerformance.status.toUpperCase()}
              </div>
              <div className="text-xs text-gray-600">Status</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default DataAnalysis;