// vite.config.js - Comprehensive chunking strategy for LCv2
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
    open: true,
    host: true // Allow external connections for Vercel preview
  },

  // Build optimization with smart chunking
  build: {
    // Increase chunk size warnings threshold
    chunkSizeWarningLimit: 1000,
    
    rollupOptions: {
      output: {
        // Smart chunking strategy - only include modules that exist
        manualChunks: (id) => {
          // React vendor chunk
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          
          // State management
          if (id.includes('node_modules/zustand') || id.includes('/contexts/')) {
            return 'state-management';
          }
          
          // UI utility libraries
          if (id.includes('node_modules/clsx') || id.includes('node_modules/tailwind')) {
            return 'vendor-ui';
          }
          
          // Lottery features - only if they exist
          if (id.includes('/features/lottery/') || id.includes('/services/lottery')) {
            return 'lottery-features';
          }
          
          // Tax calculator features
          if (id.includes('/features/tax-calculator/') || id.includes('/services/tax')) {
            return 'tax-features';
          }
          
          // Analysis features
          if (id.includes('/features/analysis/') || id.includes('/services/analysis')) {
            return 'analysis-features';
          }
          
          // UI components
          if (id.includes('/components/ui/') || id.includes('/components/layout/')) {
            return 'ui-components';
          }
          
          // API services
          if (id.includes('/services/api/') || id.includes('/api/')) {
            return 'api-services';
          }
          
          // Utilities and hooks
          if (id.includes('/utils/') || id.includes('/hooks/') || id.includes('/constants/')) {
            return 'utilities';
          }
        },
        
        // Consistent chunk names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId 
            ? chunkInfo.facadeModuleId.split('/').pop().replace(/\.[^/.]+$/, '') 
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        
        // Asset naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    
    // Additional build optimizations
    minify: 'esbuild',
    sourcemap: false, // Disable in production for smaller builds
    target: 'esnext',
    
    // CSS optimization
    cssCodeSplit: true,
    cssMinify: true
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'zustand',
      'clsx'
    ],
    exclude: []
  },

  // Preview settings for production builds
  preview: {
    port: 4173,
    host: true
  },

  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '2.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
})