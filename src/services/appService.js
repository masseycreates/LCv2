/**
 * Core application service for initializing and managing the LCv2 system
 */

import { claudeApiService } from './claudeApiService'
import { dataService } from './dataService'
import { algorithmService } from './algorithmService'

class AppService {
  constructor() {
    this.isInitialized = false
    this.initializationPromise = null
    this.services = new Map()
  }

  /**
   * Initialize the entire application
   */
  async initialize() {
    if (this.initializationPromise) {
      return this.initializationPromise
    }

    this.initializationPromise = this._performInitialization()
    return this.initializationPromise
  }

  async _performInitialization() {
    try {
      console.log('🔧 Starting application initialization...')

      // Initialize core services in order
      await this._initializeServices()
      
      // Perform system health checks
      await this._performHealthChecks()
      
      // Load initial data
      await this._loadInitialData()
      
      // Set up event listeners and watchers
      this._setupEventListeners()
      
      this.isInitialized = true
      console.log('✅ Application initialization complete')
      
      return {
        success: true,
        timestamp: new Date(),
        services: Array.from(this.services.keys())
      }
      
    } catch (error) {
      console.error('❌ Application initialization failed:', error)
      throw new Error(`Initialization failed: ${error.message}`)
    }
  }

  /**
   * Initialize all core services
   */
  async _initializeServices() {
    const services = [
      { name: 'data', service: dataService, critical: true },
      { name: 'algorithm', service: algorithmService, critical: true },
      { name: 'claude', service: claudeApiService, critical: false }
    ]

    for (const { name, service, critical } of services) {
      try {
        console.log(`🔧 Initializing ${name} service...`)
        
        if (service.initialize) {
          await service.initialize()
        }
        
        this.services.set(name, {
          service,
          status: 'ready',
          lastHealthCheck: new Date()
        })
        
        console.log(`✅ ${name} service initialized`)
        
      } catch (error) {
        console.error(`❌ Failed to initialize ${name} service:`, error)
        
        this.services.set(name, {
          service,
          status: 'error',
          error: error.message,
          lastHealthCheck: new Date()
        })
        
        if (critical) {
          throw new Error(`Critical service '${name}' failed to initialize: ${error.message}`)
        }
      }
    }
  }

  /**
   * Perform health checks on all services
   */
  async _performHealthChecks() {
    console.log('🔍 Performing system health checks...')
    
    const healthChecks = []
    
    // Check browser compatibility
    healthChecks.push(this._checkBrowserCompatibility())
    
    // Check network connectivity
    healthChecks.push(this._checkNetworkConnectivity())
    
    // Check localStorage availability
    healthChecks.push(this._checkLocalStorageAvailability())
    
    // Check service health
    for (const [name, serviceInfo] of this.services) {
      if (serviceInfo.service.healthCheck) {
        healthChecks.push(
          serviceInfo.service.healthCheck().catch(error => ({
            service: name,
            healthy: false,
            error: error.message
          }))
        )
      }
    }
    
    const results = await Promise.allSettled(healthChecks)
    const failed = results.filter(result => result.status === 'rejected')
    
    if (failed.length > 0) {
      console.warn('⚠️ Some health checks failed:', failed)
    }
    
    console.log('✅ Health checks completed')
  }

  /**
   * Load initial application data
   */
  async _loadInitialData() {
    console.log('📊 Loading initial application data...')
    
    try {
      // Load user preferences from localStorage
      const preferences = this._loadUserPreferences()
      
      // Apply saved theme
      if (preferences.theme) {
        document.documentElement.setAttribute('data-theme', preferences.theme)
      }
      
      console.log('✅ Initial data loaded')
      
    } catch (error) {
      console.warn('⚠️ Failed to load some initial data:', error)
      // Non-critical, continue initialization
    }
  }

