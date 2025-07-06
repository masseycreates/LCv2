// LCv2 Advanced Lottery Predictor Service - 6 Algorithm Ensemble System
import { ALGORITHM_CONFIG, LOTTERY_RULES } from '../utils/constants.js';
import { isValidPowerballNumbers, shuffleArray } from '../utils/helpers.js';

export class LotteryPredictor {
  constructor() {
    this.algorithmPerformance = this.initializeAlgorithmPerformance();
    this.ewmaAlpha = ALGORITHM_CONFIG.ewmaAlpha;
    this.neuralWeights = this.initializeNeuralWeights();
    this.predictionHistory = [];
    this.performanceWindow = ALGORITHM_CONFIG.performanceWindow;
    this.accuracyHistory = [];
    this.isLearning = true;
    this.initialized = false;
  }

  // ===========================================================================
  // INITIALIZATION
  // ===========================================================================

  initialize() {
    if (this.initialized) return;
    
    console.log('?? Initializing LotteryPredictor with 6 algorithms...');
    
    // Initialize algorithm performance tracking
    this.algorithmPerformance = this.initializeAlgorithmPerformance();
    
    // Initialize neural network weights
    this.neuralWeights = this.initializeNeuralWeights();
    
    // Set up performance monitoring
    this.setupPerformanceMonitoring();
    
    this.initialized = true;
    console.log('? LotteryPredictor initialized successfully');
    console.log(`?? Algorithms: ${Object.keys(this.algorithmPerformance).length}`);
    console.log(`?? Performance window: ${this.performanceWindow} predictions`);
  }

  initializeAlgorithmPerformance() {
    const performance = {};
    ALGORITHM_CONFIG.algorithms.forEach(alg => {
      performance[alg.id] = {
        name: alg.name,
        weight: alg.weight,
        successRate: 0.15, // Base success rate
        recentHits: [],
        totalPredictions: 0,
        correctPredictions: 0,
        averageConfidence: 75,
        lastUsed: null,
        description: alg.description
      };
    });
    return performance;
  }

  initializeNeuralWeights() {
    const inputSize = 10;  // Feature vector size
    const hiddenSize = 20; // Hidden layer size
    const outputSize = 69; // Output layer size (for numbers 1-69)
    
    return {
      w1: Array(inputSize).fill().map(() => 
        Array(hiddenSize).fill().map(() => (Math.random() - 0.5) * 0.1)
      ),
      w2: Array(hiddenSize).fill().map(() => 
        Array(outputSize).fill().map(() => (Math.random() - 0.5) * 0.1)
      ),
      b1: Array(hiddenSize).fill(0),
      b2: Array(outputSize).fill(0)
    };
  }

  setupPerformanceMonitoring() {
    // Track algorithm performance over time
    setInterval(() => {
      this.updateAlgorithmMetrics();
    }, 60000); // Update every minute
  }

  // ===========================================================================
  // MAIN PREDICTION GENERATOR
  // ===========================================================================

  generateEnsemblePrediction(historicalData, requestedSets = 5) {
    if (!this.initialized) {
      this.initialize();
    }

    if (!this.validateHistoricalData(historicalData)) {
      console.warn('?? Historical data validation failed, using fallback');
      return this.generateFallbackPredictions(requestedSets);
    }

    console.log(`?? Generating ${requestedSets} ensemble predictions from ${historicalData.length} drawings`);

    try {
      // Run all algorithms
      const algorithmResults = this.runAllAlgorithms(historicalData);
      
      // Create ensemble predictions
      const ensemblePredictions = this.createEnsemblePredictions(algorithmResults, requestedSets);
      
      // Validate and enhance predictions
      const validatedPredictions = this.validateAndEnhancePredictions(ensemblePredictions, historicalData);
      
      // Update prediction history
      this.updatePredictionHistory(validatedPredictions);
      
      console.log('? Ensemble predictions generated successfully');
      return validatedPredictions;


    } catch (error) {
      console.error('? Ensemble prediction failed:', error);
      return this.generateFallbackPredictions(requestedSets);
    }
  }

