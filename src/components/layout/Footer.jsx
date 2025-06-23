// src/components/layout/Footer.jsx - App Footer
import React from 'react';
import { useApp } from '@/contexts/AppContext';

function Footer() {
  const { lastUpdated, systemPerformance } = useApp();

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
          
          {/* System Info */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">System Status</h4>
            <div className="space-y-1">
              <div>Status: <span className="font-medium">{systemPerformance.status}</span></div>
              <div>Predictions: <span className="font-medium">{systemPerformance.predictionsGenerated}</span></div>
              <div>Learning: <span className="font-medium">{systemPerformance.isLearning ? 'Active' : 'Inactive'}</span></div>
            </div>
          </div>

          {/* Last Updated */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Last Updated</h4>
            <div>{formatDate(lastUpdated)}</div>
          </div>

          {/* App Info */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">LCv2 Modular System</h4>
            <div className="space-y-1">
              <div>Version: <span className="font-medium">2.0.0</span></div>
              <div>Architecture: <span className="font-medium">Modular React</span></div>
              <div>Build: <span className="font-medium">Production Ready</span></div>
            </div>
          </div>
          
        </div>

        <div className="border-t border-gray-200 mt-6 pt-4 text-center text-xs text-gray-500">
          <p>LCv2 - Modular Lottery Intelligence System • Built with React + Vite</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;