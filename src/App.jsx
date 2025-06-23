// src/App.jsx - Clean, modular main component
import React, { useState } from 'react';
import { AppProvider } from '@/contexts/AppContext';
import { LotteryProvider } from '@/contexts/LotteryContext';
import Header from '@components/layout/Header';
import Navigation from '@components/layout/Navigation';
import Footer from '@components/layout/Footer';

// Feature Components
import QuickSelection from '@components/features/lottery/QuickSelection';
import TaxCalculator from '@components/features/tax-calculator/TaxCalculator';
import DataAnalysis from '@components/features/analysis/DataAnalysis';
import NumberSelector from '@components/features/lottery/NumberSelector';

// Global Styles
import '@styles/globals/index.css';

// Tab configuration - easier to maintain
const TAB_CONFIG = {
  'quick-selection': {
    id: 'quick-selection',
    label: '🤖 AI Hybrid',
    icon: '🎯',
    component: QuickSelection,
    description: 'Claude Opus 4 + 6 Algorithms'
  },
  'number-selector': {
    id: 'number-selector',
    label: '🎲 Manual Pick',
    icon: '🎲',
    component: NumberSelector,
    description: 'Choose your own numbers'
  },
  'tax-calculator': {
    id: 'tax-calculator',
    label: '🧮 Tax Calculator',
    icon: '💰',
    component: TaxCalculator,
    description: 'Calculate winnings taxes'
  },
  'analysis': {
    id: 'analysis',
    label: '📊 Analysis',
    icon: '📈',
    component: DataAnalysis,
    description: 'Data & performance metrics'
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('quick-selection');

  // Get the active component
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