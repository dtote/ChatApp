// Login.js (mejorado con todas las mejoras y barra de progreso de detección facial)
import React, { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { Link, useNavigate } from 'react-router-dom';
import useLogin from '../../hooks/useLogin';
import { toast } from 'react-hot-toast';
import { useAuthContext } from '../../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isFaceLogin, setIsFaceLogin] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [detectionProgress, setDetectionProgress] = useState(0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const { loading, login } = useLogin();
  const { setAuthUser } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const loadModels = async () => {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      ]);
      toast.success("Models loaded successfully.");
    };
    loadModels();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      const stream = videoRef.current?.srcObject;
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 720 }, height: { ideal: 560 } },
      });
      videoRef.current.srcObject = stream;
      toast.success("Camera activated. Please align your face inside the frame.");
    } catch (err) {
      console.error('Camera access error:', err);
      toast.error('Unable to access the camera.');
    }
  };

  const detectFaceLoop = async () => {
    const video = videoRef.current;
    if (!video || video.paused || video.ended || video.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(detectFaceLoop);
      return;
    }

    const canvas = canvasRef.current;
    faceapi.matchDimensions(canvas, {
      width: video.videoWidth,
      height: video.videoHeight,
    });

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceDescriptor();

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (detection) {
      const resized = faceapi.resizeResults(detection, {
        width: video.videoWidth,
        height: video.videoHeight,
      });
      faceapi.draw.drawDetections(canvas, resized);
      faceapi.draw.drawFaceLandmarks(canvas, resized);
      setFaceDetected(true);
      setDetectionProgress(100);
    } else {
      setFaceDetected(false);
      setDetectionProgress((prev) => (prev < 95 ? prev + 1 : 0));
    }

    animationFrameRef.current = requestAnimationFrame(detectFaceLoop);
  };

  const captureImage = async () => {
    try {
      const video = videoRef.current;
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        throw new Error('No face detected.');
      }

      const formData = new FormData();
      formData.append('faceDescriptor', JSON.stringify(Array.from(detection.descriptor)));
      formData.append('username', username);

      const response = await fetch('/api/auth/loginFacial', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) throw new Error(`Request error: ${response.status}`);

      const data = await response.json();
      if (data) {
        localStorage.setItem('chat-user', JSON.stringify(data));
        setAuthUser(data);
        navigate('/');
        toast.success('Facial login successful!');
      }
    } catch (error) {
      console.error('Facial login error:', error);
      toast.error(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFaceLogin) {
      await login(username, password);
    } else {
      await captureImage();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-w-96 mx-auto relative">
      <div className="w-full p-6 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0 relative z-10">
        <h1 className="text-3xl font-semibold text-center text-gray-300">
          Login <span className="text-blue-500">ChatApp</span>
        </h1>

        <form onSubmit={handleSubmit}>
          {!isFaceLogin ? (
            <>
              <div>
                <label className="label p-2">
                  <span className="text-base label-text">Username</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="w-full input input-bordered h-10"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="label">
                  <span className="text-base label-text">Password</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full input input-bordered h-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </>
          ) : (
            <div className="relative w-full mt-4">
              <label className="label p-2">
                <span className="text-base label-text">Facial Recognition Login</span>
              </label>
              <div className="relative w-full sm:max-w-sm aspect-[4/3]">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  onPlay={detectFaceLoop}
                  className="rounded-lg w-full h-full object-cover bg-black"
                />
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
                <div className="absolute border-4 border-green-400 rounded-md 
                  w-[60%] aspect-square top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                  z-20 pointer-events-none max-w-xs" />
                <div className="absolute bottom-2 left-0 right-0 px-4">
                  <progress className="progress w-full" value={detectionProgress} max="100"></progress>
                </div>
              </div>
              <button type="button" onClick={startVideo} className="btn btn-block mt-4">
                Activate Camera
              </button>
            </div>
          )}

          <div>
            <button className="btn btn-block btn-sm mt-2" disabled={loading || (isFaceLogin && !faceDetected)}>
              {loading ? <span className="loading loading-spinner"></span> : 'Login'}
            </button>
          </div>

          <div className="flex justify-between mt-4">
            <span
              onClick={() => setIsFaceLogin(!isFaceLogin)}
              className="cursor-pointer text-blue-600 hover:underline"
            >
              {isFaceLogin ? 'Use username/password' : 'Use facial recognition'}
            </span>
            <Link to="/signup" className="text-sm hover:underline hover:text-blue-600">
              Don't have an account?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;