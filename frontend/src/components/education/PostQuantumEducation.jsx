import { useState } from 'react';
import Modal from 'react-modal';

const postQuantumUnits = [
  { 
    id: 1, 
    title: "Introducción a la Criptografía Post-Cuantica", 
    resources: [
      { type: "Video", link: "https://link-a-video.com" },
      { type: "Imagen", link: "https://link-a-imagen.com" },
      { type: "PDF", link: "https://link-a-pdf.com" },
    ]
  },
  { 
    id: 2, 
    title: "Algoritmos de Firma Crystals Dilithium", 
    resources: [
      { type: "Video", link: "https://link-a-video-dilithium.com" },
      { type: "Imagen", link: "https://link-a-imagen-dilithium.com" },
      { type: "PDF", link: "https://link-a-pdf-dilithium.com" },
    ]
  },
  { 
    id: 3, 
    title: "ML-KEM: Un Enfoque en la Criptografía Post-Cuantica", 
    resources: [
      { type: "Video", link: "https://link-a-video-mlkem.com" },
      { type: "Imagen", link: "https://link-a-imagen-mlkem.com" },
      { type: "PDF", link: "https://link-a-pdf-mlkem.com" },
    ]
  },
  { 
    id: 4, 
    title: "Teoría Cuántica y sus Implicaciones en la Criptografía", 
    resources: [
      { type: "Video", link: "https://link-a-video-teoria.com" },
      { type: "Imagen", link: "https://link-a-imagen-teoria.com" },
      { type: "PDF", link: "https://link-a-pdf-teoria.com" },
    ]
  },
  { 
    id: 5, 
    title: "Construcción de Protocolos Post-Cuanticos", 
    resources: [
      { type: "Video", link: "https://link-a-video-protocolos.com" },
      { type: "Imagen", link: "https://link-a-imagen-protocolos.com" },
      { type: "PDF", link: "https://link-a-pdf-protocolos.com" },
    ]
  },
];

const PostQuantumEducation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleUnitClick = (unit) => {
    setSelectedUnit(unit);
  };

  return (
    <div>
      {/* Texto en la esquina inferior derecha */}
      <div style={styles.securityText} onClick={openModal}>
        Curso de Post-Cuantica
      </div>

      {/* Modal con las unidades didácticas */}
      <Modal isOpen={isOpen} onRequestClose={closeModal} contentLabel="Educación Post-Cuantica" style={modalStyles}>
        <div style={styles.popupContainer}>
          {/* Lista de unidades didácticas */}
          <div style={styles.unitsList}>
            <h3>Unidades Didácticas</h3>
            <ul>
              {postQuantumUnits.map((unit) => (
                <li key={unit.id} style={styles.option} onClick={() => handleUnitClick(unit)}>
                  {unit.title}
                </li>
              ))}
            </ul>
          </div>

          {/* Enlaces de recursos para la unidad seleccionada */}
          <div style={styles.unitDetails}>
            {selectedUnit ? (
              <>
                <h3>{selectedUnit.title}</h3>
                <ul>
                  {selectedUnit.resources.map((resource, index) => (
                    <li key={index}>
                      <a href={resource.link} target="_blank" rel="noopener noreferrer">
                        {resource.type}: {resource.link}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>Selecciona una unidad para ver los recursos.</p>
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
    bottom: '60px',
    right: '20px',
    fontSize: '15px',
    cursor: 'pointer', 
    padding: '10px 20px',
    backgroundColor: 'green',
    color: '#fff',
    borderRadius: '5px',
  },
  popupContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '800px',
    height: '500px',
  },
  unitsList: {
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
  unitDetails: {
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

export default PostQuantumEducation;
