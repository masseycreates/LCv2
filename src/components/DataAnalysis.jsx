// LCv2 Data Analysis Component - System Diagnostics & Analytics
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { powerballAPI } from '../services/PowerballAPI.js';
import { lotteryPredictor } from '../services/LotteryPredictor.js';
import { claudeAPI } from '../services/ClaudeAPI.js';
import { formatCurrency, calculateHistoricalDepth, formatPercentage } from '../utils/helpers.js';

export default function DataAnalysis({
  liveDataAvailable,
  historicalDataAvailable,
  historicalStats,
  lastUpdated,
  systemPerformance,
  errorLog = [],
  dataStatus,
  setDataStatus
}) {
  
  // ===========================================================================
  // STATE MANAGEMENT
  // ===========================================================================
  
  const [diagnostics, setDiagnostics] = useState(null);
  const [isLoadingDiagnostics, setIsLoadingDiagnostics] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Advanced analysis state
  const [patternAnalysis, setPatternAnalysis] = useState(null);
  const [algorithmPerformance, setAlgorithmPerformance] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);

  // ===========================================================================
  // EFFECTS
  // ===========================================================================
  
  useEffect(() => {
    loadDiagnostics();
    generatePerformanceReport();
    analyzePatterns();
  }, []);

  useEffect(() => {
    if (historicalStats) {
      analyzePatterns();
    }
  }, [historicalStats]);

  // ===========================================================================
  // DIAGNOSTIC FUNCTIONS
  // ===========================================================================
  
  const loadDiagnostics = useCallback(async () => {
    setIsLoadingDiagnostics(true);
    setDataStatus('?? Running system diagnostics...');
    
    try {
      // Test all system components
      const diagnosticResults = await runComprehensiveDiagnostics();
      setDiagnostics(diagnosticResults);
      
      // Analyze system health
      const healthAnalysis = analyzeSystemHealth(diagnosticResults);
      setSystemHealth(healthAnalysis);
      
      setDataStatus('? Diagnostics completed');
      
    } catch (error) {
      console.error('Failed to load diagnostics:', error);
      setDataStatus('? Diagnostics failed');
    } finally {
      setIsLoadingDiagnostics(false);
      setTimeout(() => setDataStatus(''), 3000);
    }
  }, [setDataStatus]);

  const runComprehensiveDiagnostics = async () => {
    const results = {
      timestamp: new Date().toISOString(),
      components: {},
      performance: {},
      connectivity: {},
      data: {}
    };

    try {
      // Test PowerballAPI
      const apiTest = await powerballAPI.testConnectivity();
      results.components.powerballAPI = {
        status: apiTest.success ? 'healthy' : 'error',
        latency: apiTest.latency || 0,
        lastError: apiTest.error || null,
        features: ['fetchCurrentData', 'fetchHistoricalData', 'getDiagnostics']
      };

      // Test LotteryPredictor
      const predictorTest = testLotteryPredictor();
      results.components.lotteryPredictor = predictorTest;

      // Test ClaudeAPI (if available)
      const claudeTest = testClaudeAPI();
      results.components.claudeAPI = claudeTest;

      // Browser compatibility
      results.components.browser = testBrowserCompatibility();

      // Performance metrics
      results.performance = gatherPerformanceMetrics();

      // Data quality assessment
      if (historicalStats) {
        results.data = assessDataQuality(historicalStats);
      }

    } catch (error) {
      console.error('Diagnostic error:', error);
      results.error = error.message;
    }

    return results;
  };

  const testLotteryPredictor = () => {
    try {
      // Test basic functionality
      const testData = Array.from({ length: 10 }, (_, i) => ({
        numbers: [1 + i, 2 + i, 3 + i, 4 + i, 5 + i],
        powerball: 1 + i,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
      }));

      const predictions = lotteryPredictor.generateEnsemblePrediction(testData, 3);
      
      return {
        status: predictions && predictions.length > 0 ? 'healthy' : 'warning',
        algorithmsActive: 6,
        lastPrediction: predictions?.[0] ? new Date().toISOString() : null,
        features: ['EWMA', 'Neural Network', 'Pair Analysis', 'Gap Analysis', 'Markov Chain', 'Sum Range']
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        algorithmsActive: 0
      };
    }
  };

  const testClaudeAPI = () => {
    try {
      return {
        status: claudeAPI.isEnabled ? 'healthy' : 'disabled',
        model: 'claude-sonnet-4',
        features: claudeAPI.isEnabled ? ['hybridSelection', 'quickSelection', 'insights'] : [],
        lastConnection: claudeAPI.isEnabled ? new Date().toISOString() : null
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  };

  const testBrowserCompatibility = () => {
    const features = {
      localStorage: typeof localStorage !== 'undefined',
      fetch: typeof fetch !== 'undefined',
      promises: typeof Promise !== 'undefined',
      modules: typeof window !== 'undefined',  // ✅ Check for browser environment
      webWorkers: typeof Worker !== 'undefined',
      clipboard: typeof navigator?.clipboard !== 'undefined'
    };

    const supportedCount = Object.values(features).filter(Boolean).length;
    const totalFeatures = Object.keys(features).length;
    
    return {
      status: supportedCount === totalFeatures ? 'healthy' : 'warning',
      compatibility: (supportedCount / totalFeatures) * 100,
      features,
      userAgent: navigator.userAgent,
      platform: navigator.platform
    };
  };

  const gatherPerformanceMetrics = () => {
    const metrics = {
      memory: null,
      timing: null,
      connection: null
    };

    // Memory usage (if available)
    if (performance.memory) {
      metrics.memory = {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }

    // Navigation timing
    if (performance.timing) {
      const timing = performance.timing;
      metrics.timing = {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: timing.responseEnd - timing.requestStart
      };
    }

    // Connection info (if available)
    if (navigator.connection) {
      metrics.connection = {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      };
    }

    return metrics;
  };

  const assessDataQuality = (stats) => {
    if (!stats || !stats.drawings) {
      return { status: 'error', message: 'No historical data available' };
    }

    const drawings = stats.drawings;
    const quality = {
      totalRecords: drawings.length,
      validRecords: 0,
      invalidRecords: 0,
      missingFields: 0,
      duplicates: 0,
      dateRange: null,
      completeness: 0
    };

    const seenDrawings = new Set();
    
    drawings.forEach(drawing => {
      const key = `${drawing.date}-${drawing.numbers?.join(',')}-${drawing.powerball}`;
      
      if (seenDrawings.has(key)) {
        quality.duplicates++;
        return;
      }
      seenDrawings.add(key);

      if (drawing.numbers && 
          Array.isArray(drawing.numbers) && 
          drawing.numbers.length === 5 && 
          drawing.powerball &&
          drawing.date) {
        quality.validRecords++;
      } else {
        quality.invalidRecords++;
        if (!drawing.numbers || !Array.isArray(drawing.numbers)) quality.missingFields++;
        if (!drawing.powerball) quality.missingFields++;
        if (!drawing.date) quality.missingFields++;
      }
    });

    quality.completeness = (quality.validRecords / quality.totalRecords) * 100;
    
    if (drawings.length > 0) {
      const dates = drawings
        .filter(d => d.date)
        .map(d => new Date(d.date))
        .sort((a, b) => a - b);
      
      if (dates.length > 0) {
        quality.dateRange = {
          earliest: dates[0].toISOString().split('T')[0],
          latest: dates[dates.length - 1].toISOString().split('T')[0],
          span: calculateHistoricalDepth(drawings)
        };
      }
    }

    return {
      status: quality.completeness > 90 ? 'healthy' : quality.completeness > 70 ? 'warning' : 'error',
      ...quality
    };
  };

  const analyzeSystemHealth = (diagnostics) => {
    if (!diagnostics) return null;

    const components = diagnostics.components || {};
    const healthyCount = Object.values(components).filter(c => c.status === 'healthy').length;
    const totalComponents = Object.keys(components).length;
    const healthPercentage = totalComponents > 0 ? (healthyCount / totalComponents) * 100 : 0;

    let overallStatus = 'healthy';
    if (healthPercentage < 60) overallStatus = 'critical';
    else if (healthPercentage < 80) overallStatus = 'warning';

    return {
      overall: overallStatus,
      score: healthPercentage,
      components: totalComponents,
      healthy: healthyCount,
      warnings: Object.values(components).filter(c => c.status === 'warning').length,
      errors: Object.values(components).filter(c => c.status === 'error').length,
      recommendations: generateHealthRecommendations(components)
    };
  };

  const generateHealthRecommendations = (components) => {
    const recommendations = [];

    if (components.powerballAPI?.status === 'error') {
      recommendations.push({
        type: 'critical',
        message: 'PowerballAPI is offline. Check internet connection and API endpoints.',
        action: 'Refresh data or check network connectivity'
      });
    }

    if (components.claudeAPI?.status === 'disabled') {
      recommendations.push({
        type: 'info',
        message: 'Claude AI is not enabled. Add your Anthropic API key for enhanced predictions.',
        action: 'Enter API key in Quick Selection tab'
      });
    }

    if (components.browser?.compatibility < 90) {
      recommendations.push({
        type: 'warning',
        message: 'Browser compatibility issues detected. Some features may not work properly.',
        action: 'Update your browser to the latest version'
      });
    }

    return recommendations;
  };

  // ===========================================================================
  // PATTERN ANALYSIS
  // ===========================================================================
  
  const analyzePatterns = useCallback(() => {
    if (!historicalStats || !historicalStats.drawings) return;

    setDataStatus('?? Analyzing number patterns...');
    
    try {
      const analysis = performPatternAnalysis(historicalStats.drawings);
      setPatternAnalysis(analysis);
      setDataStatus('? Pattern analysis completed');
    } catch (error) {
      console.error('Pattern analysis failed:', error);
      setDataStatus('? Pattern analysis failed');
    } finally {
      setTimeout(() => setDataStatus(''), 3000);
    }
  }, [historicalStats, setDataStatus]);

  const performPatternAnalysis = (drawings) => {
    const analysis = {
      frequency: {},
      pairs: {},
      gaps: {},
      trends: {},
      distributions: {}
    };

    // Number frequency analysis
    for (let i = 1; i <= 69; i++) {
      analysis.frequency[i] = 0;
      analysis.gaps[i] = [];
    }

    let currentGaps = {};
    for (let i = 1; i <= 69; i++) {
      currentGaps[i] = 0;
    }

    // Process each drawing
    drawings.forEach((drawing, index) => {
      if (!drawing.numbers) return;

      // Update gaps for all numbers
      for (let i = 1; i <= 69; i++) {
        currentGaps[i]++;
      }

      // Process drawn numbers
      drawing.numbers.forEach(num => {
        if (num >= 1 && num <= 69) {
          analysis.frequency[num]++;
          analysis.gaps[num].push(currentGaps[num]);
          currentGaps[num] = 0;
        }
      });

      // Pair analysis
      drawing.numbers.forEach((num1, i) => {
        drawing.numbers.forEach((num2, j) => {
          if (i < j) {
            const pair = `${Math.min(num1, num2)}-${Math.max(num1, num2)}`;
            analysis.pairs[pair] = (analysis.pairs[pair] || 0) + 1;
          }
        });
      });
    });

    // Calculate statistics
    const frequencies = Object.values(analysis.frequency);
    const avgFrequency = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
    
    analysis.distributions = {
      mean: avgFrequency,
      max: Math.max(...frequencies),
      min: Math.min(...frequencies),
      stdDev: Math.sqrt(frequencies.reduce((acc, f) => acc + Math.pow(f - avgFrequency, 2), 0) / frequencies.length)
    };

    // Find hot/cold numbers
    const sortedByFreq = Object.entries(analysis.frequency)
      .sort(([,a], [,b]) => b - a)
      .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }));

    analysis.trends = {
      hot: sortedByFreq.slice(0, 10),
      cold: sortedByFreq.slice(-10),
      overdue: Object.entries(currentGaps)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([num, gap]) => ({ number: parseInt(num), gap }))
    };

    return analysis;
  };

  const generatePerformanceReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      uptime: systemPerformance?.uptime || 0,
      errorRate: errorLog.length > 0 ? (errorLog.length / 100) : 0,
      features: {
        dataFetching: liveDataAvailable ? 'operational' : 'degraded',
        algorithms: 'operational',
        ai: claudeAPI?.isEnabled ? 'operational' : 'disabled',
        calculations: 'operational'
      },
      metrics: systemPerformance || {}
    };

    setPerformanceMetrics(report);
  };

  // ===========================================================================
  // RENDER HELPERS
  // ===========================================================================
  
  const renderStatusIndicator = (status, label, details = null) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'healthy': return 'text-green-600';
        case 'warning': return 'text-yellow-600';
        case 'error': case 'critical': return 'text-red-600';
        case 'disabled': return 'text-gray-600';
        default: return 'text-gray-600';
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'healthy': return '?';
        case 'warning': return '??';
        case 'error': case 'critical': return '?';
        case 'disabled': return '?';
        default: return '?';
      }
    };

    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <span>{getStatusIcon(status)}</span>
          <span className={`font-medium ${getStatusColor(status)}`}>{label}</span>
        </div>
        {details && (
          <span className="text-sm text-gray-600">{details}</span>
        )}
      </div>
    );
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      
      {/* System Health Overview */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">?? System Health Overview</h3>
          <p className="card-subtitle">Real-time system status and performance</p>
        </div>
        
        {systemHealth ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Overall System Health</span>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                systemHealth.overall === 'healthy' ? 'bg-green-100 text-green-800' :
                systemHealth.overall === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {systemHealth.score.toFixed(0)}% {systemHealth.overall.toUpperCase()}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{systemHealth.healthy}</div>
                <div className="text-sm text-gray-600">Healthy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{systemHealth.warnings}</div>
                <div className="text-sm text-gray-600">Warnings</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{systemHealth.errors}</div>
                <div className="text-sm text-gray-600">Errors</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">{systemHealth.components}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>

            {systemHealth.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Recommendations:</h4>
                {systemHealth.recommendations.map((rec, index) => (
                  <div key={index} className={`p-3 rounded-lg border-l-4 ${
                    rec.type === 'critical' ? 'bg-red-50 border-red-400' :
                    rec.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                    'bg-blue-50 border-blue-400'
                  }`}>
                    <p className="text-sm font-medium">{rec.message}</p>
                    <p className="text-xs text-gray-600 mt-1">{rec.action}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="loading-spinner loading-spinner-lg mx-auto mb-4" />
            <p className="text-gray-600">Analyzing system health...</p>
          </div>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl mb-2">??</div>
          <div className="text-lg font-semibold text-gray-800">Data Status</div>
          <div className={`text-sm ${liveDataAvailable ? 'text-green-600' : 'text-orange-600'}`}>
            {liveDataAvailable ? 'Live Connected' : 'Offline Mode'}
          </div>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl mb-2">??</div>
          <div className="text-lg font-semibold text-gray-800">Historical Data</div>
          <div className="text-sm text-gray-600">
            {historicalStats ? `${historicalStats.totalDrawings} drawings` : 'Loading...'}
          </div>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl mb-2">??</div>
          <div className="text-lg font-semibold text-gray-800">Algorithms</div>
          <div className="text-sm text-green-600">6 Active</div>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl mb-2">??</div>
          <div className="text-lg font-semibold text-gray-800">Claude AI</div>
          <div className={`text-sm ${claudeAPI?.isEnabled ? 'text-green-600' : 'text-gray-600'}`}>
            {claudeAPI?.isEnabled ? 'Connected' : 'Disabled'}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDiagnosticsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">?? Detailed Diagnostics</h3>
        <button
          onClick={loadDiagnostics}
          disabled={isLoadingDiagnostics}
          className="btn btn-primary"
        >
          {isLoadingDiagnostics ? (
            <>
              <div className="loading-spinner" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <span>??</span>
              <span>Re-run Diagnostics</span>
            </>
          )}
        </button>
      </div>

      {diagnostics ? (
        <div className="space-y-4">
          {Object.entries(diagnostics.components).map(([component, data]) => (
            <div key={component} className="card">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold capitalize">{component.replace(/([A-Z])/g, ' $1')}</h4>
                {renderStatusIndicator(data.status, data.status.toUpperCase())}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Features:</strong>
                  <ul className="list-disc list-inside text-gray-600 mt-1">
                    {(data.features || []).map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  {data.latency && (
                    <p><strong>Latency:</strong> {data.latency}ms</p>
                  )}
                  {data.algorithmsActive !== undefined && (
                    <p><strong>Algorithms Active:</strong> {data.algorithmsActive}</p>
                  )}
                  {data.compatibility && (
                    <p><strong>Compatibility:</strong> {data.compatibility.toFixed(1)}%</p>
                  )}
                  {data.error && (
                    <p className="text-red-600"><strong>Error:</strong> {data.error}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">??</div>
          <p className="text-gray-600">Click "Re-run Diagnostics" to analyze system components</p>
        </div>
      )}
    </div>
  );

  const renderPatternsTab = () => (
    <div className="space-y-6">
      {patternAnalysis ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Hot Numbers */}
            <div className="card">
              <h4 className="font-semibold text-gray-800 mb-3">?? Hot Numbers</h4>
              <div className="space-y-2">
                {patternAnalysis.trends.hot.slice(0, 8).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="font-medium">{item.number}</span>
                    <span className="text-gray-600">{item.frequency}x</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cold Numbers */}
            <div className="card">
              <h4 className="font-semibold text-gray-800 mb-3">?? Cold Numbers</h4>
              <div className="space-y-2">
                {patternAnalysis.trends.cold.slice(0, 8).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="font-medium">{item.number}</span>
                    <span className="text-gray-600">{item.frequency}x</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Overdue Numbers */}
            <div className="card">
              <h4 className="font-semibold text-gray-800 mb-3">? Overdue Numbers</h4>
              <div className="space-y-2">
                {patternAnalysis.trends.overdue.slice(0, 8).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="font-medium">{item.number}</span>
                    <span className="text-gray-600">{item.gap} draws</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Distribution Statistics */}
          <div className="card">
            <h4 className="font-semibold text-gray-800 mb-3">?? Distribution Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {patternAnalysis.distributions.mean.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Average Frequency</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {patternAnalysis.distributions.max}
                </div>
                <div className="text-sm text-gray-600">Max Frequency</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">
                  {patternAnalysis.distributions.min}
                </div>
                <div className="text-sm text-gray-600">Min Frequency</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">
                  {patternAnalysis.distributions.stdDev.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Std Deviation</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">??</div>
          <p className="text-gray-600">
            {historicalStats ? 'Analyzing patterns...' : 'Historical data required for pattern analysis'}
          </p>
        </div>
      )}
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {performanceMetrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card text-center">
              <div className="text-2xl mb-2">??</div>
              <div className="text-lg font-semibold">Uptime</div>
              <div className="text-blue-600">
                {Math.round(performanceMetrics.uptime / 1000 / 60)}m
              </div>
            </div>
            
            <div className="card text-center">
              <div className="text-2xl mb-2">??</div>
              <div className="text-lg font-semibold">Memory</div>
              <div className="text-purple-600">
                {performanceMetrics.metrics.memory?.used || 0}MB
              </div>
            </div>
            
            <div className="card text-center">
              <div className="text-2xl mb-2">??</div>
              <div className="text-lg font-semibold">Error Rate</div>
              <div className="text-red-600">
                {(performanceMetrics.errorRate * 100).toFixed(1)}%
              </div>
            </div>
            
            <div className="card text-center">
              <div className="text-2xl mb-2">??</div>
              <div className="text-lg font-semibold">Features</div>
              <div className="text-green-600">
                {Object.values(performanceMetrics.features).filter(f => f === 'operational').length}/
                {Object.keys(performanceMetrics.features).length}
              </div>
            </div>
          </div>

          {/* Feature Status */}
          <div className="card">
            <h4 className="font-semibold text-gray-800 mb-3">??? Feature Status</h4>
            <div className="space-y-2">
              {Object.entries(performanceMetrics.features).map(([feature, status]) => 
                renderStatusIndicator(status, feature.replace(/([A-Z])/g, ' $1'), status.toUpperCase())
              )}
            </div>
          </div>

          {/* Error Log */}
          {errorLog.length > 0 && (
            <div className="card">
              <h4 className="font-semibold text-gray-800 mb-3">?? Recent Errors ({errorLog.length})</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {errorLog.slice(0, 10).map((error, index) => (
                  <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-xs">
                    <div className="font-medium text-red-800">{error.category}</div>
                    <div className="text-red-600">{error.message}</div>
                    <div className="text-gray-500">{new Date(error.timestamp).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  // ===========================================================================
  // MAIN RENDER
  // ===========================================================================
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '??' },
    { id: 'diagnostics', label: 'Diagnostics', icon: '??' },
    { id: 'patterns', label: 'Patterns', icon: '??' },
    { id: 'performance', label: 'Performance', icon: '?' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'diagnostics' && renderDiagnosticsTab()}
        {activeTab === 'patterns' && renderPatternsTab()}
        {activeTab === 'performance' && renderPerformanceTab()}
      </div>
    </div>
  );
}