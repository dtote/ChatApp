import express from 'express';
import Poll from '../models/polls.model.js'
const router = express.Router();

// Endpoint to create a poll
router.post('/poll', async (req, res) => {
  const { pollId, question, options } = req.body; // Receive optional ID, question, and options

  if (!question || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ message: "The poll must have at least two options" });
  }

  try {
    // If a specific ID is provided, check that no poll already exists with that ID
    if (pollId) {
      const existingPoll = await Poll.findById(pollId);
      if (existingPoll) {
        return res.status(400).json({ message: "A poll with this ID already exists" });
      }
    }

    const newPoll = new Poll({
      _id: pollId, // This can be undefined if not provided, and MongoDB will generate one automatically
      question,
      options: options.map(option => ({ option, votes: 0 })),
    });

    // Save the new poll to the database
    await newPoll.save();

    res.status(200).json({ message: "Poll created successfully", poll: newPoll });
  } catch (error) {
    console.error("Error creating poll:", error);
    res.status(500).json({ message: "Error creating the poll" });
  }
});

// Endpoint to vote on a poll option
router.post('/vote', async (req, res) => {
  const { pollId, optionIndex } = req.body; // Receive poll ID and selected option index

  try {
    // Try to find the poll by ID
    let poll = await Poll.findById(pollId);

    // Ensure the option index is valid
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ message: 'Invalid option selected' });
    }

    // Increment the vote count for the selected option
    poll.options[optionIndex].votes += 1;

    // Save the updated poll
    await poll.save();

    res.status(200).json(poll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering the vote' });
  }
});

// Get a poll by ID
router.get('/poll/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const poll = await Poll.findById(id);
    
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    res.status(200).json(poll);
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({ message: 'Error fetching the poll' });
  }
});


export default router;