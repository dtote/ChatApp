
import express from 'express';


const router = express.Router();

router.post('/', async (req, res) => {
  const { message, receiverPublicKey, kemName } = req.body;

  if (!message || !receiverPublicKey || !kemName) {
    return res.status(400).json({ error: 'Missing required fields: message, receiverPublicKey, or kemName' });
  }

  try {
    // Send a request to the Python notebook
    const encryptionResponse = await axios.post('http://localhost:5003/encrypt', {
      kem_name: kemName,
      message,
      public_key: receiverPublicKey,
    });

    // Check if the request was successful
    if (encryptionResponse.status !== 200) {
      throw new Error('Failed to encrypt the message using Python');
    }

    const { ciphertext, shared_secret } = encryptionResponse.data;
    res.json({ ciphertext, shared_secret });
  } catch (error) {
    console.error('Error while processing encrypted message:', error.message);
    res.status(500).json({ error: 'An error occurred while processing the message' });
  }
});


export default router;
