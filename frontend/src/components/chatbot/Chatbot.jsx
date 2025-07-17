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
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isWindowDragging, setIsWindowDragging] = useState(false);
  const [windowDragOffset, setWindowDragOffset] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef(null);
  const bubbleRef = useRef(null);
  const chatWindowRef = useRef(null);
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const clickCountRef = useRef(0);
  const clickTimeoutRef = useRef(null);

  // Detect mobile device and set position accordingly
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      if (mobile) {
        // Fixed position for mobile (bottom right corner, accounting for header)
        setPosition({ x: window.innerWidth - 80 - 20, y: window.innerHeight - 80 - 20 });
      } else {
        // Load saved position for desktop
        const savedPosition = localStorage.getItem('chatbot-position');
        if (savedPosition) {
          try {
            const parsedPosition = JSON.parse(savedPosition);
            setPosition(parsedPosition);
          } catch (error) {
            console.error('Error loading chatbot position:', error);
            setDefaultPosition();
          }
        } else {
          setDefaultPosition();
        }
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const setDefaultPosition = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const bubbleSize = 64;

    const defaultX = viewportWidth - bubbleSize - 20;
    const defaultY = viewportHeight - bubbleSize - 20;

    setPosition({ x: defaultX, y: defaultY });
  };

  // Save position to localStorage whenever it changes (desktop only)
  useEffect(() => {
    if (!isMobile && (position.x !== 0 || position.y !== 0)) {
      localStorage.setItem('chatbot-position', JSON.stringify(position));
    }
  }, [position, isMobile]);

  const toggleBot = () => {
    setIsOpen(!isOpen);
  };

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

        // Drag functionality (desktop only)
  const handleMouseDown = (e) => {
    if (isOpen || isMobile) return;

    setIsDragging(true);
    isDraggingRef.current = true;
    setHasMoved(false);
    hasMovedRef.current = false;

    const rect = bubbleRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    // Mark that we've moved
    if (!hasMoved) {
      setHasMoved(true);
      hasMovedRef.current = true;
    }

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const bubbleSize = 64;

    const constrainedX = Math.max(0, Math.min(newX, viewportWidth - bubbleSize));
    const constrainedY = Math.max(0, Math.min(newY, viewportHeight - bubbleSize));

    setPosition({ x: constrainedX, y: constrainedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    isDraggingRef.current = false;

    if (isOpen) {
      adjustChatWindowPosition();
    }
  };

  // Chat window drag functionality
  const handleWindowMouseDown = (e) => {
    if (isMobile) return;

    setIsWindowDragging(true);

    const rect = chatWindowRef.current.getBoundingClientRect();
    setWindowDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleWindowMouseMove = (e) => {
    if (!isWindowDragging) return;

    const newX = e.clientX - windowDragOffset.x;
    const newY = e.clientY - windowDragOffset.y;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const windowWidth = 500; // Chat window width
    const windowHeight = Math.min(window.innerHeight * 0.7, 600); // Chat window height

    const constrainedX = Math.max(0, Math.min(newX, viewportWidth - windowWidth));
    const constrainedY = Math.max(0, Math.min(newY, viewportHeight - windowHeight));

    setPosition({ x: constrainedX, y: constrainedY });
  };

  const handleWindowMouseUp = () => {
    setIsWindowDragging(false);
  };

    const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Only open if we haven't moved significantly
    if (!hasMoved && !isDraggingRef.current) {
      toggleBot();
      handleHeartAnimation();
    }
  };

      // Click handler with different behavior for mobile/desktop
  const handleBubbleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isMobile) {
      // Single click for mobile
      toggleBot();
      handleHeartAnimation();
      return;
    }

    // Desktop: double click detection
    if (hasMovedRef.current) {
      return;
    }

    clickCountRef.current += 1;

    // Clear existing timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    // Set timeout for double click detection
    clickTimeoutRef.current = setTimeout(() => {
      if (clickCountRef.current === 1) {
      } else if (clickCountRef.current === 2) {
        toggleBot();
        handleHeartAnimation();
      }
      clickCountRef.current = 0;
    }, 300); // 300ms for double click detection
  };

      const adjustChatWindowPosition = () => {
    const chatWindowWidth = 500;
    const chatWindowHeight = Math.min(window.innerHeight * 0.8, 600);
    const bubbleSize = 64;

    let adjustedX = position.x;
    let adjustedY = position.y + 80;

    // Adjust horizontal position - keep bubble visible
    if (adjustedX + chatWindowWidth > window.innerWidth) {
      // Position window to the left of the bubble
      adjustedX = position.x - chatWindowWidth - 20;

      // If still not visible, position at the right edge
      if (adjustedX < 0) {
        adjustedX = window.innerWidth - chatWindowWidth - 20;
      }
    }
    if (adjustedX < 0) {
      adjustedX = 20;
    }

    // Adjust vertical position - keep bubble visible
    if (adjustedY + chatWindowHeight > window.innerHeight) {
      // Try to position above the bubble first
      adjustedY = position.y - chatWindowHeight - 20;

      // If still not visible, position at the top but keep bubble visible
      if (adjustedY < 0) {
        adjustedY = bubbleSize + 20; // Keep bubble visible at top
      }
    }
    if (adjustedY < 0) {
      adjustedY = bubbleSize + 20; // Keep bubble visible
    }

    // Update position if adjustments were made
    if (adjustedX !== position.x || adjustedY !== position.y + 80) {
      setPosition({ x: adjustedX, y: adjustedY - 80 });
    }
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, hasMoved]);

  // Add global mouse event listeners for window dragging
  useEffect(() => {
    if (isWindowDragging) {
      document.addEventListener('mousemove', handleWindowMouseMove);
      document.addEventListener('mouseup', handleWindowMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleWindowMouseMove);
        document.removeEventListener('mouseup', handleWindowMouseUp);
      };
    }
  }, [isWindowDragging, windowDragOffset]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(adjustChatWindowPosition, 100);
    }
  }, [isOpen]);

  // Adjust position when window is resized
  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        adjustChatWindowPosition();
      }

      // Update bubble position for mobile
      if (isMobile) {
        setPosition({ x: window.innerWidth - 80 - 20, y: window.innerHeight - 80 - 20 });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, position, isMobile]);

  return (
    <>


                  {/* Bot Floating Button */}
      <div
        ref={bubbleRef}
        className={`fixed z-50 chatbot-bubble ${
          isMobile
            ? 'mobile-bubble'
            : `${isDragging ? 'cursor-grabbing dragging' : 'cursor-grab'}`
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onMouseDown={handleMouseDown}
        onClick={handleBubbleClick}
      >
        <button
          className={`rounded-full shadow-lg border flex items-center justify-center transform transition-all ease-out duration-500 hover:scale-110 hover:shadow-2xl active:scale-95 active:shadow-lg focus:outline-none relative group ${
            isOpen ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
          } ${isMobile ? 'w-20 h-20' : 'w-16 h-16'}`}
          style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
          title={
            isMobile
              ? (isOpen ? "Chat is open • Tap to close" : "Tap to chat")
              : (isOpen ? "Chat is open • Drag header to move window" : "Double click to chat • Drag to move bubble")
          }
        >
          <span className="absolute top-0 right-0 text-red-600 text-xl animate-bounce">❗</span>
          <img src="geekbot-svgrepo-com.svg" alt="ChatBot" className={isMobile ? "w-12 h-12" : "w-10 h-10"} />
          {/* Chat open indicator */}
          {isOpen && (
            <div className="absolute -top-1 -left-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center opacity-90">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
              </svg>
            </div>
          )}
          {/* Drag indicator */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center opacity-70">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 2zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 14zm6-8a2 2 0 1 1-.001-4.001A2 2 0 0 1 13 6zm0 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 14z"/>
            </svg>
          </div>
        </button>
      </div>

      {showHeart && (
        <div
          className="absolute animate-heart text-red-500 text-5xl pointer-events-none"
          style={{
            left: `${position.x + 32}px`,
            top: `${position.y - 32}px`,
          }}
        >
          ❤️
        </div>
      )}

            {/* Bot Chat Window */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          className={`fixed w-[500px] max-h-[70vh] bg-white shadow-xl rounded-lg border flex flex-col overflow-hidden z-50 chatbot-window ${
            isWindowDragging ? 'dragging' : ''
          }`}
          style={{
            left: `${position.x}px`,
            top: `${position.y + 80}px`,
            maxWidth: 'calc(100vw - 40px)',
            maxHeight: 'calc(100vh - 40px)',
          }}
        >
          <div
            className={`flex justify-between items-center px-4 py-2 border-b cursor-move select-none ${
              isWindowDragging ? 'bg-blue-100' : 'bg-gray-100'
            }`}
            onMouseDown={handleWindowMouseDown}
            title="Drag to move window"
          >
            <span className="font-semibold flex items-center gap-2">
              <span>Assistant</span>
              {!isMobile && (
                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 2zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 14zm6-8a2 2 0 1 1-.001-4.001A2 2 0 0 1 13 6zm0 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 14z"/>
                </svg>
              )}
            </span>
            <button
              onClick={toggleBot}
              className="text-lg font-bold hover:text-red-500 transition-colors"
              title="Close chat"
            >
              ✕
            </button>
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
