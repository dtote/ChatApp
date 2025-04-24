import { useState } from 'react';
import Modal from 'react-modal';

const postQuantumUnits = [
  { 
    id: 1, 
    title: "Introducción a la Criptografía Post-Cuantica", 
    resources: [
      { type: "Video", link: "https://www.youtube.com/watch?v=Z2RjZB6dVyw" },
      { type: "Video", link: "https://www.youtube.com/watch?v=DlUft80yUec" },
      { type: "Video", link: "https://www.youtube.com/watch?v=QZBkhmqyBTA" },
      { type: "Video", link: "https://www.youtube.com/watch?v=MBdKvBA5vrw" },
      { type: "Imagen", link: "https://link-a-imagen.com" },
      { type: "Cuaderno", link: "https://www.geogebra.org/m/cm2e42fk" },
      { type: "Cuaderno", link: "https://www.geogebra.org/m/nyzt7puf" },
      { type: "PDF", link: "https://drive.google.com/file/d/1iT1q6c2HRXchnYtzntcxPTdAqjOvtoDq/view?usp=drive_link" },
      { type: "PDF", link: "https://drive.google.com/file/d/1vlA2A9E0xaVINI_xTcDRdYow0vlC-van/view?usp=drive_link" },
    ]
  },
  { 
    id: 2, 
    title: "Algoritmos de Firma Crystals Dilithium, ML-DSA", 
    resources: [
      { type: "Video", link: "https://link-a-video-dilithium.com" },
      { type: "Imagen", link: "https://link-a-imagen-dilithium.com" },
      { type: "PDF", link: "https://drive.google.com/file/d/14b-M3DWwsa4R3U7Orbr0qf4_Mj6ycvFA/view?usp=drive_link" },
      { type: "PDF", link: "https://drive.google.com/file/d/13K86XWKNU154hld3mnSQGtxpOR_oB8By/view?usp=drive_link"}
    ]
  },
  { 
    id: 3, 
    title: "ML-KEM: Un Enfoque en la Criptografía Post-Cuantica", 
    resources: [
      { type: "Video", link: "https://www.youtube.com/watch?v=832mo7IVJug&t=5s" },
      { type: "Imagen", link: "https://link-a-imagen-mlkem.com" },
      { type: "PDF", link: "https://drive.google.com/file/d/1czpSih6WvrG8QzKTrx1_DWIBLideeZOb/view?usp=drive_link" },
      { type: "PDF", link: "https://drive.google.com/file/d/1nw1FaFaqGhAAKHuxRH-7HbMh3uHdBiuC/view?usp=drive_link"  },
      { type: "PDF", link: "https://drive.google.com/file/d/1O3apCrbSYn5flzrCjlqHlxB1BlC4ySaA/view?usp=drive_link"},
      { type: "PDF", link: "https://drive.google.com/file/d/1EEaJYUQZZEuYxKgBqU9y9ZyhlhQwHo-9/view?usp=drive_link"},
    ]
  }
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
