import express from 'express';
import axios from 'axios';
import { ENV_CONFIG } from '../config/environment.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    // Extract the necessary parameters from the request body
    const { kem_name, ciphertext, shared_secret } = req.body;

    // Verify that the necessary parameters have been provided
    if (!kem_name || !ciphertext || !shared_secret) {
      return res.status(400).json({ error: 'Faltan parámetros necesarios para el descifrado.' });
    }

    // Hacer la solicitud al servicio de descifrado en el backend (Flask en este caso)
    const response = await axios.post(`${ENV_CONFIG.PQCLEAN_API_URL}/decrypt`, {
      kem_name,  // El nombre de la clave de cifrado (como 'ML-KEM-512')
      ciphertext, // El mensaje cifrado
      shared_secret, // La clave secreta compartida
    });

    // Si la respuesta es exitosa, devolver el mensaje descifrado
    if (response.data && response.data.original_message) {
      return res.json({ decryptedMessage: response.data.original_message });
    } else {
      return res.status(500).json({ error: 'No se pudo descifrar el mensaje.' });
    }

  } catch (error) {
    console.error('Error al desencriptar:', error);
    res.status(500).json({ error: 'Error desencriptando el mensaje.' });
  }
});

export default router;