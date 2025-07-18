import crypto from 'crypto';

class CryptoCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 1000; // Máximo 1000 entradas en caché
    this.ttl = 5 * 60 * 1000; // 5 minutos TTL
  }

  // Generar clave única para la operación
  generateKey(operation, data) {
    const dataString = JSON.stringify(data);
    return crypto.createHash('md5').update(`${operation}:${dataString}`).digest('hex');
  }

  // Obtener del caché
  get(operation, data) {
    const key = this.generateKey(operation, data);
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Verificar si ha expirado
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }

  // Guardar en caché
  set(operation, data, value) {
    const key = this.generateKey(operation, data);
    
    // Limpiar caché si está lleno
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  // Limpiar caché expirado
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Limpiar todo el caché
  clear() {
    this.cache.clear();
  }

  // Obtener estadísticas del caché
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl
    };
  }
}

export const cryptoCache = new CryptoCache();

// Limpiar caché expirado cada 5 minutos
setInterval(() => {
  cryptoCache.cleanup();
}, 5 * 60 * 1000); 