import {create} from 'zustand';

const useSecurity = create((set) => ({
  selectedKeySize: 'ML-KEM-512', // Aquí almacenamos el tipo de clave
  setSelectedKeySize: (keySize) => set({ selectedKeySize: keySize }), // Función para actualizar el tipo de clave
}));

export default useSecurity;
