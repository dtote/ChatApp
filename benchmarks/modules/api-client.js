/**
 * Cliente de API para PQClean
 * Maneja todas las comunicaciones con la API de PQClean
 */

import axios from 'axios';
import { CONFIG } from './config.js';
import { getRetryDelay } from './utils.js';

export class APIClient {
  constructor() {
    this.baseURL = CONFIG.API.URL;
    this.timeout = CONFIG.API.TIMEOUT;
    this.maxRetries = CONFIG.API.MAX_RETRIES;
  }

  /**
   * Realiza una petición con reintentos automáticos
   * @param {Function} requestFn - Función que realiza la petición
   * @returns {Promise<any>} Respuesta de la petición
   */
  async makeRequestWithRetry(requestFn) {
    let lastError;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        // No reintentar en el último intento
        if (attempt === this.maxRetries) {
          break;
        }

        // Verificar si es un error de red que vale la pena reintentar
        if (this.shouldRetry(error)) {
          const delay = getRetryDelay(attempt);
          console.log(`   ⚠️  Error en intento ${attempt + 1}, reintentando en ${delay}ms...`);
          await this.sleep(delay);
        } else {
          break;
        }
      }
    }

    throw lastError;
  }

  /**
   * Determina si un error debe ser reintentado
   * @param {Error} error - Error ocurrido
   * @returns {boolean} True si debe reintentarse
   */
  shouldRetry(error) {
    if (error.code === 'ECONNRESET' || 
        error.code === 'ECONNREFUSED' || 
        error.code === 'ETIMEDOUT' ||
        error.message.includes('timeout')) {
      return true;
    }
    return false;
  }

  /**
   * Pausa la ejecución por un tiempo determinado
   * @param {number} ms - Milisegundos a esperar
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Verifica la salud de la API
   * @returns {Promise<boolean>} True si la API está disponible
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: CONFIG.API.HEALTH_CHECK_TIMEOUT,
        headers: { 'Connection': 'keep-alive' }
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Asegura que la API esté disponible con múltiples intentos
   * @param {number} maxAttempts - Número máximo de intentos
   * @returns {Promise<boolean>} True si la API está disponible
   */
  async ensureApiHealth(maxAttempts = 5) {
    for (let i = 0; i < maxAttempts; i++) {
      if (await this.checkHealth()) {
        return true;
      }
      
      if (i < maxAttempts - 1) {
        console.log(`   🔄 Intento ${i + 1}/${maxAttempts} - Esperando API...`);
        await this.sleep(2000);
      }
    }
    return false;
  }

  // ===== MÉTODOS ESPECÍFICOS DE LA API =====

  /**
   * Genera claves ML-KEM
   * @param {string} variant - Variante de ML-KEM
   * @returns {Promise<Object>} Respuesta con las claves
   */
  async generateMLKEMKeys(variant) {
    return this.makeRequestWithRetry(async () => {
      const response = await axios.post(`${this.baseURL}/generate_keys`, {
        kem_name: variant
      }, {
        timeout: this.timeout,
        headers: { 'Connection': 'keep-alive' }
      });
      return response.data;
    });
  }

  /**
   * Genera claves ML-DSA
   * @param {string} variant - Variante de ML-DSA
   * @returns {Promise<Object>} Respuesta con las claves
   */
  async generateMLDSAKeys(variant) {
    return this.makeRequestWithRetry(async () => {
      const response = await axios.post(`${this.baseURL}/generate_ml_dsa_keys`, {
        ml_dsa_variant: variant
      }, {
        timeout: this.timeout,
        headers: { 'Connection': 'keep-alive' }
      });
      return response.data;
    });
  }

  /**
   * Firma un mensaje con ML-DSA
   * @param {string} message - Mensaje a firmar
   * @param {string} privateKey - Clave privada
   * @param {string} variant - Variante de ML-DSA
   * @returns {Promise<Object>} Respuesta con la firma
   */
  async signMLDSA(message, privateKey, variant) {
    return this.makeRequestWithRetry(async () => {
      const response = await axios.post(`${this.baseURL}/sign`, {
        message,
        private_key: privateKey,
        ml_dsa_variant: variant
      }, {
        timeout: this.timeout,
        headers: { 'Connection': 'keep-alive' }
      });
      return response.data;
    });
  }

  /**
   * Verifica una firma ML-DSA
   * @param {string} message - Mensaje original
   * @param {string} signature - Firma a verificar
   * @param {string} publicKey - Clave pública
   * @param {string} variant - Variante de ML-DSA
   * @returns {Promise<Object>} Respuesta con el resultado de verificación
   */
  async verifyMLDSA(message, signature, publicKey, variant) {
    return this.makeRequestWithRetry(async () => {
      const response = await axios.post(`${this.baseURL}/verify`, {
        message,
        signature,
        public_key: publicKey,
        ml_dsa_variant: variant
      }, {
        timeout: this.timeout,
        headers: { 'Connection': 'keep-alive' }
      });
      return response.data;
    });
  }
}

export default APIClient;
