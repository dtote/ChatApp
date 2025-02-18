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
  const [showEncrypted, setShowEncrypted] = useState(false);
  const [messages, setMessages] = useState([message]);
  const [showPopup, setShowPopup] = useState(false); // Estado para controlar la visibilidad del popup
  const [urlStatus, setUrlStatus] = useState({});
  const [profilePic, setProfilePic] = useState(
    fromMe ? authUser.profilePic : 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg'
  );
  const urlPattern = useMemo(() => /(https?:\/\/[^\s]+)/g, []);
  const pdfUrl = `https://chatapp-7lh7.onrender.com/${message.fileUrl}`;
  
  console.log("Imagen del usuario autenticado:", authUser.profilePic);

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

    if (showPopup) {
      fetchUserData(message.senderId); // Llamada al abrir el popup
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
      const response = await fetch(`https://chatapp-7lh7.onrender.com/api/users/${senderId}/profile-pic`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setProfilePic(data.profilePic || 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg');
        console.log("Imagen de perfil:", data.profilePic);
      }
    } catch (error) {
      console.error("Error en la solicitud fetch:", error);
    }
  };

  const fetchUserData = async (userId) => {
    try {
      const response = await fetch(`https://chatapp-7lh7.onrender.com/api/users/${userId}/popup-data`);
      if (response.ok) {
        const data = await response.json();
        setUserData({
          email: data.email,
          username: data.username,
          publicKey: data.publicKey,
          sharedElements: "Elementos compartidos" // Puedes cambiarlo si es dinámico
        });
      } else {
        console.error("Error al obtener los datos del usuario");
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
      <div className={`chat ${chatClassName}`} onDoubleClick={() => setShowEncrypted(!showEncrypted)}>
        <div className='chat-image avatar' onClick={() => setShowPopup(true)}>
          <div className='w-10 rounded-full'>
            <img alt='Perfil' src={profilePic} />
          </div>
        </div>
        <div className={`chat-bubble text-white ${bubbleBgColor}`}>
               {showEncrypted ? (
            <span className="text-yellow-500">{handleEncryptMessage()}</span>
          ) : (
            <>
              {(message.message || '').split(urlPattern).map((part, index) => {
                const urlMatch = part.match(urlPattern);
                if (urlMatch) {
                  const url = urlMatch[0];
                  return (
                    <span key={index}>
                      {urlStatus[url] !== undefined ? (
                        <>
                          {urlStatus[url] ? (
                            <a href={url} key={`url-${index}`} target="_blank" rel="noopener noreferrer" className="text-green-500">
                              {url}
                            </a>
                          ) : (
                            <a href={url} key={`url-${index}`} target="_blank" rel="noopener noreferrer" className="red">
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
              { message.fileUrl && message.fileUrl.endsWith('.pdf') && (
                <div className="iframe-container mt-2">
                  <iframe src={pdfUrl} width="100%" height="300px" />
                </div>
              )}
            </>
          )}
        </div>
        <div className='chat-footer opacity-50 text-xs flex gap-1 items-center'>{formattedTime}</div>
      </div>

      {showPopup && (
        <div className="bg-white fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg max-w-md mx-auto">
            <h2 className="text-center text-2xl font-bold mb-4">Información del Usuario</h2>
            <div className="text-center flex justify-center mb-4">
              <img
                src={profilePic}
                alt="Foto de Perfil"
                className="w-10 h-10 rounded-full"
              />
            </div>
            <p className="text-center"><strong>Email:</strong> {userData.email}</p>
            <p className="text-center"><strong>Apodo:</strong> {userData.username}</p>
            <p className="text-center ajustText"><strong>Clave pública:</strong> {userData.publicKey}</p>
            <p className="text-center"><strong>Elementos compartidos:</strong> {userData.sharedElements || 'No hay elemento compartidos'}</p>
            <button
              className="text-center mt-4 bg-blue-500 text-white py-2 px-4 rounded"
              onClick={() => setShowPopup(false)}
            >
            Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Message;