import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@model': path.resolve(__dirname, './src/model'),
      '@view': path.resolve(__dirname, './src/view'),
      '@controller': path.resolve(__dirname, './src/controller'),
      '@automation': path.resolve(__dirname, './src/automation'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
})
