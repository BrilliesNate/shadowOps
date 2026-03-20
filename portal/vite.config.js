import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    // Serve app.html as default instead of index.html
    open: '/app.html',
  },
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'app.html'),
    },
  },
})
