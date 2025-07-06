// LCv2 Tax Calculator Service
import { TAX_CONFIG } from '../utils/constants.js';
import { formatCurrency, formatPercentage } from '../utils/helpers.js';

export class TaxCalculatorService {
  constructor() {
    this.currentYear = TAX_CONFIG.currentYear;
    this.federalBrackets = TAX_CONFIG.federalBrackets;
    this.stateTaxRates = TAX_CONFIG.stateTaxRates;
    this.stateNames = TAX_CONFIG.stateNames;
    this.federalWithholdingRate = TAX_CONFIG.federalWithholdingRate;
  }

  // Calculate federal tax using progressive brackets
  calculateFederalTax(income) {
    let tax = 0;
    let taxDetails = [];
    
    for (const bracket of this.federalBrackets) {
      if (income > bracket.min) {
        const taxableInThisBracket = Math.min(income, bracket.max) - bracket.min;
        const taxForBracket = taxableInThisBracket * bracket.rate;
        tax += taxForBracket;
        
        if (taxableInThisBracket > 0) {
          taxDetails.push({
            range: `$${bracket.min.toLocaleString()} - $${bracket.max === Infinity ? '∞' : bracket.max.toLocaleString()}`,
            rate: (bracket.rate * 100).toFixed(1) + '%',
            taxableAmount: taxableInThisBracket,
            tax: taxForBracket
          });
        }
      }
    }
    
    return { total: tax, details: taxDetails };
  }

  // Calculate state tax (flat rate)
  calculateStateTax(income, state) {
    const rate = this.stateTaxRates[state] || 0;
    return income * rate;
  }

  // Calculate total taxes for lottery winnings
  calculateTotalTaxes(grossWinnings, state = 'GA', filingStatus = 'single', hasOtherIncome = 0) {
    // Federal withholding (automatic for lottery winnings over $5,000)
    const federalWithheld = grossWinnings * this.federalWithholdingRate;
    
    // Total income for tax calculation
    const totalIncome = grossWinnings + hasOtherIncome;
    
    // Calculate actual federal tax owed
    const federalTaxCalc = this.calculateFederalTax(totalIncome);
    const federalTaxOwed = federalTaxCalc.total;
    
    // Calculate state tax
    const stateTaxRate = this.stateTaxRates[state] || 0;
    const stateTaxOwed = this.calculateStateTax(grossWinnings, state);
    
    // Federal refund or additional amount owed
    const federalRefundOrOwed = federalWithheld - federalTaxOwed;
    
    // Total tax burden
    const totalTaxOwed = federalTaxOwed + stateTaxOwed;
    const netWinnings = grossWinnings - totalTaxOwed;
    
    return {
      grossWinnings,
      federalWithheld,
      federalTaxOwed,
      federalTaxDetails: federalTaxCalc.details,
      federalRefundOrOwed,
      stateTaxRate: stateTaxRate * 100,
      stateTaxOwed,
      totalTaxOwed,
      netWinnings,
      effectiveTaxRate: (totalTaxOwed / grossWinnings) * 100
    };
  }

