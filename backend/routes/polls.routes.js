// Endpoint para crear una encuesta
router.post('/poll', async (req, res) => {
  const { pollId, question, options } = req.body; // Recibe ID opcional, pregunta y opciones

  if (!question || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ message: "La encuesta debe tener al menos dos opciones" });
  }

  try {
    // Si se proporciona un ID específico, verifica que no exista una encuesta con ese ID
    if (pollId) {
      const existingPoll = await Poll.findById(pollId);
      if (existingPoll) {
        return res.status(400).json({ message: "Ya existe una encuesta con este ID" });
      }
    }

    const newPoll = new Poll({
      _id: pollId, // Esto puede ser indefinido si no se proporciona, y MongoDB generará uno automáticamente
      question,
      options: options.map(option => ({
        option,
        votes: [] // Inicializa el array de votos vacío para cada opción
      })),
    });

    // Guarda la nueva encuesta en la base de datos
    await newPoll.save();

    res.status(200).json({ message: "Encuesta creada con éxito", poll: newPoll });
  } catch (error) {
    console.error("Error al crear la encuesta:", error);
    res.status(500).json({ message: "Error al crear la encuesta" });
  }
});

// Endpoint para votar en una opción de encuesta
router.post('/vote', async (req, res) => {
  const { pollId, optionIndex, userId, voteValue } = req.body;
  // Verifica si el voto es válido (0 o 1)
  if (![0, 1].includes(voteValue)) {
    return res.status(400).json({ message: "El valor del voto debe ser 0 o 1" });
  }

  try {
    // Encuentra la encuesta por ID
    let poll = await Poll.findById(pollId);

    // Verifica si la encuesta existe
    if (!poll) {
      return res.status(404).json({ message: 'Encuesta no encontrada' });
    }

    // Verifica que el índice de la opción sea válido
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ message: 'Opción inválida' });
    }

    // Verifica si el usuario ya ha votado
    const existingVote = poll.options[optionIndex].votes.find(vote => vote.userId.toString() === userId.toString());
    if (existingVote) {
      return res.status(400).json({ message: 'El usuario ya ha votado en esta opción' });
    }

    // Agrega el voto al array de votos de la opción seleccionada
    poll.options[optionIndex].votes.push({ userId, voteValue });

    // Guarda la encuesta actualizada
    await poll.save();

    res.status(200).json({ message: 'Voto registrado con éxito', poll });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar el voto' });
  }
});

// Endpoint para obtener una encuesta por ID
router.get('/poll/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const poll = await Poll.findById(id);

    if (!poll) {
      return res.status(404).json({ message: 'Encuesta no encontrada' });
    }

    res.status(200).json(poll);
  } catch (error) {
    console.error('Error al obtener la encuesta:', error);
    res.status(500).json({ message: 'Error al obtener la encuesta' });
  }
});

export default router;
