import React, { useState, useEffect } from 'react';
import { useLottery } from '@/contexts/LotteryContext';
import { useApp } from '@/contexts/AppContext';
import { powerballService } from '@/services/powerballService';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import LoadingSpinner from '@components/ui/LoadingSpinner';
import Banner from '@components/ui/Banner';
import NumberDisplay from '@components/ui/NumberDisplay';

function DataAnalysis() {
  const { historicalStats, liveDataAvailable } = useLottery();
  const { systemPerformance, isClaudeEnabled, addNotification } = useApp();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedDataRange, setSelectedDataRange] = useState(100);

  const dataRangeOptions = [
    { value: 50, label: '50 drawings (2 months)' },
    { value: 100, label: '100 drawings (4 months)' },
    { value: 250, label: '250 drawings (1 year)' },
    { value: 500, label: '500 drawings (2 years)' },
    { value: 1000, label: '1000 drawings (4 years)' }
  ];

  useEffect(() => {
    if (historicalStats) {
      setAnalysisData(historicalStats);
    }
  }, [historicalStats]);

  const fetchAnalysisData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await powerballService.getHistoricalData(selectedDataRange);
      setAnalysisData(result.analysis);
      
      addNotification({
        type: 'success',
        message: `Analysis complete: ${result.analysis.totalDrawings} drawings processed`
      });
    } catch (err) {
      const errorMessage = err.code === 'NETWORK_ERROR' 
        ? 'Cannot connect to lottery data servers. Check your internet connection.'
        : err.code === 'API_ERROR'
        ? 'Lottery data service is temporarily unavailable. Please try again later.'
        : err.code === 'NO_DATA'
        ? 'No historical lottery data is available for the requested period.'
        : `Data analysis failed: ${err.message}`;
      
      setError(errorMessage);
      addNotification({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchAnalysisData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <LoadingSpinner.Inline message="Analyzing real lottery data..." />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Banner type="error">
          <div>
            <strong>Data Analysis Error:</strong> {error}
          </div>
          <Button 
            onClick={refreshData} 
            variant="ghost" 
            size="sm" 
            className="mt-3"
          >
            ?? Try Again
          </Button>
        </Banner>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-12">
            <div className="text-4xl mb-4">??</div>
            <h3 className="text-lg font-semibold mb-2">No Analysis Data Available</h3>
            <p className="text-gray-600 mb-4">
              Load real historical lottery data to begin analysis
            </p>
            <Button onClick={fetchAnalysisData} variant="primary">
              Load Real Data
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Data Source & Controls */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">?? Real Data Analysis</h3>
            <p className="text-sm text-gray-600">
              Analyzing {analysisData.totalDrawings} real Powerball drawings
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={selectedDataRange}
              onChange={(e) => setSelectedDataRange(parseInt(e.target.value))}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {dataRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <Button 
              onClick={refreshData} 
              variant="secondary" 
              size="sm"
            >
              ?? Refresh
            </Button>
          </div>
        </div>

        {/* Data Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-medium text-gray-900">Data Source</div>
            <div className="text-gray-600">{analysisData.dataSource}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-medium text-gray-900">Date Range</div>
            <div className="text-gray-600">
              {analysisData.dateRange.earliest} to {analysisData.dateRange.latest}
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-medium text-gray-900">Last Updated</div>
            <div className="text-gray-600">
              {new Date(analysisData.lastUpdated).toLocaleDateString()}
            </div>
          </div>
        </div>
      </Card>

      {/* Number Frequency Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h4 className="font-semibold text-gray-900 mb-4">?? Most Frequent Numbers</h4>
          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Main Numbers (1-69)</h5>
              <div className="flex flex-wrap gap-2">
                {analysisData.numberAnalysis.hotNumbers.map((num, index) => (
                  <div key={num} className="text-center">
                    <NumberDisplay
                      number={num}
                      variant="hot"
                      size="sm"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {analysisData.numberAnalysis.frequency[num]} times
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Hot Powerballs (1-26)</h5>
              <div className="flex flex-wrap gap-2">
                {analysisData.powerballAnalysis.hotPowerballs.slice(0, 8).map(num => (
                  <div key={num} className="text-center">
                    <NumberDisplay
                      number={num}
                      variant="hot"
                      size="sm"
                      isPowerball
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {analysisData.powerballAnalysis.frequency[num]} times
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h4 className="font-semibold text-gray-900 mb-4">?? Least Frequent Numbers</h4>
          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Main Numbers (1-69)</h5>
              <div className="flex flex-wrap gap-2">
                {analysisData.numberAnalysis.coldNumbers.map(num => (
                  <div key={num} className="text-center">
                    <NumberDisplay
                      number={num}
                      variant="cold"
                      size="sm"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {analysisData.numberAnalysis.frequency[num] || 0} times
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Pattern Analysis */}
      <Card>
        <h4 className="font-semibold text-gray-900 mb-4">?? Pattern Analysis</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {Math.round(analysisData.patterns.averageSum)}
            </div>
            <div className="text-sm font-medium text-gray-900">Average Sum</div>
            <div className="text-xs text-gray-500">
              Range: {analysisData.patterns.sumRange.min} - {analysisData.patterns.sumRange.max}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {analysisData.patterns.averageConsecutive.toFixed(1)}
            </div>
            <div className="text-sm font-medium text-gray-900">Avg Consecutive</div>
            <div className="text-xs text-gray-500">
              Numbers in sequence
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {analysisData.totalDrawings}
            </div>
            <div className="text-sm font-medium text-gray-900">Total Drawings</div>
            <div className="text-xs text-gray-500">
              Analyzed in dataset
            </div>
          </div>
        </div>
      </Card>

      {/* System Status */}
      <Card>
        <h4 className="font-semibold text-gray-900 mb-4">?? System Status</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-sm mb-2 text-gray-900">Data Connection</h5>
            <p className="text-sm text-gray-700">
              {liveDataAvailable ? '? Connected to real data sources' : '? No live data connection'}
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-sm mb-2 text-gray-900">AI Enhancement</h5>
            <p className="text-sm text-gray-700">
              {isClaudeEnabled ? '? Claude AI integration active' : '?? Local analysis only'}
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-sm mb-2 text-gray-900">Analysis Quality</h5>
            <p className="text-sm text-gray-700">
              {analysisData.totalDrawings >= 100 
                ? '? Sufficient data for reliable analysis' 
                : '?? Limited data - results may vary'
              }
            </p>
          </div>
        </div>
      </Card>

      {/* Data Disclaimer */}
      <Banner type="info">
        <strong>Real Data Analysis:</strong> This dashboard uses actual historical Powerball drawing data. 
        Analysis is based on mathematical patterns and statistical frequencies. Past results do not guarantee future outcomes.
        Lottery games involve chance and no analysis can predict winning numbers.
      </Banner>
    </div>
  );
}

export default DataAnalysis;