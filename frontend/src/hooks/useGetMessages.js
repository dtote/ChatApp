import { useEffect, useState } from "react";
import useConversation from "../zustand/useConversation";
import useSecurity from "../zustand/useSecurity";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, selectedConversation } = useConversation();
  const { selectedKeySize } = useSecurity();
  const { authUser, setAuthUser } = useAuthContext();

  useEffect(() => {
    const getMessages = async () => {
      // Si no hay conversación seleccionada, no hacer nada
      if (!selectedConversation?._id) {
        setLoading(false);
        return;
      }

      // Si no hay usuario autenticado, no hacer nada (estado normal, no es un error)
      if (!authUser) {
        setLoading(false);
        return;
      }

      // Si es el asistente de IA, no hacer fetch (no tiene mensajes en BD)
      if (selectedConversation.type === "ai-assistant") {
        setMessages([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      // Intentar obtener el token de múltiples fuentes
      const chatUser = localStorage.getItem("chat-user");
      const tokenFromStorage = localStorage.getItem("token");
      const token = chatUser ? JSON.parse(chatUser)?.token : tokenFromStorage;

      try {
        const endpoint =
          selectedConversation.type === "community"
            ? `/api/communities/${selectedConversation._id}/messages?selectedKeySize=${selectedKeySize}`
            : `/api/messages/${selectedConversation._id}?selectedKeySize=${selectedKeySize}`;

        const res = await fetch(endpoint, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` })
          }
        });

        // Si el backend rechaza por falta de autenticación, limpiar authUser
        // y dejar que App.jsx redirija automáticamente al login
        if (res.status === 401 || res.status === 403) {
          setAuthUser(null);
          localStorage.removeItem("chat-user");
          localStorage.removeItem("token");
          localStorage.removeItem("sessionId");
          return;
        }

        const data = await res.json();

        if (data.error) throw new Error(data.error);

        setMessages(data);
      } catch (error) {
        // Solo mostrar error si no es un error de autenticación (ya manejado arriba)
        if (error.message && !error.message.includes("401") && !error.message.includes("403")) {
          toast.error(`Error fetching messages: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    getMessages();
  }, [selectedConversation?._id, selectedConversation?.type, selectedKeySize, authUser, setMessages, setAuthUser]);

  return { messages, loading };
};

export default useGetMessages;
