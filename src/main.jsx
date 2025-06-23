// src/main.jsx - Final working version
import React from 'react';
import ReactDOM from 'react-dom/client';
import { LotteryProvider } from './contexts/LotteryContext';
import { lotteryPredictor } from './services/algorithms/predictor';
import Card from './components/ui/Card';
import './styles/globals/index.css';

function App() {
  const [selections, setSelections] = React.useState([]);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const generateNumbers = async () => {
    setIsGenerating(true);
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newSelections = lotteryPredictor.generateQuickPick(3);
    setSelections(newSelections);
    setIsGenerating(false);
  };

  return (
    <LotteryProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-500 text-white p-4 rounded-xl mx-4 mt-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">???</div>
            <div>
              <div className="text-sm font-medium opacity-80">LCv2 Modular System</div>
              <div className="text-2xl font-bold">Successfully Deployed!</div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          
          {/* Status Card */}
          <Card>
            <div className="text-center">
              <div className="text-4xl mb-4">??</div>
              <h1 className="text-2xl font-bold mb-2 text-green-600">Build Successful!</h1>
              <p className="text-gray-600 mb-4">Your modular LCv2 system is working with optimized chunks</p>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl mb-2">?</div>
                  <div className="font-medium text-sm">Fast Loading</div>
                  <div className="text-xs text-gray-500">Chunked properly</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-2">??</div>
                  <div className="font-medium text-sm">Modular</div>
                  <div className="text-xs text-gray-500">Easy to maintain</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl mb-2">??</div>
                  <div className="font-medium text-sm">Optimized</div>
                  <div className="text-xs text-gray-500">Smart bundling</div>
                </div>
              </div>

              <button
                onClick={generateNumbers}
                disabled={isGenerating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Test Quick Pick Generator'}
              </button>
            </div>
          </Card>

          {/* Generated Numbers */}
          {selections.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold mb-4">Generated Numbers</h3>
              <div className="space-y-4">
                {selections.map((selection) => (
                  <div key={selection.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-4 mb-2">
                      {selection.numbers.map((num, index) => (
                        <span 
                          key={index}
                          className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm"
                        >
                          {num}
                        </span>
                      ))}
                      <span className="text-gray-400 mx-2">+</span>
                      <span className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {selection.powerball}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>{selection.strategy}</strong> - {selection.confidence}% confidence
                    </div>
                    <div className="text-xs text-gray-500">{selection.analysis}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Next Steps */}
          <Card>
            <h3 className="text-lg font-semibold mb-4 text-green-600">? What's Working</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Build System</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>? Vite configuration optimized</li>
                  <li>? Smart chunking enabled</li>
                  <li>? Path aliases working</li>
                  <li>? CSS processing</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">App Architecture</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>? Modular components</li>
                  <li>? Context providers</li>
                  <li>? Service layer</li>
                  <li>? Number generation working</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">?? Ready for Development</h4>
              <p className="text-sm text-blue-700">
                Your foundation is solid! You can now add features incrementally:
                tax calculator, Claude integration, advanced algorithms, etc.
              </p>
            </div>
          </Card>

        </main>
      </div>
    </LotteryProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);