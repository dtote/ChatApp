import { useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";
import axios from "axios";

const SYSTEM_PROMPT = `
You are a versatile and empathetic assistant integrated into a secure chat application for hospital patients. Your main goal is to support users with health-related questions, provide emotional and conversational companionship, and help them navigate their experience as patients.

Intelligent Assistant:
As a chatbot, you can:
- Answer questions about symptoms, possible causes, and general health concerns.
- Provide information about medications, treatments, and hospital routines.
- Offer emotional support, encouragement, and friendly conversation to patients who may feel lonely or anxious.
- Suggest entertainment, relaxation techniques, or ways to stay positive during their hospital stay.
- Help users understand how to use the chat app and participate in patient communities.

IMPORTANT: If you provide any suggestions regarding medications, treatments, or health measures, ALWAYS include a clear warning that users must consult their doctor or healthcare professional before taking any action. Never give definitive medical advice or diagnoses.

Usage Instructions:
- To ask a health-related question, simply type your concern or symptom.
- To talk about your feelings or seek support, just start a conversation.
- To get information about the app or how to join communities, ask directly.

Your Role:
- Respond clearly, empathetically, and supportively to all user questions.
- Explain health concepts in an understandable way, but always remind users to consult a professional for medical decisions.
- Be friendly and conversational, offering encouragement and companionship.
- If a user asks for medical advice, always include the warning about consulting their doctor.
- Focus on being helpful, positive, and supportive in every interaction.
`;

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, selectedConversation } = useConversation();

  const sendMessage = async (formData, selectedKeySize) => {
    setLoading(true);

    const token = JSON.parse(localStorage.getItem("chat-user"))?.token;

    if (!token) {
      toast.error("No authentication token found");
      setLoading(false);
      return;
    }

    try {


      // Si es una conversación con IA, usar el endpoint de chat
      if (selectedConversation.type === "ai-assistant") {
        const originalMessage = formData.get("message");

        if (!originalMessage.trim()) {
          setLoading(false);
          return;
        }



        // Crear mensaje del usuario con formato compatible
        const userMessage = {
          _id: Date.now().toString(), // ID temporal
          message: originalMessage,
          senderId: "user",
          createdAt: new Date().toISOString(),
          shouldShake: false
        };

        // Agregar mensaje del usuario inmediatamente
        const currentMessages = Array.isArray(messages) ? messages : [];
        const updatedMessages = [...currentMessages, userMessage];
        setMessages(updatedMessages);

        // Enviar mensaje al endpoint de chat
        try {
          const res = await axios.post("api/chat", {
            systemPrompt: SYSTEM_PROMPT,
            messages: [
              ...currentMessages.map((msg) => ({
                role: msg.senderId === "user" ? "user" : "assistant",
                content: msg.message
              })),
              {
                role: "user",
                content: originalMessage
              }
            ],
          });

          console.log("AI response:", res.data);
          const botReply = res.data.response;

          // Crear mensaje del bot con formato compatible
          const botMessage = {
            _id: (Date.now() + 1).toString(), // ID temporal
            message: botReply,
            senderId: "ai-assistant",
            createdAt: new Date().toISOString(),
            shouldShake: false
          };

          // Agregar respuesta del bot
          setMessages([...updatedMessages, botMessage]);

        } catch (error) {
          console.error("Error calling AI endpoint:", error);
          toast.error("Error communicating with Health Assistant");
        }

        setLoading(false);
        return;
      }

      // Para conversaciones normales, usar el flujo existente
      const originalMessage = formData.get("message");
      const encryptedMessage = originalMessage;

      formData.set("message", encryptedMessage);
      formData.append("selectedKeySize", selectedKeySize);

      const endpoint =
        selectedConversation.type === "community"
          ? `/api/communities/${selectedConversation._id}/messages`
          : `/api/messages/send/${selectedConversation._id}`;

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const currentMessages = Array.isArray(messages) ? messages : [];
      setMessages([...currentMessages, data]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(`Error sending message: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    sendMessage,
    loading
  };
};

export default useSendMessage;
