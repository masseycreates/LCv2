import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // Enable JSX in .js files
      include: "**/*.{jsx,js}",
    })
  ],
  esbuild: {
    // Enable JSX in .js files
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
  },
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
  }
})