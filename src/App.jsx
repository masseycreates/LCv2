import React, { useState } from 'react'

function App() {
  const [message, setMessage] = useState('Welcome to your new React application!')
  const [clickCount, setClickCount] = useState(0)

  const handleClick = () => {
    setClickCount(clickCount + 1)
    setMessage(`Button clicked ${clickCount + 1} times! React is working perfectly.`)
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 30%, #10b981 60%, #f59e0b 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          ?? Advanced Lottery Intelligence System V2
        </h1>
        <p style={{ opacity: 0.9 }}>
          Powered by React • Modern Architecture • Same Great Features
        </p>
      </div>

      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
          ?? Your React Development Environment is Ready!
        </h2>
        
        <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
          {message}
        </p>
        
        <button
          onClick={handleClick}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Test React Interactivity
        </button>
      </div>
    </div>
  )
}

export default App