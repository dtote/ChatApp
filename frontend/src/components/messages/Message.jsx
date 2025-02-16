import { useEffect, useState, useMemo } from "react";
import { useAuthContext } from "../../context/AuthContext";
import useConversation from "../../zustand/useConversation.js";
import { useSocketContext } from "../../context/SocketContext"; 
import { FaLock, FaLockOpen } from "react-icons/fa"; 
import { extractTime } from "../../utils/extractTime.js";
import useSecurity from '../../zustand/useSecurity.js'
import axios from 'axios';
import './Message.css';

const decryptMessage = async (ciphertext, sharedSecret, selectedKeySize) => {
  try {
    const response = await axios.post('https://chatapp-7lh7.onrender.com/api/decrypt', {
      kem_name: selectedKeySize,
      ciphertext: ciphertext,
      shared_secret: sharedSecret,
    });
    return response.data.decryptedMessage;
  } catch (error) {
    console.error("Error al descifrar el mensaje:", error.message);
    return null;
  }
};

const Message = ({ message }) => {
  const { authUser } = useAuthContext();
  const { selectedConversation } = useConversation();
  const { socket } = useSocketContext();
  const fromMe = message.senderId === authUser._id;
  const formattedTime = extractTime(message.createdAt);
  const chatClassName = fromMe ? "chat-end" : "chat-start";
  const bubbleBgColor = fromMe ? "bg-blue-500" : "";
  const [messages, setMessages] = useState([message]);
  const [urlStatus, setUrlStatus] = useState({});
  const [profilePic, setProfilePic] = useState(
    fromMe ? authUser.profilePic : 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg'
  );
  const urlPattern = useMemo(() => /(https?:\/\/[^\s]+)/g, []);
  const pdfUrl = `https://localhost:4000${message.fileUrl}`;
  const { selectedKeySize } = useSecurity(state => state);
  const [userData, setUserData] = useState({
    email: "",
    username: "",
    publicKey: "",
    sharedElements: "Elementos compartidos"
  });

  useEffect(() => {
    if (!fromMe) {
      fetchProfilePic(message.senderId);
    }

    if (socket) {
      socket.on("newMessage", async (newMsg) => {
        const decryptedMessage = await decryptMessage(newMsg.message, newMsg.sharedSecret, selectedKeySize);
        if (decryptedMessage) {
          setMessages((prev) => [
            ...prev.filter(msg => msg._id !== newMsg._id), 
            { ...newMsg, message: decryptedMessage }, 
          ]);
        } else {
          console.error("No se pudo descifrar el mensaje");
        }
      });
    }

    if (typeof message.message === 'string') {
      const urls = message.message.match(urlPattern);
      if (urls) {
        urls.forEach((url) => {
          checkUrlSafety(url);
        });
      }
    }
  }, [message.senderId, selectedConversation?.type, socket, message.message, selectedKeySize]);

  const fetchProfilePic = async (senderId) => {
    try {
      const response = await fetch(`https://localhost:4000/api/users/${senderId}/profile-pic`);
      if (response.ok) {
        const data = await response.json();
        setProfilePic(data.profilePic || 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg');
      }
    } catch (error) {
      console.error("Error en la solicitud fetch:", error);
    }
  };

  const checkUrlSafety = (url) => {
    const normalizedUrl = url.toLowerCase();
    const isHttps = normalizedUrl.startsWith('https://');
    const containsDangerousKeywords = ['troyano', 'malware', 'virus', 'phishing', 'scam'].some(keyword => normalizedUrl.includes(keyword));
    const urlFormatValid = /^(https?:\/\/)?([\da-z.-]+\.[a-z.]{2,6})([/\w .-]*)*\/?$/.test(normalizedUrl);
    const isSafe = isHttps && !containsDangerousKeywords && urlFormatValid;
    setUrlStatus((prev) => ({
      ...prev,
      [url]: isSafe ? true : false,
    }));
  };

  const handleEncryptMessage = () => {
    const encryptedMessage = btoa(message.message);
    const signedMessage = `${encryptedMessage}.signedBy-${authUser.username}`;
    return signedMessage;
  };

  return (
    <>
      <div className={`chat ${chatClassName}`}>
        <div className='chat-image avatar'>
          <div className='w-10 rounded-full'>
            <img alt='Perfil' src={profilePic} />
          </div>
        </div>
        <div className={`chat-bubble text-white ${bubbleBgColor}`}>
          {
            
            (
              console.log("Mensajes a imprimir:", message),
              message.message || '').split(urlPattern).map((part, index) => {
            const urlMatch = part.match(urlPattern);
            if (urlMatch) {
              const url = urlMatch[0];
              return (
                <span key={index}>
                  {urlStatus[url] !== undefined ? (
                    <>
                      {urlStatus[url] ? (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-green-500">
                          {url}
                        </a>
                      ) : (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="red">
                          {url}
                        </a>
                      )}
                      {urlStatus[url] ? (
                        <FaLock className="inline-block text-green-500 ml-1" />
                      ) : (
                        <FaLockOpen className="inline-block red ml-1" />
                      )}
                    </>
                  ) : (
                    <span>{url}</span>
                  )}
                </span>
              );
            }
            return part;
          })}
          {message.fileUrl && message.fileUrl.endsWith('.pdf') && (
            <div className="iframe-container mt-2">
              <iframe src={pdfUrl} width="100%" height="300px" />
            </div>
          )}
        </div>
        <div className='chat-footer opacity-50 text-xs flex gap-1 items-center'>{formattedTime}</div>
      </div>
    </>
  );
};

export default Message;
