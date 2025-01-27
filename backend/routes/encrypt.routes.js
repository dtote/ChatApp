
import express from 'express';


const router = express.Router();

// router.post('/', (req, res) => {
//   try {
//     const { message } = req.body;
//     if (!message) {
//       return res.status(400).json({ error: 'Mensaje no proporcionado.' });
//     }

  
//     // Llamar a la función de encriptado
//     const encryptionResult = addon.encrypt(message);
    
//     // Obtener el mensaje cifrado y la clave secreta
//     const encryptedMessage = encryptionResult.encrypted_message;
//     const secretKey = encryptionResult.secret_key;

//     // Devolver ambos al cliente para almacenarlos
//     res.json({ encryptedMessage, secretKey });
//   } catch (error) {
//     console.error('Error al encriptar:', error);
//     res.status(500).json({ error: 'Error encriptando el mensaje' });
//   }
// });

router.post('/', async (req, res) => {
  const { message } = req.body;

  try {
      // Realizar una solicitud al notebook de Python
      const response = await fetch('http://127.0.0.1:5001/encrypt', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
      });
      // Verificar si la solicitud fue exitosa
      if (!response.ok) {
          throw new Error('Error al cifrar el mensaje en Python');
      }
      // Obtener el mensaje cifrado de la respuesta
      const encryptedMessage = await response.json();
      res.json(encryptedMessage);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error en el procesamiento del mensaje' });
  }
});


export default router;
