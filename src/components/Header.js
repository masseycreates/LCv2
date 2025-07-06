// LCv2 Header Component
import React from 'react';

export default function Header({ 
  liveDataAvailable, 
  currentJackpot, 
  nextDrawDate, 
  isUpdating, 
  onRefresh 
}) {
  
  return (
    <div 
      className={liveDataAvailable ? 'gradient-bg' : 'gradient-bg-unavailable'}
      style={{
        position: 'sticky', 
        top: 0, 
        zIndex: 50, 
        marginBottom: '1rem',
        borderRadius: '0.75rem', 
        padding: '1rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        color: 'white' 
      }}>
        
        {/* Left Section - Logo and Jackpot Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '8px', 
            borderRadius: '50%' 
          }}>
            {liveDataAvailable ? '🎯' : '⚠️'}
          </div>
          
          <div>
            <div style={{ 
              opacity: 0.8, 
              fontSize: '0.75rem', 
              fontWeight: 500 
            }}>
              LCv2 - Advanced Lottery Intelligence
            </div>
            
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: 700 
            }}>
              {liveDataAvailable && currentJackpot ? 
                currentJackpot.formatted : 
                'Visit powerball.com'
              }
            </div>
            
            <div style={{ 
              opacity: 0.7, 
              fontSize: '0.625rem' 
            }}>
              {liveDataAvailable && currentJackpot ? 
                `Cash: ${currentJackpot.cashFormatted} • ` : 
                'For current jackpot • '
              }
              {nextDrawDate || 'Next drawing TBD'}
            </div>
          </div>
        </div>

        {/* Right Section - Refresh Button and Status */}
        <div style={{ textAlign: 'right' }}>
          <button
            onClick={onRefresh}
            disabled={isUpdating}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              padding: '0.375rem 0.75rem',
              borderRadius: '0.375rem',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              opacity: isUpdating ? 0.7 : 1,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isUpdating ? (
              <div className="loading-spinner" style={{ width: '0.875rem', height: '0.875rem' }} />
            ) : (
              '🔄'
            )}
            Refresh
          </button>
          
          {/* System Status Indicator */}
          <div style={{ 
            fontSize: '0.625rem', 
            opacity: 0.8, 
            marginTop: '0.25rem' 
          }}>
            <div>
              🏗️ Modular Architecture
            </div>
            <div>
              ⚡ React + Vite
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}