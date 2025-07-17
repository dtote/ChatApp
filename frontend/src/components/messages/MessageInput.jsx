import { useRef, useState } from "react";
import { BsSend } from "react-icons/bs";
import { FaPlus, FaTimes, FaFile, FaImage, FaUser, FaPoll } from "react-icons/fa";
import useSendMessage from "../../hooks/useSendMessage";
import useSecurity from "../../zustand/useSecurity.js";
import './MessageInput.css';
import toast from "react-hot-toast";

const POLL_INITIAL_STATE = {
  question: "",
  options: ["", ""],
};

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollData, setPollData] = useState(POLL_INITIAL_STATE);

  const { loading, sendMessage } = useSendMessage();
  const { selectedKeySize } = useSecurity();

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && !file) return;

    try {
      const formData = new FormData();
      const cleanFileName = file ? file.name.replace(/[^a-zA-Z0-9_.-]/g, "_") : "";
      const messageToSend = message.trim() || (file ? cleanFileName : "");
      formData.append("message", messageToSend);

      if (file) {
        formData.append("file", file);
      }

      await sendMessage(formData, selectedKeySize);
      setMessage("");
      setFile(null);
      setShowPopup(false);

      toast.success("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handlePollSubmit = async () => {
    const validOptions = pollData.options.filter((opt) => opt.trim() !== "");
    if (!pollData.question.trim()) {
      toast.error("Poll question is required");
      return;
    }

    if (validOptions.length < 2) {
      toast.error("Poll must have at least 2 options");
      return;
    }
    try {
      const pollPayload = {
        question: pollData.question,
        options: validOptions,
        type: "poll"
      };

      const formData = new FormData();
      formData.append("message", JSON.stringify(pollPayload));

      await sendMessage(formData, selectedKeySize);

      setPollData(POLL_INITIAL_STATE);
      setShowPollForm(false);
      setShowPopup(false);

      toast.success("Poll sent successfully");
    } catch (error) {
      console.error("Error sending poll:", error);
      toast.error("Failed to send poll");
    }
  };

  const handleAddOption = () => {

    if (pollData.options.length >= 5) {
      toast.error("You can only add up to 5 options");
      return;
    }

    setPollData((prev) => ({
      ...prev,
      options: [...prev.options, ""]
    }));
  };

  const handleOptionChange = (value, index) => {
    setPollData((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt))
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setShowPopup(false);
      toast.success(`File selected: ${selectedFile.name}`);

      // Clean up input value to allow re-selection of the same file
      e.target.value = '';
    }
  };

  const handleCancelPoll = () => {
    setPollData(POLL_INITIAL_STATE);
    setShowPollForm(false);
    setShowPopup(false);
  };

  const isValidPoll = () => {
    const validOptions = pollData.options.filter((opt) => opt.trim() !== "");
    return pollData.question.trim() || validOptions.length >= 2;
  };

  const togglePopup = () => {
    setShowPopup((prev) => !prev);
    setShowPollForm(false);
  };

  const handlePollQuestionChange = (e) => {
    setPollData((prev) => ({
      ...prev,
      question: e.target.value
    }));
  };

  const handleRemoveOption = (index) => {
    if (pollData.options.length <= 2) {
      toast.error("Must have at least 2 options");
      return;
    }

    setPollData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveFile = () => {
    setFile(null);
    toast.info("File removed");
  };

  return (
    <form className="px-4 my-3 relative" onSubmit={handleSubmit}>
      <div className="w-full relative flex flex-col">

        {/* Better file indicator */}
        {file && (
          <div className="mb-2 p-3 bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover rounded-lg">
                  </img>) : (
                  <FaFile className="text-white text-sm"></FaFile>
                )}
              </div>
              <div>
                <p className="text-white font-medium text-sm">{file.name}</p>
                <p className="text-gray-400 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button type="button" onClick={handleRemoveFile} className="text-red-400 hover:text-red-300 transition-colors">
              <FaTimes />
            </button>
          </div>

        )}
        <div className="relative flex items-center">
          <button
            type="button"
            className="mr-2 text-white bg-gray-700 p-2 rounded-full shadow-md hover:bg-gray-600 transition-all duration-200 flex-shrink-0"
            onClick={togglePopup}
          >
            {showPopup ? <FaTimes /> : <FaPlus />}
          </button>

          {showPopup && !showPollForm && (
            <div className="absolute left-0 bottom-[60px] bg-gray-700 text-white rounded-lg shadow-xl p-4 w-60 z-50 border border-gray-600">
              <ul>
                <li className="flex items-center p-3 hover:bg-gray-600 cursor-pointer group transition-all duration-200 rounded-lg"
                  onClick={handleFileClick}>
                  <FaFile className="mr-3 text-blue-500 text-xl" />
                  <span className="group-hover:text-blue-300 text-base">File</span>
                </li>
                <li className="flex items-center p-3 hover:bg-gray-600 cursor-pointer group transition-all duration-200 rounded-lg"
                  onClick={handleImageClick}>
                  <FaImage className="mr-3 text-green-500 text-xl" />
                  <span className="group-hover:text-green-300 text-base">Photos</span>
                </li>
                <li className="flex items-center p-3 hover:bg-gray-600 cursor-pointer group transition-all duration-200 rounded-lg"
                  onClick={() => setShowPollForm(true)}>
                  <FaPoll className="mr-3 text-yellow-500 text-xl" />
                  <span className="group-hover:text-yellow-300 text-base">Poll</span>
                </li>
              </ul>
            </div>
          )}

          {/* Hidden inputs outside the menu */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            onClick={(e) => e.target.value = ''}
            className="hidden" />

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            onClick={(e) => e.target.value = ''}
            className="hidden" />

          {showPollForm && (
            <div className="absolute left-0 bottom-[60px] bg-gray-800 text-white rounded-lg shadow-xl p-4 w-96 max-h-[500px] z-50 border border-gray-600">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold">Create Poll</h3>
                <button type="button" onClick={handleCancelPoll} className="text-gray-400 hover:text-white transition-colors">
                  <FaTimes />
                </button>
              </div>

              <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                <input
                  type="text"
                  className="w-full mb-3 p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Poll Question"
                  value={pollData.question}
                  onChange={handlePollQuestionChange}
                />

                {pollData.options.map((opt, i) => (
                  <div key={i} className="flex items-center mb-2">
                    <input
                      key={i}
                      type="text"
                      className="flex-1 p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={(e) => handleOptionChange(e.target.value, i)}
                    />
                    {pollData.options.length > 2 && (
                      <button
                        type="button"
                        className="ml-2 text-red-500 hover:text-red-700 p-1"
                        onClick={() => handleRemoveOption(i)}>
                        <FaTimes />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-3 pt-3 border-t border-gray-600">
                <button
                  type="button"
                  className="text-sm bg-green-600 px-3 py-2 rounded hover:bg-green-700 disabled:cursor-not-allowed"
                  onClick={handleAddOption}
                  disabled={pollData.options.length >= 5}
                >
                  Add Option
                </button>
                <button
                  type="button"
                  className="text-sm bg-blue-600 px-3 py-2 rounded hover:bg-blue-700 disabled:cursor-not-allowed"
                  onClick={handlePollSubmit}
                  disabled={!isValidPoll()}
                >
                  Send Poll
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 relative">
            <input
              type="text"
              className="border text-sm rounded-lg block w-full pl-3 pr-12 py-2.5 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Send a message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white disabled:opacity-50 disabled:cursor-not-allowed p-1 hover:bg-gray-600 rounded transition-colors"
            disabled={loading || (!message.trim() && !file)}
          >
            {loading ? (
              <div className="loading loading-spinner w-4 h-4"></div>
            ) : (
              <BsSend className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </form >
  );
};

export default MessageInput;
