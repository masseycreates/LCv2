// src/App.jsx - Complete modular application
import React, { useState } from 'react';
import { AppProvider } from './contexts/AppContext';
import { LotteryProvider } from './contexts/LotteryContext';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';
import Card from './components/ui/Card';
import Button from './components/ui/Button';
import { lotteryPredictor } from './services/algorithms/predictor';

// Tab Components (we'll create these step by step)
function QuickSelection() {
  const [selections, setSelections] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

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
            <h3 className="text-lg font-semibold">?? Quick Number Generation</h3>
            <p className="text-sm text-gray-600">Generate optimized lottery numbers</p>
          </div>
          <Button
            onClick={generateNumbers}
            loading={isGenerating}
            variant="primary"
          >
            {isGenerating ? 'Generating...' : 'Generate Numbers'}
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
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function TaxCalculator() {
  return (
    <Card>
      <div className="text-center py-12">
        <div className="text-4xl mb-4">??</div>
        <h3 className="text-lg font-semibold mb-2">Tax Calculator</h3>
        <p className="text-gray-600">Coming next - Calculate taxes on lottery winnings</p>
      </div>
    </Card>
  );
}

function DataAnalysis() {
  return (
    <Card>
      <div className="text-center py-12">
        <div className="text-4xl mb-4">??</div>
        <h3 className="text-lg font-semibold mb-2">Data Analysis</h3>
        <p className="text-gray-600">Coming next - Historical data and statistics</p>
      </div>
    </Card>
  );
}

function NumberSelector() {
  return (
    <Card>
      <div className="text-center py-12">
        <div className="text-4xl mb-4">??</div>
        <h3 className="text-lg font-semibold mb-2">Manual Number Selection</h3>
        <p className="text-gray-600">Coming next - Choose your own numbers</p>
      </div>
    </Card>
  );
}

// Tab configuration
const TAB_CONFIG = {
  'quick-selection': {
    id: 'quick-selection',
    label: '?? Quick Pick',
    icon: '??',
    component: QuickSelection,
    description: 'AI-powered generation'
  },
  'number-selector': {
    id: 'number-selector',
    label: '?? Manual Pick',
    icon: '??',
    component: NumberSelector,
    description: 'Choose your numbers'
  },
  'tax-calculator': {
    id: 'tax-calculator',
    label: '?? Tax Calculator',
    icon: '??',
    component: TaxCalculator,
    description: 'Calculate winnings taxes'
  },
  'analysis': {
    id: 'analysis',
    label: '?? Analysis',
    icon: '??',
    component: DataAnalysis,
    description: 'Data & statistics'
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('quick-selection');
  const ActiveTabComponent = TAB_CONFIG[activeTab]?.component || QuickSelection;

  return (
    <AppProvider>
      <LotteryProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          
          <main className="max-w-7xl mx-auto px-4 py-6">
            <Navigation 
              tabs={Object.values(TAB_CONFIG)}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            
            <div className="mt-6">
              <ActiveTabComponent />
            </div>
          </main>
          
          <Footer />
        </div>
      </LotteryProvider>
    </AppProvider>
  );
}

export default App;

// ------------------

// src/main.jsx - Updated to use modular App
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);