  /**
   * Set up global event listeners
   */
  _setupEventListeners() {
    console.log('🎧 Setting up event listeners...')
    
    // Handle visibility changes (tab focus/blur)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this._handleAppFocus()
      } else {
        this._handleAppBlur()
      }
    })
    
    // Handle online/offline events
    window.addEventListener('online', this._handleOnline.bind(this))
    window.addEventListener('offline', this._handleOffline.bind(this))
    
    // Handle unload events for cleanup
    window.addEventListener('beforeunload', this._handleBeforeUnload.bind(this))
    
    // Handle uncaught errors
    window.addEventListener('error', this._handleGlobalError.bind(this))
    window.addEventListener('unhandledrejection', this._handleUnhandledRejection.bind(this))
    
    console.log('✅ Event listeners configured')
  }

  /**
   * Browser compatibility check
   */
  _checkBrowserCompatibility() {
    const requiredFeatures = [
      'Promise',
      'fetch',
      'localStorage',
      'sessionStorage',
      'WebSocket',
      'requestAnimationFrame'
    ]
    
    const missing = requiredFeatures.filter(feature => !(feature in window))
    
    if (missing.length > 0) {
      throw new Error(`Browser missing required features: ${missing.join(', ')}`)
    }
    
    // Check for modern JavaScript features
    try {
      new Function('async () => {}')
      new Function('(...args) => {}')
      new Function('const {a} = {}')
    } catch (error) {
      throw new Error('Browser does not support modern JavaScript features')
    }
    
    return { healthy: true, message: 'Browser compatibility verified' }
  }

  /**
   * Network connectivity check
   */
  async _checkNetworkConnectivity() {
    if (!navigator.onLine) {
      throw new Error('No network connection detected')
    }
    
    try {
      // Simple connectivity test
      const response = await fetch('/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-cache',
        timeout: 5000
      })
      
      if (!response.ok) {
        throw new Error('Network connectivity test failed')
      }
      
      return { healthy: true, message: 'Network connectivity verified' }
      
    } catch (error) {
      throw new Error(`Network connectivity check failed: ${error.message}`)
    }
  }

  /**
   * LocalStorage availability check
   */
  _checkLocalStorageAvailability() {
    try {
      const testKey = '__lcv2_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return { healthy: true, message: 'LocalStorage available' }
    } catch (error) {
      throw new Error('LocalStorage not available')
    }
  }

  /**
   * Load user preferences from localStorage
   */
  _loadUserPreferences() {
    try {
      const saved = localStorage.getItem('lcv2-preferences')
      return saved ? JSON.parse(saved) : {}
    } catch (error) {
      console.warn('Failed to load user preferences:', error)
      return {}
    }
  }

  /**
   * Event handlers
   */
  _handleAppFocus() {
    console.log('🔍 App gained focus')
    // Perform any necessary updates when app becomes visible
  }

  _handleAppBlur() {
    console.log('😴 App lost focus')
    // Pause any unnecessary operations when app is hidden
  }

  _handleOnline() {
    console.log('🌐 Network connection restored')
    // Retry failed network operations
  }

  _handleOffline() {
    console.log('📶 Network connection lost')
    // Switch to offline mode
  }

  _handleBeforeUnload(event) {
    // Perform any necessary cleanup
    console.log('👋 App unloading, performing cleanup...')
  }

  _handleGlobalError(event) {
    console.error('Global error:', event.error)
    // Log error to monitoring service in production
  }

  _handleUnhandledRejection(event) {
    console.error('Unhandled promise rejection:', event.reason)
    // Log error to monitoring service in production
  }

  /**
   * Get service by name
   */
  getService(name) {
    const serviceInfo = this.services.get(name)
    return serviceInfo ? serviceInfo.service : null
  }

  /**
   * Get system status
   */
  getSystemStatus() {
    const services = Array.from(this.services.entries()).map(([name, info]) => ({
      name,
      status: info.status,
      lastHealthCheck: info.lastHealthCheck,
      error: info.error
    }))
    
    const healthyServices = services.filter(s => s.status === 'ready').length
    const totalServices = services.length
    
    return {
      isInitialized: this.isInitialized,
      overallHealth: healthyServices / totalServices,
      services,
      timestamp: new Date()
    }
  }

  /**
   * Shutdown the application gracefully
   */
  async shutdown() {
    console.log('🔄 Shutting down application...')
    
    try {
      // Cleanup services
      for (const [name, serviceInfo] of this.services) {
        if (serviceInfo.service.shutdown) {
          await serviceInfo.service.shutdown()
        }
      }
      
      // Clear any timers or intervals
      // Remove event listeners
      // Save any pending data
      
      this.isInitialized = false
      console.log('✅ Application shutdown complete')
      
    } catch (error) {
      console.error('❌ Error during shutdown:', error)
    }
  }
}

// Create singleton instance
export const appService = new AppService()

// Export initialization function
export const initializeApp = () => appService.initialize()

// Export other utility functions
export const getService = (name) => appService.getService(name)
export const getSystemStatus = () => appService.getSystemStatus()
export const shutdownApp = () => appService.shutdown()

export default appService