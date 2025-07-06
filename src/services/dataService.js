/**
 * Data service for managing lottery data and statistics
 */

import axios from 'axios'

class DataService {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutes
    this.retryAttempts = 3
    this.retryDelay = 1000
  }

  async initialize() {
    console.log('🔧 Initializing data service...')
    
    // Set up axios defaults
    this.setupAxios()
    
    // Initialize cache
    this.cache.clear()
    
    console.log('✅ Data service initialized')
  }

  setupAxios() {
    // Set default timeout
    axios.defaults.timeout = 10000
    
    // Add request interceptor
    axios.interceptors.request.use(
      (config) => {
        console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        console.error('📤 Request Error:', error)
        return Promise.reject(error)
      }
    )
    
    // Add response interceptor
    axios.interceptors.response.use(
      (response) => {
        console.log(`📥 API Response: ${response.status} ${response.config.url}`)
        return response
      },
      (error) => {
        console.error('📥 Response Error:', error.response?.status, error.config?.url)
        return Promise.reject(error)
      }
    )
  }

  /**
   * Load historical lottery data
   */
  async loadHistoricalData() {
    const cacheKey = 'historical-data'
    
    // Check cache first
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      console.log('📊 Using cached historical data')
      return cached
    }
    
    try {
      console.log('📊 Loading historical lottery data...')
      
      // Try to load from external API first
      let data = await this.loadFromExternalAPI()
      
      // If external API fails, fall back to local data
      if (!data) {
        console.log('⚠️ External API failed, using fallback data')
        data = await this.loadFallbackData()
      }
      
      // Process and validate the data
      const processedData = this.processHistoricalData(data)
      
      // Cache the processed data
      this.setCache(cacheKey, processedData)
      
      console.log(`✅ Loaded ${processedData.drawings?.length || 0} historical drawings`)
      return processedData
      
    } catch (error) {
      console.error('❌ Failed to load historical data:', error)
      throw new Error(`Data loading failed: ${error.message}`)
    }
  }

  /**
   * Load data from external lottery API
   */
  async loadFromExternalAPI() {
    try {
      // Note: In a real application, you would use actual lottery APIs
      // For now, we'll simulate with a timeout to show the fallback mechanism
      const response = await Promise.race([
        fetch('/api/lottery/historical'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API timeout')), 3000)
        )
      ])
      
      if (response.ok) {
        const data = await response.json()
        return data
      }
      
      throw new Error(`API returned ${response.status}`)
      
    } catch (error) {
      console.warn('External API failed:', error.message)
      return null
    }
  }

  /**
   * Load fallback lottery data (embedded in application)
   */
  async loadFallbackData() {
    try {
      console.log('📊 Loading fallback lottery data...')
      
      // Simulate historical Powerball data
      const drawings = this.generateFallbackDrawings(500) // Last 500 drawings
      const currentJackpot = this.generateCurrentJackpot()
      
      return {
        drawings,
        currentJackpot,
        source: 'fallback',
        timestamp: new Date(),
        total: drawings.length
      }
      
    } catch (error) {
      console.error('❌ Failed to load fallback data:', error)
      throw error
    }
  }

  /**
   * Generate realistic fallback lottery drawings
   */
  generateFallbackDrawings(count = 500) {
    const drawings = []
    const today = new Date()
    
    // Base frequency weights for more realistic distributions
    const numberWeights = this.generateNumberWeights()
    const powerballWeights = this.generatePowerballWeights()
    
    for (let i = 0; i < count; i++) {
      const drawDate = new Date(today.getTime() - (i * 3.5 * 24 * 60 * 60 * 1000)) // Every 3.5 days
      
      const numbers = this.generateWeightedNumbers(numberWeights, 5, 1, 69)
      const powerball = this.generateWeightedNumber(powerballWeights, 1, 26)
      
      drawings.push({
        id: `pb_${drawDate.toISOString().split('T')[0]}_${i}`,
        date: drawDate.toISOString().split('T')[0],
        numbers: numbers.sort((a, b) => a - b),
        powerball: powerball,
        jackpot: this.generateJackpot(i),
        multiplier: Math.random() < 0.3 ? Math.floor(Math.random() * 5) + 2 : null
      })
    }
    
    return drawings.reverse() // Return in chronological order
  }

  /**
   * Generate number frequency weights for realistic distribution
   */
  generateNumberWeights() {
    const weights = {}
    
    // Generate weights that follow a realistic lottery distribution
    for (let i = 1; i <= 69; i++) {
      // Some numbers are slightly more frequent in real data
      let weight = 1.0
      
      // Numbers ending in 1, 7 tend to be picked more often
      if (i % 10 === 1 || i % 10 === 7) weight *= 1.1
      
      // Middle range numbers are often picked more
      if (i >= 20 && i <= 50) weight *= 1.05
      
      // Add some randomness
      weight *= (0.8 + Math.random() * 0.4)
      
      weights[i] = weight
    }
    
    return weights
  }

  /**
   * Generate Powerball frequency weights
   */
  generatePowerballWeights() {
    const weights = {}
    
    for (let i = 1; i <= 26; i++) {
      let weight = 1.0
      
      // Lower numbers tend to be picked slightly more often
      if (i <= 13) weight *= 1.1
      
      // Add randomness
      weight *= (0.8 + Math.random() * 0.4)
      
      weights[i] = weight
    }
    
    return weights
  }

  /**
   * Generate weighted random numbers
   */
  generateWeightedNumbers(weights, count, min, max) {
    const numbers = []
    const availableNumbers = Array.from({ length: max - min + 1 }, (_, i) => i + min)
    
    while (numbers.length < count && availableNumbers.length > 0) {
      const totalWeight = availableNumbers.reduce((sum, num) => sum + weights[num], 0)
      let random = Math.random() * totalWeight
      
      for (let i = 0; i < availableNumbers.length; i++) {
        const num = availableNumbers[i]
        random -= weights[num]
        
        if (random <= 0) {
          numbers.push(num)
          availableNumbers.splice(i, 1)
          break
        }
      }
    }
    
    return numbers
  }

  /**
   * Generate weighted random single number
   */
  generateWeightedNumber(weights, min, max) {
    const numbers = Array.from({ length: max - min + 1 }, (_, i) => i + min)
    const totalWeight = numbers.reduce((sum, num) => sum + weights[num], 0)
    let random = Math.random() * totalWeight
    
    for (const num of numbers) {
      random -= weights[num]
      if (random <= 0) {
        return num
      }
    }
    
    return numbers[numbers.length - 1]
  }

  /**
   * Generate realistic jackpot amount
   */
  generateJackpot(drawIndex) {
    // Base jackpot of $20M, increases over time with some resets
    const baseJackpot = 20000000
    const growthFactor = 1.1
    const resetProbability = 0.02 // 2% chance of reset (jackpot won)
    
    if (Math.random() < resetProbability) {
      return baseJackpot + Math.random() * 50000000 // Won jackpot, reset to $20-70M
    }
    
    return Math.floor(baseJackpot * Math.pow(growthFactor, drawIndex % 20))
  }

  /**
   * Generate current jackpot info
   */
  generateCurrentJackpot() {
    const amount = 100000000 + Math.random() * 500000000 // $100M - $600M
    
    return {
      amount: Math.floor(amount),
      formatted: this.formatCurrency(amount),
      nextDrawing: this.getNextDrawingDate(),
      cash: Math.floor(amount * 0.6), // Approximate cash value
      formattedCash: this.formatCurrency(amount * 0.6)
    }
  }

  /**
   * Get next drawing date
   */
  getNextDrawingDate() {
    const now = new Date()
    const today = now.getDay()
    
    // Powerball draws on Monday, Wednesday, Saturday (1, 3, 6)
    const drawDays = [1, 3, 6]
    let nextDrawDay = drawDays.find(day => day > today)
    
    if (!nextDrawDay) {
      nextDrawDay = drawDays[0] // Next week's Monday
    }
    
    const daysUntilDraw = nextDrawDay > today ? nextDrawDay - today : 7 - today + nextDrawDay
    const nextDraw = new Date(now.getTime() + daysUntilDraw * 24 * 60 * 60 * 1000)
    nextDraw.setHours(22, 59, 0, 0) // 10:59 PM draw time
    
    return nextDraw.toISOString()
  }

  /**
   * Process and validate historical data
   */
  processHistoricalData(rawData) {
    try {
      console.log('🔄 Processing historical data...')
      
      const drawings = rawData.drawings || []
      
      // Validate and clean data
      const validDrawings = drawings.filter(this.validateDrawing)
      
      // Generate statistics
      const statistics = this.generateStatistics(validDrawings)
      
      return {
        drawings: validDrawings,
        currentJackpot: rawData.currentJackpot,
        statistics,
        totalDrawings: validDrawings.length,
        source: rawData.source || 'api',
        lastUpdated: new Date(),
        dataQuality: this.assessDataQuality(validDrawings)
      }
      
    } catch (error) {
      console.error('❌ Data processing failed:', error)
      throw new Error(`Data processing failed: ${error.message}`)
    }
  }

  /**
   * Validate individual drawing
   */
  validateDrawing(drawing) {
    if (!drawing || typeof drawing !== 'object') return false
    
    // Check required fields
    if (!drawing.numbers || !Array.isArray(drawing.numbers)) return false
    if (!drawing.powerball || typeof drawing.powerball !== 'number') return false
    if (!drawing.date) return false
    
    // Validate numbers
    if (drawing.numbers.length !== 5) return false
    if (drawing.numbers.some(n => n < 1 || n > 69 || !Number.isInteger(n))) return false
    if (new Set(drawing.numbers).size !== 5) return false // No duplicates
    
    // Validate powerball
    if (drawing.powerball < 1 || drawing.powerball > 26) return false
    
    return true
  }

  /**
   * Generate comprehensive statistics
   */
  generateStatistics(drawings) {
    console.log('📊 Generating statistics...')
    
    const stats = {
      hotNumbers: [],
      coldNumbers: [],
      hotPowerballs: [],
      coldPowerballs: [],
      frequencyData: {},
      powerballFrequency: {},
      pairAnalysis: {},
      sumRanges: {},
      gapAnalysis: {},
      consecutiveAnalysis: {}
    }
    
    // Calculate number frequencies
    const numberCounts = {}
    const powerballCounts = {}
    
    drawings.forEach(drawing => {
      drawing.numbers.forEach(num => {
        numberCounts[num] = (numberCounts[num] || 0) + 1
      })
      powerballCounts[drawing.powerball] = (powerballCounts[drawing.powerball] || 0) + 1
    })
    
    // Sort by frequency
    const sortedNumbers = Object.entries(numberCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([num, count]) => ({ number: parseInt(num), count, percentage: (count / drawings.length * 100).toFixed(1) }))
    
    const sortedPowerballs = Object.entries(powerballCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([num, count]) => ({ number: parseInt(num), count, percentage: (count / drawings.length * 100).toFixed(1) }))
    
    stats.hotNumbers = sortedNumbers.slice(0, 20)
    stats.coldNumbers = sortedNumbers.slice(-20).reverse()
    stats.hotPowerballs = sortedPowerballs.slice(0, 10)
    stats.coldPowerballs = sortedPowerballs.slice(-10).reverse()
    
    stats.frequencyData = numberCounts
    stats.powerballFrequency = powerballCounts
    
    // Additional analysis
    stats.pairAnalysis = this.analyzePairs(drawings)
    stats.sumRanges = this.analyzeSumRanges(drawings)
    stats.gapAnalysis = this.analyzeGaps(drawings)
    
    return stats
  }

  /**
   * Analyze number pairs
   */
  analyzePairs(drawings) {
    const pairs = {}
    
    drawings.forEach(drawing => {
      const numbers = drawing.numbers
      for (let i = 0; i < numbers.length; i++) {
        for (let j = i + 1; j < numbers.length; j++) {
          const pair = `${Math.min(numbers[i], numbers[j])}-${Math.max(numbers[i], numbers[j])}`
          pairs[pair] = (pairs[pair] || 0) + 1
        }
      }
    })
    
    return Object.entries(pairs)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 50)
      .reduce((obj, [pair, count]) => {
        obj[pair] = count
        return obj
      }, {})
  }

  /**
   * Analyze sum ranges
   */
  analyzeSumRanges(drawings) {
    const ranges = {}
    
    drawings.forEach(drawing => {
      const sum = drawing.numbers.reduce((a, b) => a + b, 0)
      const range = Math.floor(sum / 20) * 20 // Group by 20s
      const rangeKey = `${range}-${range + 19}`
      ranges[rangeKey] = (ranges[rangeKey] || 0) + 1
    })
    
    return ranges
  }

  /**
   * Analyze gaps between numbers
   */
  analyzeGaps(drawings) {
    const gaps = {}
    
    drawings.forEach(drawing => {
      const sortedNumbers = [...drawing.numbers].sort((a, b) => a - b)
      for (let i = 0; i < sortedNumbers.length - 1; i++) {
        const gap = sortedNumbers[i + 1] - sortedNumbers[i]
        gaps[gap] = (gaps[gap] || 0) + 1
      }
    })
    
    return gaps
  }

  /**
   * Assess data quality
   */
  assessDataQuality(drawings) {
    const totalExpected = 500 // Expected number of drawings
    const completeness = Math.min(drawings.length / totalExpected, 1)
    
    // Check for data consistency
    const hasValidDates = drawings.every(d => d.date && !isNaN(new Date(d.date)))
    const hasValidNumbers = drawings.every(d => this.validateDrawing(d))
    
    let quality = 'excellent'
    if (completeness < 0.9 || !hasValidDates || !hasValidNumbers) quality = 'good'
    if (completeness < 0.7) quality = 'fair'
    if (completeness < 0.5) quality = 'poor'
    
    return {
      score: Math.round(completeness * 100),
      level: quality,
      completeness,
      hasValidDates,
      hasValidNumbers,
      issues: []
    }
  }

  /**
   * Utility functions
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  /**
   * Cache management
   */
  getFromCache(key) {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  clearCache() {
    this.cache.clear()
  }

  /**
   * Health check
   */
  async healthCheck() {
    return {
      healthy: true,
      cacheSize: this.cache.size,
      message: 'Data service is healthy'
    }
  }

  /**
   * Shutdown
   */
  async shutdown() {
    this.clearCache()
    console.log('✅ Data service shutdown complete')
  }
}

// Create singleton instance
export const dataService = new DataService()

// Export main function
export const loadHistoricalData = () => dataService.loadHistoricalData()

export default dataService