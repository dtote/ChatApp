import { create } from 'zustand';

const useSecurity = create((set) => ({
  selectedKeySize: 'ML-KEM-512', // Here we store the key type
  setSelectedKeySize: (keySize) => set({ selectedKeySize: keySize }), // Function to update the key type
}));

export default useSecurity;