  // Calculate annuity vs lump sum comparison
  calculateAnnuityVsLumpSum(jackpotAmount, state = 'GA') {
    // Annuity: paid over 30 years with 5% annual increases
    const annualPayment = jackpotAmount / TAX_CONFIG.annuityYears;
    const firstYearPayment = annualPayment;
    
    // Lump sum: typically 60% of advertised jackpot
    const lumpSum = jackpotAmount * TAX_CONFIG.lumpSumRatio;
    
    // Calculate taxes for first year of annuity
    const annuityTaxes = this.calculateTotalTaxes(firstYearPayment, state);
    
    // Calculate taxes for lump sum
    const lumpSumTaxes = this.calculateTotalTaxes(lumpSum, state);
    
    // Estimate total annuity value after taxes
    let totalAnnuityAfterTax = 0;
    let currentPayment = firstYearPayment;
    
    for (let year = 0; year < TAX_CONFIG.annuityYears; year++) {
      // Calculate taxes for this year's payment
      const yearTaxes = this.calculateTotalTaxes(currentPayment, state);
      totalAnnuityAfterTax += yearTaxes.netWinnings;
      
      // Increase payment by 5% for next year
      currentPayment *= (1 + TAX_CONFIG.annualIncrease);
    }
    
    return {
      annuity: {
        totalJackpot: jackpotAmount,
        firstYearPayment,
        firstYearAfterTax: annuityTaxes.netWinnings,
        estimatedTotalAfterTax: totalAnnuityAfterTax,
        taxesFirstYear: annuityTaxes,
        annualIncrease: TAX_CONFIG.annualIncrease * 100,
        yearsOfPayments: TAX_CONFIG.annuityYears
      },
      lumpSum: {
        grossAmount: lumpSum,
        afterTax: lumpSumTaxes.netWinnings,
        taxes: lumpSumTaxes,
        percentage: TAX_CONFIG.lumpSumRatio * 100
      },
      recommendation: this.generateRecommendation(totalAnnuityAfterTax, lumpSumTaxes.netWinnings)
    };
  }

  // Generate recommendation based on financial analysis
  generateRecommendation(annuityTotal, lumpSumTotal) {
    const difference = Math.abs(annuityTotal - lumpSumTotal);
    const percentageDifference = (difference / Math.max(annuityTotal, lumpSumTotal)) * 100;
    
    let recommendation = {
      better: annuityTotal > lumpSumTotal ? 'annuity' : 'lumpsum',
      difference: difference,
      percentageDifference: percentageDifference,
      confidence: 'medium'
    };
    
    // Determine confidence level
    if (percentageDifference > 20) {
      recommendation.confidence = 'high';
    } else if (percentageDifference < 5) {
      recommendation.confidence = 'low';
    }
    
    // Generate reasoning
    if (recommendation.better === 'annuity') {
      recommendation.reasoning = `The 30-year annuity provides ${formatCurrency(difference)} more in total after-tax value. ` +
        `This assumes consistent tax rates and no investment of the lump sum.`;
    } else {
      recommendation.reasoning = `The lump sum provides ${formatCurrency(difference)} more immediate value. ` +
        `With proper investment, the lump sum could potentially exceed the annuity's total value.`;
    }
    
    return recommendation;
  }

  // Calculate taxes for different scenarios
  calculateTaxScenarios(grossWinnings, state) {
    const scenarios = [];
    
    // Current year scenario
    scenarios.push({
      name: 'Current Tax Rates',
      year: this.currentYear,
      result: this.calculateTotalTaxes(grossWinnings, state)
    });
    
    // No state tax scenario (if current state has tax)
    if (this.stateTaxRates[state] > 0) {
      scenarios.push({
        name: 'No State Tax (Move to FL, TX, etc.)',
        year: this.currentYear,
        result: this.calculateTotalTaxes(grossWinnings, 'FL'),
        savings: this.calculateTotalTaxes(grossWinnings, state).stateTaxOwed
      });
    }
    
    // High earner scenario (additional income)
    scenarios.push({
      name: 'With $200K Additional Income',
      year: this.currentYear,
      result: this.calculateTotalTaxes(grossWinnings, state, 'single', 200000)
    });
    
    return scenarios;
  }

  // Estimate quarterly tax payments
  calculateQuarterlyPayments(annualTaxOwed) {
    const quarterlyAmount = annualTaxOwed / 4;
    const dueDate = new Date();
    const quarters = [];
    
    // Q1 - April 15
    quarters.push({
      quarter: 'Q1',
      amount: quarterlyAmount,
      dueDate: new Date(dueDate.getFullYear(), 3, 15), // April 15
      description: 'January - March'
    });
    
    // Q2 - June 15
    quarters.push({
      quarter: 'Q2',
      amount: quarterlyAmount,
      dueDate: new Date(dueDate.getFullYear(), 5, 15), // June 15
      description: 'April - May'
    });
    
    // Q3 - September 15
    quarters.push({
      quarter: 'Q3',
      amount: quarterlyAmount,
      dueDate: new Date(dueDate.getFullYear(), 8, 15), // September 15
      description: 'June - August'
    });
    
    // Q4 - January 15 (next year)
    quarters.push({
      quarter: 'Q4',
      amount: quarterlyAmount,
      dueDate: new Date(dueDate.getFullYear() + 1, 0, 15), // January 15
      description: 'September - December'
    });
    
    return quarters;
  }

