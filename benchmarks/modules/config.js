/**
 * Benchmark Configuration Module
 * Centralized configuration for cryptographic performance benchmarks
 */

export const CONFIG = {
  // Configuración de la API
  API: {
    URL: process.env.PQCLEAN_API_URL || 'http://localhost:5003',
    TIMEOUT: 10000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    HEALTH_CHECK_TIMEOUT: 5000
  },

  // Configuración del benchmark
  BENCHMARK: {
    ITERATIONS: 50, // Balance óptimo para academia
    KEYGEN_ITERATIONS: 25, // RSA KeyGen: suficiente para estadística
    SIGNING_ITERATIONS: 50,
    VERIFICATION_ITERATIONS: 50,
    WARMUP_ITERATIONS: 3
  },

  // Configuración de archivos
  FILES: {
    RESULTS_DIR: 'results',
    RESULTS_FILE: 'benchmark-results.json',
    CHARTS_DIR: 'results'
  },

  // Configuración de visualización
  DISPLAY: {
    DECIMAL_PLACES: 2,
    PADDING_LENGTH: 20,
    TABLE_SEPARATOR: '─',
    SUCCESS_ICON: '✅',
    ERROR_ICON: '❌',
    WARNING_ICON: '⚠️'
  },

  // Configuración de algoritmos
  ALGORITHMS: {
    CLASSICAL: {
      RSA: ['RSA-2048', 'RSA-3072', 'RSA-4096'],
      ECDSA: ['prime256v1', 'secp384r1', 'secp521r1'],
      ECDH: ['prime256v1', 'secp384r1', 'secp521r1']
    },
    POST_QUANTUM: {
      ML_KEM: ['ML-KEM-512', 'ML-KEM-768', 'ML-KEM-1024'],
      ML_DSA: ['ML-DSA-44', 'ML-DSA-65', 'ML-DSA-87']
    }
  },

  // Configuración de seguridad
  SECURITY_LEVELS: {
    128: ['ML-KEM-512', 'ML-DSA-44', 'RSA-2048', 'prime256v1'],
    192: ['ML-KEM-768', 'ML-DSA-65', 'RSA-3072', 'secp384r1'],
    256: ['ML-KEM-1024', 'ML-DSA-87', 'RSA-4096', 'secp521r1']
  }
};

export default CONFIG;
