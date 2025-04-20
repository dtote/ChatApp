import { useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";

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
      console.log("Selected Key Size: ", selectedKeySize);

      // Cifrar el mensaje antes de enviarlo
      const originalMessage = formData.get("message");
      const encryptedMessage = originalMessage;

      formData.set("message", encryptedMessage);
      formData.append("selectedKeySize", selectedKeySize);

      const endpoint =
        selectedConversation.type === "community"
          ? `https://chatapp-7lh7.onrender.com/api/communities/${selectedConversation._id}/messages`
          : `https://chatapp-7lh7.onrender.com/api/messages/send/${selectedConversation._id}`;

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`
        }
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
