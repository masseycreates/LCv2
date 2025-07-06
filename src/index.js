// LCv2 Main Application Entry Point - Modular Architecture Bootstrap
import React from 'react';
import ReactDOM from 'react-dom/client';
import LotterySystem from './components/LotterySystem.js';
import './styles/main.css';

// Import and initialize services
import { powerballAPI } from './services/PowerballAPI.js';
import { lotteryPredictor } from './services/LotteryPredictor.js';
import { claudeAPI } from './services/ClaudeAPI.js';

// Import configuration and utilities
import { APP_CONFIG, DEBUG_CONFIG, PERFORMANCE_CONFIG } from './utils/constants.js';
import { isModernBrowser, supportsLocalStorage, logError } from './utils/helpers.js';

// ===========================================================================
// APPLICATION INITIALIZATION
// ===========================================================================

class LCv2Application {
  constructor() {
    this.initialized = false;
    this.startTime = performance.now();
    this.errorCount = 0;
    this.services = {
      powerballAPI: null,
      lotteryPredictor: null,
      claudeAPI: null
    };
  }

  async initialize() {
    if (this.initialized) return;

    try {
      console.log('?? Initializing LCv2 Application...');
      console.log(`?? Version: ${APP_CONFIG.version}`);
      console.log(`??? Architecture: Modular React + Vite`);
      
      // Check browser compatibility
      this.checkBrowserCompatibility();
      
      // Initialize services
      await this.initializeServices();
      
      // Setup global error handling
      this.setupGlobalErrorHandling();
      
      // Setup performance monitoring
      this.setupPerformanceMonitoring();
      
      // Make services globally available for debugging
      this.exposeServicesGlobally();
      
      this.initialized = true;
      const initTime = performance.now() - this.startTime;
      
      console.log('? LCv2 Application initialized successfully');
      console.log(`? Initialization time: ${initTime.toFixed(2)}ms`);
      console.log('?? Ready for lottery intelligence operations');
      
    } catch (error) {
      console.error('? Application initialization failed:', error);
      this.errorCount++;
      
      // Still try to render with limited functionality
      this.renderApplicationWithError(error);
    }
  }

  checkBrowserCompatibility() {
    console.log('?? Checking browser compatibility...');
    
    const compatibility = {
      modern: isModernBrowser(),
      localStorage: supportsLocalStorage(),
      fetch: typeof fetch !== 'undefined',
      es6: typeof Map !== 'undefined' && typeof Set !== 'undefined',
      promises: typeof Promise !== 'undefined'
    };

    const incompatibleFeatures = Object.entries(compatibility)
      .filter(([, supported]) => !supported)
      .map(([feature]) => feature);

    if (incompatibleFeatures.length > 0) {
      console.warn('?? Browser compatibility issues detected:', incompatibleFeatures);
      
      // Show user-friendly warning
      this.showCompatibilityWarning(incompatibleFeatures);
    } else {
      console.log('? Browser fully compatible');
    }

    return compatibility;
  }

  async initializeServices() {
    console.log('?? Initializing core services...');
    
    try {
      // Initialize PowerballAPI
      console.log('?? Initializing PowerballAPI...');
      this.services.powerballAPI = powerballAPI;
      console.log('? PowerballAPI ready');

      // Initialize LotteryPredictor
      console.log('?? Initializing LotteryPredictor...');
      lotteryPredictor.initialize();
      this.services.lotteryPredictor = lotteryPredictor;
      console.log('? LotteryPredictor ready with 6 algorithms');

      // Initialize ClaudeAPI (not connected by default)
      console.log('?? Initializing ClaudeAPI...');
      this.services.claudeAPI = claudeAPI;
      console.log('? ClaudeAPI ready (connection pending API key)');

      return true;
    } catch (error) {
      console.error('? Service initialization failed:', error);
      throw error;
    }
  }

