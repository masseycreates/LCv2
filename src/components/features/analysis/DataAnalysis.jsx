// src/components/features/analysis/DataAnalysis.jsx
import React from 'react';
import Card from '../../ui/Card';

function DataAnalysis() {
  return (
    <Card>
      <div className="text-center py-12">
        <div className="text-4xl mb-4">??</div>
        <h3 className="text-lg font-semibold mb-2">Data Analysis</h3>
        <p className="text-gray-600">Historical data and statistics</p>
        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-700">Coming next: Advanced data analysis tools</p>
        </div>
      </div>
    </Card>
  );
}

export default DataAnalysis;