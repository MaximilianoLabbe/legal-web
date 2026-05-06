import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Use default minification (esbuild)
    // Generate source maps for production debugging (set to false in production)
    sourcemap: false,
    // Chunk size optimization
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor';
          }
          if (id.includes('node_modules/react-icons')) {
            return 'ui';
          }
        },
      },
    },
  },
  server: {
    port: 5174,
    strictPort: false,
    middlewareMode: false,
  },
})
