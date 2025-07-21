import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Canvas } from '@react-three/fiber';
import axios from 'axios';
import { logger } from '../../utils/logger.js';
import useSecurity from '../../zustand/useSecurity.js';
import useGetSummary from '../../hooks/useGetSummary.js';
import { MdDeleteForever, MdVpnKey, MdGridOn, MdLockOutline, MdSummarize, MdSecurity, MdVisibilityOff, MdTimer, MdDevices, MdFingerprint } from "react-icons/md";
import { OrbitControls, Line } from '@react-three/drei';
import toast from 'react-hot-toast';

const securityOptions = [
  { id: 1, title: "Message Deletion", details: "Allows users to permanently remove messages based on a selected timeframe.", icon: <MdDeleteForever className="text-xl text-blue-500" /> },
  { id: 3, title: "Lattice Public Keys", details: "Display a public key as a 3D lattice structure.", icon: <MdGridOn className="text-xl text-blue-500" /> },
  { id: 4, title: "Session Control", details: "View and revoke other active login sessions.", icon: <MdDevices className="text-xl text-blue-500" /> },
  { id: 5, title: "Conversation Summary", details: "Summarize conversations using AI.", icon: <MdSummarize className="text-xl text-blue-500" /> },
  { id: 8, title: "Verify Digital Signatures", details: "Ensure the message integrity with ML-DSA.", icon: <MdSecurity className="text-xl text-blue-500" /> }
];

