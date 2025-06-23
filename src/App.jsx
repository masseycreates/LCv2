// src/App.jsx - Clean modular structure
import React, { useState } from 'react';
import { AppProvider } from './contexts/AppContext';
import { LotteryProvider } from './contexts/LotteryContext';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';

// Import feature components
import QuickSelection from './components/features/lottery/QuickSelection';
import TaxCalculator from './components/features/tax-calculator/TaxCalculator';
import DataAnalysis from './components/features/analysis/DataAnalysis';
import NumberSelector from './components/features/lottery/NumberSelector';

import './styles/globals/index.css';

// Tab configuration
const TAB_CONFIG = {
  'quick-pick': {
    id: 'quick-pick',
    label: '🎯 Quick Pick',
    icon: '🎯',
    component: QuickSelection,
    description: 'AI-powered generation'
  },
  'manual': {
    id: 'manual',
    label: '🎲 Manual',
    icon: '🎲',
    component: NumberSelector,
    description: 'Choose your numbers'
  },
  'tax': {
    id: 'tax',
    label: '🧮 Tax Calc',
    icon: '💰',
    component: TaxCalculator,
    description: 'Calculate taxes'
  },
  'analysis': {
    id: 'analysis',
    label: '📊 Analysis',
    icon: '📈',
    component: DataAnalysis,
    description: 'View statistics'
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('quick-pick');
  const ActiveTabComponent = TAB_CONFIG[activeTab]?.component || QuickSelection;

  return (
    <AppProvider>
      <LotteryProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          
          <main className="max-w-6xl mx-auto px-4 py-6">
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