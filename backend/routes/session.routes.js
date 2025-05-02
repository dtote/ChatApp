import express from 'express';
import Session from '../models/session.model.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

router.get('/', protectRoute, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.id });
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sessions' });
  }
});

router.delete('/:sessionId', protectRoute, async (req, res) => {
    try {
      console.log('Revoking session:', req.params.sessionId);
      const session = await Session.findOne({ _id: req.params.sessionId, userId: req.user.id });
  
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
  
      await session.deleteOne();
      res.json({ message: 'Session revoked' });
    } catch (err) {
      console.error('Error in session revoke route:', err);
      res.status(500).json({ message: 'Error revoking session' });
    }
  });
  

export default router;