const getShortestVector = (points) => {
  if (!points || points.length < 2) {
    return [];
  }

  let minLength = Infinity;
  let shortest = [points[0], points[1]];

  // Limit search to first 100 points for performance
  const searchPoints = points.slice(0, 100);

  for (let i = 0; i < searchPoints.length; i++) {
    for (let j = i + 1; j < searchPoints.length; j++) {
      const a = searchPoints[i], b = searchPoints[j];
      const length = Math.sqrt(
        (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
      );
      if (length < minLength && length > 0.1) { // Minimum distance threshold
        minLength = length;
        shortest = [a, b];
      }
    }
  }

  return shortest;
};


const SecurityOptions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [base64Key, setBase64Key] = useState('AQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xdXl9gYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/');
  const [latticePoints, setLatticePoints] = useState([]);
  const [summaryText, setSummaryText] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [userOrCommunity, setUserOrCommunity] = useState("");
  const [conversation, setConversation] = useState(null);
  const [sessions, setSessions] = useState([]);
  const shortestVector = getShortestVector(latticePoints);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const getSummary = useGetSummary();
  const { setSelectedKeySize } = useSecurity();

  const deleteOldMessagesFromBackend = async (timePeriod) => {
    try {
      const response = await axios.post('/api/deleteOldMessages', { timePeriod });
      alert(response.data.message);
    } catch (error) {
      alert('Error deleting messages');
    }
  };
  const fetchSessions = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("chat-user"))?.token;

      const res = await axios.get('/api/sessions', {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error('Error fetching sessions', err);
    }
  };

  const revokeSession = async (sessionId) => {
    try {
      const token = JSON.parse(localStorage.getItem("chat-user"))?.token;
      await axios.delete(`/api/sessions/${sessionId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      setSessions(prev => prev.filter(s => s._id !== sessionId));

      const currentSessionId = localStorage.getItem("sessionId");
      if (sessionId === currentSessionId) {
        // Log out the user
        localStorage.removeItem("chat-user");
        localStorage.removeItem("sessionId");
        window.location.href = "/login";
      }

    } catch (err) {
      console.error('Error revoking session', err);
    }
  };



  const handleOptionClick = (option) => {
    setSelectedOption(option);
    if (option.id === 3) {
      setBase64Key('');
      setLatticePoints([]);
    }
    if (option.id === 4) {
      fetchSessions();
    }
    if (option.id === 5) {
      setSummaryText("");
      setUserOrCommunity("");
    }
  };

  const base64ToBytes = (base64) => {
    try {
      // Validate base64 string
      if (!base64 || typeof base64 !== 'string') {
        throw new Error('Invalid input: must be a non-empty string');
      }

      // Remove any whitespace and validate base64 format
      const cleanBase64 = base64.replace(/\s/g, '');
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
        throw new Error('Invalid base64 format');
      }

      const decoded = atob(cleanBase64);
      return new Uint8Array([...decoded].map(char => char.charCodeAt(0)));
    } catch (error) {
      throw new Error(`Failed to decode base64: ${error.message}`);
    }
  };

  const generateLatticePoints = (bytes) => {
    if (!bytes || bytes.length === 0) {
      throw new Error('No data to generate lattice from');
    }

    // Limit to first 1000 bytes to avoid performance issues
    const limitedBytes = bytes.slice(0, 1000);

    return Array.from(limitedBytes).map((b, i) => [
      (i % 20) - 10, // X coordinate: -10 to 10
      Math.floor(i / 20) - Math.floor(limitedBytes.length / 40), // Y coordinate: centered
      (b / 255) * 4 - 2 // Z coordinate: -2 to 2, scaled for better visibility
    ]);
  };

  const handleGenerateLattice = () => {
    try {
      if (!base64Key.trim()) {
        toast.error('Please enter a base64 public key');
        return;
      }

      const byteArray = base64ToBytes(base64Key.trim());
      const points = generateLatticePoints(byteArray);
      setLatticePoints(points);

      toast.success(`Generated lattice with ${points.length} points`);
      logger.info('Lattice generated successfully', { pointsCount: points.length });
    } catch (error) {
      toast.error(`Error generating lattice: ${error.message}`);
      logger.error('Lattice generation failed', error);
      setLatticePoints([]);
    }
  };

  const handleSearchConversation = async () => {
    if (!userOrCommunity.trim()) {
      toast.error("Please enter a username or community name");
      return;
    }

    try {
      const token = JSON.parse(localStorage.getItem("chat-user"))?.token;
      const res = await axios.get('/api/conversation/search', {
        params: { name: userOrCommunity.trim() },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.conversationIds) {
        setConversation({ ids: res.data.conversationIds, type: res.data.type });
        handleGetSummary(res.data.conversationIds, res.data.type);
        toast.success(`Found ${res.data.type} conversation`);
      }
    } catch (err) {
      // Handle 404 errors silently (user not found is expected)
      if (err.response?.status === 404) {
        const errorMessage = err.response?.data?.error || "No user or community found with that name";
        toast.error(errorMessage);
      } else {
        // Log unexpected errors
        logger.error("Search error", err);
        toast.error("An error occurred while searching. Please try again.");
      }
    }
  };

  const handleGetSummary = async (ids, type) => {
    setLoadingSummary(true);
    try {
      const summary = await getSummary(ids, type, 50);
      if (summary) {
        setSummaryText(summary);
        toast.success("Summary generated successfully");
      } else {
        toast.error("Failed to generate summary");
      }
    } catch (e) {
      console.error("Summary error", e);
      toast.error("Error generating summary. Please try again.");
    }
    setLoadingSummary(false);
  };

  return (
    <div>
      <button className="btn btn-sm btn-primary flex items-center gap-2" onClick={openModal}>
        <MdLockOutline className="text-xl" />
        <span className="hidden sm:inline-block">Security</span>
      </button>
      <input type="checkbox" id="security-modal" className="modal-toggle" checked={isOpen} readOnly />
      <div className="modal">
        <div className="modal-box w-11/12 max-w-5xl max-h-[90vh]">
          <div className="flex flex-col md:flex-row h-full">
            <div className="w-full md:w-1/3 overflow-y-auto border-r border-base-300 pr-4 pt-4 md:pt-8">
              <h3 className="text-lg font-bold mb-4">Security Options</h3>
              <ul className="space-y-2 md:space-y-4">
                {securityOptions.map((option) => (
                  <li key={option.id}>
                    <button
                      className={`w-full text-left flex items-center gap-3 py-2 md:py-3 px-3 md:px-4 rounded-md transition duration-200 border-b border-base-300 ${selectedOption?.id === option.id
                        ? 'bg-blue-50 text-blue-600 border-blue-200'
                        : 'hover:bg-base-200'
                        }`}
                      onClick={() => handleOptionClick(option)}
                    >
                      {option.icon}
                      <span className="text-sm md:text-base">{option.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full md:w-2/3 pl-0 md:pl-4 overflow-y-auto pt-4 md:pt-0">
              {selectedOption ? (
                <div className="space-y-4">
                  <h3 className="text-lg md:text-xl font-bold">{selectedOption.title}</h3>
                  <p className="text-sm text-gray-500">{selectedOption.details}</p>

                  {selectedOption.id === 1 && (
                    <div className="space-y-2">
                      {[
                        { label: '1 hour', value: '1day' },
                        { label: '1 day', value: '1day' },
                        { label: '1 week', value: '7days' }
                      ].map(({ label, value }) => (
                        <label key={label} className="flex items-center cursor-pointer gap-2">
                          <input
                            type="radio"
                            name="frequency"
                            className="radio"
                            onChange={() => deleteOldMessagesFromBackend(value)}
                          />
                          <span className="text-sm">{label}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {selectedOption.id === 3 && (
                    <div>
                      <div className="space-y-2">
                        <label className="label">
                          <span className="label-text">Base64 Public Key</span>
                          <span className="label-text-alt text-gray-500">Enter a valid base64 encoded public key</span>
                        </label>
                        <input
                          className="input input-bordered w-full font-mono text-sm"
                          value={base64Key}
                          onChange={e => setBase64Key(e.target.value)}
                          placeholder="e.g., AQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xdXl9gYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/"
                        />
                        <div className="flex gap-2">
                          <button
                            className="btn btn-primary flex-1"
                            onClick={handleGenerateLattice}
                            disabled={!base64Key.trim()}
                          >
                            Generate Lattice Visualization
                          </button>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                              setLatticePoints([]);
                              setBase64Key('');
                              toast.success('Lattice cleared');
                            }}
                            disabled={latticePoints.length === 0}
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      {latticePoints.length > 0 && (
                        <div className="mt-4">
                          <div className="bg-gray-50 p-3 rounded-lg mb-3">
                            <div className="flex justify-between items-center text-sm">
                              <span>📊 Lattice Statistics:</span>
                              <span className="font-mono">{latticePoints.length} points</span>
                            </div>
                            <div className="flex justify-between items-center text-sm mt-1">
                              <span>🔴 Shortest Vector:</span>
                              <span className="font-mono">
                                {shortestVector.length === 2 && shortestVector[0] !== shortestVector[1]
                                  ? `${Math.sqrt(
                                    (shortestVector[0][0] - shortestVector[1][0]) ** 2 +
                                    (shortestVector[0][1] - shortestVector[1][1]) ** 2 +
                                    (shortestVector[0][2] - shortestVector[1][2]) ** 2
                                  ).toFixed(3)} units`
                                  : 'N/A'
                                }
                              </span>
                            </div>
                          </div>

                          <div className="h-[300px] md:h-[400px] rounded border border-gray-300 bg-gradient-to-br from-blue-50 to-indigo-50">
                            <Canvas
                              camera={{ position: [0, 0, 20], fov: 45 }}
                              onCreated={({ gl }) => {
                                gl.setClearColor('#f8fafc', 0);
                              }}
                              onError={(error) => {
                                logger.warn('Three.js error', error);
                              }}
                            >
                              <ambientLight intensity={0.6} />
                              <directionalLight position={[10, 10, 5]} intensity={0.8} />
                              <pointLight position={[-10, -10, -5]} intensity={0.3} />
                              <OrbitControls
                                enablePan={true}
                                enableZoom={true}
                                enableRotate={true}
                                autoRotate={false}
                                autoRotateSpeed={0.5}
                              />

                              {/* Grid for reference */}
                              <gridHelper args={[20, 20, '#e5e7eb', '#d1d5db']} />

                              {/* Shortest vector line */}
                              {shortestVector.length === 2 && shortestVector[0] !== shortestVector[1] && (
                                <Line
                                  points={shortestVector}
                                  color="red"
                                  lineWidth={3}
                                />
                              )}

                              {/* Lattice points */}
                              {latticePoints.map((pos, i) => (
                                <mesh key={i} position={pos}>
                                  <sphereGeometry args={[0.15, 12, 12]} />
                                  <meshStandardMaterial
                                    color={i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#8b5cf6' : '#06b6d4'}
                                    transparent={true}
                                    opacity={0.8}
                                  />
                                </mesh>
                              ))}
                            </Canvas>
                          </div>

                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>🔐 Lattice Cryptography:</strong> This visualization represents your public key as a 3D lattice structure.
                              The red line shows the shortest vector, which is fundamental to the security of ML-KEM.
                              Finding this shortest vector is computationally hard, making the cryptosystem secure against quantum attacks.
                            </p>
                          </div>
                        </div>
                      )}

                      {latticePoints.length === 0 && base64Key.trim() && (
                        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-sm text-yellow-800">
                            💡 <strong>Tip:</strong> Enter a valid base64-encoded public key and click "Generate Lattice Visualization" to see the 3D representation.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedOption.id === 4 && (
                    <div>
                      <ul className="divide-y divide-base-300">
                        {sessions.map((session) => (
                          <li key={session._id} className="py-2 flex justify-between items-center">
                            <span className="text-sm">{session.deviceInfo}</span>
                            <button className="btn btn-xs btn-error" onClick={() => revokeSession(session._id)}>Revoke</button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedOption.id === 5 && (
                    <div>
                      <div className="space-y-2">
                        <input
                          className="input input-bordered w-full"
                          value={userOrCommunity}
                          onChange={e => setUserOrCommunity(e.target.value)}
                          placeholder="Enter username or community name"
                          onKeyPress={(e) => e.key === 'Enter' && handleSearchConversation()}
                        />
                        <button
                          className="btn btn-primary w-full"
                          onClick={handleSearchConversation}
                          disabled={loadingSummary}
                        >
                          {loadingSummary ? 'Searching...' : 'Search Conversation'}
                        </button>
                      </div>

                      {loadingSummary && (
                        <div className="mt-4 text-center">
                          <div className="loading loading-spinner loading-md"></div>
                          <p className="mt-2 text-sm text-gray-600">Generating summary...</p>
                        </div>
                      )}

                      {summaryText && !loadingSummary && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">Conversation Summary:</h4>
                          <div className="bg-base-200 p-4 rounded-lg border">
                            <p className="text-sm leading-relaxed">{summaryText}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedOption.id === 8 && (
                    <div>
                      <p className="mb-4 text-sm text-gray-600">
                        All messages in this app are signed using the ML-DSA (post-quantum signature) scheme.
                        This ensures message integrity and authenticity. You will see a ✅ or ❌ in each message bubble
                        based on signature verification.
                      </p>
                      <ul className="list-disc list-inside text-sm text-gray-500">
                        <li>✅ Verified: Signature is valid.</li>
                        <li>❌ Unverified: Signature is invalid or missing.</li>
                      </ul>
                    </div>
                  )}

                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🔒</div>
                    <p className="text-sm md:text-base">Select a security option to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="modal-action">
            <button onClick={closeModal} className="btn btn-primary">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityOptions;


// Inline styles for the component
const styles = {
  securityText: {
    position: 'fixed',
    top: '5px',
    right: '50px',
    fontSize: '15px',
    cursor: 'pointer',
    padding: '10px 20px',
  },
  popupContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '600px',
    height: '600px',
  },
  optionsList: {
    width: '30%',
    borderRight: '1px solid #ccc',
    padding: '20px',
    overflowY: 'scroll',
  },
  option: {
    cursor: 'pointer',
    padding: '10px',
    borderBottom: '1px solid #ccc',
    listStyleType: 'none',
  },
  optionDetails: {
    width: '65%',
    padding: '20px',
    overflowY: 'scroll',
  },
  closeButton: {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    padding: '10px 20px',
    backgroundColor: 'green',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  inputField: {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
  },
  generateButton: {
    backgroundColor: 'blue',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

// Estilos personalizados para el Modal
const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '0px',
    borderRadius: '10px',
    border: 'none',
  },
};

