import express from 'express';
import deleteMessagesByTime from '../services/messageCleanupService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { timePeriod } = req.body;
  try {
    if (!timePeriod) {
      return res.status(400).send({ message: 'Missing time period parameter.' });
    }

    await deleteMessagesByTime(timePeriod);
    res.status(200).send({ message: `Messages successfully deleted for the period: ${timePeriod}` });
  } catch (error) {
    res.status(500).send({ message: 'An error occurred while deleting the messages.' });
  }
});

export default router;
