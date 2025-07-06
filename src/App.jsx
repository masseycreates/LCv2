import React, { useState, useEffect } from 'react';
import { AppProvider } from '@/contexts/AppContext';
import { LotteryProvider } from '@/contexts/LotteryContext';
import Header from '@components/layout/Header';
import Navigation from '@components/layout/Navigation';
import Footer from '@components/layout/Footer';
import QuickSelection from '@components/features/lottery/QuickSelection';
import TaxCalculator from '@components/features/tax-calculator/TaxCalculator';
import DataAnalysis from '@components/features/analysis/DataAnalysis';
import NumberSelector from '@components/features/lottery/NumberSelector';
// Remove CSS import to avoid PostCSS issues
// import '@styles/globals/index.css';

const TAB_CONFIG = {
  'quick-selection': {
    id: 'quick-selection',
    label: 'AI Hybrid',
    icon: '???',
    component: QuickSelection
  },
  'calculator': {
    id: 'calculator',
    label: 'Calculator',
    icon: '??',
    component: NumberSelector
  },
  'tax-calculator': {
    id: 'tax-calculator',
    label: 'Tax Calculator',
    icon: '??',
    component: TaxCalculator
  },
  'analysis': {
    id: 'analysis',
    label: 'Analysis',
    icon: '??',
    component: DataAnalysis
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