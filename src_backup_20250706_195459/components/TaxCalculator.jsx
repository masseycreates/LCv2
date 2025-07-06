// LCv2 Tax Calculator Component - Advanced Winnings Analysis
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { formatCurrency, formatPercentage } from '../utils/helpers.js';

export default function TaxCalculator({ currentJackpot, dataStatus, setDataStatus }) {
  
  // ===========================================================================
  // STATE MANAGEMENT
  // ===========================================================================
  
  // Input state
  const [jackpotAmount, setJackpotAmount] = useState('');
  const [payoutType, setPayoutType] = useState('lump_sum'); // 'lump_sum' or 'annuity'
  const [state, setState] = useState('no_state_tax');
  const [filingStatus, setFilingStatus] = useState('single');
  const [additionalIncome, setAdditionalIncome] = useState('');
  
  // Calculation state
  const [calculationResults, setCalculationResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(true);

  // ===========================================================================
  // EFFECTS
  // ===========================================================================
  
  // Auto-populate from current jackpot
  useEffect(() => {
    if (currentJackpot && currentJackpot.amount && !jackpotAmount) {
      setJackpotAmount(currentJackpot.amount.toString());
    }
  }, [currentJackpot, jackpotAmount]);

  // ===========================================================================
  // TAX CONFIGURATION
  // ===========================================================================
  
  const federalTaxBrackets2024 = useMemo(() => ({
    single: [
      { min: 0, max: 11000, rate: 0.10 },
      { min: 11000, max: 44725, rate: 0.12 },
      { min: 44725, max: 95375, rate: 0.22 },
      { min: 95375, max: 182050, rate: 0.24 },
      { min: 182050, max: 231250, rate: 0.32 },
      { min: 231250, max: 578125, rate: 0.35 },
      { min: 578125, max: Infinity, rate: 0.37 }
    ],
    married: [
      { min: 0, max: 22000, rate: 0.10 },
      { min: 22000, max: 89450, rate: 0.12 },
      { min: 89450, max: 190750, rate: 0.22 },
      { min: 190750, max: 364200, rate: 0.24 },
      { min: 364200, max: 462500, rate: 0.32 },
      { min: 462500, max: 693750, rate: 0.35 },
      { min: 693750, max: Infinity, rate: 0.37 }
    ]
  }), []);

  const stateTaxRates = useMemo(() => ({
    no_state_tax: { name: 'No State Tax', rate: 0.0, note: 'AL, AK, FL, NV, NH, SD, TN, TX, WA, WY' },
    california: { name: 'California', rate: 0.133, note: 'Highest state tax rate' },
    new_york: { name: 'New York', rate: 0.1082, note: 'Plus local taxes may apply' },
    illinois: { name: 'Illinois', rate: 0.0495, note: 'Flat rate' },
    pennsylvania: { name: 'Pennsylvania', rate: 0.0307, note: 'Flat rate' },
    michigan: { name: 'Michigan', rate: 0.0425, note: 'Flat rate' },
    ohio: { name: 'Ohio', rate: 0.0399, note: 'Variable rate' },
    georgia: { name: 'Georgia', rate: 0.0575, note: 'Top rate' },
    north_carolina: { name: 'North Carolina', rate: 0.0499, note: 'Flat rate' },
    arizona: { name: 'Arizona', rate: 0.045, note: 'Top rate' },
    colorado: { name: 'Colorado', rate: 0.0455, note: 'Flat rate' },
    connecticut: { name: 'Connecticut', rate: 0.0699, note: 'Top rate' },
    massachusetts: { name: 'Massachusetts', rate: 0.05, note: 'Flat rate' },
    new_jersey: { name: 'New Jersey', rate: 0.1075, note: 'Top rate' },
    maryland: { name: 'Maryland', rate: 0.0575, note: 'Plus local taxes' }
  }), []);

  // ===========================================================================
  // CALCULATION FUNCTIONS
  // ===========================================================================
  
  const calculateFederalTax = useCallback((taxableIncome, status) => {
    const brackets = federalTaxBrackets2024[status] || federalTaxBrackets2024.single;
    let totalTax = 0;
    let remainingIncome = taxableIncome;
    const breakdown = [];

    for (const bracket of brackets) {
      const taxableAtThisBracket = Math.min(remainingIncome, bracket.max - bracket.min);
      
      if (taxableAtThisBracket > 0) {
        const taxAtThisBracket = taxableAtThisBracket * bracket.rate;
        totalTax += taxAtThisBracket;
        
        breakdown.push({
          range: `${formatCurrency(bracket.min)} - ${bracket.max === Infinity ? '8' : formatCurrency(bracket.max)}`,
          rate: formatPercentage(bracket.rate * 100),
          taxableAmount: formatCurrency(taxableAtThisBracket),
          tax: formatCurrency(taxAtThisBracket)
        });
        
        remainingIncome -= taxableAtThisBracket;
        
        if (remainingIncome <= 0) break;
      }
    }

    return { totalTax, breakdown };
  }, [federalTaxBrackets2024]);

  const calculateTaxes = useCallback((grossWinnings, payout, stateCode, filing, additionalInc = 0) => {
    const additionalIncomeNum = parseFloat(additionalInc) || 0;
    const totalIncome = grossWinnings + additionalIncomeNum;
    
    // Federal withholding (24% for lottery winnings over $5,000)
    const federalWithholding = grossWinnings * 0.24;
    
    // Calculate actual federal tax owed
    const federalCalc = calculateFederalTax(totalIncome, filing);
    const federalTaxOwed = federalCalc.totalTax;
    
    // State tax
    const stateInfo = stateTaxRates[stateCode] || stateTaxRates.no_state_tax;
    const stateTax = grossWinnings * stateInfo.rate;
    
    // Net amount calculation
    const totalTaxes = federalTaxOwed + stateTax;
    const netWinnings = grossWinnings - totalTaxes;
    
    // Additional federal tax owed (if withholding isn't enough)
    const additionalFederalOwed = Math.max(0, federalTaxOwed - federalWithholding);
    
    return {
      grossWinnings,
      federalWithholding,
      federalTaxOwed,
      federalTaxBreakdown: federalCalc.breakdown,
      stateTax,
      stateInfo,
      totalTaxes,
      netWinnings,
      additionalFederalOwed,
      effectiveTaxRate: (totalTaxes / grossWinnings) * 100,
      payoutType: payout,
      filingStatus: filing
    };
  }, [calculateFederalTax, stateTaxRates]);

  const performCalculation = useCallback(async () => {
    const amount = parseFloat(jackpotAmount);
    
    if (!amount || amount < 1000000) {
      alert('Please enter a valid jackpot amount (minimum $1,000,000)');
      return;
    }
    
    setIsCalculating(true);
    setDataStatus('?? Calculating tax breakdown...');
    
    try {
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let results;
      
      if (showComparison) {
        // Calculate both lump sum and annuity
        const lumpSumAmount = amount * 0.6; // Typical lump sum is ~60% of advertised jackpot
        const annuityPayment = amount / 30; // 30 annual payments
        
        const lumpSumCalc = calculateTaxes(lumpSumAmount, 'lump_sum', state, filingStatus, additionalIncome);
        const annuityCalc = calculateTaxes(annuityPayment, 'annuity', state, filingStatus, additionalIncome);
        
        results = {
          type: 'comparison',
          data: {
            advertised: amount,
            lumpSum: lumpSumCalc,
            annuity: {
              ...annuityCalc,
              totalGross: amount,
              totalNet: annuityCalc.netWinnings * 30,
              totalTaxes: annuityCalc.totalTaxes * 30
            }
          }
        };
      } else {
        // Single calculation
        const winningsAmount = payoutType === 'lump_sum' ? amount * 0.6 : amount / 30;
        const calc = calculateTaxes(winningsAmount, payoutType, state, filingStatus, additionalIncome);
        
        results = {
          type: 'single',
          data: {
            advertised: amount,
            calculation: calc
          }
        };
      }
      
      setCalculationResults(results);
      setDataStatus('? Tax calculation completed');
      
    } catch (error) {
      console.error('Tax calculation failed:', error);
      setDataStatus('? Calculation failed');
    } finally {
      setIsCalculating(false);
      setTimeout(() => setDataStatus(''), 3000);
    }
  }, [jackpotAmount, payoutType, state, filingStatus, additionalIncome, showComparison, calculateTaxes, setDataStatus]);

  // ===========================================================================
  // RENDER HELPERS
  // ===========================================================================
  
  const renderInputSection = () => (
    <div className="card mb-6">
      <div className="card-header">
        <h3 className="card-title">?? Tax Calculator Settings</h3>
        <p className="card-subtitle">Configure your lottery winning scenario</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Jackpot Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ?? Jackpot Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              value={jackpotAmount}
              onChange={(e) => setJackpotAmount(e.target.value)}
              placeholder="100000000"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1000000"
              step="1000000"
            />
          </div>
          {currentJackpot && (
            <button
              onClick={() => setJackpotAmount(currentJackpot.amount.toString())}
              className="mt-1 text-xs text-blue-600 hover:text-blue-800"
            >
              Use current jackpot: {formatCurrency(currentJackpot.amount)}
            </button>
          )}
        </div>

        {/* Payout Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ?? Payout Type
          </label>
          <select
            value={payoutType}
            onChange={(e) => setPayoutType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={showComparison}
          >
            <option value="lump_sum">Lump Sum (Cash Option)</option>
            <option value="annuity">Annuity (30 Payments)</option>
          </select>
          {showComparison && (
            <p className="text-xs text-gray-500 mt-1">Comparison mode calculates both options</p>
          )}
        </div>

        {/* Filing Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ?? Filing Status
          </label>
          <select
            value={filingStatus}
            onChange={(e) => setFilingStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="single">Single</option>
            <option value="married">Married Filing Jointly</option>
          </select>
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ??? State
          </label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(stateTaxRates).map(([key, info]) => (
              <option key={key} value={key}>
                {info.name} ({formatPercentage(info.rate * 100)})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {stateTaxRates[state]?.note}
          </p>
        </div>

        {/* Additional Income */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ?? Additional Annual Income
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              value={additionalIncome}
              onChange={(e) => setAdditionalIncome(e.target.value)}
              placeholder="75000"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="1000"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Your other income (affects tax brackets)
          </p>
        </div>

        {/* Calculation Options */}
        <div className="space-y-3">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showComparison}
                onChange={(e) => setShowComparison(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Compare lump sum vs annuity</span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showBreakdown}
                onChange={(e) => setShowBreakdown(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Show detailed breakdown</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Calculate Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={performCalculation}
          disabled={isCalculating || !jackpotAmount}
          className="btn btn-lg btn-primary"
        >
          {isCalculating ? (
            <>
              <div className="loading-spinner" />
              <span>Calculating...</span>
            </>
          ) : (
            <>
              <span>??</span>
              <span>Calculate Taxes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderSingleResult = (data) => {
    const { advertised, calculation } = data;
    
    return (
      <div className="space-y-6">
        
        {/* Summary Cards */}
        <div className="tax-summary-grid">
          <div className="tax-summary-item">
            <h4 className="font-semibold text-gray-800 mb-2">?? Gross Winnings</h4>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(calculation.grossWinnings)}
            </div>
            <div className="text-sm text-gray-600">
              {calculation.payoutType === 'lump_sum' ? 'Cash option' : 'Annual payment'}
            </div>
          </div>
          
          <div className="tax-summary-item negative">
            <h4 className="font-semibold text-gray-800 mb-2">??? Total Taxes</h4>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(calculation.totalTaxes)}
            </div>
            <div className="text-sm text-gray-600">
              {formatPercentage(calculation.effectiveTaxRate)} effective rate
            </div>
          </div>
          
          <div className="tax-summary-item positive">
            <h4 className="font-semibold text-gray-800 mb-2">?? Net Winnings</h4>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(calculation.netWinnings)}
            </div>
            <div className="text-sm text-gray-600">
              After all taxes
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        {showBreakdown && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">?? Tax Breakdown</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="tax-breakdown-table">
                <thead>
                  <tr>
                    <th>Tax Type</th>
                    <th>Rate</th>
                    <th>Amount</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Federal Withholding</td>
                    <td>24.00%</td>
                    <td>{formatCurrency(calculation.federalWithholding)}</td>
                    <td>Automatic withholding</td>
                  </tr>
                  <tr>
                    <td>Federal Tax Owed</td>
                    <td>Variable</td>
                    <td>{formatCurrency(calculation.federalTaxOwed)}</td>
                    <td>Based on tax brackets</td>
                  </tr>
                  <tr>
                    <td>State Tax</td>
                    <td>{formatPercentage(calculation.stateInfo.rate * 100)}</td>
                    <td>{formatCurrency(calculation.stateTax)}</td>
                    <td>{calculation.stateInfo.name}</td>
                  </tr>
                  <tr className="font-semibold bg-gray-50">
                    <td>Total Taxes</td>
                    <td>{formatPercentage(calculation.effectiveTaxRate)}</td>
                    <td>{formatCurrency(calculation.totalTaxes)}</td>
                    <td>Effective rate</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {calculation.additionalFederalOwed > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-1">?? Additional Tax Owed</h4>
                <p className="text-sm text-yellow-700">
                  You'll owe an additional <strong>{formatCurrency(calculation.additionalFederalOwed)}</strong> in federal taxes 
                  beyond the 24% withholding. Plan to set this aside for tax filing.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Federal Tax Brackets */}
        {showBreakdown && calculation.federalTaxBreakdown && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">??? Federal Tax Brackets Applied</h3>
              <p className="card-subtitle">Your tax calculation by bracket ({calculation.filingStatus})</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="tax-breakdown-table">
                <thead>
                  <tr>
                    <th>Income Range</th>
                    <th>Tax Rate</th>
                    <th>Taxable Amount</th>
                    <th>Tax Owed</th>
                  </tr>
                </thead>
                <tbody>
                  {calculation.federalTaxBreakdown.map((bracket, index) => (
                    <tr key={index}>
                      <td className="font-mono text-xs">{bracket.range}</td>
                      <td>{bracket.rate}</td>
                      <td>{bracket.taxableAmount}</td>
                      <td>{bracket.tax}</td>
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

  const renderComparisonResult = (data) => {
    const { advertised, lumpSum, annuity } = data;
    
    return (
      <div className="space-y-6">
        
        {/* Comparison Overview */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">?? Lump Sum vs Annuity Comparison</h3>
            <p className="card-subtitle">Advertised Jackpot: {formatCurrency(advertised)}</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Lump Sum */}
            <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <h4 className="font-semibold text-blue-800 mb-3 text-center">?? Lump Sum Option</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Gross Amount:</span>
                  <span className="font-medium">{formatCurrency(lumpSum.grossWinnings)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Taxes:</span>
                  <span className="font-medium text-red-600">{formatCurrency(lumpSum.totalTaxes)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Net Amount:</span>
                  <span className="text-green-600">{formatCurrency(lumpSum.netWinnings)}</span>
                </div>
                <div className="text-xs text-gray-600 text-center mt-2">
                  Available immediately
                </div>
              </div>
            </div>

            {/* Annuity */}
            <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
              <h4 className="font-semibold text-green-800 mb-3 text-center">?? Annuity Option</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Annual Payment:</span>
                  <span className="font-medium">{formatCurrency(annuity.grossWinnings)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual Taxes:</span>
                  <span className="font-medium text-red-600">{formatCurrency(annuity.totalTaxes)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Annual Net:</span>
                  <span className="text-green-600">{formatCurrency(annuity.netWinnings)}</span>
                </div>
                <div className="text-xs text-gray-600 text-center mt-2">
                  30 annual payments
                </div>
              </div>
            </div>
          </div>
          
          {/* Key Insights */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">?? Key Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Immediate vs Total:</span>
                <p className="text-gray-600">
                  Lump sum gives you {formatCurrency(lumpSum.netWinnings)} now vs 
                  {formatCurrency(annuity.totalNet)} total over 30 years.
                </p>
              </div>
              <div>
                <span className="font-medium">Investment Opportunity:</span>
                <p className="text-gray-600">
                  If you invest the lump sum at 4% annually, you'd break even with annuity payments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDisclaimer = () => (
    <div className="card bg-yellow-50 border-yellow-200">
      <div className="flex items-start gap-3">
        <span className="text-yellow-500 text-xl">??</span>
        <div className="text-sm text-yellow-800">
          <h4 className="font-medium mb-2">Important Tax Disclaimer</h4>
          <ul className="space-y-1 text-xs">
            <li>• This calculator provides estimates only - actual taxes may vary</li>
            <li>• Tax laws change frequently and vary by jurisdiction</li>
            <li>• Additional taxes may apply (local, estate, gift taxes)</li>
            <li>• Consult a qualified tax professional for personalized advice</li>
            <li>• Federal withholding is 24% for lottery winnings over $5,000</li>
            <li>• State tax rates and rules vary significantly</li>
            <li>• Investment returns can significantly impact the lump sum vs annuity decision</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // ===========================================================================
  // MAIN RENDER
  // ===========================================================================
  
  return (
    <div className="space-y-6">
      
      {/* Input Section */}
      {renderInputSection()}

      {/* Results Section */}
      {calculationResults ? (
        <div className="space-y-6">
          {calculationResults.type === 'comparison' 
            ? renderComparisonResult(calculationResults.data)
            : renderSingleResult(calculationResults.data)
          }
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">??</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Ready to Calculate
          </h3>
          <p className="text-gray-600 mb-6">
            Enter your jackpot amount and preferences above, then click "Calculate Taxes" 
            to see your detailed tax breakdown and take-home amount.
          </p>
          <div className="text-sm text-gray-500">
            ?? Tip: Use "Compare lump sum vs annuity" to see both options side by side
          </div>
        </div>
      )}

      {/* Disclaimer */}
      {renderDisclaimer()}
    </div>
  );
}