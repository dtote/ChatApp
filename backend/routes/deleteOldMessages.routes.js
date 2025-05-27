import express from 'express';
import deleteMessagesByTime from '../services/messageCleanupService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { timePeriod } = req.body;
  
  const validTimePeriods = ['1day', '7days', '30days'];
  
  try {
    if (!timePeriod) {
      return res.status(400).json({ 
        error: 'Missing time period parameter.',
        validPeriods: validTimePeriods 
      });
    }

    if (!validTimePeriods.includes(timePeriod)) {
      return res.status(400).json({ 
        error: 'Invalid time period.',
        message: `Time period must be one of: ${validTimePeriods.join(', ')}`,
        received: timePeriod
      });
    }

    const result = await deleteMessagesByTime(timePeriod);
    res.status(200).json({ 
      message: `Messages successfully deleted for the period: ${timePeriod}`,
      result
    });
  } catch (error) {
    console.error('Error in deleteOldMessages route:', error);
    res.status(500).json({ 
      error: 'An error occurred while deleting the messages.',
      details: error.message
    });
  }
});

export default router;
