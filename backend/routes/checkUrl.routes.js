import express from 'express';
import axios from 'axios';

const router = express.Router();

// Google Safe Browsing API key (add it after registering)
const API_KEY = process.env.GOOGLE_SAFE_BROWSING_API_KEY;

// Endpoint that receives the URL as a query parameter
router.get('/', async (req, res) => {
  const { url } = req.query;

  // Google Safe Browsing API data configuration
  const requestData = {
    client: {
      clientId: 'your-client-id',
      clientVersion: '1.0.0'
    },
    threatInfo: {
      threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
      platformTypes: ['ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: [{ url: url }]
    }
  };

  try {
    // Perform the request to Google Safe Browsing
    const response = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`,
      requestData
    );

    // Send the response (if the URL is safe, it will return an empty object)
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
