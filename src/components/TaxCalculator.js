// LCv2 Tax Calculator Component
import React, { useState, useEffect } from 'react';
import { TaxCalculatorService } from '../services/TaxCalculatorService.js';
import { TAX_CONFIG } from '../utils/constants.js';
import { formatCurrency, formatPercentage } from '../utils/helpers.js';

export default function TaxCalculator({ currentJackpot }) {
  const [jackpotAmount, setJackpotAmount] = useState('');
  const [selectedState, setSelectedState] = useState('GA');
  const [otherIncome, setOtherIncome] = useState('');
  const [calculationResults, setCalculationResults] = useState(null);
  const [activeCalculation, setActiveCalculation] = useState('simple');
  const [calculator] = useState(new TaxCalculatorService());

  // Initialize with current jackpot if available
  useEffect(() => {
    if (currentJackpot && currentJackpot.amount) {
      setJackpotAmount(currentJackpot.amount.toString());
    }
  }, [currentJackpot]);

  // Calculate taxes based on selected mode
  const calculateTaxes = () => {
    const grossAmount = parseFloat(jackpotAmount.replace(/[,$]/g, ''));
    const income = parseFloat(otherIncome.replace(/[,$]/g, '')) || 0;
    
    if (!grossAmount || grossAmount <= 0) {
      alert('Please enter a valid jackpot amount');
      return;
    }

    if (activeCalculation === 'simple') {
      const results = calculator.calculateTotalTaxes(grossAmount, selectedState, 'single', income);
      setCalculationResults({ type: 'simple', data: results });
    } else {
      const results = calculator.calculateAnnuityVsLumpSum(grossAmount, selectedState);
      setCalculationResults({ type: 'comparison', data: results });
    }
  };

  // Clear all calculations
  const clearCalculation = () => {
    setCalculationResults(null);
    setJackpotAmount('');
    setOtherIncome('');
  };

  // Use current jackpot values
  const useCurrentJackpot = (type) => {
    if (!currentJackpot) return;
    
    if (type === 'cash' && activeCalculation === 'simple') {
      setJackpotAmount((currentJackpot.cashValue || currentJackpot.amount * TAX_CONFIG.lumpSumRatio).toString());
    } else {
      setJackpotAmount(currentJackpot.amount.toString());
    }
  };

  // Render simple tax calculation results
  const renderSimpleCalculation = (results) => {
    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="tax-summary-grid">
          <div className="tax-summary-item">
            <div className="text-sm text-gray-600">Gross Winnings</div>
            <div className="highlight-amount">{formatCurrency(results.grossWinnings)}</div>
          </div>
          <div className="tax-summary-item negative">
            <div className="text-sm text-gray-600">Total Taxes Owed</div>
            <div className="highlight-amount warning-text">{formatCurrency(results.totalTaxOwed)}</div>
          </div>
          <div className="tax-summary-item positive">
            <div className="text-sm text-gray-600">Net After Taxes</div>
            <div className="highlight-amount positive-text">{formatCurrency(results.netWinnings)}</div>
          </div>
          <div className="tax-summary-item">
            <div className="text-sm text-gray-600">Effective Tax Rate</div>
            <div className="highlight-amount">{formatPercentage(results.effectiveTaxRate)}</div>
          </div>
        </div>

        {/* Tax Breakdown */}
        <div className="card">
          <h4 className="text-lg font-semibold mb-4">💰 Tax Breakdown</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Federal Taxes */}
            <div>
              <h5 className="font-semibold mb-3 text-blue-700">🏛️ Federal Taxes</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Withheld (24%):</span>
                  <span className="font-medium">{formatCurrency(results.federalWithheld)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Actually Owed:</span>
                  <span className="font-medium">{formatCurrency(results.federalTaxOwed)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">
                    {results.federalRefundOrOwed >= 0 ? 'Refund Expected:' : 'Additional Owed:'}
                  </span>
                  <span className={`font-bold ${results.federalRefundOrOwed >= 0 ? 'positive-text' : 'warning-text'}`}>
                    {formatCurrency(Math.abs(results.federalRefundOrOwed))}
                  </span>
                </div>
              </div>
            </div>

            {/* State Taxes */}
            <div>
              <h5 className="font-semibold mb-3 text-green-700">
                🏛️ {TAX_CONFIG.stateNames[selectedState]} State Taxes
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Tax Rate:</span>
                  <span className="font-medium">{formatPercentage(results.stateTaxRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>State Tax Owed:</span>
                  <span className="font-medium">{formatCurrency(results.stateTaxOwed)}</span>
                </div>
                {results.stateTaxRate === 0 && (
                  <div className="text-green-600 text-xs font-medium">
                    ✅ No state income tax!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Federal Tax Bracket Breakdown */}
        {results.federalTaxDetails && results.federalTaxDetails.length > 0 && (
          <div className="card">
            <h4 className="text-lg font-semibold mb-4">📊 Federal Tax Bracket Breakdown</h4>
            <div className="overflow-x-auto">
              <table className="tax-breakdown-table">
                <thead>
                  <tr>
                    <th>Tax Bracket</th>
                    <th>Rate</th>
                    <th>Taxable Amount</th>
                    <th>Tax Owed</th>
                  </tr>
                </thead>
                <tbody>
                  {results.federalTaxDetails.map((bracket, index) => (
                    <tr key={index}>
                      <td>{bracket.range}</td>
                      <td>{bracket.rate}</td>
                      <td>{formatCurrency(bracket.taxableAmount)}</td>
                      <td className="font-medium">{formatCurrency(bracket.tax)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render annuity vs lump sum comparison
  const renderComparisonCalculation = (results) => {
    const { annuity, lumpSum } = results;
    const annuityIsBetter = annuity.estimatedTotalAfterTax > lumpSum.afterTax;
    
    return (
      <div className="space-y-6">
        {/* Comparison Overview */}
        <div className="comparison-highlight">
          <h4 className="text-lg font-semibold mb-4">⚖️ Annuity vs Lump Sum Comparison</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">📅</div>
              <div className="text-lg font-semibold">30-Year Annuity</div>
              <div className="text-2xl font-bold text-amber-600">
                {formatCurrency(annuity.estimatedTotalAfterTax)}
              </div>
              <div className="text-sm text-gray-600">Estimated Total After Tax</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-lg font-semibold">Lump Sum</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(lumpSum.afterTax)}
              </div>
              <div className="text-sm text-gray-600">Immediate After Tax</div>
            </div>
          </div>
          <div className="text-center mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="font-semibold">
              {annuityIsBetter ? 
                '📅 Annuity provides more total value' : 
                '💰 Lump sum provides more immediate value'
              }
            </div>
            <div className="text-sm text-gray-600">
              Difference: {formatCurrency(Math.abs(annuity.estimatedTotalAfterTax - lumpSum.afterTax))}
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Annuity Details */}
          <div className="annuity-highlight">
            <h4 className="text-lg font-semibold mb-4">📅 30-Year Annuity Details</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Jackpot:</span>
                <span className="font-medium">{formatCurrency(annuity.totalJackpot)}</span>
              </div>
              <div className="flex justify-between">
                <span>First Year Payment:</span>
                <span className="font-medium">{formatCurrency(annuity.firstYearPayment)}</span>
              </div>
              <div className="flex justify-between">
                <span>First Year After Tax:</span>
                <span className="font-medium text-green-600">{formatCurrency(annuity.firstYearAfterTax)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-bold">
                  <span>Est. Total After Tax:</span>
                  <span className="text-amber-600">{formatCurrency(annuity.estimatedTotalAfterTax)}</span>
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-2">
                * Payments increase 5% annually. Tax calculation simplified - actual taxes may vary each year.
              </div>
            </div>
          </div>

          {/* Lump Sum Details */}
          <div className="lump-sum-highlight">
            <h4 className="text-lg font-semibold mb-4">💰 Lump Sum Details</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Gross Lump Sum:</span>
                <span className="font-medium">{formatCurrency(lumpSum.grossAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Federal Taxes:</span>
                <span className="font-medium text-red-600">{formatCurrency(lumpSum.taxes.federalTaxOwed)}</span>
              </div>
              <div className="flex justify-between">
                <span>State Taxes:</span>
                <span className="font-medium text-red-600">{formatCurrency(lumpSum.taxes.stateTaxOwed)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Taxes:</span>
                <span className="font-medium text-red-600">{formatCurrency(lumpSum.taxes.totalTaxOwed)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-bold">
                  <span>Net After Taxes:</span>
                  <span className="text-green-600">{formatCurrency(lumpSum.afterTax)}</span>
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Effective tax rate: {formatPercentage(lumpSum.taxes.effectiveTaxRate)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Get list of states for dropdown
  const states = Object.entries(TAX_CONFIG.stateNames).map(([code, name]) => ({ code, name }));

  return (
    <div className="space-y-6">
      
      {/* Calculator Configuration */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">🧮 Lottery Tax Calculator</h3>
        
        {/* Calculation Mode Selection */}
        <div className="mb-4">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setActiveCalculation('simple')}
              className={`btn btn-sm ${activeCalculation === 'simple' ? 'btn-primary' : 'btn-secondary'}`}
            >
              📊 Simple Tax Calculation
            </button>
            <button
              onClick={() => setActiveCalculation('comparison')}
              className={`btn btn-sm ${activeCalculation === 'comparison' ? 'btn-primary' : 'btn-secondary'}`}
            >
              ⚖️ Annuity vs Lump Sum
            </button>
          </div>
        </div>
        
        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          
          {/* Jackpot Amount */}
          <div className="tax-input-group">
            <label>
              {activeCalculation === 'simple' ? '💰 Winnings Amount' : '🎰 Total Jackpot'}
            </label>
            <input
              type="text"
              value={jackpotAmount}
              onChange={(e) => setJackpotAmount(e.target.value)}
              placeholder={activeCalculation === 'simple' ? '1,000,000' : '100,000,000'}
              className="w-full"
            />
            {currentJackpot && (
              <div className="flex gap-1 mt-1">
                <button
                  onClick={() => useCurrentJackpot('cash')}
                  className="btn btn-secondary btn-sm text-xs flex-1"
                >
                  {activeCalculation === 'simple' ? 'Use Current Cash' : 'Use Current Jackpot'}
                </button>
                {activeCalculation === 'comparison' && (
                  <button
                    onClick={() => useCurrentJackpot('annuity')}
                    className="btn btn-secondary btn-sm text-xs flex-1"
                  >
                    Use Jackpot
                  </button>
                )}
              </div>
            )}
          </div>

          {/* State Selection */}
          <div className="tax-input-group">
            <label>🏛️ Your State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full"
            >
              {states.map(state => (
                <option key={state.code} value={state.code}>
                  {state.name} ({formatPercentage(TAX_CONFIG.stateTaxRates[state.code] * 100)})
                </option>
              ))}
            </select>
          </div>

          {/* Other Income (Simple Mode Only) */}
          {activeCalculation === 'simple' && (
            <div className="tax-input-group">
              <label>💼 Other Annual Income</label>
              <input
                type="text"
                value={otherIncome}
                onChange={(e) => setOtherIncome(e.target.value)}
                placeholder="75,000"
                className="w-full"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="tax-input-group justify-end">
            <label className="invisible">Actions</label>
            <div className="flex gap-2">
              <button
                onClick={calculateTaxes}
                className="btn btn-primary"
              >
                🔢 Calculate
              </button>
              {calculationResults && (
                <button
                  onClick={clearCalculation}
                  className="btn btn-secondary"
                >
                  🗑️ Clear
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Disclaimer */}
        <div className="warning-banner">
          <p className="text-amber-700 text-xs">
            ⚠️ Tax calculations are estimates for educational purposes. Consult a tax professional for advice. 
            Federal withholding is 24% for lottery winnings over $5,000.
          </p>
        </div>
      </div>

      {/* Results Display */}
      {calculationResults ? (
        <div>
          {calculationResults.type === 'simple' ? 
            renderSimpleCalculation(calculationResults.data) :
            renderComparisonCalculation(calculationResults.data)
          }
        </div>
      ) : (
        <div className="card text-center py-8">
          <div className="text-4xl mb-4">🧮</div>
          <p className="text-gray-600">Enter jackpot amount and click Calculate to see tax breakdown</p>
          <p className="text-xs text-gray-500 mt-2">
            Get precise tax estimates and compare annuity vs lump sum options
          </p>
        </div>
      )}
    </div>
  );
}