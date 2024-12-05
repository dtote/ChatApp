import { useEffect, useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, selectedConversation } = useConversation();

  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);

      try {
        // Determinar si es una comunidad o una conversación privada
			
        const endpoint = selectedConversation.type === "community"
          ? `/api/communities/${selectedConversation._id}/messages`
          : `/api/messages/${selectedConversation._id}`;

        const res = await fetch(endpoint);
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        setMessages(data);
      } catch (error) {
        toast.error(`Error fetching messages: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (selectedConversation?._id) getMessages();
  }, [selectedConversation?._id, selectedConversation?.type, setMessages]);

  return { messages, loading };
};

export default useGetMessages;
