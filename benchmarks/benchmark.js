#!/usr/bin/env node

/**
 * Cryptographic Algorithm Performance Benchmark
 * Comparative analysis of classical vs post-quantum cryptographic algorithms
 * 
 * Modular architecture following clean code principles:
 * - config.js: Centralized configuration management
 * - crypto-sizes.js: Official cryptographic size definitions
 * - utils.js: Statistical utilities and helper functions
 * - api-client.js: Robust API client for PQClean integration
 * - classical-benchmarks.js: Classical cryptography benchmark implementations
 * - pqc-benchmarks.js: Post-quantum cryptography benchmark implementations
 * - display.js: Result visualization and console output
 */

import fs from 'fs';
import { CONFIG } from './modules/config.js';
import { ensureDirectoryExists } from './modules/utils.js';
import { ClassicalBenchmarks } from './modules/classical-benchmarks.js';
import { PostQuantumBenchmarks } from './modules/pqc-benchmarks.js';
import { ResultDisplay } from './modules/display.js';

class Benchmark {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      classical: {},
      postQuantum: {},
      comparison: {}
    };

    this.classicalBenchmarks = new ClassicalBenchmarks();
    this.pqcBenchmarks = new PostQuantumBenchmarks();
    this.display = new ResultDisplay();
  }

  /**
   * Ejecuta todos los benchmarks
   */
  async runAllBenchmarks() {
    this.display.displayHeader();

    // Algoritmos clásicos
    this.display.displayClassicalHeader();
    this.results.classical.rsa = await this.classicalBenchmarks.benchmarkRSA();
    this.results.classical.ecdsa = await this.classicalBenchmarks.benchmarkECDSA();
    this.results.classical.ecdh = await this.classicalBenchmarks.benchmarkECDH();

    // Algoritmos post-cuánticos
    this.display.displayPostQuantumHeader();
    this.results.postQuantum.mlKem = await this.pqcBenchmarks.benchmarkMLKEM();
    this.results.postQuantum.mlDsa = await this.pqcBenchmarks.benchmarkMLDSA();

    // Mostrar resultados agrupados por operación
    this.display.displayResultsByOperation(this.results);

    // Análisis comparativo
    this.display.generateComparison(this.results);

    // Guardar resultados
    await this.saveResults();
  }

  /**
   * Guarda los resultados en archivo JSON
   */
  async saveResults() {
    try {
      await ensureDirectoryExists(CONFIG.FILES.RESULTS_DIR);
      const filePath = `${CONFIG.FILES.RESULTS_DIR}/${CONFIG.FILES.RESULTS_FILE}`;

      await fs.promises.writeFile(
        filePath,
        JSON.stringify(this.results, null, 2),
        'utf8'
      );

      console.log(`\n💾 Resultados guardados en: ${filePath}`);
    } catch (error) {
      console.error('❌ Error guardando resultados:', error.message);
    }
  }

  /**
   * Carga resultados desde archivo JSON
   * @param {string} filePath - Ruta del archivo
   * @returns {Object|null} Resultados cargados o null si hay error
   */
  async loadResults(filePath = `${CONFIG.FILES.RESULTS_DIR}/${CONFIG.FILES.RESULTS_FILE}`) {
    try {
      const data = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Error cargando resultados:', error.message);
      return null;
    }
  }

  /**
   * Muestra estadísticas del benchmark
   */
  displayStatistics() {
    const totalAlgorithms =
      Object.keys(this.results.classical).length +
      Object.keys(this.results.postQuantum).length;

    console.log('\n📊 ESTADÍSTICAS DEL BENCHMARK');
    console.log('='.repeat(40));
    console.log(`📅 Timestamp: ${this.results.timestamp}`);
    console.log(`🔢 Algoritmos clásicos: ${Object.keys(this.results.classical).length}`);
    console.log(`🔢 Algoritmos post-cuánticos: ${Object.keys(this.results.postQuantum).length}`);
    console.log(`📊 Total de algoritmos: ${totalAlgorithms}`);
    console.log(`⚙️  Iteraciones por benchmark: ${CONFIG.BENCHMARK.ITERATIONS}`);
  }
}

/**
 * Función principal
 */
async function main() {
  try {
    const benchmark = new Benchmark();
    await benchmark.runAllBenchmarks();
    benchmark.displayStatistics();

    console.log('\n✅ Benchmark completado exitosamente!');
  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default Benchmark;
