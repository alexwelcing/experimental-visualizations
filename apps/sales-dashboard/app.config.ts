import { defineConfig } from '@tanstack/start/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  vite: {
    plugins: [react()],
  },
  server: {
    preset: 'node-server',
  },
})
