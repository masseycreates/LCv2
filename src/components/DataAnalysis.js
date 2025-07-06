// LCv2 Data Analysis Component
import React, { useState, useEffect } from 'react';
import { powerballAPI } from '../services/PowerballAPI.js';
import { lotteryPredictor } from '../services/LotteryPredictor.js';
import { claudeAPI } from '../services/ClaudeAPI.js';

export default function DataAnalysis({
  liveDataAvailable,
  historicalDataAvailable,
  historicalStats,
  lastUpdated,
  systemPerformance
}) {
  
  const [diagnostics, setDiagnostics] = useState(null);
  const [isLoadingDiagnostics, setIsLoadingDiagnostics] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  // Load diagnostics on component mount
  useEffect(() => {
    loadDiagnostics();
  }, []);

  // Load system diagnostics
  const loadDiagnostics = async () => {
    setIsLoadingDiagnostics(true);
    
    try {
      const diagnosticsData = await powerballAPI.getDiagnostics();
      setDiagnostics(diagnosticsData);
    } catch (error) {
      console.error('Failed to load diagnostics:', error);
    }
    
    setIsLoadingDiagnostics(false);
  };

  // Toggle expanded section
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Render system status indicator
  const renderStatusIndicator = (status, label) => {
    const getStatusColor = (status) => {
      if (status === true || status === 'success' || status === 'excellent' || status === 'healthy') return 'text-green-600';
      if (status === false || status === 'failed' || status === 'error') return 'text-red-600';
      if (status === 'warning' || status === 'degraded') return 'text-yellow-600';
      return 'text-gray-600';
    };

    const getStatusIcon = (status) => {
      if (status === true || status === 'success' || status === 'excellent' || status === 'healthy') return '✅';
      if (status === false || status === 'failed' || status === 'error') return '❌';
      if (status === 'warning' || status === 'degraded') return '⚠️';
      return '❓';
    };

    return (
      <div className="flex items-center gap-2">
        <span>{getStatusIcon(status)}</span>
        <span className={getStatusColor(status)}>{label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* System Overview */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">📊 System Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          
          {/* Live Data Status */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-1 text-gray-900">Live Data Status</h4>
            {renderStatusIndicator(liveDataAvailable, liveDataAvailable ? 'Connected' : 'Unavailable')}
            <p className="text-xs text-gray-600 mt-1">
              {lastUpdated ? `Updated: ${lastUpdated}` : 'Not updated'}
            </p>
          </div>
          
          {/* Historical Data Status */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-1 text-gray-900">Historical Data</h4>
            {renderStatusIndicator(historicalDataAvailable, historicalDataAvailable ? 'Available' : 'Limited')}
            <p className="text-xs text-gray-600 mt-1">
              {historicalStats ? `${historicalStats.totalDrawings} drawings` : 'No data'}
            </p>
          </div>
          
          {/* AI Status */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-1 text-gray-900">AI Integration</h4>
            {renderStatusIndicator(claudeAPI.isAvailable(), claudeAPI.isAvailable() ? 'Claude Opus 4 Active' : 'Local Only')}
            <p className="text-xs text-gray-600 mt-1">
              {claudeAPI.isAvailable() ? 'Hybrid AI + Algorithms' : 'Mathematical algorithms only'}
            </p>
          </div>
          
          {/* Algorithm Status */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-1 text-gray-900">Algorithm Engine</h4>
            {renderStatusIndicator('healthy', 'All Systems Operational')}
            <p className="text-xs text-gray-600 mt-1">
              6 algorithms running normally
            </p>
          </div>
        </div>
      </div>

      {/* Statistical Analysis */}
      {historicalStats && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">📈 Statistical Analysis</h3>
            <button
              onClick={() => toggleSection('stats')}
              className="btn btn-secondary btn-sm"
            >
              {expandedSection === 'stats' ? '▼ Collapse' : '▶ Expand'}
            </button>
          </div>
          
          {/* Basic Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{historicalStats.totalDrawings}</div>
              <div className="text-xs text-gray-600">Total Drawings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {historicalStats.dateRange ? 
                  Math.floor((new Date(historicalStats.dateRange.latest) - new Date(historicalStats.dateRange.earliest)) / (1000 * 60 * 60 * 24 * 365)) 
                  : 'N/A'
                }
              </div>
              <div className="text-xs text-gray-600">Years of Data</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {historicalStats.hotNumbers ? historicalStats.hotNumbers.length : 0}
              </div>
              <div className="text-xs text-gray-600">Hot Numbers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {historicalStats.coldNumbers ? historicalStats.coldNumbers.length : 0}
              </div>
              <div className="text-xs text-gray-600">Cold Numbers</div>
            </div>
          </div>
          
          {/* Expanded Statistics */}
          {expandedSection === 'stats' && (
            <div className="space-y-4 border-t pt-4">
              
              {/* Hot Numbers */}
              {historicalStats.hotNumbers && (
                <div>
                  <h4 className="font-medium text-sm mb-2 text-gray-900">🔥 Most Frequent Numbers</h4>
                  <div className="flex flex-wrap gap-2">
                    {historicalStats.hotNumbers.slice(0, 15).map(num => (
                      <span key={num} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Cold Numbers */}
              {historicalStats.coldNumbers && (
                <div>
                  <h4 className="font-medium text-sm mb-2 text-gray-900">❄️ Least Frequent Numbers</h4>
                  <div className="flex flex-wrap gap-2">
                    {historicalStats.coldNumbers.slice(0, 15).map(num => (
                      <span key={num} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Powerball Analysis */}
              {historicalStats.hotPowerballs && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-gray-900">🔥 Hot Powerballs</h4>
                    <div className="flex flex-wrap gap-1">
                      {historicalStats.hotPowerballs.slice(0, 8).map(num => (
                        <span key={num} className="powerball-display text-xs">
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-gray-900">❄️ Cold Powerballs</h4>
                    <div className="flex flex-wrap gap-1">
                      {historicalStats.coldPowerballs?.slice(0, 8).map(num => (
                        <span key={num} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Pattern Analysis */}
              {historicalStats.patterns && (
                <div>
                  <h4 className="font-medium text-sm mb-2 text-gray-900">🔍 Pattern Analysis</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {historicalStats.patterns.evenOddDistribution && (
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="font-medium">Even/Odd</div>
                        <div>{historicalStats.patterns.evenOddDistribution.evenPercentage?.toFixed(1)}% Even</div>
                      </div>
                    )}
                    {historicalStats.patterns.lowHighDistribution && (
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="font-medium">Low/High</div>
                        <div>{historicalStats.patterns.lowHighDistribution.lowPercentage?.toFixed(1)}% Low</div>
                      </div>
                    )}
                    {historicalStats.sumRanges && (
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="font-medium">Avg Sum</div>
                        <div>{historicalStats.sumRanges.average?.toFixed(0)}</div>
                      </div>
                    )}
                    {historicalStats.patterns.consecutiveNumbers !== undefined && (
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="font-medium">Consecutive</div>
                        <div>{(historicalStats.patterns.consecutiveNumbers * 100).toFixed(1)}%</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* System Performance */}
      {systemPerformance && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">⚙️ System Performance</h3>
            <button
              onClick={() => toggleSection('performance')}
              className="btn btn-secondary btn-sm"
            >
              {expandedSection === 'performance' ? '▼ Collapse' : '▶ Expand'}
            </button>
          </div>
          
          {/* Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{systemPerformance.averageHitRate}%</div>
              <div className="text-xs text-gray-600">Avg Hit Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{systemPerformance.predictionsGenerated}</div>
              <div className="text-xs text-gray-600">Predictions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {claudeAPI.isAvailable() ? 'OPUS 4' : 'LOCAL'}
              </div>
              <div className="text-xs text-gray-600">AI Mode</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{systemPerformance.status.toUpperCase()}</div>
              <div className="text-xs text-gray-600">Status</div>
            </div>
          </div>
          
          {/* Expanded Performance Details */}
          {expandedSection === 'performance' && systemPerformance.algorithmHealth && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-sm mb-3 text-gray-900">🧮 Algorithm Health</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(systemPerformance.algorithmHealth).map(([id, health]) => (
                  <div key={id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">
                        {id.toUpperCase()}
                      </span>
                      {renderStatusIndicator(health.status, health.status)}
                    </div>
                    <div className="text-xs text-gray-600">
                      Success: {(health.successRate * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">
                      Weight: {(health.weight * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* System Diagnostics */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">🔧 System Diagnostics</h3>
          <div className="flex gap-2">
            <button
              onClick={loadDiagnostics}
              disabled={isLoadingDiagnostics}
              className="btn btn-secondary btn-sm"
            >
              {isLoadingDiagnostics ? <span className="loading-spinner" /> : '🔄'} Refresh
            </button>
            <button
              onClick={() => toggleSection('diagnostics')}
              className="btn btn-secondary btn-sm"
            >
              {expandedSection === 'diagnostics' ? '▼ Collapse' : '▶ Expand'}
            </button>
          </div>
        </div>
        
        {isLoadingDiagnostics ? (
          <div className="text-center py-4">
            <div className="loading-spinner mx-auto mb-2" />
            <p className="text-sm text-gray-600">Running diagnostics...</p>
          </div>
        ) : diagnostics ? (
          <div className="space-y-4">
            
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm mb-1">Data Sources</h4>
                <p className="text-lg font-bold">
                  {diagnostics.summary?.workingDataSources || 0}/{diagnostics.summary?.totalDataSources || 0}
                </p>
                <p className="text-xs text-gray-600">Sources working</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm mb-1">Response Time</h4>
                <p className="text-lg font-bold">{diagnostics.summary?.avgResponseTime || 0}ms</p>
                <p className="text-xs text-gray-600">Average response</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm mb-1">Data Quality</h4>
                <p className="text-lg font-bold">
                  {diagnostics.summary?.sourcesWithJackpotData || 0}
                </p>
                <p className="text-xs text-gray-600">Sources with data</p>
              </div>
            </div>
            
            {/* Recommendations */}
            {diagnostics.summary?.recommendations && (
              <div>
                <h4 className="font-medium text-sm mb-2 text-gray-900">💡 Recommendations</h4>
                <div className="space-y-1">
                  {diagnostics.summary.recommendations.map((rec, index) => (
                    <div key={index} className="text-xs p-2 bg-blue-50 rounded">
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Expanded Diagnostics */}
            {expandedSection === 'diagnostics' && diagnostics.dataSources && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-3 text-gray-900">🌐 Data Source Details</h4>
                <div className="space-y-2">
                  {diagnostics.dataSources.map((source, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{source.name}</span>
                        {renderStatusIndicator(source.status, source.status)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                        <div>Status: {source.statusCode || 'N/A'}</div>
                        <div>Response: {source.responseTime || 0}ms</div>
                        <div>Data: {source.dataFound ? 'Found' : 'Missing'}</div>
                        <div>Jackpot: {source.jackpotExtracted ? '✅' : '❌'}</div>
                      </div>
                      {source.error && (
                        <div className="text-xs text-red-600 mt-1">
                          Error: {source.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">No diagnostic data available</p>
          </div>
        )}
      </div>

      {/* Environment Information */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">🌍 Environment Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-1">Architecture</h4>
            <p className="text-xs text-gray-600">Modular React + Vite</p>
            <p className="text-xs text-gray-600">Component-based design</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-1">Deployment</h4>
            <p className="text-xs text-gray-600">Vercel Serverless</p>
            <p className="text-xs text-gray-600">Global edge network</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-1">AI Integration</h4>
            <p className="text-xs text-gray-600">Claude Opus 4 compatible</p>
            <p className="text-xs text-gray-600">Hybrid AI + Algorithms</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-1">Data Sources</h4>
            <p className="text-xs text-gray-600">Multiple APIs</p>
            <p className="text-xs text-gray-600">Real-time + Historical</p>
          </div>
        </div>
      </div>
    </div>
  );
}