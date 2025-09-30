/**
 * Módulo de Visualización de Resultados
 * Maneja la presentación de resultados del benchmark
 */

import { CONFIG } from './config.js';
import { padString, createSeparator, formatNumber } from './utils.js';

export class ResultDisplay {
  constructor() {
    this.paddingLength = CONFIG.DISPLAY.PADDING_LENGTH;
    this.decimalPlaces = CONFIG.DISPLAY.DECIMAL_PLACES;
  }

  /**
   * Muestra los resultados agrupados por tipo de operación
   * @param {Object} results - Resultados del benchmark
   */
  displayResultsByOperation(results) {
    console.log('\n📊 RESULTADOS AGRUPADOS POR TIPO DE OPERACIÓN');
    console.log(createSeparator(80));

    this.displayKeyGenerationTable(results);
    this.displaySigningTable(results);
    this.displayVerificationTable(results);
  }

  /**
   * Muestra la tabla de generación de claves
   * @param {Object} results - Resultados del benchmark
   */
  displayKeyGenerationTable(results) {
    console.log('\n🔑 TABLA 1: GENERACIÓN DE CLAVES');
    console.log(createSeparator(80));
    console.log(padString('Algoritmo') + padString('Tiempo(ms)', 15) + padString('Throughput', 15) + padString('Éxito(%)', 12) + 'Tamaño Clave');
    console.log(createSeparator(80));

    // Algoritmos post-cuánticos
    if (results.postQuantum?.mlKem) {
      Object.entries(results.postQuantum.mlKem).forEach(([algorithm, data]) => {
        if (data && !data.error && data.keyGeneration) {
          const footprint = data.keyGeneration.footprint;
          console.log(
            padString(algorithm) +
            padString(formatNumber(data.keyGeneration.avgTime), 15) +
            padString(data.keyGeneration.throughput.toString(), 15) +
            padString(formatNumber(data.keyGeneration.successRate, 1), 12) +
            `${footprint.publicKeySize} bytes`
          );
        }
      });
    }

    // Algoritmos clásicos
    if (results.classical?.rsa) {
      Object.entries(results.classical.rsa).forEach(([keySize, data]) => {
        if (data && !data.error && data.keyGeneration) {
          const footprint = data.keyGeneration.footprint;
          console.log(
            padString(keySize) +
            padString(formatNumber(data.keyGeneration.avgTime), 15) +
            padString(data.keyGeneration.throughput.toString(), 15) +
            padString(formatNumber(data.keyGeneration.successRate, 1), 12) +
            `${footprint.publicKeySize} bytes`
          );
        }
      });
    }

    if (results.classical?.ecdh) {
      Object.entries(results.classical.ecdh).forEach(([curve, data]) => {
        if (data && !data.error && data.keyGeneration) {
          const footprint = data.keyGeneration.footprint;
          console.log(
            padString(`ECDH-${curve}`) +
            padString(formatNumber(data.keyGeneration.avgTime), 15) +
            padString(data.keyGeneration.throughput.toString(), 15) +
            padString(formatNumber(data.keyGeneration.successRate, 1), 12) +
            `${footprint.publicKeySize} bytes`
          );
        }
      });
    }
  }

