// src/services/tax/taxCalculatorService.js
class TaxCalculatorService {
  constructor() {
    // 2024 Federal Tax Brackets (Single Filer)
    this.federalBrackets = [
      { min: 0, max: 11000, rate: 0.10 },
      { min: 11000, max: 44725, rate: 0.12 },
      { min: 44725, max: 95375, rate: 0.22 },
      { min: 95375, max: 182050, rate: 0.24 },
      { min: 182050, max: 231250, rate: 0.32 },
      { min: 231250, max: 578125, rate: 0.35 },
      { min: 578125, max: Infinity, rate: 0.37 }
    ];

    // State Income Tax Rates (approximate)
    this.stateTaxRates = {
      'AL': 0.05, 'AK': 0.00, 'AZ': 0.045, 'AR': 0.066, 'CA': 0.133,
      'CO': 0.044, 'CT': 0.0699, 'DE': 0.066, 'FL': 0.00, 'GA': 0.0575,
      'HI': 0.11, 'ID': 0.058, 'IL': 0.0495, 'IN': 0.0323, 'IA': 0.0853,
      'KS': 0.057, 'KY': 0.05, 'LA': 0.06, 'ME': 0.0715, 'MD': 0.0575,
      'MA': 0.05, 'MI': 0.0425, 'MN': 0.0985, 'MS': 0.05, 'MO': 0.054,
      'MT': 0.0675, 'NE': 0.0684, 'NV': 0.00, 'NH': 0.05, 'NJ': 0.1075,
      'NM': 0.059, 'NY': 0.1082, 'NC': 0.0475, 'ND': 0.029, 'OH': 0.0399,
      'OK': 0.05, 'OR': 0.099, 'PA': 0.0307, 'RI': 0.0599, 'SC': 0.07,
      'SD': 0.00, 'TN': 0.00, 'TX': 0.00, 'UT': 0.0495, 'VT': 0.0875,
      'VA': 0.0575, 'WA': 0.00, 'WV': 0.065, 'WI': 0.0765, 'WY': 0.00
    };

    this.stateNames = {
      'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
      'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
      'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
      'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
      'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
      'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
      'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
      'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
      'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
      'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
    };
  }

  getStates() {
    return Object.keys(this.stateTaxRates).map(code => ({
      code,
      name: this.stateNames[code] || code,
      rate: this.stateTaxRates[code]
    })).sort((a, b) => a.name.localeCompare(b.name));
  }

  getStateName(code) {
    return this.stateNames[code] || code;
  }

  calculateFederalTax(income) {
    let tax = 0;
    let taxDetails = [];
    
    for (const bracket of this.federalBrackets) {
      if (income > bracket.min) {
        const taxableInBracket = Math.min(income - bracket.min, bracket.max - bracket.min);
        const taxOwed = taxableInBracket * bracket.rate;
        tax += taxOwed;
        
        if (taxableInBracket > 0) {
          taxDetails.push({
            range: `$${bracket.min.toLocaleString()} - ${bracket.max === Infinity ? '$∞' : '$' + bracket.max.toLocaleString()}`,
            rate: `${(bracket.rate * 100).toFixed(1)}%`,
            taxableAmount: `$${taxableInBracket.toLocaleString()}`,
            taxOwed: `$${taxOwed.toLocaleString()}`
          });
        }
      }
    }
    
    return { tax, taxDetails };
  }

  calculateTaxes({ jackpotAmount, otherIncome = 0, state }) {
    const winnings = jackpotAmount;
    const cashValue = winnings * 0.6; // Typical cash option is ~60%
    
    // Calculate for both lump sum and cash option
    const lumpSumIncome = winnings + otherIncome;
    const cashIncome = cashValue + otherIncome;
    
    // Federal taxes
    const lumpSumFederal = this.calculateFederalTax(lumpSumIncome);
    const cashFederal = this.calculateFederalTax(cashIncome);
    
    // State taxes
    const stateRate = this.stateTaxRates[state];
    const lumpSumState = winnings * stateRate;
    const cashState = cashValue * stateRate;
    
    // Federal withholding (24% for lottery winnings over $5,000)
    const federalWithholding = winnings * 0.24;
    const cashWithholding = cashValue * 0.24;
    
    return {
      winnings,
      cashValue,
      otherIncome,
      state,
      stateName: this.getStateName(state),
      stateRate,
      lumpSum: {
        grossAmount: winnings,
        federalTax: lumpSumFederal.tax,
        federalTaxDetails: lumpSumFederal.taxDetails,
        stateTax: lumpSumState,
        federalWithholding,
        totalTaxes: lumpSumFederal.tax + lumpSumState,
        netAmount: winnings - (lumpSumFederal.tax + lumpSumState)
      },
      cashOption: {
        grossAmount: cashValue,
        federalTax: cashFederal.tax,
        federalTaxDetails: cashFederal.taxDetails,
        stateTax: cashState,
        federalWithholding: cashWithholding,
        totalTaxes: cashFederal.tax + cashState,
        netAmount: cashValue - (cashFederal.tax + cashState)
      }
    };
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatPercentage(rate) {
    return `${(rate * 100).toFixed(1)}%`;
  }
}

export const taxCalculatorService = new TaxCalculatorService();