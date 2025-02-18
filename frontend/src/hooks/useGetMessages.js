import { useEffect, useState } from "react";
import useConversation from "../zustand/useConversation";
import useSecurity from "../zustand/useSecurity";
import toast from "react-hot-toast";

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, selectedConversation } = useConversation();
  const { selectedKeySize } = useSecurity();
  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);

      try {
        // Determinar si es una comunidad o una conversación privada
			
        const endpoint = selectedConversation.type === "community"
        ? `https://chatapp-7lh7.onrender.com/api/communities/${selectedConversation._id}/messages?selectedKeySize=${selectedKeySize}`
        : `https://chatapp-7lh7.onrender.com/api/messages/${selectedConversation._id}?selectedKeySize=${selectedKeySize}`;

        const res = await fetch(endpoint, {
          credentials: "include",
        });
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
