import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'

// Create the main application store
export const useAppStore = create(
  subscribeWithSelector(
    devtools(
      (set, get) => ({
        // System state
        system: {
          status: 'initializing', // 'initializing' | 'ready' | 'error'
          version: '2.0.0',
          isLoading: false,
          lastUpdated: null,
          environment: import.meta.env.MODE,
          isOnline: navigator?.onLine ?? true
        },

        // Claude AI state
        claude: {
          isConnected: false,
          isEnabled: false,
          apiKey: null,
          connectionStatus: 'disconnected', // 'disconnected' | 'connecting' | 'connected' | 'error'
          model: 'claude-3-opus-20240229',
          analysisCount: 0,
          lastAnalysis: null,
          error: null
        },

        // Lottery data state
        lotteryData: {
          historicalDrawings: [],
          currentJackpot: null,
          lastDrawing: null,
          totalDrawings: 0,
          dataSource: 'local',
          isDataLoaded: false,
          lastDataUpdate: null,
          statistics: {
            hotNumbers: [],
            coldNumbers: [],
            hotPowerballs: [],
            coldPowerballs: [],
            frequencyData: {},
            pairAnalysis: {},
            sumRanges: {},
            gapAnalysis: {}
          }
        },

        // Analysis state
        analysis: {
          currentAnalysis: null,
          generatedSets: [],
          analysisHistory: [],
          performance: {
            totalGenerated: 0,
            hitRate: 0,
            averageHits: 0,
            bestPerformance: null
          },
          algorithms: {
            ewmaFrequency: { weight: 0.2, performance: 0.15 },
            pairAnalysis: { weight: 0.18, performance: 0.14 },
            gapAnalysis: { weight: 0.16, performance: 0.13 },
            sumRangeAnalysis: { weight: 0.15, performance: 0.12 },
            markovChain: { weight: 0.14, performance: 0.11 },
            neuralNetwork: { weight: 0.17, performance: 0.16 }
          }
        },

        // UI state
        ui: {
          theme: 'light',
          sidebarOpen: false,
          activeTab: 'dashboard',
          notifications: [],
          modals: {
            claudeSetup: false,
            settings: false,
            about: false
          },
          loading: {
            claude: false,
            analysis: false,
            data: false
          }
        },

        // User preferences
        preferences: {
          autoAnalysis: false,
          analysisStrategy: 'balanced',
          maxSetsToGenerate: 5,
          saveHistory: true,
          notifications: {
            analysis: true,
            errors: true,
            updates: true
          }
        },

        // Actions
        actions: {
          // System actions
          setSystemStatus: (status) => 
            set((state) => ({
              system: { ...state.system, status, lastUpdated: new Date() }
            })),

          setLoading: (isLoading) =>
            set((state) => ({
              system: { ...state.system, isLoading }
            })),

          setOnlineStatus: (isOnline) =>
            set((state) => ({
              system: { ...state.system, isOnline }
            })),

          // Claude actions
          setClaudeConfig: (config) =>
            set((state) => ({
              claude: { ...state.claude, ...config }
            })),

          setClaudeConnection: (connectionStatus, error = null) =>
            set((state) => ({
              claude: { 
                ...state.claude, 
                connectionStatus,
                isConnected: connectionStatus === 'connected',
                error 
              }
            })),

          incrementClaudeAnalysis: () =>
            set((state) => ({
              claude: { 
                ...state.claude, 
                analysisCount: state.claude.analysisCount + 1,
                lastAnalysis: new Date()
              }
            })),

          // Lottery data actions
          setLotteryData: (data) =>
            set((state) => ({
              lotteryData: {
                ...state.lotteryData,
                ...data,
                isDataLoaded: true,
                lastDataUpdate: new Date()
              }
            })),

          updateStatistics: (statistics) =>
            set((state) => ({
              lotteryData: {
                ...state.lotteryData,
                statistics: { ...state.lotteryData.statistics, ...statistics }
              }
            })),

          // Analysis actions
          setCurrentAnalysis: (analysis) =>
            set((state) => ({
              analysis: { ...state.analysis, currentAnalysis: analysis }
            })),

          addGeneratedSets: (sets) =>
            set((state) => ({
              analysis: {
                ...state.analysis,
                generatedSets: [...state.analysis.generatedSets, ...sets],
                performance: {
                  ...state.analysis.performance,
                  totalGenerated: state.analysis.performance.totalGenerated + sets.length
                }
              }
            })),

          updateAlgorithmPerformance: (algorithm, performance) =>
            set((state) => ({
              analysis: {
                ...state.analysis,
                algorithms: {
                  ...state.analysis.algorithms,
                  [algorithm]: {
                    ...state.analysis.algorithms[algorithm],
                    performance
                  }
                }
              }
            })),

          clearGeneratedSets: () =>
            set((state) => ({
              analysis: { ...state.analysis, generatedSets: [] }
            })),

          // UI actions
          setTheme: (theme) =>
            set((state) => ({
              ui: { ...state.ui, theme }
            })),

          setSidebarOpen: (open) =>
            set((state) => ({
              ui: { ...state.ui, sidebarOpen: open }
            })),

          setActiveTab: (tab) =>
            set((state) => ({
              ui: { ...state.ui, activeTab: tab }
            })),

          addNotification: (notification) => {
            const id = Date.now().toString()
            set((state) => ({
              ui: {
                ...state.ui,
                notifications: [
                  ...state.ui.notifications,
                  { ...notification, id, timestamp: new Date() }
                ]
              }
            }))
            
            // Auto-remove notification after 5 seconds
            setTimeout(() => {
              get().actions.removeNotification(id)
            }, 5000)
          },

          removeNotification: (id) =>
            set((state) => ({
              ui: {
                ...state.ui,
                notifications: state.ui.notifications.filter(n => n.id !== id)
              }
            })),

          setModal: (modal, open) =>
            set((state) => ({
              ui: {
                ...state.ui,
                modals: { ...state.ui.modals, [modal]: open }
              }
            })),

          setUILoading: (component, loading) =>
            set((state) => ({
              ui: {
                ...state.ui,
                loading: { ...state.ui.loading, [component]: loading }
              }
            })),

          // Preferences actions
          updatePreferences: (preferences) =>
            set((state) => ({
              preferences: { ...state.preferences, ...preferences }
            })),

          // Utility actions
          reset: () =>
            set((state) => ({
              ...state,
              claude: {
                ...state.claude,
                isConnected: false,
                connectionStatus: 'disconnected',
                analysisCount: 0,
                error: null
              },
              analysis: {
                ...state.analysis,
                currentAnalysis: null,
                generatedSets: [],
                performance: {
                  totalGenerated: 0,
                  hitRate: 0,
                  averageHits: 0,
                  bestPerformance: null
                }
              },
              ui: {
                ...state.ui,
                notifications: [],
                loading: {
                  claude: false,
                  analysis: false,
                  data: false
                }
              }
            })),

          // Computed getters
          getSystemHealth: () => {
            const state = get()
            return {
              isHealthy: state.system.status === 'ready' && state.system.isOnline,
              claudeEnabled: state.claude.isConnected,
              dataLoaded: state.lotteryData.isDataLoaded,
              issues: []
            }
          },

          getAnalysisStats: () => {
            const state = get()
            return {
              totalSets: state.analysis.generatedSets.length,
              claudeAnalyses: state.claude.analysisCount,
              averageConfidence: state.analysis.generatedSets.reduce(
                (acc, set) => acc + (set.confidence || 0), 0
              ) / Math.max(state.analysis.generatedSets.length, 1),
              lastGenerated: state.analysis.generatedSets[state.analysis.generatedSets.length - 1]?.timestamp
            }
          }
        }
      }),
      {
        name: 'lcv2-store',
        partialize: (state) => ({
          preferences: state.preferences,
          claude: {
            model: state.claude.model
          }
        })
      }
    )
  )
)

// Selectors for optimized component updates
export const useSystemStatus = () => useAppStore(state => state.system.status)
export const useClaudeStatus = () => useAppStore(state => state.claude)
export const useLotteryData = () => useAppStore(state => state.lotteryData)
export const useAnalysis = () => useAppStore(state => state.analysis)
export const useUI = () => useAppStore(state => state.ui)
export const usePreferences = () => useAppStore(state => state.preferences)
export const useActions = () => useAppStore(state => state.actions)

// Initialize online status listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useAppStore.getState().actions.setOnlineStatus(true)
  })
  
  window.addEventListener('offline', () => {
    useAppStore.getState().actions.setOnlineStatus(false)
  })
}

export default useAppStore