  /**
   * Muestra la tabla de firma digital
   * @param {Object} results - Resultados del benchmark
   */
  displaySigningTable(results) {
    console.log('\n✍️ TABLA 4: FIRMA DIGITAL');
    console.log(createSeparator(80));
    console.log(padString('Algoritmo') + padString('Tiempo(ms)', 15) + padString('Throughput', 15) + padString('Éxito(%)', 12) + 'Tamaño Firma');
    console.log(createSeparator(80));

    // Algoritmos post-cuánticos
    if (results.postQuantum?.mlDsa) {
      Object.entries(results.postQuantum.mlDsa).forEach(([algorithm, data]) => {
        if (data && !data.error && data.signing) {
          const footprint = data.signing.footprint;
          console.log(
            padString(algorithm) +
            padString(formatNumber(data.signing.avgTime), 15) +
            padString(data.signing.throughput.toString(), 15) +
            padString(formatNumber(data.signing.successRate, 1), 12) +
            `${footprint.signatureSize} bytes`
          );
        }
      });
    }

    // Algoritmos clásicos
    if (results.classical?.rsa) {
      Object.entries(results.classical.rsa).forEach(([keySize, data]) => {
        if (data && !data.error && data.signing) {
          const footprint = data.signing.footprint;
          console.log(
            padString(`${keySize} (legacy)`) +
            padString(formatNumber(data.signing.avgTime), 15) +
            padString(data.signing.throughput.toString(), 15) +
            padString(formatNumber(data.signing.successRate, 1), 12) +
            `${footprint.signatureSize} bytes`
          );
        }
      });
    }

    if (results.classical?.ecdsa) {
      Object.entries(results.classical.ecdsa).forEach(([curve, data]) => {
        if (data && !data.error && data.signing) {
          const footprint = data.signing?.footprint || { 
            signatureSize: curve === 'prime256v1' ? 64 : curve === 'secp384r1' ? 96 : 132 
          };
          console.log(
            padString(`ECDSA-${curve}`) +
            padString(formatNumber(data.signing.avgTime), 15) +
            padString(data.signing.throughput.toString(), 15) +
            padString(formatNumber(data.signing.successRate, 1), 12) +
            `${footprint.signatureSize} bytes`
          );
        }
      });
    }
  }

  /**
   * Muestra la tabla de verificación de firmas
   * @param {Object} results - Resultados del benchmark
   */
  displayVerificationTable(results) {
    console.log('\n🔍 TABLA 5: VERIFICACIÓN DE FIRMAS');
    console.log(createSeparator(80));
    console.log(padString('Algoritmo') + padString('Tiempo(ms)', 15) + padString('Throughput', 15) + padString('Éxito(%)', 12) + 'Verificación');
    console.log(createSeparator(80));

    // Algoritmos post-cuánticos
    if (results.postQuantum?.mlDsa) {
      Object.entries(results.postQuantum.mlDsa).forEach(([algorithm, data]) => {
        if (data && !data.error && data.verification) {
          console.log(
            padString(algorithm) +
            padString(formatNumber(data.verification.avgTime), 15) +
            padString(data.verification.throughput.toString(), 15) +
            padString(formatNumber(data.verification.successRate, 1), 12) +
            CONFIG.DISPLAY.SUCCESS_ICON
          );
        }
      });
    }

    // Algoritmos clásicos
    if (results.classical?.rsa) {
      Object.entries(results.classical.rsa).forEach(([keySize, data]) => {
        if (data && !data.error && data.verification) {
          console.log(
            padString(`${keySize} (legacy)`) +
            padString(formatNumber(data.verification.avgTime), 15) +
            padString(data.verification.throughput.toString(), 15) +
            padString(formatNumber(data.verification.successRate, 1), 12) +
            CONFIG.DISPLAY.SUCCESS_ICON
          );
        }
      });
    }

    if (results.classical?.ecdsa) {
      Object.entries(results.classical.ecdsa).forEach(([curve, data]) => {
        if (data && !data.error && data.verification) {
          console.log(
            padString(`ECDSA-${curve}`) +
            padString(formatNumber(data.verification.avgTime), 15) +
            padString(data.verification.throughput.toString(), 15) +
            padString(formatNumber(data.verification.successRate, 1), 12) +
            CONFIG.DISPLAY.SUCCESS_ICON
          );
        }
      });
    }
  }

