import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { 
    port: 3000,
    https: false, // 🔹 Deshabilitar HTTPS
    proxy: {
      "/api": {
        target: "http://chatapp-7lh7.onrender.com:10000", // 🔹 Cambié https por http
        changeOrigin: true,
        secure: false,
      }
    },
    mimeTypes: {
      'application/javascript': ['js', 'mjs']
    }
  },
  resolve: {
    alias: {
      crypto: 'crypto-browserify'
    }
  },
  build: {
    outDir: 'build', 
  },
});