  // Calculate gift tax implications
  calculateGiftTaxImplications(winnings, giftAmount, recipients = 1) {
    const annualExemption = 17000; // 2023 annual gift tax exemption
    const lifetimeExemption = 12920000; // 2023 lifetime exemption
    
    const exemptGiftPerRecipient = Math.min(giftAmount / recipients, annualExemption);
    const taxableGiftPerRecipient = Math.max(0, (giftAmount / recipients) - annualExemption);
    const totalTaxableGift = taxableGiftPerRecipient * recipients;
    
    return {
      totalGift: giftAmount,
      recipients: recipients,
      giftPerRecipient: giftAmount / recipients,
      exemptAmount: exemptGiftPerRecipient * recipients,
      taxableAmount: totalTaxableGift,
      lifetimeExemptionUsed: Math.min(totalTaxableGift, lifetimeExemption),
      giftTaxOwed: Math.max(0, totalTaxableGift - lifetimeExemption) * 0.40, // 40% gift tax rate
      remainingLifetimeExemption: Math.max(0, lifetimeExemption - totalTaxableGift)
    };
  }

  // Format currency values
  formatCurrency(amount) {
    return formatCurrency(amount);
  }

  // Format percentage values
  formatPercentage(rate) {
    return formatPercentage(rate);
  }

  // Get tax bracket information for a specific income
  getTaxBracketInfo(income) {
    for (let i = this.federalBrackets.length - 1; i >= 0; i--) {
      const bracket = this.federalBrackets[i];
      if (income > bracket.min) {
        return {
          bracket: bracket,
          marginalRate: bracket.rate * 100,
          description: `${(bracket.rate * 100).toFixed(1)}% marginal tax bracket`
        };
      }
    }
    
    return {
      bracket: this.federalBrackets[0],
      marginalRate: this.federalBrackets[0].rate * 100,
      description: `${(this.federalBrackets[0].rate * 100).toFixed(1)}% marginal tax bracket`
    };
  }

  // Validate state code
  isValidState(stateCode) {
    return this.stateNames.hasOwnProperty(stateCode);
  }

  // Get state information
  getStateInfo(stateCode) {
    if (!this.isValidState(stateCode)) {
      return null;
    }
    
    return {
      code: stateCode,
      name: this.stateNames[stateCode],
      taxRate: this.stateTaxRates[stateCode] * 100,
      hasTax: this.stateTaxRates[stateCode] > 0
    };
  }

  // Get all states sorted by tax rate
  getAllStatesSortedByTax() {
    return Object.entries(this.stateNames)
      .map(([code, name]) => ({
        code,
        name,
        taxRate: this.stateTaxRates[code] * 100
      }))
      .sort((a, b) => a.taxRate - b.taxRate);
  }

  // Calculate tax savings by moving states
  calculateMovingTaxSavings(grossWinnings, currentState, targetState) {
    const currentTaxes = this.calculateTotalTaxes(grossWinnings, currentState);
    const targetTaxes = this.calculateTotalTaxes(grossWinnings, targetState);
    
    return {
      currentState: {
        code: currentState,
        name: this.stateNames[currentState],
        taxes: currentTaxes
      },
      targetState: {
        code: targetState,
        name: this.stateNames[targetState],
        taxes: targetTaxes
      },
      savings: currentTaxes.totalTaxOwed - targetTaxes.totalTaxOwed,
      percentageSavings: ((currentTaxes.totalTaxOwed - targetTaxes.totalTaxOwed) / currentTaxes.totalTaxOwed) * 100
    };
  }
}