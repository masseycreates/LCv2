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
      console.log('🎰 Initializing LCv2 Application...');
      console.log(`📊 Version: ${APP_CONFIG.version}`);
      console.log(`⚡ Architecture: Modular React + Vite`);
      
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
      
      console.log('✅ LCv2 Application initialized successfully');
      console.log(`⏱️ Initialization time: ${initTime.toFixed(2)}ms`);
      console.log('🚀 Ready for lottery intelligence operations');
      
    } catch (error) {
      console.error('❌ Application initialization failed:', error);
      this.errorCount++;
      
      // Still try to render with limited functionality
      this.renderApplicationWithError(error);
    }
  }

  checkBrowserCompatibility() {
    console.log('🔍 Checking browser compatibility...');
    
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
      console.warn('⚠️ Browser compatibility issues detected:', incompatibleFeatures);
      
      // Show user-friendly warning
      this.showCompatibilityWarning(incompatibleFeatures);
    } else {
      console.log('✅ Browser fully compatible');
    }

    return compatibility;
  }

  async initializeServices() {
    console.log('🔧 Initializing core services...');
    
    try {
      // Initialize PowerballAPI
      console.log('🌐 Initializing PowerballAPI...');
      this.services.powerballAPI = powerballAPI;
      console.log('✅ PowerballAPI ready');

      // Initialize LotteryPredictor
      console.log('🧠 Initializing LotteryPredictor...');
      lotteryPredictor.initialize();
      this.services.lotteryPredictor = lotteryPredictor;
      console.log('✅ LotteryPredictor ready with 6 algorithms');

      // Initialize ClaudeAPI (not connected by default)
      console.log('🤖 Initializing ClaudeAPI...');
      this.services.claudeAPI = claudeAPI;
      console.log('✅ ClaudeAPI ready (connection pending API key)');

      return true;
    } catch (error) {
      console.error('❌ Service initialization failed:', error);
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

    console.log('🛡️ Global error handling configured');
  }

  setupPerformanceMonitoring() {
    if (!PERFORMANCE_CONFIG.enabled) return;

    // Monitor memory usage
    if (performance.memory) {
      setInterval(() => {
        const memory = performance.memory;
        if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.8) {
          console.warn('⚠️ High memory usage detected:', {
            used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
            limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
            percentage: `${((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(1)}%`
          });
        }
      }, PERFORMANCE_CONFIG.memoryCheckInterval);
    }

    console.log('📊 Performance monitoring active');
  }

  showCompatibilityWarning(incompatibleFeatures) {
    const warningMessage = `
      Your browser may not support all features of this application.
      Unsupported features: ${incompatibleFeatures.join(', ')}
      
      For the best experience, please use a modern browser like:
      - Chrome 70+
      - Firefox 70+
      - Safari 13+
      - Edge 79+
    `;

    // Create a simple warning overlay
    const overlay = document.createElement('div');
    overlay.className = 'compatibility-warning';
    overlay.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: Arial, sans-serif;
        text-align: center;
        padding: 20px;
      ">
        <div style="
          background: #1f2937;
          padding: 40px;
          border-radius: 12px;
          max-width: 500px;
          border: 2px solid #f59e0b;
        ">
          <h2 style="color: #f59e0b; margin-bottom: 20px;">⚠️ Browser Compatibility Warning</h2>
          <p style="margin-bottom: 20px; line-height: 1.5;">${warningMessage}</p>
          <button onclick="this.parentElement.parentElement.remove()" style="
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
          ">Continue Anyway</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  exposeServicesGlobally() {
    if (DEBUG_CONFIG.enabled) {
      window.LCv2 = {
        app: this,
        services: this.services,
        config: { APP_CONFIG, DEBUG_CONFIG, PERFORMANCE_CONFIG },
        version: APP_CONFIG.version,
        getBuildInfo: () => ({
          buildTime: new Date().toISOString(),
          environment: import.meta.env.MODE,
          devMode: import.meta.env.DEV
        })
      };

      console.log('🔧 Debug interface exposed as window.LCv2');
    }
  }

  renderApplicationWithError(error) {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Application Error
          </h2>
          <p className="text-gray-600 mb-4">
            The application failed to initialize properly.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Reload Application
          </button>
          {DEBUG_CONFIG.enabled && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500">
                Error Details
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {error.toString()}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  renderApplication() {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
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
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log to our error tracking system
    logError(error, {
      type: 'react_component_error',
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    });

    // Dispatch custom event for global error handler
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
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
          <div className="max-w-lg bg-white rounded-xl shadow-xl p-8 text-center">
            <div className="text-red-500 text-5xl mb-6">🚨</div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Application Error
            </h1>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              {this.state.retryCount === 0 
                ? 'The application encountered an unexpected error.'
                : 'The application failed to initialize properly.'
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
    console.log('🚀 Starting LCv2 Application Bootstrap...');
    
    // Create application instance
    const app = new LCv2Application();
    
    // Initialize services and render
    await app.initialize();
    app.renderApplication();
    
  } catch (error) {
    console.error('💥 Bootstrap failed:', error);
    
    // Fallback: render basic error state
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 text-4xl mb-4">💥</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Bootstrap Failed
          </h2>
          <p className="text-gray-600 mb-4">
            The application could not start properly.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}

// ===========================================================================
// INITIALIZATION
// ===========================================================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapApplication);
} else {
  bootstrapApplication();
}