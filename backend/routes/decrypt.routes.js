import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { encryptedMessage} = req.body;

    if (!encryptedMessage) {
      return res.status(400).json({ error: 'Texto cifrado no proporcionados.' });
    }

    //console.log('Sending encryptedMessage:', encryptedMessage);
    //console.log('Sending secretKey:', secretKey);

    // Hacer una solicitud a la API Flask
    const response = await fetch('http://127.0.0.1:5001/decrypt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        encryptedMessage
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error });
    }

    const result = await response.json();
    res.json({ decryptedMessage: result.decrypted_message });
  } catch (error) {
    console.error('Error al desencriptar:', error);
    res.status(500).json({ error: 'Error desencriptando el mensaje' });
  }
});


export default router;