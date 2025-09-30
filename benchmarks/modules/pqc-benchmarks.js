/**
 * Benchmarks de Algoritmos Post-Cuánticos
 * Implementa los benchmarks para ML-KEM y ML-DSA
 */

import { performance } from 'perf_hooks';
import { CONFIG } from './config.js';
import { getCryptoFootprint } from './crypto-sizes.js';
import { calculateMetrics } from './utils.js';
import { APIClient } from './api-client.js';

export class PostQuantumBenchmarks {
  constructor() {
    this.iterations = CONFIG.BENCHMARK.ITERATIONS;
    this.apiClient = new APIClient();
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
   * Benchmark de ML-KEM
   * @returns {Promise<Object>} Resultados del benchmark
   */
  async benchmarkMLKEM() {
    console.log('🔐 Ejecutando benchmarks ML-KEM...');

    // Verificar que la API esté disponible
    console.log('   🔄 Verificando disponibilidad de la API...');
    const isApiHealthy = await this.apiClient.ensureApiHealth();
    if (!isApiHealthy) {
      console.log('   ❌ API no disponible después de múltiples intentos');
      return null;
    }
    console.log('   ✅ API disponible');

    const results = {};

    for (const variant of CONFIG.ALGORITHMS.POST_QUANTUM.ML_KEM) {
      console.log(`   🔑 Probando ${variant}...`);

      try {
        const keyGenResult = await this.runBenchmark(
          `${variant} KeyGen`,
          () => this.apiClient.generateMLKEMKeys(variant),
          CONFIG.BENCHMARK.KEYGEN_ITERATIONS
        );

        if (keyGenResult.error) {
          console.log(`   ❌ Error en ${variant} KeyGen: ${keyGenResult.error}`);
          results[variant] = { error: keyGenResult.error };
          continue;
        }

        // Obtener claves para pruebas adicionales
        const keygenResponse = await this.apiClient.generateMLKEMKeys(variant);
        const { public_key, secret_key } = keygenResponse;

        // Obtener footprint
        const variantNumber = variant.split('-')[1];
        const footprint = getCryptoFootprint('ML-KEM', variantNumber);

        results[variant] = {
          keyGeneration: {
            ...keyGenResult,
            footprint: {
              publicKeySize: footprint.publicKeySize,
              privateKeySize: footprint.privateKeySize
            }
          }
        };

        console.log(`   ✅ ${variant} completado`);

      } catch (error) {
        console.log(`   ❌ Error en ${variant}: ${error.message}`);
        results[variant] = { error: error.message };
      }
    }

    return results;
  }

  /**
   * Benchmark de ML-DSA
   * @returns {Promise<Object>} Resultados del benchmark
   */
  async benchmarkMLDSA() {
    console.log('🔐 Ejecutando benchmarks ML-DSA...');

    // Verificar que la API esté disponible
    console.log('   🔄 Verificando disponibilidad de la API...');
    const isApiHealthy = await this.apiClient.ensureApiHealth();
    if (!isApiHealthy) {
      console.log('   ❌ API no disponible después de múltiples intentos');
      return null;
    }
    console.log('   ✅ API disponible');

    const results = {};

    for (const variant of CONFIG.ALGORITHMS.POST_QUANTUM.ML_DSA) {
      console.log(`   ✍️  Probando ${variant}...`);

      try {
        const keyGenResult = await this.runBenchmark(
          `${variant} KeyGen`,
          () => this.apiClient.generateMLDSAKeys(variant),
          CONFIG.BENCHMARK.KEYGEN_ITERATIONS
        );

        if (keyGenResult.error) {
          console.log(`   ❌ Error en ${variant} KeyGen: ${keyGenResult.error}`);
          results[variant] = { error: keyGenResult.error };
          continue;
        }

        // Obtener claves para firma
        const keygenResponse = await this.apiClient.generateMLDSAKeys(variant);
        const { public_key, private_key } = keygenResponse;

        // Benchmark de firma
        const signResult = await this.runBenchmark(
          `${variant} Sign`,
          () => this.apiClient.signMLDSA('Hello World', private_key, variant),
          CONFIG.BENCHMARK.SIGNING_ITERATIONS
        );

        // Benchmark de verificación
        const signTestResponse = await this.apiClient.signMLDSA('Hello World', private_key, variant);
        const verifyResult = await this.runBenchmark(
          `${variant} Verify`,
          () => this.apiClient.verifyMLDSA('Hello World', signTestResponse.signature, public_key, variant),
          CONFIG.BENCHMARK.VERIFICATION_ITERATIONS
        );

        // Obtener footprint
        const variantNumber = variant.split('-')[1];
        const footprint = getCryptoFootprint('ML-DSA', variantNumber);

        results[variant] = {
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

        console.log(`   ✅ ${variant} completado`);

      } catch (error) {
        console.log(`   ❌ Error en ${variant}: ${error.message}`);
        results[variant] = { error: error.message };
      }
    }

    return results;
  }
}

export default PostQuantumBenchmarks;
