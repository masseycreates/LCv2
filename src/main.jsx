// src/main.jsx - IMMEDIATE FIX - Replace your entire main.jsx with this
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals/index.css';

// Import all needed components directly here since modules might not be working
import { lotteryPredictor } from './services/algorithms/predictor';

// Simple embedded components for immediate fix
function Button({ children, onClick, loading, className = '' }) {
  return (
    <button 
      onClick={onClick}
      disabled={loading}
      className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 ${className}`}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      {children}
    </div>
  );
}

function Header({ activeTab }) {
  return (
    <header className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-500 text-white p-4 rounded-xl mx-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🎯✨</div>
          <div>
            <div className="text-sm font-medium opacity-80">LCv2 - Advanced Lottery System</div>
            <div className="text-2xl font-bold">Navigation Working!</div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm opacity-80">Active: {activeTab}</div>
          <div className="text-xs bg-white/20 px-2 py-1 rounded mt-1 font-bold">
            🚀 MODULAR
          </div>
        </div>
      </div>
    </header>
  );
}

function Navigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'quick-pick', label: '🎯 Quick Pick', description: 'Generate numbers' },
    { id: 'manual', label: '🎲 Manual', description: 'Choose numbers' },
    { id: 'tax', label: '🧮 Tax Calc', description: 'Calculate taxes' },
    { id: 'analysis', label: '📊 Analysis', description: 'View statistics' }
  ];

  return (
    <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-4 py-3 text-sm font-medium rounded-md transition-colors
              ${activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            <div className="text-center">
              <div className="font-medium">{tab.label}</div>
              <div className="text-xs opacity-75">{tab.description}</div>
            </div>
          </button>
        ))}
      </div>
    </nav>
  );
}

function QuickPickTab() {
  const [selections, setSelections] = React.useState([]);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const generateNumbers = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newSelections = lotteryPredictor.generateQuickPick(3);
    setSelections(newSelections);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">🎯 Quick Number Generation</h3>
            <p className="text-sm text-gray-600">Generate optimized lottery numbers instantly</p>
          </div>
          <Button onClick={generateNumbers} loading={isGenerating}>
            Generate 3 Sets
          </Button>
        </div>

        {selections.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Generated Numbers</h4>
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
        )}
      </Card>
    </div>
  );
}

function ManualTab() {
  return (
    <Card>
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🎲</div>
        <h3 className="text-lg font-semibold mb-2">Manual Number Selection</h3>
        <p className="text-gray-600">Choose your own lucky numbers</p>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">Coming next: Interactive number picker</p>
        </div>
      </div>
    </Card>
  );
}

function TaxTab() {
  return (
    <Card>
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🧮</div>
        <h3 className="text-lg font-semibold mb-2">Tax Calculator</h3>
        <p className="text-gray-600">Calculate taxes on lottery winnings</p>
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700">Coming next: Complete tax calculation system</p>
        </div>
      </div>
    </Card>
  );
}

function AnalysisTab() {
  return (
    <Card>
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-semibold mb-2">Data Analysis</h3>
        <p className="text-gray-600">Historical data and statistics</p>
        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-700">Coming next: Advanced data analysis tools</p>
        </div>
      </div>
    </Card>
  );
}

function App() {
  const [activeTab, setActiveTab] = React.useState('quick-pick');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'quick-pick': return <QuickPickTab />;
      case 'manual': return <ManualTab />;
      case 'tax': return <TaxTab />;
      case 'analysis': return <AnalysisTab />;
      default: return <QuickPickTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} />
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>✅ <strong>Navigation Working!</strong> - LCv2 Modular System Active</p>
          <p className="text-xs mt-2">Current tab: <span className="font-medium">{activeTab}</span></p>
        </div>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);