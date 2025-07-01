import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Canvas } from '@react-three/fiber';
import axios from 'axios';
import useSecurity from '../../zustand/useSecurity.js';
import useGetSummary from '../../hooks/useGetSummary.js';
import { MdDeleteForever, MdVpnKey, MdGridOn, MdLockOutline, MdSummarize, MdSecurity, MdVisibilityOff, MdTimer, MdDevices, MdFingerprint } from "react-icons/md";
import { OrbitControls, Line } from '@react-three/drei';

const securityOptions = [
  { id: 1, title: "Message Deletion", details: "Allows users to permanently remove messages based on a selected timeframe.", icon: <MdDeleteForever className="text-xl text-primary" /> },
  { id: 3, title: "Lattice Public Keys", details: "Display a public key as a 3D lattice structure.", icon: <MdGridOn className="text-xl text-primary" /> },
  { id: 4, title: "Session Control", details: "View and revoke other active login sessions.", icon: <MdDevices className="text-xl text-primary" /> },
  { id: 5, title: "Conversation Summary", details: "Summarize conversations using AI.", icon: <MdSummarize className="text-xl text-primary" /> },
  { id: 8, title: "Verify Digital Signatures", details: "Ensure the message integrity with ML-DSA.", icon: <MdSecurity className="text-xl text-primary" /> }
];

const getShortestVector = (points) => {
  let minLength = Infinity;
  let shortest = [points[0], points[0]];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const a = points[i], b = points[j];
      const length = Math.sqrt(
        (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
      );
      if (length < minLength && length > 0) {
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
  const [base64Key, setBase64Key] = useState('');
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
        // Cerrar sesión del usuario
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
    const decoded = atob(base64);
    return new Uint8Array([...decoded].map(char => char.charCodeAt(0)));
  };

  const generateLatticePoints = (bytes) => {
    return Array.from(bytes).map((b, i) => [i % 10 - 5, Math.floor(i / 10) - 5, b / 255 * 2 - 1]);
  };

  const handleGenerateLattice = () => {
    const byteArray = base64ToBytes(base64Key);
    setLatticePoints(generateLatticePoints(byteArray));
  };

  const handleSearchConversation = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("chat-user"))?.token;
      const res = await axios.get('/api/conversation/search', {
        params: { name: userOrCommunity },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.conversationIds) {
        setConversation({ ids: res.data.conversationIds, type: res.data.type });
        handleGetSummary(res.data.conversationIds, res.data.type);
      }
    } catch (err) {
      alert("Conversation not found");
    }
  };

  const handleGetSummary = async (ids, type) => {
    setLoadingSummary(true);
    try {
      const summary = await getSummary(ids, type, 50);
      setSummaryText(summary);
    } catch (e) {
      console.error("Summary error", e);
    }
    setLoadingSummary(false);
  };

  return (
    <div className="fixed top-2 right-4 z-50">
      <button className="btn btn-sm btn-accent mt-4 flex items-center gap-2" onClick={openModal}>
        <MdLockOutline className="text-2xl" />
        <span className="hidden sm:inline-block">Security Options</span>
      </button>
      <input type="checkbox" id="security-modal" className="modal-toggle" checked={isOpen} readOnly />
      <div className="modal">
        <div className="modal-box w-11/12 max-w-5xl">
          <div className="flex flex-col md:flex-row h-[80vh]">
            <div className="w-full md:w-1/3 overflow-y-auto border-r border-base-300 pr-4 pt-8">
              <h3 className="text-lg font-bold mb-2">Security Options</h3>
              <ul className="space-y-4">
                {securityOptions.map((option) => (
                  <li key={option.id}>
                    <button className="w-full text-left flex items-center gap-3 py-3 px-4 rounded-md hover:bg-base-200 transition duration-200 border-b border-base-300" onClick={() => handleOptionClick(option)}>
                      {option.icon}
                      <span>{option.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full md:w-2/3 pl-4 overflow-y-auto">
              {selectedOption && (
                <div className="space-y-4">
                  <h3 className="text-xl mt-4 font-bold">{selectedOption.title}</h3>
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
                      <input className="input input-bordered w-full" value={base64Key} onChange={e => setBase64Key(e.target.value)} placeholder="Base64 Public Key" />
                      <button className="btn btn-primary mt-2" onClick={handleGenerateLattice}>Generate Lattice</button>

                      <div className="h-[400px] mt-4 rounded border border-gray-300">
                        <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
                          <ambientLight intensity={0.5} />
                          <directionalLight position={[5, 5, 5]} intensity={1} />
                          <OrbitControls />
                          {shortestVector.length === 2 && shortestVector[0] !== shortestVector[1] && (
                            <Line
                              points={shortestVector}
                              color="red"
                              lineWidth={2}
                            />
                          )}
                          {latticePoints.map((pos, i) => (
                            <mesh key={i} position={pos}>
                              <sphereGeometry args={[0.2, 16, 16]} />
                              <meshStandardMaterial color="blue" />
                            </mesh>
                          ))}
                        </Canvas>
                        <p className="text-sm mt-2 text-gray-600">
                          The red line represents the shortest vector in this lattice, which is central to the hardness of ML-KEM.
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedOption.id === 4 && (
                    <div>
                      <ul className="divide-y divide-base-300">
                        {sessions.map((session) => (
                          <li key={session.id} className="py-2 flex justify-between items-center">
                            <span>{session.deviceInfo}</span>
                            <button className="btn btn-xs btn-error" onClick={() => revokeSession(session._id)}>Revoke</button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedOption.id === 5 && (
                    <div>
                      <input className="input input-bordered w-full" value={userOrCommunity} onChange={e => setUserOrCommunity(e.target.value)} placeholder="Username or Community" />
                      <button className="btn btn-info mt-2" onClick={handleSearchConversation}>Search</button>
                      {loadingSummary ? <p>Loading summary...</p> : summaryText && <p className="bg-base-200 p-4 rounded mt-4">{summaryText}</p>}
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
              )}
            </div>
            <div className="modal-action">
              <button onClick={closeModal} className="btn btn-success">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityOptions;


// Estilos en línea para el componente
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

