import { cryptoCache } from './cache.js';

class CryptoMonitor {
  constructor() {
    this.stats = {
      totalOperations: 0,
      cacheHits: 0,
      cacheMisses: 0,
      rateLimitErrors: 0,
      otherErrors: 0,
      startTime: Date.now()
    };
  }

  // Registrar una operación
  recordOperation(type, success = true, cacheHit = false, errorType = null) {
    this.stats.totalOperations++;
    
    if (cacheHit) {
      this.stats.cacheHits++;
    } else {
      this.stats.cacheMisses++;
    }

    if (!success) {
      if (errorType === 'rate_limit') {
        this.stats.rateLimitErrors++;
      } else {
        this.stats.otherErrors++;
      }
    }

    // Log cada 100 operaciones
    if (this.stats.totalOperations % 100 === 0) {
      this.logStats();
    }
  }

  // Obtener estadísticas
  getStats() {
    const uptime = Date.now() - this.stats.startTime;
    const cacheHitRate = this.stats.totalOperations > 0 
      ? (this.stats.cacheHits / this.stats.totalOperations * 100).toFixed(2)
      : 0;
    
    const errorRate = this.stats.totalOperations > 0
      ? (this.stats.rateLimitErrors / this.stats.totalOperations * 100).toFixed(2)
      : 0;

    return {
      ...this.stats,
      uptime: Math.floor(uptime / 1000), // segundos
      cacheHitRate: `${cacheHitRate}%`,
      errorRate: `${errorRate}%`,
      cacheStats: cryptoCache.getStats()
    };
  }

  // Log de estadísticas
  logStats() {
    const stats = this.getStats();
    console.log('📊 [CryptoMonitor] Statistics:', {
      totalOperations: stats.totalOperations,
      cacheHitRate: stats.cacheHitRate,
      errorRate: stats.errorRate,
      rateLimitErrors: stats.rateLimitErrors,
      cacheSize: stats.cacheStats.size,
      uptime: `${stats.uptime}s`
    });
  }

  // Resetear estadísticas
  reset() {
    this.stats = {
      totalOperations: 0,
      cacheHits: 0,
      cacheMisses: 0,
      rateLimitErrors: 0,
      otherErrors: 0,
      startTime: Date.now()
    };
  }
}

export const cryptoMonitor = new CryptoMonitor();

// Log de estadísticas cada 5 minutos
setInterval(() => {
  cryptoMonitor.logStats();
}, 5 * 60 * 1000); 