import { useState } from "react";
import { BsSend } from "react-icons/bs";
import { FaPlus, FaTimes, FaFile, FaImage, FaUser, FaPoll } from "react-icons/fa";
import useSendMessage from "../../hooks/useSendMessage";
import useSecurity from "../../zustand/useSecurity";
import './MessageInput.css';

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const { loading, sendMessage } = useSendMessage();
  const [showPopup, setShowPopup] = useState(false);
  const [file, setFile] = useState(null); 
  const { selectedKeySize } = useSecurity(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message && !file) return;

    const formData = new FormData();
  
    formData.append("message", message);
    
    if (file) {
      formData.append("file", file);
    }
    console.log("Selected Key Size Input: ", selectedKeySize);
    await sendMessage(formData, selectedKeySize); 
    setMessage("");
    setFile(null);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const togglePopup = () => {
    setShowPopup((prev) => !prev);
  };

  return (
    <form className="px-4 my-3 relative" onSubmit={handleSubmit}>
      <div className="w-full relative flex items-center">
        {/* Botón para abrir o cerrar el menú (+ o X) */}
        <button
          type="button"
          className="mr-2 text-white bg-gray-700 p-2 rounded-full shadow-md hover:bg-gray-600 transition-all duration-200"
          onClick={togglePopup}
        >
          {showPopup ? <FaTimes /> : <FaPlus />}
        </button>
        {/* Menú desplegable */}
        {showPopup && (
          <div className="absolute custom-popup bottom-[270px] bg-gray-700 text-white rounded-lg shadow-lg p-4 w-60 z-50">
            <ul>
              <li className="flex items-center p-4 hover:bg-gray-600 cursor-pointer group transition-all duration-200">
                <label htmlFor="file-input" className="flex items-center cursor-pointer">
                  <FaFile className="mr-4 text-blue-500 text-xl" />
                  <span className="group-hover:text-gray-400 text-lg">Archivo</span>
                </label>
                <input 
                  id="file-input" 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </li>
              <li className="flex items-center p-4 hover:bg-gray-600 cursor-pointer group transition-all duration-200">
                <label htmlFor="image-input" className="flex items-center cursor-pointer">
                  <FaImage className="mr-4 text-blue-400 text-xl" />
                  <span className="group-hover:text-gray-400 text-lg">Fotos y videos</span>
                </label>
                <input
                  id="image-input"
                  type="file"
                  accept="image/*,video/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </li>
              <li className="flex items-center p-4 hover:bg-gray-600 cursor-pointer group transition-all duration-200">
                <FaUser className="mr-4 text-orange-400 text-xl" />
                <span className="group-hover:text-gray-400 text-lg">Contacto</span>
              </li>
              <li className="flex items-center p-4 hover:bg-gray-600 cursor-pointer group transition-all duration-200">
                <FaPoll className="mr-4 text-yellow-500 text-xl" />
                <span className="group-hover:text-gray-400 text-lg">Encuesta</span>
              </li>
            </ul>
          </div>
        )}
        {/* Input para enviar el mensaje */}
        <input
          type="text"
          className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Send a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        {/* Botón para enviar el mensaje */}
        <button
          type="submit"
          className="absolute inset-y-0 end-0 flex items-center pe-3 text-white"
        >
          {loading ? (
            <div className="loading loading-spinner"></div>
          ) : (
            <BsSend />
          )}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
