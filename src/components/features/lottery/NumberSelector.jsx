// src/components/features/lottery/NumberSelector.jsx
import React from 'react';
import Card from '../../ui/Card';

function NumberSelector() {
  return (
    <Card>
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🎲</div>
        <h3 className="text-lg font-semibold mb-2">Manual Number Selection</h3>
        <p className="text-gray-600">Choose your own lucky numbers</p>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">Coming next: Interactive number picker</p>
        </div>
      </div>
    </Card>
  );
}

export default NumberSelector;

// ------------------