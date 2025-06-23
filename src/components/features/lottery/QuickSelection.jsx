// src/components/features/lottery/QuickSelection.jsx
import React, { useState } from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { lotteryPredictor } from '../../../services/algorithms/predictor';

function QuickSelection() {
  const [selections, setSelections] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateNumbers = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newSelections = lotteryPredictor.generateQuickPick(3);
    setSelections(newSelections);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">?? Quick Number Generation</h3>
            <p className="text-sm text-gray-600">Generate optimized lottery numbers instantly</p>
          </div>
          <Button onClick={generateNumbers} loading={isGenerating}>
            Generate 3 Sets
          </Button>
        </div>

        {selections.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Generated Numbers</h4>
            {selections.map((selection) => (
              <div key={selection.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-4 mb-2">
                  {selection.numbers.map((num, index) => (
                    <span 
                      key={index}
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
                <div className="text-sm text-gray-600">
                  <strong>{selection.strategy}</strong> - {selection.confidence}% confidence
                </div>
                <div className="text-xs text-gray-500">{selection.analysis}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default QuickSelection;

// ------------------