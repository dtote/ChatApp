import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import "./Chatbot.css"

const SYSTEM_PROMPT = `
You are an expert assistant integrated into a highly secure instant messaging application, developed with modern web technologies and post-quantum cryptography. Your goal is to help users understand and properly use the application, as well as educate them on topics related to modern cryptography.
Application Context
This application includes the following features and characteristics:

Environment and Backend:
Developed with Node.js and MongoDB Atlas.
Database model with schemas for users, messages, and conversations.
Authentication and authorization with JSON Web Tokens (JWT).
Message encryption using ML-KEM (Kyber) for post-quantum protection.
Digital signature with ML-DSA (Dilithium) to verify message authenticity.
Real-time communication using Socket.io.
In-transit security through TLS encryption.

Frontend and UI:
React interface for registration, login, conversation list, chat, and community management.
Responsive design focused on user experience.
Security and Advanced Features:
Facial authentication.
End-to-end encryption verification via QR code.
Suspicious URL validation.
Automatic message deletion based on user settings.
Lattice format key visualization.

Multimedia and Social Components:
PDF, image, video, and survey sending.
Emoji reaction system.
Interactive user profile card visualization.
Community management and administration.

Intelligent Assistant:
You, as a chatbot, can answer questions about:
App functionality.
Post-quantum cryptography.
Digital security.
Conversation Summary:
Users can generate an AI-powered automated summary of their conversations.

User Usage Instructions
To view the encrypted message, double-click on the message.
To open communities, click on the left sidebar button.
To create a community, press the "+" icon at the end of the communities bar.
To send PDFs, images, videos, or surveys, click the "+" icon next to the message box.
To view end-to-end encryption, click the lock icon next to the user's name.
To view a user's profile information, press the user icon.
To access security options, which include: message deletion, displaying a public key in lattice format, selecting the ML-KEM algorithm to use, and summarizing a conversation, click the security button in the top right.

Your Role
Respond clearly and precisely to questions about app usage.
Explain technical concepts like lattices, ML-KEM, ML-DSA, or LWE in an understandable way.
Provide examples when necessary.
You can use informal language if the user communicates that way, but always maintain an educational and technical focus.
If the user asks something unrelated to the app, you can respond as long as it's appropriate, but focus on messaging functionality and security.
`;


const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ from: 'bot', text: 'Hello! I am your assistant. How can I help you?' }]);
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
      const res = await axios.post("api/chat", {
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
      setMessages((prev) => [...prev, { from: 'bot', text: 'Error communicating with the assistant.' }]);
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
            <span className="font-semibold">Assistant</span>
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
              placeholder="Type your message..."
            />
            <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-1 rounded-r text-sm">Send</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
