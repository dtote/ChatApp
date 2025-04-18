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
        <strong>Clave pública:</strong> {publicKey?.slice(0, 20)}...
      </p>
      {copied && <p className="text-green-500 text-sm mt-1">¡Clave copiada!</p>}
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
  const pdfUrl = `https://chatapp-7lh7.onrender.com${message.fileUrl}`;

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
    console.error("No se pudo analizar la encuesta:", err);
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
    if (!fromMe) {
      fetchProfilePic(message.senderId);
    }

    if (showPopup) {
      fetchUserData(message.senderId);
    }

    const initializePoll = async () => {
      if (isPoll && message._id) {
        try {
          const pollExists = await axios.get(`https://chatapp-7lh7.onrender.com/api/poll/${message._id}`);
          if (pollExists.status === 200) {
            // Si existe, actualizamos las opciones por si tienen votos
            pollOptions = pollExists.data.options;
          }
        } catch (err) {
          if (err.response && err.response.status === 404) {
            // No existe, así que la creamos
            await axios.post('https://chatapp-7lh7.onrender.com/api/poll', {
              pollId: message._id,
              question: pollQuestion,
              options: pollOptions.map(opt => opt.option || opt), // por si vienen como strings o objetos
            });

            setPollOptionsState(pollOptions);

          } else {
            console.error("Error al verificar o crear la encuesta:", err);
          }
        }
      }
    };

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

    initializePoll();

  }, [isPoll, showPopup, message.senderId, selectedConversation?.type, socket, message.message, selectedKeySize]);

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
            <img alt="Perfil" src={profilePic} />
          </div>
        </div>
        <div className={`chat-bubble text-white ${bubbleBgColor}`}>
          {showEncrypted ? (
            <span className="text-yellow-500">{message.message}</span>
          ) : isPoll ? (
            <form className="w-full bg-white p-4 rounded shadow-md mt-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{pollQuestion}</h3>
              <div className="flex flex-col gap-2">
                {pollOptionsState.map((option, idx) => (
                  <label key={idx} className="flex items-center gap-2 text-gray-700">
                    <input 
                      type="radio" 
                      className="form-checkbox h-4 w-4 text-blue-600" 
                      value={idx}
                      onChange={(e) =>  setSelectedOption(parseInt(e.target.value))}
                    />
                    <span> {option.option}</span>
                    <span className="ml-auto">{option.votes} votos</span>
                  </label>
                ) )}
              </div>
              <button
                type="button"
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-4 rounded shadow"
                onClick={handleVote}
              >
                Enviar voto
              </button>
            </form>
          ) : (
            <span>{message.message}</span>
          )}
        </div>
        <div className="chat-footer opacity-50 text-xs flex gap-1 items-center">{formattedTime}</div>
      </div>
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
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
            <PublicKeyDisplay publicKey={userData.publicKey} />
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
