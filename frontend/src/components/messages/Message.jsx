import { useEffect, useState, useMemo } from "react";
import { useAuthContext } from "../../context/AuthContext";
import useConversation from "../../zustand/useConversation.js";
import { useSocketContext } from "../../context/SocketContext";
import { FaLock, FaLockOpen, FaDownload } from "react-icons/fa";
import extractTime from "../../utils/extractTime.js";
import useSecurity from '../../zustand/useSecurity.js';
import axios from 'axios';
import { logger } from '../../utils/logger.js';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import './Message.css';

const checkUrlSafety = async (url, setUrlStatus) => {
  // 🔄 Mark as "checking" immediately
  setUrlStatus(prev => ({ ...prev, [url]: 'checking' }));

  try {
    const normalizedUrl = url.toLowerCase();
    const isHttps = normalizedUrl.startsWith('https://');
    const containsDangerousKeywords = ['troyano', 'malware', 'virus', 'phishing', 'scam'].some(keyword =>
      normalizedUrl.includes(keyword)
    );
    const urlFormatValid = /^(https?:\/\/)?([\da-z.-]+\.[a-z.]{2,6})([/\w .-]*)*\/?$/.test(normalizedUrl);

    // 🔄 Simulate more realistic verification (optional)
    await new Promise(resolve => setTimeout(resolve, 500));

    const isSafe = isHttps && !containsDangerousKeywords && urlFormatValid;

    // 🔄 Update final status
    setUrlStatus(prev => ({ ...prev, [url]: isSafe }));
  } catch (error) {
    console.error('Error verifying URL:', error);
    // 🔄 Mark as error if verification fails
    setUrlStatus(prev => ({ ...prev, [url]: 'error' }));
  }
};

