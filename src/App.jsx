import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore, useSystemStatus, useActions } from '@stores/appStore'

// Layout components
import Layout from '@components/layout/Layout'
import LoadingScreen from '@components/ui/LoadingScreen'
import NotificationContainer from '@components/ui/NotificationContainer'

// Page components
import Dashboard from '@components/pages/Dashboard'
import Analysis from '@components/pages/Analysis'
import History from '@components/pages/History'
import Settings from '@components/pages/Settings'
import About from '@components/pages/About'

// Service imports
import { initializeApp } from '@services/appService'
import { loadHistoricalData } from '@services/dataService'

function App() {
  const systemStatus = useSystemStatus()
  const actions = useActions()
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize the application
  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('?? Initializing LCv2 Application...')
        
        // Set loading state
        actions.setLoading(true)
        actions.setSystemStatus('initializing')
        
        // Initialize core services
        await initializeApp()
        
        // Load historical lottery data
        console.log('?? Loading historical data...')
        const historicalData = await loadHistoricalData()
        
        if (historicalData) {
          actions.setLotteryData({
            historicalDrawings: historicalData.drawings || [],
            currentJackpot: historicalData.currentJackpot,
            totalDrawings: historicalData.drawings?.length || 0,
            statistics: historicalData.statistics || {}
          })
          console.log(`? Loaded ${historicalData.drawings?.length || 0} historical drawings`)
        }
        
        // Set system as ready
        actions.setSystemStatus('ready')
        actions.setLoading(false)
        
        // Add success notification
        actions.addNotification({
          type: 'success',
          title: 'System Ready',
          message: 'LCv2 has been successfully initialized!'
        })
        
        setIsInitialized(true)
        console.log('? LCv2 Application initialized successfully')
        
      } catch (error) {
        console.error('? Application initialization failed:', error)
        
        actions.setSystemStatus('error')
        actions.setLoading(false)
        
        actions.addNotification({
          type: 'error',
          title: 'Initialization Failed',
          message: 'Failed to initialize the application. Please refresh the page.'
        })
      }
    }

    initApp()
  }, [actions])

  // Handle system errors
  useEffect(() => {
    if (systemStatus === 'error') {
      console.error('System in error state')
    }
  }, [systemStatus])

  // Show loading screen during initialization
  if (!isInitialized || systemStatus === 'initializing') {
    return <LoadingScreen />
  }

  // Show error state if system failed to initialize
  if (systemStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">??</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            System Error
          </h1>
          <p className="text-gray-600 mb-6">
            The application failed to initialize properly. Please refresh the page to try again.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
            <button
              onClick={() => actions.reset()}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Reset System
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      {/* Main application layout */}
      <Layout>
        <Routes>
          {/* Default route redirects to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Main application routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
          
          {/* Catch-all route for 404s */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>

      {/* Global UI components */}
      <NotificationContainer />
      
      {/* Development helpers */}
      {import.meta.env.DEV && <DevelopmentHelper />}
    </div>
  )
}

// Development helper component (only shown in development)
const DevelopmentHelper = () => {
  const [showDebug, setShowDebug] = useState(false)
  const store = useAppStore()

  // Keyboard shortcut to toggle debug panel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setShowDebug(!showDebug)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showDebug])

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setShowDebug(true)}
          className="bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-50 hover:opacity-100"
          title="Ctrl+Shift+D to toggle debug panel"
        >
          Debug
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black text-green-400 p-4 rounded-lg text-xs font-mono max-w-md max-h-96 overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">LCv2 Debug Panel</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-red-400 hover:text-red-300"
        >
          ?
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <span className="text-yellow-400">System:</span> {store.system.status}
        </div>
        <div>
          <span className="text-yellow-400">Claude:</span> {store.claude.connectionStatus}
        </div>
        <div>
          <span className="text-yellow-400">Data:</span> {store.lotteryData.totalDrawings} drawings
        </div>
        <div>
          <span className="text-yellow-400">Generated:</span> {store.analysis.generatedSets.length} sets
        </div>
        <div>
          <span className="text-yellow-400">Notifications:</span> {store.ui.notifications.length}
        </div>
        <div>
          <span className="text-yellow-400">Memory:</span> {Math.round(performance.memory?.usedJSHeapSize / 1024 / 1024)}MB
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-600">
        <button
          onClick={() => console.log('Store State:', store)}
          className="text-blue-400 hover:text-blue-300 mr-3"
        >
          Log Store
        </button>
        <button
          onClick={() => store.actions.reset()}
          className="text-red-400 hover:text-red-300"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default App