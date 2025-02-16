import { useState } from 'react';
import Modal from 'react-modal';
import { Canvas } from '@react-three/fiber';
import { useRef } from 'react';
import axios from 'axios';
import useSecurity from '../../zustand/useSecurity.js';


// Definir las opciones de seguridad y sus detalles
const securityOptions = [
  { id: 1, title: "Borrado de mensajes", details: "El borrado de mensajes permite a los usuarios eliminar mensajes de manera permanente" },
  { id: 2, title: "Tamaño de la clave de cifrado", details: "Cuanto mayor sea el tamaño de la clave, más difícil será para los atacantes descifrar la información" },
  { id: 3, title: "Claves Publicas Reticulares", details: "Permite mostrar una clave publica introducida por el usuario en un retículo." },
  { id: 4, title: "Cifrado de datos", details: "Cifra la información sensible para protegerla de accesos no autorizados." },
];

const SecurityOptions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedKeySize, setLocalSelectedKeySize] = useState('');
  const [base64Key, setBase64Key] = useState('');
  const [latticePoints, setLatticePoints] = useState([]);

  // Función para abrir y cerrar el modal
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  // Accede a la función de zustand para actualizar el tipo de clave
  const { setSelectedKeySize } = useSecurity(); 
  const deleteOldMessagesFromBackend = async (timePeriod) => {
    try {
      const response = await axios.post('https://chatapp-7lh7.onrender.com/api/deleteOldMessages', { timePeriod });
      alert(response.data.message);  // Muestra un mensaje de éxito
    } catch (error) {
      console.error('Error al eliminar los mensajes', error);
      alert('Hubo un error al intentar eliminar los mensajes.');
    }
  };

  const handleKeySizeChange = (event) => {
    const selectedSize = event.target.value;
    setLocalSelectedKeySize(selectedSize); // Actualizar el tipo de clave en el estado local
    console.log("Selected Key Size: ", selectedSize);
    setSelectedKeySize(selectedSize); // Actualizar también el estado global de zustand
  };

  // Función para seleccionar una opción de seguridad
  const handleOptionClick = (option) => {
    setSelectedOption(option);
    if (option.id === 1) {
      setSelectedKeySize(''); // Resetear la selección de tamaño de clave cuando se elige la opción de Borrado de mensajes
      setBase64Key(''); // Resetear la clave cuando se elige otra opción
      setLatticePoints([]); // Resetear la cuadrícula de puntos cuando se elige otra opción
    }
  };

  // Función para manejar la clave pública en base64
  const handleBase64Change = (event) => {
    setBase64Key(event.target.value);
  };

    // Función para convertir la clave en base64 a una estructura de bytes
    const base64ToBytes = (base64) => {
      const decodedData = atob(base64);
      const byteArray = new Uint8Array(decodedData.length);
      for (let i = 0; i < decodedData.length; i++) {
        byteArray[i] = decodedData.charCodeAt(i);
      }
      return byteArray;
    };
  
    // Función para generar puntos reticulares
    const generateLatticePoints = (byteArray) => {
      const points = [];
      const gridSize = 10; // Tamaño de la cuadrícula, ajustable para hacerla más densa o dispersa
  
      for (let i = 0; i < byteArray.length; i++) {
        const x = (i % gridSize) * 2 - gridSize; // Distribuir los puntos en el eje X
        const y = Math.floor(i / gridSize) * 2 - gridSize; // Distribuir los puntos en el eje Y
        const z = byteArray[i] / 255 * 2 - 1; // Usar el valor del byte para la posición Z (normalizado)
        points.push([x, y, z]);
      }
      return points;
    };
  
    // Función para procesar la clave y mostrar los puntos
    const handleGenerateLattice = () => {
      const byteArray = base64ToBytes(base64Key);
      const points = generateLatticePoints(byteArray);
      setLatticePoints(points);
    };
  
  return (
    <div>
      {/* Texto en la esquina de la derecha */}
      <div style={styles.securityText} onClick={openModal}>
        Opciones de seguridad
      </div>

      {/* Modal con las opciones de seguridad */}
      <Modal isOpen={isOpen} onRequestClose={closeModal} contentLabel="Opciones de Seguridad" style={modalStyles}>
        <div style={styles.popupContainer}>
          {/* Lista de opciones de seguridad */}
          <div style={styles.optionsList}>
            <h3>Opciones de seguridad</h3>
            <ul>
              {securityOptions.map((option) => (
                <li key={option.id} style={styles.option} onClick={() => handleOptionClick(option)}>
                  {option.title}
                </li>
              ))}
            </ul>
          </div>

          {/* Detalles de la opción seleccionada */}
          <div style={styles.optionDetails}>
            {selectedOption ? (
              <>
                <h3>{selectedOption.title}</h3>
                <p>{selectedOption.details}</p>
                {selectedOption.id === 1 && (
                  <div>
                    <h4>Selecciona la frecuencia de borrado de mensajes:</h4>
                    <form>
                      <label>
                        <input 
                          type="radio" 
                          name="frequency" 
                          value="1 hora" 
                          onChange={() => deleteOldMessagesFromBackend('1 hora')}
                        />
                        1 hora
                      </label>
                      <br />
                      <label>
                        <input 
                          type="radio" 
                          name="frequency" 
                          value="1 día" 
                          onChange={() => deleteOldMessagesFromBackend('1 día')}
                        />
                        1 día
                      </label>
                      <br />
                      <label>
                        <input 
                          type="radio" 
                          name="frequency" 
                          value="1 semana" 
                    
                          onChange={() => deleteOldMessagesFromBackend('1 semana')}
                        />
                        1 semana
                      </label>
                    </form>
                  </div>
                )}

                {selectedOption.id === 2 && (
                  <div>
                    <h4>Selecciona el esquema de cifrado:</h4>
                    <form>
                      <label>
                        <input 
                          type="radio" 
                          name="keySize" 
                          value="ML-KEM-512" 
                          checked={selectedKeySize === 'ML-KEM-512'}
                          onChange={handleKeySizeChange} 
                        />
                        ML-KEM-512
                      </label>
                      <br />
                      <label>
                        <input 
                          type="radio" 
                          name="keySize" 
                          value="ML-KEM-768" 
                          checked={selectedKeySize === 'ML-KEM-768'}
                          onChange={handleKeySizeChange} 
                        />
                        ML-KEM-768
                      </label>
                      <br />
                      <label>
                        <input 
                          type="radio" 
                          name="keySize" 
                          value="ML-KEM-1024" 
                          checked={selectedKeySize === 'ML-KEM-1024'}
                          onChange={handleKeySizeChange} 
                        />
                        ML-KEM-1024
                      </label>
                    </form>
                    <p><strong>Esquema de cifrado seleccionado: </strong>{selectedKeySize}</p>
                  </div>
                )}
                 {selectedOption.id === 3 && (
                  <div>
                    <h4>Introduce la clave pública en Base64:</h4>
                    <input 
                      type="text" 
                      value={base64Key} 
                      onChange={handleBase64Change} 
                      placeholder="Clave pública en Base64" 
                      style={styles.inputField}
                    />
                    <button onClick={handleGenerateLattice} style={styles.generateButton}>Generar retículo</button>

                    {latticePoints.length > 0 && (
                      <div style={{ width: '100%', height: '400px' }}>
                        <Canvas style={{ width: '100%', height: '100%' }}>
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
              </>
            ) : (
              <p>Selecciona una opción para ver los detalles.</p>
            )}
          </div>
        </div>
        <button onClick={closeModal} style={styles.closeButton}>Cerrar</button>
      </Modal>
    </div>
  );
};

// Estilos en línea para el componente
const styles = {
  securityText: {
    position: 'fixed',
    top: '0px',
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
