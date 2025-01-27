import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';
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
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'keys/localhost.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'keys/localhost.crt')),
    },
    proxy: {
      "/api": {
      target: "https://localhost:4000",
      secure: false,
      }
    },
    mimeTypes: {
      'application/javascript': ['js', 'mjs']
    }
  },
  resolve : {
    alias: {
      crypto: 'crypto-browserify'
    }
  },
  build: {
    outDir: 'build', 
  },
})
