import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post("/", async (req, res) => {
  const { messages, systemPrompt } = req.body;

  try {
    const geminiMessages = [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...messages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      }))
    ]

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: geminiMessages
    })

    const botReply = response?.candidates?.[0]?.content?.parts?.[0]?.text // "No se pudo generar una respuesta"
    res.json({ response: botReply });

  } catch (err) {
    console.error("Gemini error:", err?.message || err);
    res.status(500).json({ error: "Fallo al generar respuesta" });
  }
});

export default router;
