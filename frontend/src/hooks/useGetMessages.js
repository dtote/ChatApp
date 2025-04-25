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

      const token = JSON.parse(localStorage.getItem("chat-user"))?.token;

      if (!token) {
        toast.error("No authentication token found");
        setLoading(false);
        return;
      }

      try {
        const endpoint =
          selectedConversation.type === "community"
            ? `/api/communities/${selectedConversation._id}/messages?selectedKeySize=${selectedKeySize}`
            : `/api/messages/${selectedConversation._id}?selectedKeySize=${selectedKeySize}`;

        const res = await fetch(endpoint, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
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
  }, [selectedConversation?._id, selectedConversation?.type, selectedKeySize, setMessages]);

  return { messages, loading };
};

export default useGetMessages;
