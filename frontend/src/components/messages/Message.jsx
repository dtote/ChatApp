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

    return response.data?.decryptedMessage ?? null;
  } catch (error) {
    console.error("Error al descifrar el mensaje:", error?.response?.data || error.message);
    return null;
  }
};

const checkUrlSafety = async (url, setUrlStatus) => {
  const normalizedUrl = url.toLowerCase();

  const isHttps = normalizedUrl.startsWith('https://');
  const containsDangerousKeywords = ['troyano', 'malware', 'virus', 'phishing', 'scam'].some(keyword =>
    normalizedUrl.includes(keyword)
  );
  const urlFormatValid = /^(https?:\/\/)?([\da-z.-]+\.[a-z.]{2,6})([/\w .-]*)*\/?$/.test(normalizedUrl);

  const isSafe = isHttps && !containsDangerousKeywords && urlFormatValid;

  setUrlStatus(prev => ({
    ...prev,
    [url]: isSafe
  }));
};

const PublicKeyDisplay = ({ publicKey }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar la clave:", err);
    }
  };

  return (
    <div className="text-center">
      <p
        onClick={handleCopy}
        className="cursor-pointer text-sm text-gray-700 bg-gray-100 p-2 rounded hover:bg-gray-200 max-w-xs mx-auto break-words"
        title="Haz clic para copiar la clave completa"
      >
        <strong>Public Key:</strong> {publicKey?.slice(0, 20)}...
      </p>
      {copied && <p className="text-green-500 text-sm mt-1">¡Copied Key!</p>}
    </div>
  );
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
  const [showPopup, setShowPopup] = useState(false);
  const [urlStatus, setUrlStatus] = useState({});
  const profilePic = fromMe ? authUser.profilePic : selectedConversation?.profilePic;

  const urlPattern = useMemo(() => /(https?:\/\/[^\s]+)/g, []);

  const { selectedKeySize } = useSecurity(state => state);
  const [userData, setUserData] = useState({
    email: "",
    username: "",
    publicKey: "",
    sharedElements: "Elementos compartidos"
  });

  let isPoll = false;
  let pollQuestion = '';
  let pollOptions = [];

  try {
    if (typeof message.message === 'string' && message.message.includes('"type":"poll"')) {
      const jsonStart = message.message.indexOf('{');
      const jsonEnd = message.message.lastIndexOf('}') + 1;
      const jsonStr = message.message.slice(jsonStart, jsonEnd);
      const parsedPoll = JSON.parse(jsonStr);

      if (parsedPoll && parsedPoll.type === 'poll' && parsedPoll.question && parsedPoll.options) {
        isPoll = true;
        pollQuestion = parsedPoll.question;
        pollOptions = parsedPoll.options;
      }
    }
  } catch (err) {
    console.error("Could not analyze the survey:", err);
  }

  const [pollOptionsState, setPollOptionsState] = useState(pollOptions);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleVote = async () => {
    if (selectedOption !== null) {
      try {
        const response = await axios.post('https://chatapp-7lh7.onrender.com/api/poll/vote', {
          pollId: message._id,
          optionIndex: selectedOption,
        });

        setPollOptionsState(response.data.options);
        if (response.status === 200) {
          pollOptions = response.data.options;
        }
      } catch (error) {
        console.error("Error al registrar el voto:", error);
      }
    }
  };

  useEffect(() => {
    if (showPopup) {
      fetchUserData(message.senderId);
    }

    if (typeof message.message === 'string') {
      const urls = message.message.match(urlPattern);
      if (urls) {
        urls.forEach((url) => {
          if (!(url in urlStatus)) {
            setUrlStatus(prev => ({ ...prev, [url]: null }));
            checkUrlSafety(url, setUrlStatus);
          }
        });
      }
    }

    const initializePoll = async () => {
      if (isPoll && message._id) {
        try {
          const pollExists = await axios.get(`https://chatapp-7lh7.onrender.com/api/poll/${message._id}`);
          if (pollExists.status === 200) {
            pollOptions = pollExists.data.options;
          }
        } catch (err) {
          if (err.response && err.response.status === 404) {
            await axios.post('https://chatapp-7lh7.onrender.com/api/poll', {
              pollId: message._id,
              question: pollQuestion,
              options: pollOptions.map(opt => opt.option || opt),
            });

            setPollOptionsState(pollOptions);
          } else {
            console.error("Error to verify or create survey:", err);
          }
        }
      }
    };

    initializePoll();

    if (socket) {
      const handleNewMessage = async (newMsg) => {
        const decryptedMessage = await decryptMessage(newMsg.message, newMsg.sharedSecret, selectedKeySize, pollOptions, pollQuestion);
        if (decryptedMessage) {
          setMessages((prev) => [
            ...prev.filter(msg => msg._id !== newMsg._id),
            { ...newMsg, message: decryptedMessage },
          ]);
        } else {
          console.error("No se pudo descifrar el mensaje");
        }
      };

      socket.on("newMessage", handleNewMessage);
      return () => {
        socket.off("newMessage", handleNewMessage); // evitar múltiples suscripciones
      };
    }
  }, [isPoll, showPopup, message.senderId, urlPattern, urlStatus, setUrlStatus, selectedConversation?.type, socket, message.message, selectedKeySize]);

  const fetchUserData = async (userId) => {
    try {
      const response = await fetch(`https://chatapp-7lh7.onrender.com/api/users/${userId}/popup-data`);
      if (response.ok) {
        const data = await response.json();
        setUserData({
          email: data.email,
          username: data.username,
          publicKey: data.publicKey,
          sharedElements: "Elementos compartidos"
        });
      } else {
        console.error("Error al obtener los datos del usuario");
      }
    } catch (error) {
      console.error("Error en la solicitud fetch:", error);
    }
  };

  return (
    <>
      <div className={`chat ${chatClassName}`} onDoubleClick={() => setShowEncrypted(!showEncrypted)}>
        <div className="chat-image avatar" onClick={() => setShowPopup(true)}>
          <div className="w-10 rounded-full">
            <img alt="Profile" src={profilePic} />
          </div>
        </div>
        <div className={`chat-bubble text-white ${bubbleBgColor}`}>
          {showEncrypted ? (
            <span className="text-yellow-500">{message.message}</span>
          ) : isPoll ? (
            <form className="w-full bg-white p-4 rounded shadow-md mt-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{pollQuestion}</h3>
              <div className="flex flex-col gap-2">
                {Array.isArray(pollOptionsState) && pollOptionsState.length > 0 && pollOptionsState.map((option, idx) => (
                  <label key={idx} className="flex items-center gap-2 text-gray-700">
                    <input 
                      type="radio" 
                      className="form-checkbox h-4 w-4 text-blue-600" 
                      value={idx}
                      onChange={(e) =>  setSelectedOption(parseInt(e.target.value))}
                    />
                    <span>{option.option}</span>
                    <span className="ml-auto">{option.votes} votes</span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                className={`mt-4 bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-4 rounded shadow `}
                onClick={handleVote}
                
              >
              Send Vote
              </button>
            </form>
          ) : message.fileUrl ? (
            message.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <img
                src={`https://chatapp-7lh7.onrender.com${message.fileUrl}`}
                alt="imagen enviada"
                className="max-w-xs rounded shadow"
              />
            ) : message.fileUrl.match(/\.(mp4|webm|ogg)$/i) ? (
              <video
                src={`https://chatapp-7lh7.onrender.com${message.fileUrl}`}
                controls
                className="max-w-xs rounded shadow"
              />
            ) : message.fileUrl.match(/\.pdf$/i) ? (
              <iframe
                src={`https://chatapp-7lh7.onrender.com${message.fileUrl}`}
                title="PDF enviado"
                className="w-full h-64 rounded shadow"
              />
            ) : (
              <a
                href={`https://chatapp-7lh7.onrender.com${message.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-200 underline"
              >
                Attachment File
              </a>
            )
          ) : (message.message || '').split(urlPattern).map((part, index) => {
              const urlMatch = part.match(urlPattern);
              if (urlMatch) {
                const url = urlMatch[0];
                const status = urlStatus[url];

                return (
                  <span key={index}>
                    {status === null && (
                      <>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-yellow-500">
                          {url}
                        </a>
                        <span className="ml-1 text-yellow-500 italic">Analizando...</span>
                      </>
                    )}
                    {status === true && (
                      <>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-green-500">
                          {url}
                        </a>
                        <FaLock className="inline-block text-green-500 ml-1" />
                      </>
                    )}
                    {status === false && (
                      <>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-red-500 underline">
                          {url}
                        </a>
                        <FaLockOpen className="inline-block text-red-500 ml-1" />
                      </>
                    )}
                  </span>
                );
              }
              return <span key={index}>{part}</span>;
            })
          }
        </div>
        <div className="chat-footer opacity-50 text-xs flex gap-1 items-center">{formattedTime}</div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg max-w-md mx-auto">
            <h2 className="text-center text-2xl font-bold mb-4">User Data</h2>
            <div className="text-center flex justify-center mb-4">
              <img
                src={profilePic}
                alt="Foto de Perfil"
                className="w-10 h-10 rounded-full"
              />
            </div>
            <p className="text-center"><strong>Email:</strong> {userData.email}</p>
            <p className="text-center"><strong>Alias:</strong> {userData.username}</p>
            <PublicKeyDisplay publicKey={userData.publicKey} />
            <p className="text-center"><strong>Shared Elements:</strong> {userData.sharedElements || 'No hay elementos compartidos'}</p>
            <button
              className="text-center mt-4 bg-blue-500 text-white py-2 px-4 rounded"
              onClick={() => setShowPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Message;
