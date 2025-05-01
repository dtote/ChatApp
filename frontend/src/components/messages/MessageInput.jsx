import { useState } from "react";
import { BsSend } from "react-icons/bs";
import { FaPlus, FaTimes, FaFile, FaImage, FaUser, FaPoll } from "react-icons/fa";
import useSendMessage from "../../hooks/useSendMessage";
import useSecurity from "../../zustand/useSecurity.js";
import './MessageInput.css';

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const { loading, sendMessage } = useSendMessage();
  const [showPopup, setShowPopup] = useState(false);
  const [file, setFile] = useState(null);
  const { selectedKeySize } = useSecurity();

  const [showPollForm, setShowPollForm] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message && !file) return;

    const formData = new FormData();
    formData.append("message", message);

    if (file) {
      formData.append("file", file);
    }

    await sendMessage(formData, selectedKeySize);
    setMessage("");
    setFile(null);
    setShowPopup(false);
  };

  const handlePollSubmit = async () => {
    const validOptions = pollOptions.filter((opt) => opt.trim() !== "");
    if (!pollQuestion || validOptions.length < 2) return;

    const pollData = {
      question: pollQuestion,
      options: validOptions,
      type: "poll"
    };

    const formData = new FormData();
    formData.append("message", JSON.stringify(pollData));

    await sendMessage(formData, selectedKeySize);

    setPollQuestion("");
    setPollOptions(["", ""]);
    setShowPollForm(false);
    setShowPopup(false);
  };

  const handleAddOption = () => {
    setPollOptions([...pollOptions, ""]);
  };

  const handleOptionChange = (value, index) => {
    const updated = [...pollOptions];
    updated[index] = value;
    setPollOptions(updated);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const togglePopup = () => {
    setShowPopup((prev) => !prev);
    setShowPollForm(false);
  };

  return (
    <form className="px-4 my-3 relative" onSubmit={handleSubmit}>
      <div className="w-full relative flex items-center">
        <button
          type="button"
          className="mr-2 text-white bg-gray-700 p-2 rounded-full shadow-md hover:bg-gray-600 transition-all duration-200"
          onClick={togglePopup}
        >
          {showPopup ? <FaTimes /> : <FaPlus />}
        </button>

        {showPopup && !showPollForm && (
          <div className="absolute custom-popup bottom-[50px] bg-gray-700 text-white rounded-lg shadow-lg p-4 w-60 z-50">
            <ul>
              <li className="flex items-center p-4 hover:bg-gray-600 cursor-pointer group transition-all duration-200">
                <label htmlFor="file-input" className="flex items-center cursor-pointer">
                  <FaFile className="mr-4 text-blue-500 text-xl" />
                  <span className="group-hover:text-gray-400 text-lg">Archivo</span>
                </label>
                <input id="file-input" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
              </li>
              <li className="flex items-center p-4 hover:bg-gray-600 cursor-pointer group transition-all duration-200">
                <label htmlFor="image-input" className="flex items-center cursor-pointer">
                  <FaImage className="mr-4 text-blue-400 text-xl" />
                  <span className="group-hover:text-gray-400 text-lg">Fotos</span>
                </label>
                <input id="image-input" type="file" accept="image/*,application/pdf" onChange={handleFileChange} className="hidden" />
              </li>
              <li className="flex items-center p-4 hover:bg-gray-600 cursor-pointer group transition-all duration-200"
                  onClick={() => setShowPollForm(true)}>
                <FaPoll className="mr-4 text-yellow-500 text-xl" />
                <span className="group-hover:text-gray-400 text-lg">Encuesta</span>
              </li>
            </ul>
          </div>
        )}
        {showPollForm && (
          <div className="absolute bottom-[270px] bg-gray-800 text-white rounded-lg shadow-lg p-4 w-full max-w-md z-50">
            <h3 className="text-lg font-bold mb-2">Create Poll</h3>
            <input
              type="text"
              className="w-full mb-2 p-2 rounded bg-gray-700 text-white border border-gray-600"
              placeholder="Questions Poll"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
            />
            {pollOptions.map((opt, i) => (
              <input
                key={i}
                type="text"
                className="w-full mb-2 p-2 rounded bg-gray-700 text-white border border-gray-600"
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => handleOptionChange(e.target.value, i)}
              />
            ))}
            <div className="flex justify-between mt-2">
              <button
                type="button"
                className="text-sm bg-green-600 px-3 py-1 rounded hover:bg-green-700"
                onClick={handleAddOption}
              >
                Add Option
              </button>
              <button
                type="button"
                className="text-sm bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
                onClick={handlePollSubmit}
              >
                Send Poll
              </button>
            </div>
          </div>
        )}

        <input
          type="text"
          className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Send a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

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
