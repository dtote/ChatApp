import express from 'express';
import Poll from '../models/polls.model.js';

const router = express.Router();

// Endpoint to create a poll
router.post('/poll', async (req, res) => {
  const { pollId, question, options } = req.body; // Receives optional ID, question, and options

  if (!question || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ message: "The poll must have at least two options" });
  }

  try {
    // If a specific ID is provided, verify that a poll with that ID doesn't exist
    if (pollId) {
      const existingPoll = await Poll.findById(pollId);
      if (existingPoll) {
        return res.status(400).json({ message: "A poll with this ID already exists" });
      }
    }

    const newPoll = new Poll({
      _id: pollId, // This can be undefined if not provided, and MongoDB will generate one automatically
      question,
      options: options.map(option => ({
        option,
        votes: [] // Initialize empty votes array for each option
      })),
    });

    // Save the new poll to the database
    await newPoll.save();

    res.status(200).json({ message: "Poll created successfully", poll: newPoll });
  } catch (error) {
    console.error("Error creating poll:", error);
    res.status(500).json({ message: "Error creating poll" });
  }
});

// Endpoint to vote on a poll option
router.post('/vote', async (req, res) => {
  const { pollId, optionIndex, userId, voteValue } = req.body;
  // Verify if the vote is valid (0 or 1)
  if (![0, 1].includes(voteValue)) {
    return res.status(400).json({ message: "The vote value must be 0 or 1" });
  }

  try {
    // Find the poll by ID
    let poll = await Poll.findById(pollId);

    // Verify if the poll exists
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Verify that the option index is valid
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ message: 'Invalid option' });
    }

    // Verify if the user has already voted
    const existingVote = poll.options[optionIndex].votes.find(vote => vote.userId.toString() === userId.toString());
    if (existingVote) {
      return res.status(400).json({ message: 'The user has already voted on this option' });
    }

    // Add the vote to the votes array of the selected option
    poll.options[optionIndex].votes.push({ userId, voteValue });

    // Save the updated poll
    await poll.save();

    res.status(200).json({ message: 'Vote registered successfully', poll });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering vote' });
  }
});

// Endpoint to get a poll by ID
router.get('/poll/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const poll = await Poll.findById(id);

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    res.status(200).json(poll);
  } catch (error) {
    console.error('Error getting poll:', error);
    res.status(500).json({ message: 'Error getting poll' });
  }
});

export default router;
