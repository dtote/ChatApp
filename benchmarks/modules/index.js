/**
 * Índice de Módulos del Benchmark
 * Exporta todos los módulos para facilitar las importaciones
 */

export { CONFIG } from './config.js';
export { CRYPTO_SIZES, getCryptoFootprint } from './crypto-sizes.js';
export * from './utils.js';
export { APIClient } from './api-client.js';
export { ClassicalBenchmarks } from './classical-benchmarks.js';
export { PostQuantumBenchmarks } from './pqc-benchmarks.js';
export { ResultDisplay } from './display.js';

export default {
  CONFIG: () => import('./config.js'),
  CRYPTO_SIZES: () => import('./crypto-sizes.js'),
  UTILS: () => import('./utils.js'),
  APIClient: () => import('./api-client.js'),
  ClassicalBenchmarks: () => import('./classical-benchmarks.js'),
  PostQuantumBenchmarks: () => import('./pqc-benchmarks.js'),
  ResultDisplay: () => import('./display.js')
};