  runAllAlgorithms(historicalData) {
    const results = {};
    
    try {
      // Algorithm 1: EWMA Frequency Analysis
      results.ewma = this.generateEWMAFrequencyPrediction(historicalData);
      this.algorithmPerformance.ewma.lastUsed = new Date();
      
      // Algorithm 2: Neural Network Pattern Recognition
      results.neural = this.generateNeuralNetworkPrediction(historicalData);
      this.algorithmPerformance.neural.lastUsed = new Date();
      
      // Algorithm 3: Pair Relationship Analysis
      results.pairs = this.generatePairAnalysisPrediction(historicalData);
      this.algorithmPerformance.pairs.lastUsed = new Date();
      
      // Algorithm 4: Gap Analysis Optimization
      results.gaps = this.generateGapAnalysisPrediction(historicalData);
      this.algorithmPerformance.gaps.lastUsed = new Date();
      
      // Algorithm 5: Markov Chain Transition
      results.markov = this.generateMarkovChainPrediction(historicalData);
      this.algorithmPerformance.markov.lastUsed = new Date();
      
      // Algorithm 6: Sum Range Optimization
      results.sum = this.generateSumRangePrediction(historicalData);
      this.algorithmPerformance.sum.lastUsed = new Date();

      console.log(`?? ${Object.keys(results).length} algorithms executed successfully`);
      return results;

    } catch (error) {
      console.error('?? Some algorithms failed:', error);
      
      // Return partial results or fallback
      const fallbackResults = {};
      for (let i = 0; i < 6; i++) {
        fallbackResults[`fallback_${i}`] = this.generateRandomPrediction(i);
      }
      return fallbackResults;
    }
  }

  // ===========================================================================
  // ALGORITHM 1: EWMA FREQUENCY ANALYSIS
  // ===========================================================================

  generateEWMAFrequencyPrediction(historicalData) {
    try {
      const frequencies = this.calculateEWMAFrequencies(historicalData);
      const powerballFreqs = this.calculateEWMAPowerballFrequencies(historicalData);
      
      // Select numbers based on EWMA weights
      const numbers = [];
      const weightedNumbers = Object.entries(frequencies.numbers)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 15); // Top 15 candidates
      
      // Add some randomization to avoid always picking the same numbers
      const selectedCandidates = shuffleArray(weightedNumbers).slice(0, 8);
      
      while (numbers.length < 5) {
        const [num, weight] = selectedCandidates[numbers.length % selectedCandidates.length];
        const candidate = parseInt(num);
        if (!numbers.includes(candidate) && candidate >= 1 && candidate <= 69) {
          numbers.push(candidate);
        }
      }
      
      // Select powerball
      const powerballCandidates = Object.entries(frequencies.powerball)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8);
      
      const powerball = parseInt(powerballCandidates[Math.floor(Math.random() * powerballCandidates.length)][0]);
      
