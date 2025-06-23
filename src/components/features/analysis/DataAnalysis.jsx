// src/components/features/analysis/DataAnalysis.jsx
import React, { useState, useEffect } from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { dataAnalysisService } from '../../../services/analysis/dataAnalysisService';

function DataAnalysis() {
  const [stats, setStats] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDataRange, setSelectedDataRange] = useState(100);
  const [activeSection, setActiveSection] = useState('overview');

  const dataRangeOptions = [
    { value: 50, label: '50 drawings (2 months)' },
    { value: 100, label: '100 drawings (4 months)' },
    { value: 250, label: '250 drawings (1 year)' },
    { value: 500, label: '500 drawings (2+ years)' }
  ];

  useEffect(() => {
    loadAnalysisData();
  }, [selectedDataRange]);

  const loadAnalysisData = async () => {
    setIsLoading(true);
    
    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const analysisStats = dataAnalysisService.getHistoricalStats(selectedDataRange);
      const systemPerformance = dataAnalysisService.getSystemPerformance();
      
      setStats(analysisStats);
      setPerformance(systemPerformance);
    } catch (error) {
      console.error('Failed to load analysis data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return dataAnalysisService.formatCurrency(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="large" />
          <span className="ml-3 text-gray-600">Loading analysis data...</span>
        </div>
      </Card>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Data Summary */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">📊 Data Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalDrawings}</div>
            <div className="text-sm text-gray-600">Total Drawings</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{performance.analysisAccuracy}%</div>
            <div className="text-sm text-gray-600">Analysis Accuracy</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{performance.predictionConfidence}%</div>
            <div className="text-sm text-gray-600">Prediction Confidence</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{performance.dataQuality.toUpperCase()}</div>
            <div className="text-sm text-gray-600">Data Quality</div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <strong>Date Range:</strong> {stats.dateRange.earliest} to {stats.dateRange.latest}
        </div>
      </Card>

      {/* Jackpot Statistics */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">💰 Jackpot Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">{formatCurrency(stats.jackpotStats.average)}</div>
            <div className="text-sm text-gray-600">Average Jackpot</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">{formatCurrency(stats.jackpotStats.median)}</div>
            <div className="text-sm text-gray-600">Median Jackpot</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{formatCurrency(stats.jackpotStats.max)}</div>
            <div className="text-sm text-gray-600">Highest Jackpot</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600 capitalize">{stats.jackpotStats.trend}</div>
            <div className="text-sm text-gray-600">Recent Trend</div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderHotCold = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Hot Numbers */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-red-600">🔥 Hot Numbers</h3>
        <p className="text-sm text-gray-600 mb-4">Most frequently drawn numbers</p>
        
        <div className="space-y-2">
          {stats.hotNumbers.map((item, index) => (
            <div key={item.number} className="flex items-center justify-between p-2 bg-red-50 rounded">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                <span className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {item.number}
                </span>
              </div>
              <div className="text-right">
                <div className="font-semibold">{item.count} times</div>
                <div className="text-xs text-gray-600">{item.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Cold Numbers */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-blue-600">❄️ Cold Numbers</h3>
        <p className="text-sm text-gray-600 mb-4">Least frequently drawn numbers</p>
        
        <div className="space-y-2">
          {stats.coldNumbers.map((item, index) => (
            <div key={item.number} className="flex items-center justify-between p-2 bg-blue-50 rounded">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {item.number}
                </span>
              </div>
              <div className="text-right">
                <div className="font-semibold">{item.count} times</div>
                <div className="text-xs text-gray-600">{item.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderPatterns = () => (
    <div className="space-y-6">
      {/* Even/Odd Distribution */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">⚖️ Even/Odd Distribution</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.patterns.evenOddDistribution.map((item) => (
            <div key={item.pattern} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-bold text-lg">{item.count}</div>
              <div className="text-sm text-gray-600">{item.pattern}</div>
              <div className="text-xs text-gray-500">{item.percentage}%</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Sum Ranges */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">📊 Sum Range Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.patterns.sumRanges.map((item) => (
            <div key={item.range} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-bold text-lg">{item.count}</div>
              <div className="text-sm text-gray-600">{item.range}</div>
              <div className="text-xs text-gray-500">{item.percentage}%</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Consecutive Numbers */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">🔗 Pattern Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold mb-2">Consecutive Numbers</h4>
            <div className="text-2xl font-bold text-green-600">{stats.patterns.consecutiveNumbers.count}</div>
            <div className="text-sm text-gray-600">
              {stats.patterns.consecutiveNumbers.percentage}% of drawings had consecutive numbers
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Overdue Numbers</h4>
            <div className="flex flex-wrap gap-1">
              {stats.patterns.gaps.overdue.slice(0, 5).map(item => (
                <span key={item.number} className="px-2 py-1 bg-blue-600 text-white rounded text-sm">
                  {item.number}
                </span>
              ))}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Numbers not drawn recently
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderPowerball = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Hot Powerballs */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-red-600">🔥 Hot Powerballs</h3>
        
        <div className="space-y-2">
          {stats.powerballStats.hotPowerballs.map((item, index) => (
            <div key={item.number} className="flex items-center justify-between p-2 bg-red-50 rounded">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                <span className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {item.number}
                </span>
              </div>
              <div className="text-right">
                <div className="font-semibold">{item.count} times</div>
                <div className="text-xs text-gray-600">{item.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Cold Powerballs */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-blue-600">❄️ Cold Powerballs</h3>
        
        <div className="space-y-2">
          {stats.powerballStats.coldPowerballs.map((item, index) => (
            <div key={item.number} className="flex items-center justify-between p-2 bg-blue-50 rounded">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {item.number}
                </span>
              </div>
              <div className="text-right">
                <div className="font-semibold">{item.count} times</div>
                <div className="text-xs text-gray-600">{item.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">📊 Data Analysis</h2>
            <p className="text-sm text-gray-600">Historical lottery data insights and patterns</p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={selectedDataRange}
              onChange={(e) => setSelectedDataRange(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {dataRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <Button onClick={loadAnalysisData} size="small">
              🔄 Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Section Navigation */}
      <Card>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'hot-cold', label: '🔥 Hot/Cold Numbers' },
            { id: 'patterns', label: '📈 Patterns' },
            { id: 'powerball', label: '⚡ Powerball Analysis' }
          ].map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Content */}
      {activeSection === 'overview' && renderOverview()}
      {activeSection === 'hot-cold' && renderHotCold()}
      {activeSection === 'patterns' && renderPatterns()}
      {activeSection === 'powerball' && renderPowerball()}
    </div>
  );
}

export default DataAnalysis;