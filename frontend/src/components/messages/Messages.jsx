import useGetMessages from "../../hooks/useGetMessages";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import Message from "./Message";
import useListenMessages from "../../hooks/useListenMessages";
import useConversation from "../../zustand/useConversation";
import { useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";

const Messages = () => {
  const { messages: rawMessages, loading } = useGetMessages();
  const { selectedConversation, setSelectedConversation } = useConversation();
  const messagesEndRef = useRef(null);

  useListenMessages();

  // Asegurar que messages sea siempre un array
  const messages = Array.isArray(rawMessages) ? rawMessages : [];



  // Scroll to bottom when messages change
  useEffect(() => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Error scrolling to bottom:", error);
    }
  }, [messages]);

  const closeConversation = () => {
    setSelectedConversation(null);
  };

  if (loading && selectedConversation?.type !== "ai-assistant") {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="loading loading-spinner"></span>
      </div>
    )
  }

  // Si es una conversación con IA, mostrar siempre la información del asistente
  if (selectedConversation?.type === "ai-assistant") {
    return (
      <div className='px-4 flex-1 overflow-auto'>
        {/* Health Assistant Header - Siempre visible */}
        <div className="flex flex-col justify-center items-center py-6 border-b border-gray-200 relative">
          {/* Botón para cerrar conversación */}
          <button
            onClick={closeConversation}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100"
            title="Close conversation"
          >
            <FaTimes className="w-5 h-5" />
          </button>

          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <img src="/geekbot-svgrepo-com.svg" alt="Health Assistant" className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Health Assistant</h3>
            <p className="text-gray-600 mb-4">
              Hello! I'm your health assistant. I can help you with health-related questions,
              provide emotional support, and assist you with using this app.
            </p>
            <p className="text-sm text-gray-500">
              Ask me anything - I'm here to help! 💙
            </p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="py-4">
          {messages.length > 0 && messages.map((message, idx) => {
            try {
              return <Message key={message._id || idx} message={message} />;
            } catch (error) {
              return null;
            }
          })}
        </div>

        {/* Scroll to bottom reference */}
        <div ref={messagesEndRef} />
      </div>
    );
  }

  // Para conversaciones normales, usar el flujo original
  return (
    <div className='px-4 flex-1 overflow-auto'>
      {messages.length > 0 && messages.map((message, idx) => {
        try {
          return <Message key={message._id || idx} message={message} />;
        } catch (error) {
          return null;
        }
      })}

      {messages.length === 0 && (
        <div className="flex justify-center items-center h-full">
          <p className='text-center text-gray-500'>Send a message to start the conversation</p>
        </div>
      )}

      {/* Scroll to bottom reference */}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default Messages;