import * as faceapi from 'face-api.js';

export const loadFaceApiModels = async () => {
  const MODEL_URL = './models'; // Cambia esta ruta si los modelos están en otra ubicación
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
};

export default loadFaceApiModels;