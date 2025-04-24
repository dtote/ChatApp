import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", async (req, res) => {
  const { messages, systemPrompt } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-05-13",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ]
    });
    res.json({ response: completion.choices[0].message.content });
  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ error: "Fallo al generar respuesta" });
  }
});

export default router;
