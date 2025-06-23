// src/components/features/analysis/DataAnalysis.jsx
import React from 'react';
import { useLottery } from '@/contexts/LotteryContext';

function DataAnalysis() {
  const { historicalStats, liveDataAvailable } = useLottery();

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">📊 Data Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Live Data Status</h4>
            <p className="text-sm text-gray-700">
              {liveDataAvailable ? '✅ Connected' : '❌ Unavailable'}
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Historical Data</h4>
            <p className="text-sm text-gray-700">
              {historicalStats ? `${historicalStats.totalDrawings} drawings` : 'Loading...'}
            </p>
          </div>
        </div>

        {historicalStats && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">🔥 Hot Numbers</h4>
              <div className="flex flex-wrap gap-2">
                {historicalStats.hotNumbers?.slice(0, 10).map(num => (
                  <span key={num} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                    {num}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-sm mb-2">❄️ Cold Numbers</h4>
              <div className="flex flex-wrap gap-2">
                {historicalStats.coldNumbers?.slice(0, 10).map(num => (
                  <span key={num} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {num}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataAnalysis;