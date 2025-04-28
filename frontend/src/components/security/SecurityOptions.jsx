import { useState } from 'react';
import Modal from 'react-modal';
import { Canvas } from '@react-three/fiber';
import { useRef } from 'react';
import axios from 'axios';
import useSecurity from '../../zustand/useSecurity.js';
import useGetSummary from '../../hooks/useGetSummary.js';
import { MdDeleteForever, MdVpnKey, MdGridOn, MdLockOutline, MdSummarize,} from "react-icons/md";


const securityOptions = [
  {
    id: 1,
    title: "Message Deletion",
    details: "Message deletion allows users to permanently remove messages.",
    icon: <MdDeleteForever className="text-xl text-primary" />,
  },
  {
    id: 3,
    title: "Lattice Public Keys",
    details: "Allows displaying a public key entered by the user in a lattice.",
    icon: <MdGridOn className="text-xl text-primary" />,
  },
  {
    id: 5,
    title: "Conversation Summary",
    details: "Generates a summary of the conversation using OpenAI's artificial intelligence.",
    icon: <MdSummarize className="text-xl text-primary" />,
  },
];


const SecurityOptions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedKeySize, setLocalSelectedKeySize] = useState('');
  const [base64Key, setBase64Key] = useState('');
  const [latticePoints, setLatticePoints] = useState([]);
  const [summaryText, setSummaryText] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [userOrCommunity, setUserOrCommunity] = useState("");  // Nuevo estado para el nombre de usuario o comunidad
  const [conversation, setConversation] = useState(null);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const getSummary = useGetSummary();


  const { setSelectedKeySize } = useSecurity(); 

  const deleteOldMessagesFromBackend = async (timePeriod) => {
    try {
      const response = await axios.post('/api/deleteOldMessages', { timePeriod });
      alert(response.data.message); 
    } catch (error) {
      console.error('Error al eliminar los mensajes', error);
      alert('Hubo un error al intentar eliminar los mensajes.');
    }
  };

  const handleKeySizeChange = (event) => {
    const selectedSize = event.target.value;
    setLocalSelectedKeySize(selectedSize);
    setSelectedKeySize(selectedSize);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    if (option.id === 1) {
      setSelectedKeySize('');
      setBase64Key('');
      setLatticePoints([]);
    }
    if (option.id === 5) {
      setSummaryText(""); 
      setUserOrCommunity("");
    }
  };

  const handleBase64Change = (event) => {
    setBase64Key(event.target.value);
  };

  const base64ToBytes = (base64) => {
    const decodedData = atob(base64);
    const byteArray = new Uint8Array(decodedData.length);
    for (let i = 0; i < decodedData.length; i++) {
      byteArray[i] = decodedData.charCodeAt(i);
    }
    return byteArray;
  };

  const generateLatticePoints = (byteArray) => {
    const points = [];
    const gridSize = 10;

    for (let i = 0; i < byteArray.length; i++) {
      const x = (i % gridSize) * 2 - gridSize;
      const y = Math.floor(i / gridSize) * 2 - gridSize;
      const z = byteArray[i] / 255 * 2 - 1;
      points.push([x, y, z]);
    }
    return points;
  };

  const handleGenerateLattice = () => {
    const byteArray = base64ToBytes(base64Key);
    const points = generateLatticePoints(byteArray);
    setLatticePoints(points);
  };

  
  const handleSearchConversation = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("chat-user"))?.token;
  
      const response = await axios.get(`/api/conversation/search`, {
        params: { name: userOrCommunity },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (response.data && response.data.conversationIds) {
        const { conversationIds, type } = response.data;
        setConversation({ ids: conversationIds, type: type });
        handleGetSummary(conversationIds, type);
      } else {
        alert('No se encontró una conversación para ese nombre.');
      }
    } catch (error) {
      console.error('Error al buscar la conversación:', error);
      alert('Hubo un error al buscar la conversación.');
    }
  };

  const handleGetSummary = async (conversationIds, type) => {
    setLoadingSummary(true);
    try {
      const summary = await getSummary(conversationIds, type, 50);
      if (summary) {
        setSummaryText(summary);
      }
    } catch (error) {
      console.error("Error al obtener el resumen:", error);
    }
    setLoadingSummary(false);
  };
  
  return (
    <div className="fixed top-2 right-4 z-50">
    <button className="btn btn-sm btn-accent" onClick={openModal}>
      Security Options
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
                  <button
                    className="w-full text-left flex items-center gap-3 py-3 px-4 rounded-md hover:bg-base-200 transition duration-200 border-b border-base-300"
                    onClick={() => handleOptionClick(option)}
                  >
                    {option.icon}
                    <span>{option.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
  
          <div className="w-full md:w-2/3 pl-4 overflow-y-auto">
            {selectedOption ? (
              <div className="space-y-4">
                <h3 className="text-xl mt-[20px] font-bold">{selectedOption.title}</h3>
                <p className="text-sm text-gray-500">{selectedOption.details}</p>
  
                {selectedOption.id === 1 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Select message deletion frequency:</h4>
                    {["1 hour", "1 day", "1 week"].map((val) => (
                      <label className="label cursor-pointer" key={val}>
                        <input type="radio" name="frequency" className="radio checked:bg-red-500" onChange={() => deleteOldMessagesFromBackend(val)} />
                        <span className="label-text ml-2">{val}</span>
                      </label>
                    ))}
                  </div>
                )}
  
                {selectedOption.id === 3 && (
                  <div className="space-y-2">
                    <input
                      className="input input-bordered w-full"
                      value={base64Key}
                      onChange={handleBase64Change}
                      placeholder="Public key in Base64"
                    />
                    <button className="btn btn-primary" onClick={handleGenerateLattice}>Generate Lattice</button>
                    {latticePoints.length > 0 && (
                      <div className="h-64 mt-4">
                        <Canvas>
                          {latticePoints.map((point, index) => (
                            <mesh key={index} position={point}>
                              <sphereGeometry args={[0.1, 8, 8]} />
                              <meshBasicMaterial color="blue" />
                            </mesh>
                          ))}
                        </Canvas>
                      </div>
                    )}
                  </div>
                )}
  
                {selectedOption.id === 5 && (
                  <div className="space-y-2">
                    <input
                      className="input input-bordered w-full"
                      value={userOrCommunity}
                      onChange={(e) => setUserOrCommunity(e.target.value)}
                      placeholder="Username or Community"
                    />
                    <button className="btn btn-info" onClick={handleSearchConversation}>Search Conversation</button>
  
                    {loadingSummary ? (
                      <p className="text-sm mt-2">Loading summary...</p>
                    ) : (
                      summaryText && (
                        <div className="mt-4 bg-base-200 p-4 rounded-box">
                          <h4 className="font-semibold">Conversation Summary:</h4>
                          <p className="text-sm">{summaryText}</p>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm pt-8 text-gray-400">Select an option to view details.</p>
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

export default SecurityOptions;
