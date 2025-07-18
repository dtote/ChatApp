import Sidebar from '../../components/sidebar/Sidebar';
import MessageContainer from '../../components/messages/MessageContainer';
import SecurityOptions from '../../components/security/SecurityOptions';
import PostQuantumEducation from '../../components/education/PostQuantumEducation';
import './Home.css';
import ChatBot from '../../components/chatbot/Chatbot';
import { useState, useEffect } from 'react';

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => setIsOpen(!isOpen);
  const closeDrawer = () => setIsOpen(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  return (
    <div className="fixed inset-0">
      {/* Mobile Drawer */}
      <div className="lg:hidden relative">
        {/* Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40"
            onClick={closeDrawer}
          />
        )}

        {/* Sidebar Drawer */}
        <div
          className={`fixed top-0 left-0 h-screen w-[80vw] max-w-[300px] box-border bg-gray-400 bg-clip-padding backdrop-blur-lg bg-opacity-30 p-4 z-50 transform transition-transform duration-300 overflow-y-auto text-sm ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex justify-start">
            <button
              onClick={closeDrawer}
              className="btn btn-ghost text-xl"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          <Sidebar />
        </div>
        {/* Contenido principal */}
        <div className="flex flex-col h-screen">
          <div className="grid grid-cols-3 items-center p-4 bg-white border-b border-gray-200 shadow-sm">
            <button
              onClick={toggleDrawer}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 justify-self-start"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="font-medium">Menu</span>
            </button>
            <div className="text-lg font-semibold text-gray-800 text-center">PQCare</div>
            <div className="flex-shrink-0 justify-self-end">
              <SecurityOptions />
            </div>
          </div>
          <div className="flex-1 overflow-hidden relative bg-gray-50">
            <MessageContainer />
            <div className="absolute bottom-4 right-4 z-10">
              <ChatBot />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden mt-20 lg:flex w-screen h-[80vh] overflow-hidden">
        <div className="flex flex-col h-full">
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden relative bg-gray-50">
          <div className="grid grid-cols-3 items-center p-4 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
            <div></div>
            <div className="text-lg font-semibold text-gray-800 text-center">PQCare</div>
            <div className="flex-shrink-0 justify-self-end">
              <SecurityOptions />
            </div>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <MessageContainer />
            <div className="absolute bottom-4 right-4 z-10">
              <ChatBot />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