  setupGlobalErrorHandling() {
    // Unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.errorCount++;
      const errorReport = logError(event.error, {
        type: 'javascript_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
      
      if (DEBUG_CONFIG.enabled) {
        console.error('Global JavaScript Error:', errorReport);
      }
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.errorCount++;
      const errorReport = logError(new Error(event.reason), {
        type: 'unhandled_promise_rejection',
        reason: event.reason
      });
      
      if (DEBUG_CONFIG.enabled) {
        console.error('Unhandled Promise Rejection:', errorReport);
      }
      
      // Prevent the error from appearing in console
      event.preventDefault();
    });

    // React error boundary backup
    window.addEventListener('react-error', (event) => {
      this.errorCount++;
      logError(event.detail.error, {
        type: 'react_error',
        componentStack: event.detail.errorInfo?.componentStack
      });
    });

    console.log('??? Global error handling configured');
  }

  setupPerformanceMonitoring() {
    if (!PERFORMANCE_CONFIG.optimization.enablePerformanceLogging) return;

    // Monitor memory usage
    setInterval(() => {
      if (performance.memory) {
        const memoryInfo = {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        };

        // Warn about high memory usage
        if (memoryInfo.used > PERFORMANCE_CONFIG.thresholds.memoryUsage) {
          console.warn(`?? High memory usage: ${memoryInfo.used}MB`);
        }

        if (DEBUG_CONFIG.enabled && DEBUG_CONFIG.features.showPerformanceMetrics) {
          console.log('?? Memory usage:', memoryInfo);
        }
      }
    }, 60000); // Check every minute

    // Monitor API response times
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const responseTime = performance.now() - startTime;
        
        if (responseTime > PERFORMANCE_CONFIG.thresholds.apiResponseTime) {
          console.warn(`?? Slow API response: ${responseTime.toFixed(2)}ms for ${args[0]}`);
        }
        
        return response;
      } catch (error) {
        const responseTime = performance.now() - startTime;
        console.error(`? API request failed after ${responseTime.toFixed(2)}ms:`, error);
        throw error;
      }
    };

    console.log('?? Performance monitoring enabled');
  }

  exposeServicesGlobally() {
    // Make services available globally for debugging and compatibility
    window.lcv2 = {
      version: APP_CONFIG.version,
      services: this.services,
      app: this,
      debug: DEBUG_CONFIG.enabled ? {
        errorCount: () => this.errorCount,
        performance: () => ({
          uptime: performance.now() - this.startTime,
          memory: performance.memory ? {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
          } : null
        }),
        reload: () => window.location.reload(),
        clearCache: () => {
          localStorage.clear();
          window.location.reload();
        }
      } : null
    };

    // Backward compatibility
    window.powerballAPI = powerballAPI;
    window.lotteryPredictor = lotteryPredictor;
    window.claudeAPI = claudeAPI;

    if (DEBUG_CONFIG.enabled) {
      console.log('?? Debug interface available at window.lcv2');
    }
  }

  showCompatibilityWarning(incompatibleFeatures) {
    // Create a simple warning banner
    const warningBanner = document.createElement('div');
    warningBanner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #fef3cd;
      border-bottom: 2px solid #f59e0b;
      color: #92400e;
      padding: 8px 16px;
      font-size: 14px;
      text-align: center;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    `;
    warningBanner.innerHTML = `
      ?? Browser compatibility issues detected. Some features may not work properly. 
      Please update to a modern browser for the best experience.
      <button onclick="this.parentElement.remove()" style="margin-left: 10px; background: none; border: 1px solid #92400e; padding: 2px 8px; border-radius: 4px; cursor: pointer;">Dismiss</button>
    `;
    
    document.body.insertBefore(warningBanner, document.body.firstChild);
  }

  renderApplicationWithError(error) {
    console.warn('?? Rendering application with limited functionality due to initialization error');
    
    // Render a simplified version
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <ErrorBoundary initializationError={error}>
          <LotterySystem />
        </ErrorBoundary>
      </React.StrictMode>
    );
  }
}

// ===========================================================================
// ERROR BOUNDARY COMPONENT
// ===========================================================================

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('?? React Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log the error
    logError(error, {
      type: 'react_error_boundary',
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    });

    // Dispatch custom event for global error handling
    window.dispatchEvent(new CustomEvent('react-error', {
      detail: { error, errorInfo }
    }));
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="text-6xl mb-6">??</div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Something went wrong
            </h1>
            
            <p className="text-gray-600 mb-6">
              {this.props.initializationError 
                ? 'The application failed to initialize properly.'
                : 'The application encountered an unexpected error.'
              }
            </p>
            
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                disabled={this.state.retryCount >= 3}
              >
                {this.state.retryCount >= 3 ? 'Max retries reached' : `Try Again (${this.state.retryCount}/3)`}
              </button>
              
              <button
                onClick={this.handleReload}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Reload Application
              </button>
            </div>
            
            {DEBUG_CONFIG.enabled && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development)
                </summary>
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-xs">
                  <div className="font-medium text-red-800 mb-2">Error:</div>
                  <pre className="text-red-600 whitespace-pre-wrap overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <>
                      <div className="font-medium text-red-800 mt-3 mb-2">Component Stack:</div>
                      <pre className="text-red-600 whitespace-pre-wrap overflow-auto text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}
            
            <div className="mt-6 text-xs text-gray-500">
              <p>LCv2 v{APP_CONFIG.version}</p>
              <p>If this problem persists, please refresh the page or contact support.</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ===========================================================================
// MAIN APPLICATION COMPONENT
// ===========================================================================

function App() {
  return (
    <React.StrictMode>
      <ErrorBoundary>
        <LotterySystem />
      </ErrorBoundary>
    </React.StrictMode>
  );
}

// ===========================================================================
// APPLICATION BOOTSTRAP
// ===========================================================================

async function bootstrapApplication() {
  try {
    console.log('?? Starting LCv2 Advanced Lottery Intelligence System...');
    
    // Create application instance
    const app = new LCv2Application();
    
    // Initialize application
    await app.initialize();
    
    // Create React root and render
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found. Check your HTML file.');
    }
    
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
    
    // Log successful startup
    const startupTime = performance.now() - app.startTime;
    console.log(`?? LCv2 Application started successfully in ${startupTime.toFixed(2)}ms`);
    
    // Performance logging
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        const loadTime = performance.now();
        console.log(`? Page fully loaded in ${loadTime.toFixed(2)}ms`);
        
        // Report performance metrics
        if (performance.navigation) {
          console.log('?? Navigation type:', performance.navigation.type === 0 ? 'Navigate' : 'Reload');
        }
      });
    }
    
  } catch (error) {
    console.error('?? Application bootstrap failed:', error);
    
    // Render emergency fallback
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <ErrorBoundary initializationError={error}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">LCv2 System Error</h1>
            <p className="text-gray-600 mb-4">Failed to start the lottery intelligence system.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-6 py-2 rounded"
            >
              Reload Application
            </button>
          </div>
        </div>
      </ErrorBoundary>
    );
  }
}

// ===========================================================================
// STARTUP SEQUENCE
// ===========================================================================

// Ensure DOM is ready before starting
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapApplication);
} else {
  // DOM is already ready
  bootstrapApplication();
}

// ===========================================================================
// DEVELOPMENT HELPERS
// ===========================================================================

if (DEBUG_CONFIG.enabled) {
  // Hot module replacement support for Vite
  if (import.meta.hot) {
    import.meta.hot.accept();
    console.log('?? Hot module replacement enabled');
  }
  
  // Development shortcuts
  window.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Shift + D = Toggle debug info
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      console.log('?? LCv2 Debug Info:', window.lcv2?.debug?.performance());
    }
    
    // Ctrl/Cmd + Shift + R = Clear cache and reload
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
      e.preventDefault();
      localStorage.clear();
      window.location.reload();
    }
  });
  
  console.log('??? Development mode shortcuts:');
  console.log('  Ctrl/Cmd + Shift + D: Show debug info');
  console.log('  Ctrl/Cmd + Shift + R: Clear cache and reload');
}

// ===========================================================================
// EXPORT FOR TESTING
// ===========================================================================

export { LCv2Application, ErrorBoundary, App };
export default bootstrapApplication;