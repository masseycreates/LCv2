// src/components/features/tax-calculator/TaxCalculator.jsx
import React, { useState } from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { taxCalculatorService } from '../../../services/tax/taxCalculatorService';

function TaxCalculator() {
  const [jackpotAmount, setJackpotAmount] = useState('50000000');
  const [selectedState, setSelectedState] = useState('GA');
  const [otherIncome, setOtherIncome] = useState('75000');
  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateTaxes = async () => {
    setIsCalculating(true);
    
    try {
      // Simulate calculation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const calculationResults = taxCalculatorService.calculateTaxes({
        jackpotAmount: parseFloat(jackpotAmount.replace(/[,$]/g, '')),
        otherIncome: parseFloat(otherIncome.replace(/[,$]/g, '')) || 0,
        state: selectedState
      });
      
      setResults(calculationResults);
    } catch (error) {
      console.error('Tax calculation failed:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (rate) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  const states = taxCalculatorService.getStates();

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">🧮 Lottery Tax Calculator</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              💰 Jackpot Amount
            </label>
            <input
              type="text"
              value={jackpotAmount}
              onChange={(e) => setJackpotAmount(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="50000000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-xs text-gray-500 mt-1">
              Formatted: {formatCurrency(parseFloat(jackpotAmount.replace(/[,$]/g, '')) || 0)}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🏛️ Your State
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {states.map(state => (
                <option key={state.code} value={state.code}>
                  {state.name} ({formatPercentage(state.rate)})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              💼 Other Annual Income
            </label>
            <input
              type="text"
              value={otherIncome}
              onChange={(e) => setOtherIncome(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="75000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-xs text-gray-500 mt-1">
              Formatted: {formatCurrency(parseFloat(otherIncome.replace(/[,$]/g, '')) || 0)}
            </div>
          </div>
        </div>

        <Button 
          onClick={calculateTaxes} 
          loading={isCalculating}
          className="w-full md:w-auto"
        >
          Calculate Taxes
        </Button>
      </Card>

      {/* Results */}
      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lump Sum Results */}
          <Card>
            <h4 className="text-lg font-semibold mb-4 text-blue-600">💰 Lump Sum Option</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Gross Amount:</span>
                <span className="font-semibold">{formatCurrency(results.lumpSum.grossAmount)}</span>
              </div>
              
              <div className="flex justify-between text-red-600">
                <span>Federal Tax:</span>
                <span className="font-semibold">-{formatCurrency(results.lumpSum.federalTax)}</span>
              </div>
              
              <div className="flex justify-between text-red-600">
                <span>State Tax ({results.stateName}):</span>
                <span className="font-semibold">-{formatCurrency(results.lumpSum.stateTax)}</span>
              </div>
              
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>Net Amount:</span>
                <span className="text-green-600">{formatCurrency(results.lumpSum.netAmount)}</span>
              </div>
              
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <strong>Effective Tax Rate:</strong> {formatPercentage(results.lumpSum.totalTaxes / results.lumpSum.grossAmount)}
              </div>
            </div>
          </Card>

          {/* Cash Option Results */}
          <Card>
            <h4 className="text-lg font-semibold mb-4 text-green-600">💵 Cash Option (~60%)</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Gross Amount:</span>
                <span className="font-semibold">{formatCurrency(results.cashOption.grossAmount)}</span>
              </div>
              
              <div className="flex justify-between text-red-600">
                <span>Federal Tax:</span>
                <span className="font-semibold">-{formatCurrency(results.cashOption.federalTax)}</span>
              </div>
              
              <div className="flex justify-between text-red-600">
                <span>State Tax ({results.stateName}):</span>
                <span className="font-semibold">-{formatCurrency(results.cashOption.stateTax)}</span>
              </div>
              
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>Net Amount:</span>
                <span className="text-green-600">{formatCurrency(results.cashOption.netAmount)}</span>
              </div>
              
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <strong>Effective Tax Rate:</strong> {formatPercentage(results.cashOption.totalTaxes / results.cashOption.grossAmount)}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Important Notes */}
      <Card className="bg-yellow-50 border-yellow-200">
        <h4 className="text-sm font-semibold mb-2 text-yellow-800">⚠️ Important Notes</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Federal withholding is 24% for lottery winnings over $5,000</li>
          <li>• You may owe additional taxes when filing your return</li>
          <li>• State tax rates vary and some states don't tax lottery winnings</li>
          <li>• Cash option is typically 60% of advertised jackpot</li>
          <li>• Consult a tax professional for personalized advice</li>
        </ul>
      </Card>
    </div>
  );
}

export default TaxCalculator;