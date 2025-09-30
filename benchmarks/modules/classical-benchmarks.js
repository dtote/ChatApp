/**
 * Classical Cryptography Benchmark Implementation
 * Performance benchmarking for RSA, ECDSA, and ECDH algorithms
 */

import crypto from 'crypto';
import { performance } from 'perf_hooks';
import { CONFIG } from './config.js';
import { getCryptoFootprint } from './crypto-sizes.js';
import { calculateMetrics } from './utils.js';
import { formatNumber, padString, createSeparator } from './utils.js';

export class ClassicalBenchmarks {
  constructor() {
    this.iterations = CONFIG.BENCHMARK.ITERATIONS;
    this.keygenIterations = CONFIG.BENCHMARK.KEYGEN_ITERATIONS;
    this.signingIterations = CONFIG.BENCHMARK.SIGNING_ITERATIONS;
    this.verificationIterations = CONFIG.BENCHMARK.VERIFICATION_ITERATIONS;
  }

  /**
   * Ejecuta un benchmark individual
   * @param {string} name - Nombre del benchmark
   * @param {Function} operation - Función a medir
   * @param {number} iterations - Número de iteraciones
   * @returns {Object} Resultado del benchmark
   */
  async runBenchmark(name, operation, iterations = this.iterations) {
    // Warmup para estabilizar las mediciones
    const warmupIterations = CONFIG.BENCHMARK.WARMUP_ITERATIONS;
    for (let i = 0; i < warmupIterations; i++) {
      try {
        await operation();
      } catch (error) {
        // Ignorar errores en warmup
      }
    }

    const times = [];
    let successCount = 0;

    for (let i = 0; i < iterations; i++) {
      try {
        const start = performance.now();
        await operation();
        const end = performance.now();

        const duration = end - start;
        times.push(duration);
        successCount++;
      } catch (error) {
        times.push(0);
      }
    }

    const metrics = calculateMetrics(times);
    metrics.successRate = (successCount / iterations) * 100;

    return {
      ...metrics,
      iterations,
      successCount,
      errorRate: 100 - metrics.successRate
    };
  }

