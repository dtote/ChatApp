import React, { useState, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { Link } from 'react-router-dom';
import useLogin from '../../hooks/useLogin';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isFaceLogin, setIsFaceLogin] = useState(false); // Para cambiar entre métodos de inicio de sesión
  const videoRef = useRef(null);
  const { loading, login } = useLogin();

  // Función para iniciar el video
  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => {
        videoRef.current.srcObject = stream;
      })
      .catch(err => console.error('Error al acceder a la cámara:', err));
  };

  // Función para capturar la imagen y enviar al backend
  const captureImage = async () => {
  try {
    // Cargar los modelos necesarios desde el servidor
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');

    // Detección de la cara usando el video de referencia
    const detections = await faceapi.detectAllFaces(
      videoRef.current,
      new faceapi.TinyFaceDetectorOptions()
    ).withFaceLandmarks().withFaceDescriptors();

    // Si no se detecta ninguna cara, mostrar un error
    if (detections.length === 0) {
      toast.error('No se detectó ninguna cara. Por favor, inténtalo de nuevo.');
      return;
    }

    const faceData = detections[0].descriptor; // Descripción de la cara

    // Enviar los datos faciales al backend
    const response = await fetch('/api/auth/loginFacial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faceData }), // Enviar solo la descripción facial
    });

    // Manejar la respuesta
    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status}`);
    }

    const data = await response.json();
    toast.success('Inicio de sesión facial exitoso');
    // Manejar el token y autenticación
  } catch (error) {
    console.error('Error durante el inicio de sesión facial:', error);
    toast.error(error.message);
  }
};

	
  // Manejo del envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFaceLogin) {
      await login(username, password); // Login por usuario y contraseña
    } else {
			console.log("Iniciando captura de imagen...");
      await captureImage(); // Login facial
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-w-96 mx-auto'>
      <div className='w-full p-6 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0'>
        <h1 className='text-3xl font-semibold text-center text-gray-300'>
          Login <span className='text-blue-500'>ChatApp</span>
        </h1>

        <form onSubmit={handleSubmit}>
          {!isFaceLogin ? (
            <>
              <div>
                <label className='label p-2'>
                  <span className='text-base label-text'>Username</span>
                </label>
                <input
                  type='text'
                  placeholder='Enter username'
                  className='w-full input input-bordered h-10'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <label className='label'>
                  <span className='text-base label-text'>Password</span>
                </label>
                <input
                  type='password'
                  placeholder='Enter Password'
                  className='w-full input input-bordered h-10'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </>
          ) : (
            <div>
              <label className='label p-2'>
                <span className='text-base label-text'>Facial Login</span>
              </label>
              <video ref={videoRef} autoPlay className='w-full h-40 mb-4' />
              <button type='button' onClick={startVideo} className='btn btn-block'>
                Start Video
              </button>
            </div>
          )}

          <div>
            <button className='btn btn-block btn-sm mt-2' disabled={loading}>
              {loading ? <span className='loading loading-spinner'></span> : "Login"}
            </button>
          </div>

          <div className='flex justify-between mt-4'>
            <span onClick={() => setIsFaceLogin(!isFaceLogin)} className='cursor-pointer text-blue-600 hover:underline'>
              {isFaceLogin ? "Use Username/Password" : "Use Facial Recognition"}
            </span>
            <Link to='/signup' className='text-sm hover:underline hover:text-blue-600'>
              {"Don't"} have an account?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

