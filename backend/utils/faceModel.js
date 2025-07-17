import * as faceapi from 'face-api.js';

export const loadFaceApiModels = async () => {
  const MODEL_URL = './models'; // Change this path if the models are in another location
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
};

export default loadFaceApiModels;