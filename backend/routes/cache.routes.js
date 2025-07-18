import express from 'express';
import { cryptoCache } from '../utils/cache.js';
import { cryptoMonitor } from '../utils/monitor.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

// Obtener estadísticas del caché
router.get('/stats', protectRoute, (req, res) => {
  try {
    const stats = cryptoCache.getStats();
    res.json({
      success: true,
      data: stats,
      message: 'Cache statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache statistics'
    });
  }
});

// Obtener estadísticas del monitor
router.get('/monitor', protectRoute, (req, res) => {
  try {
    const stats = cryptoMonitor.getStats();
    res.json({
      success: true,
      data: stats,
      message: 'Monitor statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting monitor stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get monitor statistics'
    });
  }
});

// Limpiar todo el caché
router.delete('/clear', protectRoute, (req, res) => {
  try {
    cryptoCache.clear();
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
});

// Limpiar caché expirado
router.post('/cleanup', protectRoute, (req, res) => {
  try {
    cryptoCache.cleanup();
    const stats = cryptoCache.getStats();
    res.json({
      success: true,
      data: stats,
      message: 'Cache cleanup completed successfully'
    });
  } catch (error) {
    console.error('Error cleaning up cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup cache'
    });
  }
});

export default router; 