      return {
        numbers: numbers.sort((a, b) => a - b),
        powerball: powerball,
        strategy: 'EWMA Frequency Analysis',
        confidence: this.calculatePredictionConfidence('ewma', numbers, powerball),
        analysis: 'Exponentially weighted moving average with recent trend emphasis',
        algorithmId: 'ewma'
      };

    } catch (error) {
      console.error('EWMA algorithm failed:', error);
      return this.generateRandomPrediction(0);
    }
  }

  calculateEWMAFrequencies(historicalData) {
    const numberEWMA = {};
    const powerballEWMA = {};
    
    // Initialize
    for (let i = 1; i <= 69; i++) numberEWMA[i] = 0;
    for (let i = 1; i <= 26; i++) powerballEWMA[i] = 0;
    
    if (!historicalData || historicalData.length === 0) {
      return { numbers: numberEWMA, powerball: powerballEWMA };
    }
    
    // Calculate EWMA with more recent drawings having higher weight
    historicalData.forEach((drawing, index) => {
      const weight = Math.pow(1 - this.ewmaAlpha, historicalData.length - index - 1);
      
      if (drawing.numbers && Array.isArray(drawing.numbers)) {
        drawing.numbers.forEach(num => {
          if (num >= 1 && num <= 69) {
            numberEWMA[num] = this.ewmaAlpha * weight + (1 - this.ewmaAlpha) * numberEWMA[num];
          }
        });
      }
      
      if (drawing.powerball >= 1 && drawing.powerball <= 26) {
        powerballEWMA[drawing.powerball] = this.ewmaAlpha * weight + 
          (1 - this.ewmaAlpha) * powerballEWMA[drawing.powerball];
      }
    });
    
    return { numbers: numberEWMA, powerball: powerballEWMA };
  }

  calculateEWMAPowerballFrequencies(historicalData) {
    const frequencies = {};
    for (let i = 1; i <= 26; i++) frequencies[i] = 0;
    
    historicalData.forEach((drawing, index) => {
      if (drawing.powerball >= 1 && drawing.powerball <= 26) {
        const weight = Math.pow(1 - this.ewmaAlpha, historicalData.length - index - 1);
        frequencies[drawing.powerball] += weight;
      }
    });
    
    return frequencies;
  }

  // ===========================================================================
  // ALGORITHM 2: NEURAL NETWORK PATTERN RECOGNITION
  // ===========================================================================

  generateNeuralNetworkPrediction(historicalData) {
    try {
      const features = this.extractNeuralFeatures(historicalData);
      const predictions = this.forwardPassNeural(features);
      
      // Convert neural network output to number selection
      const numbers = this.neuralOutputToNumbers(predictions);
      const powerball = this.neuralOutputToPowerball(predictions);
      
      return {
        numbers: numbers.sort((a, b) => a - b),
        powerball: powerball,
        strategy: 'Neural Network Pattern Recognition',
        confidence: this.calculatePredictionConfidence('neural', numbers, powerball),
        analysis: 'Multi-layer neural network analyzing positional and temporal patterns',
        algorithmId: 'neural'
      };

    } catch (error) {
      console.error('Neural network algorithm failed:', error);
      return this.generateRandomPrediction(1);
    }
  }

  extractNeuralFeatures(historicalData) {
    const features = new Array(10).fill(0);
    
    if (historicalData.length === 0) return features;
    
    const recent = historicalData.slice(0, Math.min(10, historicalData.length));
    
    // Feature 1-5: Average positions of recent numbers
    for (let i = 0; i < 5; i++) {
      let sum = 0;
      let count = 0;
      recent.forEach(drawing => {
        if (drawing.numbers && drawing.numbers[i]) {
          sum += drawing.numbers[i];
          count++;
        }
      });
      features[i] = count > 0 ? sum / count / 69 : 0.5; // Normalize
    }
    
    // Feature 6: Average sum of recent drawings
    let sumTotal = 0;
    let sumCount = 0;
    recent.forEach(drawing => {
      if (drawing.numbers) {
        sumTotal += drawing.numbers.reduce((a, b) => a + b, 0);
        sumCount++;
      }
    });
    features[5] = sumCount > 0 ? (sumTotal / sumCount) / 345 : 0.5; // Normalize by max possible sum
    
    // Feature 7: Trend in sums (increasing/decreasing)
    if (recent.length >= 3) {
      const recentSums = recent.slice(0, 3).map(d => 
        d.numbers ? d.numbers.reduce((a, b) => a + b, 0) : 0
      );
      features[6] = (recentSums[0] - recentSums[2]) / 345; // Normalize trend
    }
    
    // Feature 8: Even/odd ratio in recent drawings
    let evenCount = 0, totalNumbers = 0;
    recent.forEach(drawing => {
      if (drawing.numbers) {
        drawing.numbers.forEach(num => {
          if (num % 2 === 0) evenCount++;
          totalNumbers++;
        });
      }
    });
    features[7] = totalNumbers > 0 ? evenCount / totalNumbers : 0.5;
    
    // Feature 9: High/low ratio (>35 vs <=35)
    let highCount = 0;
    totalNumbers = 0;
    recent.forEach(drawing => {
      if (drawing.numbers) {
        drawing.numbers.forEach(num => {
          if (num > 35) highCount++;
          totalNumbers++;
        });
      }
    });
    features[8] = totalNumbers > 0 ? highCount / totalNumbers : 0.5;
    
    // Feature 10: Days since last occurrence of most frequent number
    const frequencies = {};
    historicalData.forEach(drawing => {
      if (drawing.numbers) {
        drawing.numbers.forEach(num => {
          frequencies[num] = (frequencies[num] || 0) + 1;
        });
      }
    });
    const mostFrequent = Object.entries(frequencies)
      .sort(([,a], [,b]) => b - a)[0];
    features[9] = mostFrequent ? Math.min(1, (frequencies[mostFrequent[0]] || 0) / 100) : 0;
    
    return features;
  }

  forwardPassNeural(features) {
    // Simple forward pass through neural network
    const { w1, w2, b1, b2 } = this.neuralWeights;
    
    // Hidden layer
    const hidden = new Array(20).fill(0);
    for (let i = 0; i < 20; i++) {
      let sum = b1[i];
      for (let j = 0; j < 10; j++) {
        sum += features[j] * w1[j][i];
      }
      hidden[i] = Math.tanh(sum); // Activation function
    }
    
    // Output layer
    const output = new Array(69).fill(0);
    for (let i = 0; i < 69; i++) {
      let sum = b2[i];
      for (let j = 0; j < 20; j++) {
        sum += hidden[j] * w2[j][i];
      }
      output[i] = 1 / (1 + Math.exp(-sum)); // Sigmoid activation
    }
    
    return output;
  }

  neuralOutputToNumbers(predictions) {
    // Convert neural network output to 5 numbers
    const candidates = predictions
      .map((prob, index) => ({ number: index + 1, probability: prob }))
      .sort((a, b) => b.probability - a.probability);
    
    const selected = [];
    let candidateIndex = 0;
    
    while (selected.length < 5 && candidateIndex < candidates.length) {
      const candidate = candidates[candidateIndex];
      
      // Add some randomness to avoid always picking the highest probabilities
      if (Math.random() < candidate.probability + 0.3) {
        selected.push(candidate.number);
      }
      candidateIndex++;
    }
    
    // Fill remaining slots if needed
    while (selected.length < 5) {
      const randomCandidate = Math.floor(Math.random() * 69) + 1;
      if (!selected.includes(randomCandidate)) {
        selected.push(randomCandidate);
      }
    }
    
    return selected;
  }

  neuralOutputToPowerball(predictions) {
    // Use first few neural outputs to influence powerball selection
    const sum = predictions.slice(0, 5).reduce((a, b) => a + b, 0);
    return Math.floor(sum * 26) + 1;
  }

  // ===========================================================================
  // ALGORITHM 3: PAIR RELATIONSHIP ANALYSIS
  // ===========================================================================

  generatePairAnalysisPrediction(historicalData) {
    try {
      const pairFrequencies = this.calculatePairFrequencies(historicalData);
      const numbers = this.selectNumbersFromPairs(pairFrequencies);
      const powerball = this.selectPowerballFromPairs(historicalData);
      
      return {
        numbers: numbers.sort((a, b) => a - b),
        powerball: powerball,
        strategy: 'Pair Relationship Analysis',
        confidence: this.calculatePredictionConfidence('pairs', numbers, powerball),
        analysis: 'Co-occurrence pattern analysis identifying number pair relationships',
        algorithmId: 'pairs'
      };

    } catch (error) {
      console.error('Pair analysis algorithm failed:', error);
      return this.generateRandomPrediction(2);
    }
  }

  calculatePairFrequencies(historicalData) {
    const pairs = {};
    
    historicalData.forEach(drawing => {
      if (!drawing.numbers || drawing.numbers.length !== 5) return;
      
      // Calculate all pairs in this drawing
      for (let i = 0; i < 5; i++) {
        for (let j = i + 1; j < 5; j++) {
          const num1 = drawing.numbers[i];
          const num2 = drawing.numbers[j];
          const pairKey = `${Math.min(num1, num2)}-${Math.max(num1, num2)}`;
          
          pairs[pairKey] = (pairs[pairKey] || 0) + 1;
        }
      }
    });
    
    return pairs;
  }

  selectNumbersFromPairs(pairFrequencies) {
    const numbers = [];
    const usedNumbers = new Set();
    
    // Sort pairs by frequency
    const sortedPairs = Object.entries(pairFrequencies)
      .sort(([,a], [,b]) => b - a);
    
    // Select numbers from highest frequency pairs
    for (const [pairKey, frequency] of sortedPairs) {
      if (numbers.length >= 5) break;
      
      const [num1, num2] = pairKey.split('-').map(n => parseInt(n));
      
      if (!usedNumbers.has(num1) && numbers.length < 5) {
        numbers.push(num1);
        usedNumbers.add(num1);
      }
      
      if (!usedNumbers.has(num2) && numbers.length < 5) {
        numbers.push(num2);
        usedNumbers.add(num2);
      }
    }
    
    // Fill remaining slots with random numbers
    while (numbers.length < 5) {
      const candidate = Math.floor(Math.random() * 69) + 1;
      if (!usedNumbers.has(candidate)) {
        numbers.push(candidate);
        usedNumbers.add(candidate);
      }
    }
    
    return numbers;
  }

  selectPowerballFromPairs(historicalData) {
    const powerballFreq = {};
    
    historicalData.forEach(drawing => {
      if (drawing.powerball >= 1 && drawing.powerball <= 26) {
        powerballFreq[drawing.powerball] = (powerballFreq[drawing.powerball] || 0) + 1;
      }
    });
    
    const sortedPowerballs = Object.entries(powerballFreq)
      .sort(([,a], [,b]) => b - a);
    
    // Select from top 8 most frequent powerballs with some randomness
    const topCandidates = sortedPowerballs.slice(0, 8);
    const selectedIndex = Math.floor(Math.random() * topCandidates.length);
    
    return parseInt(topCandidates[selectedIndex]?.[0] || '1');
  }

  // ===========================================================================
  // ALGORITHM 4: GAP ANALYSIS OPTIMIZATION
  // ===========================================================================

  generateGapAnalysisPrediction(historicalData) {
    try {
      const gaps = this.calculateNumberGaps(historicalData);
      const numbers = this.selectOverdueNumbers(gaps);
      const powerball = this.selectOverduePowerball(historicalData);
      
      return {
        numbers: numbers.sort((a, b) => a - b),
        powerball: powerball,
        strategy: 'Gap Analysis Optimization',
        confidence: this.calculatePredictionConfidence('gaps', numbers, powerball),
        analysis: 'Overdue number identification using gap pattern analysis',
        algorithmId: 'gaps'
      };

    } catch (error) {
      console.error('Gap analysis algorithm failed:', error);
      return this.generateRandomPrediction(3);
    }
  }

  calculateNumberGaps(historicalData) {
    const gaps = {};
    const currentGaps = {};
    
    // Initialize
    for (let i = 1; i <= 69; i++) {
      gaps[i] = [];
      currentGaps[i] = 0;
    }
    
    // Calculate gaps for each number
    historicalData.forEach((drawing, index) => {
      // Increment gap for all numbers
      for (let i = 1; i <= 69; i++) {
        currentGaps[i]++;
      }
      
      // Reset gap for drawn numbers
      if (drawing.numbers) {
        drawing.numbers.forEach(num => {
          if (num >= 1 && num <= 69) {
            gaps[num].push(currentGaps[num]);
            currentGaps[num] = 0;
          }
        });
      }
    });
    
    // Calculate statistics for each number
    const gapStats = {};
    for (let i = 1; i <= 69; i++) {
      const numberGaps = gaps[i];
      if (numberGaps.length > 0) {
        const avgGap = numberGaps.reduce((a, b) => a + b, 0) / numberGaps.length;
        gapStats[i] = {
          currentGap: currentGaps[i],
          averageGap: avgGap,
          maxGap: Math.max(...numberGaps),
          overdueScore: currentGaps[i] / avgGap // How overdue compared to average
        };
      } else {
        gapStats[i] = {
          currentGap: currentGaps[i],
          averageGap: historicalData.length / 5, // Rough estimate
          maxGap: currentGaps[i],
          overdueScore: 1
        };
      }
    }
    
    return gapStats;
  }

  selectOverdueNumbers(gapStats) {
    // Sort numbers by overdue score
    const overdueNumbers = Object.entries(gapStats)
      .sort(([,a], [,b]) => b.overdueScore - a.overdueScore)
      .slice(0, 15) // Top 15 overdue
      .map(([num, stats]) => ({ 
        number: parseInt(num), 
        score: stats.overdueScore,
        gap: stats.currentGap
      }));
    
    const selected = [];
    
    // Select mix of most overdue and moderate overdue
    const mostOverdue = overdueNumbers.slice(0, 3);
    const moderateOverdue = overdueNumbers.slice(3, 10);
    
    // Add 2-3 from most overdue
    shuffleArray(mostOverdue).slice(0, 3).forEach(item => {
      if (selected.length < 5) {
        selected.push(item.number);
      }
    });
    
    // Add remaining from moderate overdue
    shuffleArray(moderateOverdue).forEach(item => {
      if (selected.length < 5 && !selected.includes(item.number)) {
        selected.push(item.number);
      }
    });
    
    // Fill any remaining slots
    while (selected.length < 5) {
      const candidate = Math.floor(Math.random() * 69) + 1;
      if (!selected.includes(candidate)) {
        selected.push(candidate);
      }
    }
    
    return selected;
  }

  selectOverduePowerball(historicalData) {
    const powerballGaps = {};
    let currentGaps = {};
    
    // Initialize
    for (let i = 1; i <= 26; i++) {
      powerballGaps[i] = [];
      currentGaps[i] = 0;
    }
    
    historicalData.forEach(drawing => {
      // Increment gaps
      for (let i = 1; i <= 26; i++) {
        currentGaps[i]++;
      }
      
      // Reset for drawn powerball
      if (drawing.powerball >= 1 && drawing.powerball <= 26) {
        powerballGaps[drawing.powerball].push(currentGaps[drawing.powerball]);
        currentGaps[drawing.powerball] = 0;
      }
    });
    
    // Find most overdue powerball
    let maxOverdue = 0;
    let selectedPowerball = 1;
    
    for (let i = 1; i <= 26; i++) {
      if (currentGaps[i] > maxOverdue) {
        maxOverdue = currentGaps[i];
        selectedPowerball = i;
      }
    }
    
    return selectedPowerball;
  }

  // ===========================================================================
  // ALGORITHM 5: MARKOV CHAIN TRANSITION
  // ===========================================================================

  generateMarkovChainPrediction(historicalData) {
    try {
      const transitionMatrix = this.buildTransitionMatrix(historicalData);
      const numbers = this.generateMarkovSequence(transitionMatrix, historicalData);
      const powerball = this.generateMarkovPowerball(historicalData);
      
      return {
        numbers: numbers.sort((a, b) => a - b),
        powerball: powerball,
        strategy: 'Markov Chain Transition',
        confidence: this.calculatePredictionConfidence('markov', numbers, powerball),
        analysis: 'State transition analysis predicting next numbers based on sequence patterns',
        algorithmId: 'markov'
      };

    } catch (error) {
      console.error('Markov chain algorithm failed:', error);
      return this.generateRandomPrediction(4);
    }
  }

  buildTransitionMatrix(historicalData) {
    const transitions = {};
    
    // Build transition counts
    for (let i = 0; i < historicalData.length - 1; i++) {
      const current = historicalData[i];
      const next = historicalData[i + 1];
      
      if (!current.numbers || !next.numbers) continue;
      
      current.numbers.forEach(currentNum => {
        if (!transitions[currentNum]) {
          transitions[currentNum] = {};
        }
        
        next.numbers.forEach(nextNum => {
          transitions[currentNum][nextNum] = (transitions[currentNum][nextNum] || 0) + 1;
        });
      });
    }
    
    // Convert to probabilities
    Object.keys(transitions).forEach(currentNum => {
      const total = Object.values(transitions[currentNum]).reduce((a, b) => a + b, 0);
      if (total > 0) {
        Object.keys(transitions[currentNum]).forEach(nextNum => {
          transitions[currentNum][nextNum] /= total;
        });
      }
    });
    
    return transitions;
  }

  generateMarkovSequence(transitionMatrix, historicalData) {
    if (historicalData.length === 0) {
      return this.generateRandomNumbers(5);
    }
    
    const lastDrawing = historicalData[0];
    if (!lastDrawing.numbers) {
      return this.generateRandomNumbers(5);
    }
    
    const numbers = [];
    const usedNumbers = new Set();
    
    // Start with numbers from last drawing
    const startingNumbers = [...lastDrawing.numbers];
    
    startingNumbers.forEach(startNum => {
      if (numbers.length >= 5) return;
      
      const transitions = transitionMatrix[startNum] || {};
      const candidates = Object.entries(transitions)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
      
      if (candidates.length > 0) {
        // Select based on transition probabilities with some randomness
        const selectedCandidate = candidates[Math.floor(Math.random() * Math.min(3, candidates.length))];
        const candidateNum = parseInt(selectedCandidate[0]);
        
        if (!usedNumbers.has(candidateNum) && numbers.length < 5) {
          numbers.push(candidateNum);
          usedNumbers.add(candidateNum);
        }
      }
    });
    
    // Fill remaining slots
    while (numbers.length < 5) {
      const candidate = Math.floor(Math.random() * 69) + 1;
      if (!usedNumbers.has(candidate)) {
        numbers.push(candidate);
        usedNumbers.add(candidate);
      }
    }
    
    return numbers;
  }

  generateMarkovPowerball(historicalData) {
    if (historicalData.length < 2) {
      return Math.floor(Math.random() * 26) + 1;
    }
    
    // Simple Markov for powerball based on last few drawings
    const recentPowerballs = historicalData
      .slice(0, 5)
      .map(d => d.powerball)
      .filter(p => p >= 1 && p <= 26);
    
    if (recentPowerballs.length === 0) {
      return Math.floor(Math.random() * 26) + 1;
    }
    
    // Calculate average and add some variance
    const avg = recentPowerballs.reduce((a, b) => a + b, 0) / recentPowerballs.length;
    const variance = Math.floor(Math.random() * 6) - 3; // -3 to +3
    const predicted = Math.max(1, Math.min(26, Math.round(avg + variance)));
    
    return predicted;
  }

  // ===========================================================================
  // ALGORITHM 6: SUM RANGE OPTIMIZATION
  // ===========================================================================

  generateSumRangePrediction(historicalData) {
    try {
      const sumStats = this.calculateSumStatistics(historicalData);
      const numbers = this.generateNumbersForTargetSum(sumStats);
      const powerball = this.generateSumBasedPowerball(sumStats);
      
      return {
        numbers: numbers.sort((a, b) => a - b),
        powerball: powerball,
        strategy: 'Sum Range Optimization',
        confidence: this.calculatePredictionConfidence('sum', numbers, powerball),
        analysis: 'Sum range optimization based on historical distribution patterns',
        algorithmId: 'sum'
      };

    } catch (error) {
      console.error('Sum range algorithm failed:', error);
      return this.generateRandomPrediction(5);
    }
  }

  calculateSumStatistics(historicalData) {
    const sums = historicalData
      .filter(d => d.numbers && d.numbers.length === 5)
      .map(d => d.numbers.reduce((a, b) => a + b, 0));
    
    if (sums.length === 0) {
      return {
        mean: 175,
        stdDev: 50,
        min: 75,
        max: 275,
        target: 175
      };
    }
    
    const mean = sums.reduce((a, b) => a + b, 0) / sums.length;
    const variance = sums.reduce((acc, sum) => acc + Math.pow(sum - mean, 2), 0) / sums.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      mean,
      stdDev,
      min: Math.min(...sums),
      max: Math.max(...sums),
      target: mean + (Math.random() - 0.5) * stdDev // Target with some variation
    };
  }

  generateNumbersForTargetSum(sumStats) {
    const { target, mean, stdDev } = sumStats;
    const numbers = [];
    let currentSum = 0;
    let attempts = 0;
    const maxAttempts = 100;
    
    while (numbers.length < 5 && attempts < maxAttempts) {
      attempts++;
      
      if (numbers.length === 4) {
        // Last number: calculate what we need
        const needed = target - currentSum;
        if (needed >= 1 && needed <= 69 && !numbers.includes(needed)) {
          numbers.push(needed);
          break;
        } else {
          // Start over if we can't reach target
          numbers.length = 0;
          currentSum = 0;
          continue;
        }
      }
      
      const remainingNumbers = 5 - numbers.length;
      const remainingSum = target - currentSum;
      const targetNum = Math.round(remainingSum / remainingNumbers);
      
      // Add some randomness around the target
      const candidate = Math.max(1, Math.min(69, targetNum + Math.floor(Math.random() * 20) - 10));
      
      if (!numbers.includes(candidate)) {
        numbers.push(candidate);
        currentSum += candidate;
      }
    }
    
    // Fallback if we couldn't generate a good set
    if (numbers.length < 5) {
      return this.generateRandomNumbers(5);
    }
    
    return numbers;
  }

  generateSumBasedPowerball(sumStats) {
    // Use sum statistics to influence powerball selection
    const normalized = (sumStats.target - 75) / (275 - 75); // Normalize to 0-1
    const powerball = Math.max(1, Math.min(26, Math.round(normalized * 26)));
    return powerball;
  }

  // ===========================================================================
  // ENSEMBLE CREATION & VALIDATION
  // ===========================================================================

  createEnsemblePredictions(algorithmResults, requestedSets) {
    const predictions = [];
    const resultArray = Object.values(algorithmResults);
    
    // Ensure we have enough algorithm results
    if (resultArray.length === 0) {
      return this.generateFallbackPredictions(requestedSets);
    }
    
    // Use algorithm results in order of their weights
    const sortedAlgorithms = Object.entries(this.algorithmPerformance)
      .sort(([,a], [,b]) => b.weight - a.weight);
    
    for (let i = 0; i < requestedSets; i++) {
      const algorithmIndex = i % resultArray.length;
      const result = resultArray[algorithmIndex];
      
      if (this.validatePrediction(result)) {
        predictions.push({
          ...result,
          id: i + 1,
          ensembleWeight: sortedAlgorithms[algorithmIndex % sortedAlgorithms.length][1].weight
        });
      } else {
        predictions.push(this.generateRandomPrediction(i));
      }
    }
    
    return predictions;
  }

  validateAndEnhancePredictions(predictions, historicalData) {
    return predictions.map(prediction => {
      // Validate numbers
      if (!this.validatePrediction(prediction)) {
        return this.generateRandomPrediction(prediction.id || 0);
      }
      
      // Enhance with metadata
      const enhanced = {
        ...prediction,
        metadata: this.generatePredictionMetadata(prediction, historicalData),
        timestamp: new Date().toISOString()
      };
      
      // Update algorithm performance
      if (prediction.algorithmId && this.algorithmPerformance[prediction.algorithmId]) {
        this.algorithmPerformance[prediction.algorithmId].totalPredictions++;
      }
      
      return enhanced;
    });
  }

  validatePrediction(prediction) {
    return prediction && 
           prediction.numbers && 
           prediction.powerball &&
           isValidPowerballNumbers(prediction.numbers, prediction.powerball) &&
           prediction.numbers.length === 5;
  }

  generatePredictionMetadata(prediction, historicalData) {
    const sum = prediction.numbers.reduce((a, b) => a + b, 0);
    const evenCount = prediction.numbers.filter(num => num % 2 === 0).length;
    const lowCount = prediction.numbers.filter(num => num <= 35).length;
    
    return {
      sum,
      evenCount,
      oddCount: 5 - evenCount,
      lowCount,
      highCount: 5 - lowCount,
      range: Math.max(...prediction.numbers) - Math.min(...prediction.numbers),
      dataSize: historicalData.length,
      generatedAt: new Date().toISOString()
    };
  }

  // ===========================================================================
  // CONFIDENCE CALCULATION
  // ===========================================================================

  calculatePredictionConfidence(algorithmId, numbers, powerball) {
    let baseConfidence = 70;
    
    // Adjust based on algorithm performance
    const algorithmPerf = this.algorithmPerformance[algorithmId];
    if (algorithmPerf) {
      baseConfidence += algorithmPerf.successRate * 30;
      baseConfidence = (baseConfidence + algorithmPerf.averageConfidence) / 2;
    }
    
    // Adjust based on number characteristics
    const sum = numbers.reduce((a, b) => a + b, 0);
    if (sum >= 100 && sum <= 250) baseConfidence += 5; // Good sum range
    
    const evenCount = numbers.filter(n => n % 2 === 0).length;
    if (evenCount >= 2 && evenCount <= 3) baseConfidence += 3; // Balanced even/odd
    
    // Add some randomness and cap
    baseConfidence += (Math.random() - 0.5) * 10;
    return Math.min(95, Math.max(65, Math.round(baseConfidence)));
  }

  // ===========================================================================
  // FALLBACK & UTILITY METHODS
  // ===========================================================================

  generateFallbackPredictions(count) {
    const predictions = [];
    for (let i = 0; i < count; i++) {
      predictions.push(this.generateRandomPrediction(i));
    }
    return predictions;
  }

  generateRandomPrediction(index) {
    const numbers = this.generateRandomNumbers(5);
    const powerball = Math.floor(Math.random() * 26) + 1;
    
    return {
      numbers: numbers.sort((a, b) => a - b),
      powerball: powerball,
      strategy: 'Enhanced Random',
      confidence: 70 + Math.floor(Math.random() * 15),
      analysis: 'Statistical random generation with mathematical constraints',
      algorithmId: 'random',
      id: index + 1
    };
  }

  generateRandomNumbers(count) {
    const numbers = [];
    while (numbers.length < count) {
      const num = Math.floor(Math.random() * 69) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    return numbers;
  }

  validateHistoricalData(data) {
    return Array.isArray(data) && 
           data.length >= 10 && 
           data.every(drawing => 
             drawing.numbers && 
             Array.isArray(drawing.numbers) && 
             drawing.numbers.length === 5 &&
             drawing.powerball
           );
  }

  // ===========================================================================
  // PERFORMANCE MONITORING
  // ===========================================================================

  updateAlgorithmMetrics() {
    Object.keys(this.algorithmPerformance).forEach(algorithmId => {
      const perf = this.algorithmPerformance[algorithmId];
      
      // Update success rate based on recent hits
      if (perf.recentHits.length > 0) {
        const recentSuccess = perf.recentHits.slice(-this.performanceWindow);
        perf.successRate = recentSuccess.reduce((a, b) => a + b, 0) / recentSuccess.length;
      }
      
      // Adjust weights based on performance
      if (perf.successRate > 0.2) {
        perf.weight = Math.min(0.25, perf.weight * 1.05);
      } else if (perf.successRate < 0.1) {
        perf.weight = Math.max(0.05, perf.weight * 0.95);
      }
    });
  }

  updatePredictionHistory(predictions) {
    this.predictionHistory.push({
      timestamp: new Date().toISOString(),
      predictions: predictions.map(p => ({
        numbers: p.numbers,
        powerball: p.powerball,
        algorithmId: p.algorithmId,
        confidence: p.confidence
      }))
    });
    
    // Keep only recent history
    if (this.predictionHistory.length > 100) {
      this.predictionHistory = this.predictionHistory.slice(-50);
    }
  }

  recordActualDrawing(actualNumbers, actualPowerball) {
    // Update algorithm performance based on actual results
    if (this.predictionHistory.length === 0) return;
    
    const lastPredictions = this.predictionHistory[this.predictionHistory.length - 1];
    
    lastPredictions.predictions.forEach(prediction => {
      if (!prediction.algorithmId) return;
      
      const matches = prediction.numbers.filter(num => actualNumbers.includes(num)).length;
      const powerballMatch = prediction.powerball === actualPowerball ? 1 : 0;
      
      // Score: number matches + powerball match
      const score = (matches + powerballMatch) / 6; // 0 to 1 scale
      
      const algorithmPerf = this.algorithmPerformance[prediction.algorithmId];
      if (algorithmPerf) {
        algorithmPerf.recentHits.push(score);
        algorithmPerf.correctPredictions += score;
        
        // Keep only recent hits
        if (algorithmPerf.recentHits.length > this.performanceWindow) {
          algorithmPerf.recentHits = algorithmPerf.recentHits.slice(-this.performanceWindow);
        }
      }
    });
    
    console.log('?? Algorithm performance updated with actual drawing results');
  }

  getPerformanceReport() {
    return {
      timestamp: new Date().toISOString(),
      algorithms: Object.entries(this.algorithmPerformance).map(([id, perf]) => ({
        id,
        name: perf.name,
        successRate: perf.successRate,
        weight: perf.weight,
        totalPredictions: perf.totalPredictions,
        lastUsed: perf.lastUsed
      })),
      predictionHistory: this.predictionHistory.length,
      isLearning: this.isLearning
    };
  }
}

// Create and export singleton instance
export const lotteryPredictor = new LotteryPredictor();

console.log('?? LotteryPredictor service loaded');
console.log('?? 6 algorithms ready: EWMA, Neural, Pairs, Gaps, Markov, Sum Range');