  /**
   * Benchmark de generación de claves RSA
   * @returns {Promise<Object>} Resultados del benchmark
   */
  async benchmarkRSA() {
    console.log('🔐 Ejecutando benchmarks RSA...');
    const results = {};

    for (const keySize of CONFIG.ALGORITHMS.CLASSICAL.RSA) {
      console.log(`  📊 ${keySize}...`);

      try {
        const keyGenResult = await this.runBenchmark(
          `${keySize} KeyGen`,
          () => {
            const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
              modulusLength: parseInt(keySize.split('-')[1]),
              publicKeyEncoding: { type: 'spki', format: 'pem' },
              privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
            });
            return { publicKey, privateKey };
          },
          CONFIG.BENCHMARK.KEYGEN_ITERATIONS
        );

        // Benchmark de firma RSA (legacy)
        const signResult = await this.runBenchmark(
          `${keySize} Sign`,
          () => {
            const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
              modulusLength: parseInt(keySize.split('-')[1]),
              publicKeyEncoding: { type: 'spki', format: 'pem' },
              privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
            });

            const message = 'Hello World';
            const signature = crypto.sign('sha256', Buffer.from(message), privateKey);
            return { signature };
          },
          CONFIG.BENCHMARK.SIGNING_ITERATIONS
        );

        // Benchmark de verificación RSA (legacy)
        const verifyResult = await this.runBenchmark(
          `${keySize} Verify`,
          () => {
            const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
              modulusLength: parseInt(keySize.split('-')[1]),
              publicKeyEncoding: { type: 'spki', format: 'pem' },
              privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
            });

            const message = 'Hello World';
            const signature = crypto.sign('sha256', Buffer.from(message), privateKey);
            const isValid = crypto.verify('sha256', Buffer.from(message), publicKey, signature);
            return { isValid };
          },
          CONFIG.BENCHMARK.VERIFICATION_ITERATIONS
        );

        // Obtener footprint
        const keySizeNumber = keySize.split('-')[1];
        const footprint = getCryptoFootprint('RSA', keySizeNumber);

        results[keySize] = {
          keyGeneration: {
            ...keyGenResult,
            footprint: {
              publicKeySize: footprint.publicKeySize,
              privateKeySize: footprint.privateKeySize
            }
          },
          signing: {
            ...signResult,
            footprint: {
              signatureSize: footprint.signatureSize
            }
          },
          verification: {
            ...verifyResult,
            footprint: {
              signatureSize: footprint.signatureSize
            }
          }
        };

      } catch (error) {
        console.log(`  ❌ Error en ${keySize}: ${error.message}`);
        results[keySize] = { error: error.message };
      }
    }

    return results;
  }

  /**
   * Benchmark de ECDSA
   * @returns {Promise<Object>} Resultados del benchmark
   */
  async benchmarkECDSA() {
    console.log('🔐 Ejecutando benchmarks ECDSA...');
    const results = {};

    for (const curve of CONFIG.ALGORITHMS.CLASSICAL.ECDSA) {
      console.log(`  📊 ECDSA-${curve}...`);

      try {
        const keyGenResult = await this.runBenchmark(
          `ECDSA-${curve} KeyGen`,
          () => {
            const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
              namedCurve: curve,
              publicKeyEncoding: { type: 'spki', format: 'pem' },
              privateKeyEncoding: { type: 'sec1', format: 'pem' }
            });
            return { publicKey, privateKey };
          },
          CONFIG.BENCHMARK.KEYGEN_ITERATIONS
        );

        // Benchmark de firma ECDSA
        const signResult = await this.runBenchmark(
          `ECDSA-${curve} Sign`,
          () => {
            const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
              namedCurve: curve,
              publicKeyEncoding: { type: 'spki', format: 'pem' },
              privateKeyEncoding: { type: 'sec1', format: 'pem' }
            });

            const message = 'Hello World';
            const signature = crypto.sign('sha256', Buffer.from(message), privateKey);
            return { signature };
          },
          CONFIG.BENCHMARK.SIGNING_ITERATIONS
        );

        // Benchmark de verificación ECDSA
        const verifyResult = await this.runBenchmark(
          `ECDSA-${curve} Verify`,
          () => {
            const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
              namedCurve: curve,
              publicKeyEncoding: { type: 'spki', format: 'pem' },
              privateKeyEncoding: { type: 'sec1', format: 'pem' }
            });

            const message = 'Hello World';
            const signature = crypto.sign('sha256', Buffer.from(message), privateKey);
            const isValid = crypto.verify('sha256', Buffer.from(message), publicKey, signature);
            return { isValid };
          },
          CONFIG.BENCHMARK.VERIFICATION_ITERATIONS
        );

        // Obtener footprint
        const footprint = getCryptoFootprint('ECDSA', curve);

        results[curve] = {
          keyGeneration: {
            ...keyGenResult,
            footprint: {
              publicKeySize: footprint.publicKeySize,
              privateKeySize: footprint.privateKeySize
            }
          },
          signing: {
            ...signResult,
            footprint: {
              signatureSize: footprint.signatureSize
            }
          },
          verification: {
            ...verifyResult,
            footprint: {
              signatureSize: footprint.signatureSize
            }
          }
        };

      } catch (error) {
        console.log(`  ❌ Error en ECDSA-${curve}: ${error.message}`);
        results[curve] = { error: error.message };
      }
    }

    return results;
  }

  /**
   * Benchmark de ECDH
   * @returns {Promise<Object>} Resultados del benchmark
   */
  async benchmarkECDH() {
    console.log('🔐 Ejecutando benchmarks ECDH...');
    const results = {};

    for (const curve of CONFIG.ALGORITHMS.CLASSICAL.ECDH) {
      console.log(`  📊 ECDH-${curve}...`);

      try {
        const keyGenResult = await this.runBenchmark(
          `ECDH-${curve} KeyGen`,
          () => {
            const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
              namedCurve: curve,
              publicKeyEncoding: { type: 'spki', format: 'pem' },
              privateKeyEncoding: { type: 'sec1', format: 'pem' }
            });
            return { publicKey, privateKey };
          },
          CONFIG.BENCHMARK.KEYGEN_ITERATIONS
        );

        // Obtener footprint
        const footprint = getCryptoFootprint('ECDH', curve);

        results[curve] = {
          keyGeneration: {
            ...keyGenResult,
            footprint: {
              publicKeySize: footprint.publicKeySize,
              privateKeySize: footprint.privateKeySize
            }
          }
        };

      } catch (error) {
        console.log(`  ❌ Error en ECDH-${curve}: ${error.message}`);
        results[curve] = { error: error.message };
      }
    }

    return results;
  }
}

export default ClassicalBenchmarks;
