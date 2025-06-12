import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const resolveModulePath = (moduleName) =>
  path.resolve(__dirname, `./node_modules/${moduleName}`);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { 
    port: 3000,
    host: '0.0.0.0',
    https: false,
    mimeTypes: {
      'application/javascript': ['js', 'mjs']
    }
  },
  allowedHosts: ['*'],
  resolve: {
    alias: {
      crypto: resolveModulePath('crypto-browserify'),
      stream: resolveModulePath('stream-browserify'),
      buffer: resolveModulePath('buffer'),
      process: resolveModulePath('process/browser'),
    }
  },
  base: '/ChatAppNew16/',  // Reemplaza esto con el nombre de tu repositorio
  build: {
    outDir: 'build',
    assetsDir: 'assets',
  },
});
