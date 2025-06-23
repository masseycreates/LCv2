// vite.config.js - Fixed configuration for LCv2
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  
  // Path aliases for cleaner imports
  resolve: {
    alias: {
      '@': resolve(process.cwd(), 'src'),
      '@components': resolve(process.cwd(), 'src/components'),
      '@services': resolve(process.cwd(), 'src/services'),
      '@utils': resolve(process.cwd(), 'src/utils'),
      '@hooks': resolve(process.cwd(), 'src/hooks'),
      '@constants': resolve(process.cwd(), 'src/constants'),
      '@styles': resolve(process.cwd(), 'src/styles')
    }
  },

  // Development server settings
  server: {
    port: 3000,
    open: true
  },

  // Build optimization - REMOVED manual chunks that reference missing files
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
          // Removed references to files that don't exist yet:
          // lottery: ['./src/services/algorithms/predictor.js'],
          // ui: ['./src/components/ui']
        }
      }
    }
  }
})