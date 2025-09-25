import { useEffect, useState } from "react";
import useConversation from "../../zustand/useConversation";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { TiMessages } from "react-icons/ti";
import { useAuthContext } from "../../context/AuthContext";
import EncryptionVerification from "./EncryptionVerification";
import { FaLock, FaTimes } from "react-icons/fa"; // Icono de candado para cifrado

const MessageContainer = () => {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const [isEncryptionVisible, setIsEncryptionVisible] = useState(false);

  useEffect(() => {
    return () => setSelectedConversation(null);
  }, [setSelectedConversation]);

  const toggleEncryptionPanel = () => {
    setIsEncryptionVisible(!isEncryptionVisible);
  };

  const closeConversation = () => {
    setSelectedConversation(null);
  };

  const isCommunity = selectedConversation ? selectedConversation.type === "community" : false;
  const isAIConversation = selectedConversation ? selectedConversation.type === "ai-assistant" : false;

  return (
    <div className="w-full h-full flex flex-col">
      {!selectedConversation ? (
        <NoChatSelected />
      ) : (
        <>
          {/* Header - Solo mostrar para conversaciones normales, no para IA */}
          {!isAIConversation && (
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center">
                <span className="text-gray-600 mr-2 font-medium">To:</span>
                {isCommunity ? (
                  <span className="text-gray-800 font-semibold">{selectedConversation.name}</span>
                ) : (
                  <div className="flex items-center">
                    <span className="text-gray-800 font-semibold">{selectedConversation.username}</span>
                    <FaLock
                      className="text-blue-500 ml-2 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={toggleEncryptionPanel}
                    />
                  </div>
                )}
              </div>
              {/* Botón para cerrar conversación */}
              <button
                onClick={closeConversation}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                title="Close conversation"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Encryption Verification - Solo para conversaciones normales */}
          {!isCommunity && !isAIConversation && isEncryptionVisible && (
            <div className="flex-shrink-0">
              <EncryptionVerification />
            </div>
          )}

          {/* Messages - with minimum height to ensure input is visible */}
          <div className="flex-1 overflow-auto min-h-0">
            <Messages />
          </div>

          {/* Message Input - always visible at the bottom */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-white">
            <MessageInput />
          </div>
        </>
      )}
    </div>
  );
};

export default MessageContainer;

const NoChatSelected = () => {
  const { authUser } = useAuthContext();

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Icono principal */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
        </div>

        {/* Welcome message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, <span className="text-blue-600">{authUser?.username || 'User'}</span>! 👋
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-600 mb-8">
          Ready to connect? Choose a conversation or join a community to start messaging.
        </p>

        {/* Visual indicators */}
        <div className="flex justify-center space-x-4 text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">Online</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm">Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
};
