import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import useConversation from "../zustand/useConversation";
import useSecurity from "../zustand/useSecurity";
import notificationSound from "../assets/sounds/notification.mp3";
import axios from "axios";

const decryptMessage = async (ciphertext, sharedSecret, selectedKeySize) => {
  try {
    const response = await axios.post("/api/decrypt", {
      kem_name: selectedKeySize,
      ciphertext,
      shared_secret: sharedSecret,
    });
    return response.data?.decryptedMessage ?? null;
  } catch (error) {
    console.error("Error al descifrar el mensaje:", error?.response?.data || error.message);
    return null;
  }
};

export const useListenMessages = () => {
  const { socket } = useSocketContext();
  const { setMessages } = useConversation();
  const { selectedKeySize } = useSecurity();

  useEffect(() => {
	if (!socket) return;
  
	const handleNewMessage = async (newMessage) => {
	  newMessage.shouldShake = true;
	  new Audio(notificationSound).play();
  
	  let decryptedText = null;
	  if (newMessage.message && newMessage.sharedSecret) {
		try {
		  decryptedText = await decryptMessage(
			newMessage.message,
			newMessage.sharedSecret,
			selectedKeySize
		  );
		} catch (err) {
		  console.warn("Fallo en la desencriptación");
		}
	  }
  
	  const constructedMessage = {
		...newMessage,
		message: decryptedText || newMessage.message,
	  };
  
	  const currentMessages = useConversation.getState().messages;
	  setMessages([...currentMessages, constructedMessage]);
	};
  
	socket.off("newMessage");
	socket.on("newMessage", handleNewMessage);
  
	return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedKeySize, setMessages]);
  
};

export default useListenMessages;
