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
    host: '0.0.0.0',
    https: false,
    proxy: {
      "/api": {
        target: "https://chatapp-7lh7.onrender.com", 
        changeOrigin: true,
        secure: true,
      }
    },
    mimeTypes: {
      'application/javascript': ['js', 'mjs']
    }
  },
  allowedHosts: [
    'chatapp-1-eebi.onrender.com',  
    'localhost',                    
    '0.0.0.0',
    '*'                      
  ],
  resolve: {
    alias: {
      crypto: 'crypto-browserify'
    }
  },
  build: {
    outDir: 'dist', 
  },
});
