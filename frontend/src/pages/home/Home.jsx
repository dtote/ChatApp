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
              aria-label="Cerrar menú"
            >
              ✕
            </button>
          </div>
          <Sidebar />
        </div>
        {/* Contenido principal */}
        <div className="flex flex-col h-screen">
          <button onClick={toggleDrawer} className="btn btn-primary m-4 w-fit z-30">
            ☰ Abrir menú
          </button>
          <div className="flex-1 overflow-y-auto">
            <MessageContainer className="h-[600px]" />
            <SecurityOptions/>
            <ChatBot className="mt-30"/>
          </div>
        </div>
      </div>

      <div className="hidden mt-20 lg:flex w-screen h-[80vh] overflow-hidden">
        <div className="flex flex-col h-full">
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <MessageContainer className="flex-1 overflow-y-auto" />
          <SecurityOptions />
          <ChatBot className="mt-[120px]" />
        </div>
      </div>
    </div>
  );
};

export default Home;
