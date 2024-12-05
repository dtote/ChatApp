import { useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, selectedConversation } = useConversation();

  const sendMessage = async (formData) => {
    setLoading(true);

    try {
      // Determinar si es una comunidad o una conversación privada
      const endpoint = selectedConversation.type === "community"
        ? `/api/communities/${selectedConversation._id}/messages`
        : `/api/messages/send/${selectedConversation._id}`;
      console.log("Json Data: ", JSON.stringify(formData));
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData, // Convertir formData a JSON
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages([...messages, data]);
    } catch (error) {
      toast.error(`Error sending message: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading };
};

export default useSendMessage;
