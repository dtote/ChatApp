/**
 * Utilidades del Benchmark
 * Funciones auxiliares para cálculos estadísticos y operaciones comunes
 */

import { CONFIG } from './config.js';

/**
 * Calcula la mediana de un array de números
 * @param {number[]} arr - Array de números
 * @returns {number} Mediana
 */
export function median(arr) {
  if (arr.length === 0) return 0;
  const sorted = arr.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Calcula la desviación estándar de un array de números
 * @param {number[]} arr - Array de números
 * @param {number} mean - Media del array
 * @returns {number} Desviación estándar
 */
export function standardDeviation(arr, mean) {
  if (arr.length === 0) return 0;
  const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

/**
 * Calcula métricas estadísticas de un array de tiempos
 * @param {number[]} times - Array de tiempos en milisegundos
 * @returns {Object} Objeto con métricas estadísticas
 */
export function calculateMetrics(times) {
  if (times.length === 0) {
    return {
      avgTime: 0,
      minTime: 0,
      maxTime: 0,
      medianTime: 0,
      stdDev: 0,
      throughput: 0,
      successRate: 0
    };
  }

  // Filtrar valores válidos y asegurar mínimo de 0.001ms
  const validTimes = times.filter(t => t > 0).map(t => Math.max(t, 0.001));

  if (validTimes.length === 0) {
    return {
      avgTime: 0,
      minTime: 0,
      maxTime: 0,
      medianTime: 0,
      stdDev: 0,
      throughput: 0,
      successRate: 0
    };
  }

  const avgTime = validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length;
  const minTime = Math.min(...validTimes);
  const maxTime = Math.max(...validTimes);
  const medianTime = median(validTimes);
  const stdDev = standardDeviation(validTimes, avgTime);
  const throughput = avgTime > 0 ? Math.round(1000 / avgTime) : 0;
  const successRate = (validTimes.length / times.length) * 100;

  return {
    avgTime: parseFloat(avgTime.toFixed(CONFIG.DISPLAY.DECIMAL_PLACES)),
    minTime: parseFloat(minTime.toFixed(CONFIG.DISPLAY.DECIMAL_PLACES)),
    maxTime: parseFloat(maxTime.toFixed(CONFIG.DISPLAY.DECIMAL_PLACES)),
    medianTime: parseFloat(medianTime.toFixed(CONFIG.DISPLAY.DECIMAL_PLACES)),
    stdDev: parseFloat(stdDev.toFixed(CONFIG.DISPLAY.DECIMAL_PLACES)),
    throughput,
    successRate: parseFloat(successRate.toFixed(1))
  };
}

/**
 * Genera un delay aleatorio para retry con backoff exponencial
 * @param {number} attempt - Número de intento (0-based)
 * @param {number} baseDelay - Delay base en milisegundos
 * @returns {number} Delay en milisegundos
 */
export function getRetryDelay(attempt, baseDelay = CONFIG.API.RETRY_DELAY) {
  const jitter = Math.random() * 0.1 * baseDelay; // 10% de jitter
  return Math.min(baseDelay * Math.pow(2, attempt) + jitter, 10000); // Max 10 segundos
}

/**
 * Formatea un número con el número de decimales especificado
 * @param {number} num - Número a formatear
 * @param {number} decimals - Número de decimales
 * @returns {string} Número formateado
 */
export function formatNumber(num, decimals = CONFIG.DISPLAY.DECIMAL_PLACES) {
  return parseFloat(num.toFixed(decimals));
}

/**
 * Crea una línea separadora para tablas
 * @param {number} length - Longitud de la línea
 * @param {string} char - Carácter a usar
 * @returns {string} Línea separadora
 */
export function createSeparator(length = 80, char = CONFIG.DISPLAY.TABLE_SEPARATOR) {
  return char.repeat(length);
}

/**
 * Pads una cadena a la longitud especificada
 * @param {string} str - Cadena a pad
 * @param {number} length - Longitud deseada
 * @param {string} padChar - Carácter de padding
 * @returns {string} Cadena con padding
 */
export function padString(str, length = CONFIG.DISPLAY.PADDING_LENGTH, padChar = ' ') {
  return String(str).padEnd(length, padChar);
}

/**
 * Valida que un objeto tenga las propiedades requeridas
 * @param {Object} obj - Objeto a validar
 * @param {string[]} requiredProps - Propiedades requeridas
 * @returns {boolean} True si todas las propiedades están presentes
 */
export function validateObject(obj, requiredProps) {
  return requiredProps.every(prop => obj.hasOwnProperty(prop));
}

/**
 * Genera un timestamp único para archivos
 * @returns {string} Timestamp en formato ISO
 */
export function generateTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

/**
 * Crea un directorio si no existe
 * @param {string} dirPath - Ruta del directorio
 */
export async function ensureDirectoryExists(dirPath) {
  const fs = await import('fs');
  try {
    await fs.promises.access(dirPath);
  } catch {
    await fs.promises.mkdir(dirPath, { recursive: true });
  }
}

export default {
  median,
  standardDeviation,
  calculateMetrics,
  getRetryDelay,
  formatNumber,
  createSeparator,
  padString,
  validateObject,
  generateTimestamp,
  ensureDirectoryExists
};
