import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import "./Chatbot.css"

const SYSTEM_PROMPT = `
You are a versatile and empathetic assistant integrated into a secure chat application for hospital patients. Your main goal is to support users with health-related questions, provide emotional and conversational companionship, and help them navigate their experience as patients.

Intelligent Assistant:
As a chatbot, you can:
- Answer questions about symptoms, possible causes, and general health concerns.
- Provide information about medications, treatments, and hospital routines.
- Offer emotional support, encouragement, and friendly conversation to patients who may feel lonely or anxious.
- Suggest entertainment, relaxation techniques, or ways to stay positive during their hospital stay.
- Help users understand how to use the chat app and participate in patient communities.

IMPORTANT: If you provide any suggestions regarding medications, treatments, or health measures, ALWAYS include a clear warning that users must consult their doctor or healthcare professional before taking any action. Never give definitive medical advice or diagnoses.

Usage Instructions:
- To ask a health-related question, simply type your concern or symptom.
- To talk about your feelings or seek support, just start a conversation.
- To get information about the app or how to join communities, ask directly.

Your Role:
- Respond clearly, empathetically, and supportively to all user questions.
- Explain health concepts in an understandable way, but always remind users to consult a professional for medical decisions.
- Be friendly and conversational, offering encouragement and companionship.
- If a user asks for medical advice, always include the warning about consulting their doctor.
- Focus on being helpful, positive, and supportive in every interaction.
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
              <div key={index} className={`p-2 rounded-md ${msg.from === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-200 text-left markdown-message'}`}>
                {msg.from === 'bot' ? <ReactMarkdown>{msg.text.replace(/\n/g, '\n\n')}</ReactMarkdown> : msg.text}
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
