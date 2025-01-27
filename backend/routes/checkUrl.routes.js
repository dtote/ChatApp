import express from 'express';
import axios from 'axios';

const router = express.Router();

// Clave de la API de Google Safe Browsing (añádela después de registrarte)
const GOOGLE_API_KEY = 'AIzaSyDbZTdCLMIxdbqmdxx6rsPiSIkbbHPkBAg';

// Endpoint que recibe la URL como query parameter
router.get('/', async (req, res) => {
  const { url } = req.query;

  // Configuración de los datos para la API de Google Safe Browsing
  const postData = {
    client: {
      clientId: "CryptoChatApp",
      clientVersion: "1.5.2"
    },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [
        { url: url }
      ]
    }
  };

  try {
    // Realizar la solicitud a Google Safe Browsing
    const response = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_API_KEY}`,
      postData
    );

    // Enviar la respuesta (si la URL es segura, devolverá un objeto vacío)
    if (Object.keys(response.data).length === 0) {
      res.json({ safe: true, message: 'The URL is safe.' });
    } else {
      res.json({ safe: false, message: 'The URL is potentially dangerous.', details: response.data });
    }
  } catch (error) {
    console.error('Error checking URL:', error);
    res.status(500).json({ error: 'Error checking URL' });
  }
});

export default router;
