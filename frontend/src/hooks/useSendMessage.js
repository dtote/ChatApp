import { useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, selectedConversation } = useConversation();

  const sendMessage = async (formData, selectedKeySize) => {
    setLoading(true);

    try {
      console.log("Selected Key Size: ", selectedKeySize);

      // Cifrar el mensaje antes de enviarlo
      const originalMessage = formData.get('message');
      const encryptedMessage = originalMessage;

      // Reemplazar el mensaje con la versión cifrada
      formData.set('message', encryptedMessage);
      formData.append('selectedKeySize', selectedKeySize); // Agregar el tamaño de la clave

      // Determinar el endpoint
      const endpoint = selectedConversation.type === "community"
        ? `api/communities/${selectedConversation._id}/messages`
        : `api/messages/send/${selectedConversation._id}`;

      // Debugging: Ver contenido de formData antes de enviarlo
      // for (let pair of formData.entries()) {
      //   console.log(pair[0] + ': ' + pair[1]);
      // }

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData, // Enviar como FormData
        credentials: "include"
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
