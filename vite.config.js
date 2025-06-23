// vite.config.js - Working configuration for LCv2
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  
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

  server: {
    port: 3000,
    open: true,
    host: true
  },

  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/zustand')) {
            return 'vendor-state';
          }
          if (id.includes('node_modules/clsx')) {
            return 'vendor-utils';
          }
          
          // App chunks - only create if files exist
          if (id.includes('/contexts/')) {
            return 'app-state';
          }
          if (id.includes('/components/')) {
            return 'app-components';
          }
          if (id.includes('/services/')) {
            return 'app-services';
          }
        }
      }
    },
    minify: 'esbuild',
    sourcemap: false,
    target: 'esnext'
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand', 'clsx']
  }
})