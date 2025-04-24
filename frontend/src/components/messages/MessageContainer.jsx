import { useEffect, useState } from "react";
import useConversation from "../../zustand/useConversation";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { TiMessages } from "react-icons/ti";
import { useAuthContext } from "../../context/AuthContext";
import EncryptionVerification from "./EncryptionVerification";
import { FaLock } from "react-icons/fa"; // Icono de candado para cifrado

const MessageContainer = () => {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const [isEncryptionVisible, setIsEncryptionVisible] = useState(false);

  useEffect(() => {
    return () => setSelectedConversation(null);
  }, [setSelectedConversation]);

  const toggleEncryptionPanel = () => {
    setIsEncryptionVisible(!isEncryptionVisible);
  };

  const isCommunity = selectedConversation ? selectedConversation.type === "community" : false;

  return (
    <div className="w-full h-full flex flex-col">
      {!selectedConversation ? (
        <NoChatSelected />
      ) : (
        <>
          {/* Header */}
          <div className="bg-slate-500 px-4 py-2 mb-2 flex justify-between items-center">
            <div className="flex items-center">
              <span className="label-text mr-1">To:</span>
              {isCommunity ? (
                selectedConversation.name
              ) : (
                <>
                  {selectedConversation.username}
                  <FaLock
                    className="text-blue-400 ml-2 cursor-pointer"
                    onClick={toggleEncryptionPanel}
                  />
                </>
              )}
            </div>
          </div>


          {/* Verificación de Cifrado */}
          {!isCommunity && isEncryptionVisible && <EncryptionVerification />}

          {/* Messages */}
          <div className="flex-grow overflow-auto">
            <Messages />
          </div>

          {/* Message Input */}
          <div className="mt-auto relative">
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
      <div className="px-4 text-center sm:text-lg md:text-xl text-gray-200 font-semibold flex flex-col items-center gap-2">
        <p>Welcome 👋 {authUser.username} ❄</p>
        <p>Select a chat or a community to start messaging</p>
        <TiMessages className="text-3xl md:text-6xl text-center" />
      </div>
    </div>
  );
};
