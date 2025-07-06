// LCv2 Main Application Entry Point
import React from 'react';
import ReactDOM from 'react-dom/client';
import LotterySystem from './components/LotterySystem.js';
import './styles/main.css';

// Initialize global services
import { powerballAPI } from './services/PowerballAPI.js';
import { lotteryPredictor } from './services/LotteryPredictor.js';

// Make services globally available for compatibility
window.powerballAPI = powerballAPI;
window.lotteryPredictor = lotteryPredictor;

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Initialize application
const root = ReactDOM.createRoot(document.getElementById('root'));

// App wrapper with error boundary
function App() {
  return (
    <React.StrictMode>
      <ErrorBoundary>
        <LotterySystem />
      </ErrorBoundary>
    </React.StrictMode>
  );
}

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              The application encountered an unexpected error.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Reload Application
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Render the application
root.render(<App />);

// Log startup information
console.log('🎰 LCv2 Advanced Lottery Intelligence System');
console.log('📊 Modular architecture with React + Vite');
console.log('🤖 Claude Opus 4 + 6 Algorithms support');
console.log(`🔧 Environment: ${import.meta.env.MODE}`);

// Performance monitoring
if (typeof window !== 'undefined' && 'performance' in window) {
  window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`⚡ App loaded in ${loadTime.toFixed(2)}ms`);
  });
}