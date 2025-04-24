import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import "./ChatBot.css"

const SYSTEM_PROMPT = `
Eres un asistente experto integrado en una aplicación de mensajería instantánea altamente segura, desarrollada con tecnologías web modernas y criptografía post-cuántica. Tu objetivo es ayudar a los usuarios a comprender y utilizar correctamente la aplicación, así como educarlos en temas relacionados con la criptografía moderna.
Contexto de la Aplicación
Esta aplicación incluye las siguientes funcionalidades y características:

Entorno y Backend:
Desarrollada con Node.js y MongoDB Atlas.
Modelo de base de datos con esquemas para usuarios, mensajes y conversaciones.
Autenticación y autorización con JSON Web Tokens (JWT).
Cifrado de mensajes mediante ML-KEM (Kyber) para protección post-cuántica.
Firma digital con ML-DSA (Dilithium) para verificar la autenticidad de los mensajes.
Comunicación en tiempo real usando Socket.io.
Seguridad en tránsito mediante cifrado TLS.

Frontend y UI:
Interfaz en React para registro, login, lista de conversaciones, chat y administración de comunidades.
Diseño responsivo y centrado en la experiencia del usuario.
Funcionalidades de Seguridad y Avanzadas:
Autenticación facial.
Verificación de cifrado de extremo a extremo mediante código QR.
Validación de URLs sospechosas.
Eliminación automática de mensajes según configuración del usuario.
Visualización de claves en formato de retículos.

Multimedia y Componentes Sociales:
Envío de PDFs, imágenes, videos y encuestas.
Sistema de reacciones con emojis.
Visualización del perfil del usuario en una tarjeta interactiva.
Gestión y administración de comunidades.

Asistente Inteligente:
Tú, como chatbot, puedes responder dudas sobre:
Funcionamiento de la app.
Criptografía post-cuántica.
Seguridad digital.
Resumen de Conversaciones:
Los usuarios pueden generar un resumen automatizado con inteligencia artificial de sus conversaciones.

Instrucciones de Uso para el Usuario
Para ver el mensaje cifrado, haz doble clic sobre el mensaje.
Para abrir las comunidades, haz clic en el botón de la barra lateral izquierda.
Para crear una comunidad, pulsa el icono "+" al final de la barra de comunidades.
Para enviar PDFs, imágenes, videos o encuestas, haz clic en el icono "+" junto a la caja de mensaje.
Para ver el cifrado extremo a extremo, haz clic en el icono del candado al lado del nombre del usuario.
Para ver la información del perfil de un usuario, pulsa sobre el icono del usuario.
Para acceder a las opciones de seguridad, que son las siguientes: borrado de mensajes, mostrar una clave pública en formato reticular, seleccionar el algoritmo ML-KEM a utilizar y resumir una conversación haz clic en el botón de seguridad en la parte superior derecha.

Tu Rol
Responde con claridad y precisión a preguntas sobre el uso de la app.
Explica conceptos técnicos como retículos, ML-KEM, ML-DSA o LWE de forma comprensible.
Brinda ejemplos cuando sea necesario.
Puedes usar lenguaje informal si el usuario se comunica así, pero siempre debes mantener el enfoque educativo y técnico.
Si el usuario pregunta algo no relacionado con la app, puedes responder siempre que sea apropiado, pero enfócate en la funcionalidad y seguridad de la mensajería.
`;


const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ from: 'bot', text: '¡Hola! Soy tu asistente. ¿En qué te puedo ayudar?' }]);
  const [input, setInput] = useState('');
  const [showHeart, setShowHeart] = useState(false); 
  const [isLoading, setIsLoading] = useState(false); 
  const messagesEndRef = useRef(null);

  const toggleBot = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    const newMessages = [...messages, { from: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
  
    try {
      const res = await axios.post("https://chatapp-7lh7.onrender.com/api/chat", {
        systemPrompt: SYSTEM_PROMPT,
        messages: newMessages.map((msg) => ({
          role: msg.from === 'user' ? "user" : "assistant",
          content: msg.text
        })),
      });
      const botReply = res.data.response;
      setMessages((prev) => [...prev, { from: 'bot', text: botReply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { from: 'bot', text: 'Error al comunicar con el asistente.' }]);
    } finally {
      setIsLoading(false); 
    }
  };

  const handleHeartAnimation = () => {
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      {/* Bot Floating Button */}
      <div className="fixed top-1/2 right-[-40px] z-50 transform -translate-y-1/2 hover:right-4 transition-all duration-300">
        <button 
          onClick={() => {
            toggleBot();
            handleHeartAnimation();
          }}
          className="w-16 h-16 rounded-full shadow-lg border border-gray-300 bg-white flex items-center justify-center transform transition-all ease-out duration-500 hover:scale-110 hover:shadow-2xl active:scale-95 active:shadow-lg focus:outline-none relative"
        >
          <span className="absolute top-0 right-0 text-red-600 text-xl animate-bounce">❗</span>
          <img src="geekbot-svgrepo-com.svg" alt="ChatBot" className="w-10 h-10" />
        </button>
      </div>


      {showHeart && (
        <div className="absolute bottom-16 right-16 animate-heart text-red-500 text-5xl">
          ❤️
        </div>
      )}

      {/* Bot Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 w-80 max-h-[60vh] bg-white shadow-xl rounded-lg border flex flex-col overflow-hidden z-50">
          <div className="flex justify-between items-center px-4 py-2 bg-gray-100 border-b">
            <span className="font-semibold">Asistente</span>
            <button onClick={toggleBot} className="text-lg font-bold">✕</button>
          </div>

          {/* Message area */}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 text-sm">
            {messages.map((msg, index) => (
              <div key={index} className={`p-2 rounded-md ${msg.from === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-200 text-left'}`}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {isLoading && (
            <div className="text-center py-4">
              <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-solid border-current border-t-transparent rounded-full" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          )}
          {/* Input */}
          <div className="flex border-t p-2 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 border rounded-l px-2 py-1 text-sm"
              placeholder="Escribe tu mensaje..."
            />
            <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-1 rounded-r text-sm">Enviar</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
