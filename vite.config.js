import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // Enable JSX in .js files explicitly
      include: "**/*.{jsx,js,ts,tsx}",
      jsxRuntime: 'automatic'
    })
  ],
  
  // Remove conflicting esbuild configuration
  // The React plugin handles JSX transformation
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          lottery: ['./src/services/LotteryPredictor.js'],
          claude: ['./src/services/ClaudeAPI.js']
        }
      }
    }
  },
  
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  
  // Ensure proper file extensions are recognized
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  }
})