  /**
   * Genera análisis comparativo
   * @param {Object} results - Resultados del benchmark
   */
  generateComparison(results) {
    console.log('\n📊 ANÁLISIS COMPARATIVO');
    console.log(createSeparator(50));

    // Comparación RSA vs ML-KEM (Generación de claves)
    const rsa2048 = results.classical?.rsa?.['RSA-2048'];
    const mlKem512 = results.postQuantum?.mlKem?.['ML-KEM-512'];

    if (rsa2048 && mlKem512 && rsa2048.keyGeneration && mlKem512.keyGeneration) {
      console.log('\n🔐 Generación de Claves - RSA-2048 vs ML-KEM-512 (128 bits):');
      console.log(`     RSA-2048:    ${formatNumber(rsa2048.keyGeneration.avgTime)}ms (${rsa2048.keyGeneration.throughput} ops/s)`);
      console.log(`     ML-KEM-512:  ${formatNumber(mlKem512.keyGeneration.avgTime)}ms (${mlKem512.keyGeneration.throughput} ops/s)`);
      const keygenRatio = rsa2048.keyGeneration.avgTime / mlKem512.keyGeneration.avgTime;
      console.log(`     Ratio:       ${formatNumber(keygenRatio)}x más rápido ML-KEM`);
    }

    // Comparación RSA vs ML-DSA (Firma digital)
    const rsa2048Sign = results.classical?.rsa?.['RSA-2048'];
    const mlDsa44 = results.postQuantum?.mlDsa?.['ML-DSA-44'];

    if (rsa2048Sign && mlDsa44 && rsa2048Sign.signing && mlDsa44.signing) {
      console.log('\n✍️  Firma Digital - RSA-2048 vs ML-DSA-44 (128 bits):');
      console.log(`     RSA-2048:    ${formatNumber(rsa2048Sign.signing.avgTime)}ms (${rsa2048Sign.signing.throughput} ops/s)`);
      console.log(`     ML-DSA-44:   ${formatNumber(mlDsa44.signing.avgTime)}ms (${mlDsa44.signing.throughput} ops/s)`);
      const signRatio = rsa2048Sign.signing.avgTime / mlDsa44.signing.avgTime;
      console.log(`     Ratio:       ${formatNumber(signRatio)}x más rápido ML-DSA`);
    }

    // Comparación RSA vs ML-DSA (Verificación)
    if (rsa2048Sign && mlDsa44 && rsa2048Sign.verification && mlDsa44.verification) {
      console.log('\n🔍 Verificación - RSA-2048 vs ML-DSA-44 (128 bits):');
      console.log(`     RSA-2048:    ${formatNumber(rsa2048Sign.verification.avgTime)}ms (${rsa2048Sign.verification.throughput} ops/s)`);
      console.log(`     ML-DSA-44:   ${formatNumber(mlDsa44.verification.avgTime)}ms (${mlDsa44.verification.throughput} ops/s)`);
      const verifyRatio = rsa2048Sign.verification.avgTime / mlDsa44.verification.avgTime;
      console.log(`     Ratio:       ${formatNumber(verifyRatio)}x más rápido ML-DSA`);
    }

    // Comparación ECDSA vs ML-DSA (Firma digital moderna)
    const ecdsa256 = results.classical?.ecdsa?.['ECDSA-prime256v1'];
    if (ecdsa256 && mlDsa44 && ecdsa256.signing && mlDsa44.signing) {
      console.log('\n✍️  Firma Digital Moderna - ECDSA-256 vs ML-DSA-44 (128 bits):');
      console.log(`     ECDSA-256:   ${formatNumber(ecdsa256.signing.avgTime)}ms (${ecdsa256.signing.throughput} ops/s)`);
      console.log(`     ML-DSA-44:   ${formatNumber(mlDsa44.signing.avgTime)}ms (${mlDsa44.signing.throughput} ops/s)`);
      const modernSignRatio = ecdsa256.signing.avgTime / mlDsa44.signing.avgTime;
      console.log(`     Ratio:       ${formatNumber(modernSignRatio)}x más rápido ECDSA`);
    }
  }

  /**
   * Muestra el encabezado del benchmark
   */
  displayHeader() {
    console.log('🚀 Iniciando Benchmark Simplificado...');
    console.log('');
  }

  /**
   * Muestra el encabezado de algoritmos clásicos
   */
  displayClassicalHeader() {
    console.log('📊 ALGORITMOS CLÁSICOS');
    console.log(createSeparator(50));
  }

  /**
   * Muestra el encabezado de algoritmos post-cuánticos
   */
  displayPostQuantumHeader() {
    console.log('📊 ALGORITMOS POST-CUÁNTICOS');
    console.log(createSeparator(50));
  }
}

export default ResultDisplay;
