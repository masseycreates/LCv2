// This file tells Vite (your build tool) how to handle your project
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Think of this configuration like setting up rules for how your workshop operates
export default defineConfig({
  // Tell Vite that this is a React project
  plugins: [react()],
  
  // Set up shortcuts so you can import files more easily
  // Instead of writing "../../../components/Button" you can write "@components/Button"
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

  // Configure the development server
  server: {
    port: 3000,  // Your app will run on http://localhost:3000
    open: true   // Automatically open your browser when you start the server
  }
})