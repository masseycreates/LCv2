// src/components/layout/Footer.jsx
import React from 'react';

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">System Status</h4>
            <div className="space-y-1">
              <div>Status: <span className="font-medium text-green-600">Active</span></div>
              <div>Architecture: <span className="font-medium">Modular React</span></div>
              <div>Performance: <span className="font-medium">Optimized</span></div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Features</h4>
            <div className="space-y-1">
              <div>? Quick Pick Generation</div>
              <div>? Tax Calculator</div>
              <div>? Data Analysis</div>
              <div>? Smart Chunking</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">LCv2 System</h4>
            <div className="space-y-1">
              <div>Version: <span className="font-medium">2.0.0</span></div>
              <div>Build: <span className="font-medium">Production</span></div>
              <div>Updated: <span className="font-medium">{new Date().toLocaleDateString()}</span></div>
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