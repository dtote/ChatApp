import express from 'express';
import axios from 'axios';
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    // Extraer los parámetros necesarios desde el cuerpo de la solicitud
    const { kem_name, ciphertext, shared_secret } = req.body;

    // Verificar que se hayan proporcionado los parámetros necesarios
    if (!kem_name || !ciphertext || !shared_secret) {
      return res.status(400).json({ error: 'Faltan parámetros necesarios para el descifrado.' });
    }

    // Hacer la solicitud al servicio de descifrado en el backend (Flask en este caso)
    const response = await axios.post('https://kyber-api-1.onrender.com/decrypt', {
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