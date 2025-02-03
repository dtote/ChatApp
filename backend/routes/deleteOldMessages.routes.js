import express from 'express';
import deleteMessagesByTime from '../services/messageCleanupService.js';

const router = express.Router();

// Ruta para borrar mensajes según el tiempo seleccionado
router.post('/', async (req, res) => {
  const { timePeriod } = req.body; // Recibe el parámetro timePeriod del frontend

  try {
    if (!timePeriod) {
      return res.status(400).send({ message: 'Falta el parámetro de tiempo.' });
    }

    await deleteMessagesByTime(timePeriod);
    res.status(200).send({ message: `Mensajes eliminados correctamente para el período: ${timePeriod}` });
  } catch (error) {
    res.status(500).send({ message: 'Hubo un error al eliminar los mensajes.' });
  }
});

export default router;