const PublicKeyDisplay = ({ publicKey }) => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const [showFullKey, setShowFullKey] = useState(false);

  const handleCopy = async () => {
    if (!publicKey) {
      setError(true);
      setTimeout(() => setError(false), 2000);
      return;
    }

    try {
      // Fallback method for older browsers
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(publicKey);
      } else {
        // Fallback for non-secure contexts or older browsers
        const textArea = document.createElement('textarea');
        textArea.value = publicKey;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }

      setCopied(true);
      setError(false);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error copying key:", err);
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  if (!publicKey) {
    return (
      <div className="text-center">
        <p className="text-sm text-gray-500 bg-gray-100 p-2 rounded max-w-xs mx-auto">
          <strong>Public Key:</strong> Not available
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="flex flex-col items-center gap-2">
        <p
          onClick={handleCopy}
          className="cursor-pointer text-sm text-gray-700 bg-gray-100 p-2 rounded hover:bg-gray-200 max-w-xs mx-auto break-words font-mono"
          title="Click to copy public key"
        >
          <strong>Public Key:</strong> {publicKey.slice(0, 30)}...
        </p>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="btn btn-xs btn-primary"
            disabled={copied}
          >
            {copied ? 'Copied!' : 'Copy Key'}
          </button>

          <button
            onClick={() => setShowFullKey(true)}
            className="btn btn-xs btn-outline"
          >
            View Full Key
          </button>
        </div>

        {copied && <p className="text-green-500 text-sm">✅ Key copied to clipboard!</p>}
        {error && <p className="text-red-500 text-sm">❌ Failed to copy key</p>}
      </div>

      {/* Modal for full key */}
      {showFullKey && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl mx-4">
            <h3 className="text-lg font-bold mb-4">Full Public Key</h3>
            <div className="bg-gray-100 p-4 rounded font-mono text-sm break-all max-h-96 overflow-y-auto">
              {publicKey}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowFullKey(false)}
                className="btn btn-outline btn-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleCopy();
                  setShowFullKey(false);
                }}
                className="btn btn-primary btn-sm"
              >
                Copy Full Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Message = ({ message }) => {
  const { authUser } = useAuthContext();
  const { selectedConversation } = useConversation();
  const { socket } = useSocketContext();
  const fromMe = message.senderId === authUser._id;
  const formattedTime = extractTime(message.createdAt);
  const shakeClass = message.shouldShake ? "shake" : "";
  const chatClassName = fromMe ? "chat-end" : "chat-start";
  const bubbleBgColor = fromMe ? "bg-blue-500" : "";
  const [showEncrypted, setShowEncrypted] = useState(false);
  const [messages, setMessages] = useState([message]);
  const [currentMessage, setCurrentMessage] = useState(message);

  const [showPopup, setShowPopup] = useState(false);
  const [urlStatus, setUrlStatus] = useState({});
  const [profilePic, setProfilePic] = useState(
    fromMe ? authUser.profilePic : 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg'
  );
  const urlPattern = useMemo(() => /(https?:\/\/[^\s]+)/g, []);
  const { selectedKeySize } = useSecurity(state => state);
  const [userData, setUserData] = useState({
    email: "",
    username: "",
    publicKey: "",
    sharedElements: "Shared elements"
  });
  const [reactions, setReactions] = useState(message.reactions || []);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const handleToggleEmojiPicker = () => {
    setShowEmojiPicker(prev => !prev);
  };

  const handleReact = async (emojiObj) => {
    console.log("Selected emoji:", emojiObj);
    const emoji = emojiObj.native;

    try {
      const response = await axios.post(`/api/messages/${message._id}/react`, {
        emoji,
        userId: authUser._id,
      });

      setReactions(response.data);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Error reacting to message:", error);
    }
  };

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
    console.error("Could not analyze the survey:", err);
  }

  const [pollOptionsState, setPollOptionsState] = useState(pollOptions);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleVote = async () => {
    if (selectedOption !== null) {
      const voteValue = 1;
      const userId = authUser._id;

      try {
        const response = await axios.post('/api/poll/vote', {
          pollId: message._id,
          optionIndex: selectedOption,
          userId,
          voteValue,
        });

        if (response.status === 200) {
          setPollOptionsState(response.data.options);
        }
      } catch (error) {
        console.error("Error registering vote:", error);
      }
    }
  };

  useEffect(() => {
    if (!fromMe) {
      fetchProfilePic(message.senderId);
    }

    const handleClickOutside = (e) => {
      const clickedElement = e.target;

      // Check if clicked on emoji button or picker
      const isEmojiButton = clickedElement.closest(".emoji-button");
      const isEmojiPicker = clickedElement.closest(".emoji-picker");

      if (!isEmojiButton && !isEmojiPicker) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    if (showPopup) {
      fetchUserData(message.senderId);
    }

    if (typeof message.message === 'string') {
      const urls = message.message.match(urlPattern);
      if (urls) {
        urls.forEach((url) => {
          if (!(url in urlStatus)) {
            setUrlStatus(prev => ({ ...prev, [url]: null }));
            checkUrlSafety(url, setUrlStatus);
          }
        });
      }
    }

    const initializePoll = async () => {
      if (isPoll && message._id) {
        try {
          const pollExists = await axios.get(`/api/poll/poll/${message._id}`);
          if (pollExists.status === 200) {
            const newPollOptions = pollExists.data.options;

            if (JSON.stringify(pollOptionsState) !== JSON.stringify(newPollOptions)) {
              setPollOptionsState(newPollOptions);
            }
          }
        } catch (err) {
          if (err.response) {
            await axios.post('/api/poll/poll', {
              pollId: message._id,
              question: pollQuestion,
              options: pollOptions.map(opt => opt.option || opt),
            });

            setPollOptionsState(pollOptions);
          } else {
            console.error("Error to verify or create survey:", err);
          }
        }
      }
    };

    initializePoll();

    if (socket) {

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isPoll, showEmojiPicker, showPopup, message.senderId, urlPattern, urlStatus, pollOptions, pollQuestion, setUrlStatus, selectedConversation?.type, socket, message.message, selectedKeySize]);

  const fetchProfilePic = async (senderId) => {
    try {
      const response = await fetch(`/api/users/${senderId}/profile-pic`);
      if (response.ok) {
        const data = await response.json();
        setProfilePic(data.profilePic || 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg');
      } else {
        console.error("Error getting profile picture");
      }
    } catch (error) {
      console.error("Error in fetch request:", error);
    }
  };

  const fetchUserData = async (userId) => {
    try {
      const token = JSON.parse(localStorage.getItem("chat-user"))?.token;
      const response = await fetch(`/api/users/${userId}/popup-data`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        logger.info('User data fetched successfully', {
          email: data.email,
          username: data.username,
          hasPublicKey: !!data.publicKey,
          publicKeyLength: data.publicKey?.length
        });

        setUserData({
          email: data.email,
          username: data.username,
          publicKey: data.publicKey,
          sharedElements: "Shared elements"
        });
      } else {
        logger.error("Error getting user data", {
          status: response.status,
          statusText: response.statusText,
          userId
        });
        setUserData(prev => ({ ...prev, publicKey: null }));
      }
    } catch (error) {
      logger.error("Error in fetch request", error);
      setUserData(prev => ({ ...prev, publicKey: null }));
    }
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await axios.get(url, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  }

  function toBase64Unicode(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
  }

  const handleEncryptMessage = (message) => {
    try {
      // Encode message with btoa
      const encodedMessage = toBase64Unicode(message.message);

      // Return encoded message with username suffix
      return `${encodedMessage.slice(0, 60)}...signedBy-${authUser.username}`;
    } catch (error) {
      console.error("Error encrypting message:", error);
      return "[Error encrypting]";
    }
  };

  const getDocumentPreview = () => {
    const fileUrl = message.fileUrl;
    const extension = fileUrl.split('.').pop()?.toLowerCase();

    const getFileSize = () => {
      if (message.fileSize) {
        const bytes = parseInt(message.fileSize);
        if (bytes < 1024) return `${bytes} B`;
        else if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
        else if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(2)} MB`;
        else return `${(bytes / 1073741824).toFixed(2)} GB`;
      }
      return 'Unknown size';
    }

    const getFileName = () => {
      if (message.fileName) {
        return message.fileName;
      }
      // Fallback to URL if fileName is not provided
      const urlFileName = fileUrl.split('/').pop()?.split('?')[0];
      return urlFileName || 'Document';
    }

    const getFileIcon = () => {
      switch (extension) {
        case 'pdf':
          return '📄';
        case 'doc':
        case 'docx':
          return '📘';
        case 'xls':
        case 'xlsx':
          return '📊';
        case 'ppt':
        case 'pptx':
          return '📽️';
        case 'txt':
          return '📝';
        case 'zip':
        case 'rar':
          return '📦';
        default:
          return '📋';
      }
    };

    // FALLBACK
    return (
      <div
        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
        onClick={() => window.open(fileUrl, '_blank')}
      >
        {/* 🔧 FILE ICON */}
        < div className="text-3xl" >
          {getFileIcon()}
        </div >

        {/* 🔧 FILE INFORMATION */}
        < div className="flex-1 min-w-0" >
          <p className="text-sm font-medium text-gray-900 truncate">
            {getFileName()}
          </p>
          <p className="text-xs text-gray-500">
            {getFileSize()} • {extension?.toUpperCase() || 'FILE'}
          </p>
        </div >

        {/* 🔧 DOWNLOAD BUTTON */}
        < button
          className="text-gray-400 hover:text-gray-600 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload(fileUrl, getFileName());
          }}
        >
          <FaDownload className="w-4 h-4" />
        </button >
      </div >
    );
  }

  return (
    <>
      <div className={`chat ${chatClassName} `} onDoubleClick={() => setShowEncrypted(!showEncrypted)}>
        <div className="chat-image avatar" onClick={() => setShowPopup(true)}>
          <div className="w-10 rounded-full">
            <img alt="Profile" src={profilePic} />
          </div>
        </div>
        <div className={`chat-bubble text-white ${bubbleBgColor} ${shakeClass} pb-2`}>
          {showEncrypted ? (
            <span className="text-yellow-500 break-all">{handleEncryptMessage(message)}</span>
          ) : isPoll ? (
            <form className="w-full bg-white p-4 rounded shadow-md mt-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{pollQuestion}</h3>
              <div className="flex flex-col gap-2">
                {Array.isArray(pollOptionsState) && pollOptionsState.length > 0 && pollOptionsState.map((option, idx) => (
                  <label key={idx} className="flex items-center gap-2 text-gray-700">
                    <input
                      type="radio"
                      className="form-checkbox h-4 w-4 text-blue-600"
                      value={idx}
                      onChange={(e) => setSelectedOption(parseInt(e.target.value))}
                    />
                    <span>{option.option}</span>
                    <span className="ml-auto">{Array.isArray(option.votes) ? option.votes.length : 0} votes</span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                className={`mt - 4 bg - blue - 500 hover: bg - blue - 600 text - white py - 1.5 px - 4 rounded shadow `}
                onClick={handleVote}

              >
                Send Vote
              </button>
            </form>
          ) : message.fileUrl ? (
            <div>

              {/* Show file according to its type */}
              {message.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                // 🖼️ IMAGE FILES

                <div className="relative group max-w-[200px]">
                  <div className="bg-white rounded-lg p-1 shadow-md">
                    <img
                      src={`${message.fileUrl} `}
                      alt="Sent image"
                      className="max-w-[180px] max-h-[180px] w-auto h-auto rounded-lg shadow cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(message.fileUrl, '_blank')}
                    />
                  </div>

                  {/* 🔧 FILENAME WITH SIZE AND DOWNLOAD BUTTON */}
                  <div className="flex items-center justify-between mt-1 px-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-300 truncate">
                        {message.fileName || message.fileUrl.split('/').pop()?.split('?')[0] || 'image.jpg'}
                      </p>
                      {/* 🔧 ADD SIZE */}
                      {message.fileSize && (
                        <p className="text-xs text-gray-400">
                          {(() => {
                            const bytes = parseInt(message.fileSize);
                            if (bytes < 1024) return `${bytes} B`;
                            else if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
                            else if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
                            else return `${(bytes / 1073741824).toFixed(1)} GB`;
                          })()}
                        </p>
                      )}
                    </div>
                    {/* 🔧 DOWNLOAD BUTTON */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(message.fileUrl, message.fileName || 'image.jpg');
                      }}
                      className="text-gray-400 hover:text-gray-300 transition-colors ml-2"
                    >
                      <FaDownload className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : message.fileUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                // 🎥 VIDEO FILES
                <video
                  src={`${message.fileUrl} `}
                  controls
                  className="w-full max-w-[250px] h-auto rounded shadow"
                />
              ) : (
                // 📋 DOCUMENTS
                <div className="space-y-2">
                  <div
                    className="bg-white rounded-lg p-1 shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(message.fileUrl, '_blank')}
                  >
                    {getDocumentPreview()}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {typeof message.message === 'string' && message.message.match(urlPattern) ? (
                <div>
                  {message.message.split(urlPattern).map((part, index) => {
                    if (part.match(urlPattern)) {
                      const safetyStatus = urlStatus[part];
                      return (
                        <div key={index} className="inline-block">
                          <a
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`underline ${safetyStatus === true ? 'text-blue-200' : safetyStatus === false ? 'text-red-400' : 'text-yellow-300'} `}
                          >
                            {part}
                          </a>
                          {safetyStatus === true && <span className="text-green-400 ml-1">✓</span>}
                          {safetyStatus === false && <span className="text-red-400 ml-1">⚠</span>}
                          {safetyStatus === null && <span className="text-yellow-300 ml-1">...</span>}
                        </div>
                      );
                    }
                    return <span key={index}>{part}</span>
                  })}
                </div>
              ) : (
                <span>{message.message}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 ml-12">
          {reactions.map((reaction, index) => (
            <span key={index} className="text-lg">
              {reaction.emoji}
            </span>
          ))}
          <button
            className="text-sm text-white bg-gray-600 px-2 py-1 rounded hover:bg-gray-700"
            onClick={handleToggleEmojiPicker}
          >
            +
          </button>
        </div>
        {showEmojiPicker && (
          <div
            className={`emoji - picker absolute z - 50 bottom - [100px] ${fromMe ? 'right-0' : 'left-0'
              } `}
          >
            <Picker data={data} onEmojiSelect={handleReact} theme="light" />
          </div>
        )}

        <div className="chat-footer opacity-50 text-xs flex gap-1 items-center">{formattedTime}</div>
      </div >

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg max-w-md mx-auto">
            <h2 className="text-center text-2xl font-bold mb-4">User Data</h2>
            <div className="text-center flex justify-center mb-4">
              <img
                src={profilePic}
                alt="Profile Picture"
                className="w-10 h-10 rounded-full"
              />
            </div>
            <p className="text-center"><strong>Email:</strong> {userData.email}</p>
            <p className="text-center"><strong>Alias:</strong> {userData.username}</p>
            <PublicKeyDisplay publicKey={userData.publicKey} />
            <p className="text-center"><strong>Shared Elements:</strong> {userData.sharedElements || 'No shared elements'}</p>
            <button
              className="text-center mt-4 bg-blue-500 text-white py-2 px-4 rounded"
              onClick={() => setShowPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Message;
