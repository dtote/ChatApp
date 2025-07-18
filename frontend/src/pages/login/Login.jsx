// Login.js (enhanced with all improvements and facial detection progress bar)
import React, { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { Link, useNavigate } from 'react-router-dom';
import useLogin from '../../hooks/useLogin';
import { useCameraContext } from '../../context/CameraContext.jsx';
import { toast } from 'react-hot-toast';
import { useAuthContext } from '../../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isFaceLogin, setIsFaceLogin] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [detectionProgress, setDetectionProgress] = useState(0);
  const { videoRef, canvasRef, animationFrameRef, startVideo, stopVideo } = useCameraContext();
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
  }, []);

  // Custom stopVideo that also resets face detection state
  const handleStopVideo = () => {
    stopVideo();
    setFaceDetected(false);
    setDetectionProgress(0);
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
        // Stop camera before navigating
        handleStopVideo();

        localStorage.setItem('chat-user', JSON.stringify(data));
        localStorage.setItem('token', data.token);
        if (data.sessionId) {
          localStorage.setItem("sessionId", data.sessionId);
        }
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
      <div className="w-full p-6 rounded-lg shadow-lg bg-white border border-gray-200 relative z-10">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Login <span className="text-blue-500">PQCare</span>
        </h1>

        <form onSubmit={handleSubmit}>
          {!isFaceLogin ? (
            <>
              <div>
                <label className="label p-2">
                  <span className="text-base label-text text-gray-700">Username</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="w-full input input-bordered h-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="label">
                  <span className="text-base label-text text-gray-700">Password</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full input input-bordered h-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </>
          ) : (
            <div className="relative w-full mt-6">
              <div className="text-center mb-4">
                <span className="text-lg font-medium text-gray-700">Facial Recognition</span>
                <p className="text-sm text-gray-500 mt-1">Position your face in the center</p>
              </div>
              
              <div className="relative w-full max-w-xs aspect-[4/3] mx-auto mb-6">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  onPlay={detectFaceLoop}
                  className="rounded-2xl w-full h-full object-cover bg-gray-100"
                />
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full rounded-2xl" />
                
                {/* Marco de detección más sutil */}
                <div className="absolute border border-blue-300 rounded-xl
                  w-[75%] aspect-square top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                  z-20 pointer-events-none" />
                
                {/* Indicador de estado */}
                {faceDetected && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    ✓ Detected
                  </div>
                )}
              </div>
              
              {/* Barra de progreso simple */}
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${detectionProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  {detectionProgress === 100 ? 'Face detected successfully!' : 'Detecting face...'}
                </p>
              </div>
              
              {/* Botones simplificados */}
              <div className="space-y-3">
                <button 
                  type="button" 
                  onClick={startVideo} 
                  className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Start Camera
                </button>
                <button 
                  type="button" 
                  onClick={handleStopVideo} 
                  className="w-full py-2 px-4 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Stop Camera
                </button>
              </div>
            </div>
          )}

          <div>
            <button 
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 mt-6 ${
                faceDetected && !loading 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={loading || (isFaceLogin && !faceDetected)}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Login'
              )}
            </button>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => {
                if (isFaceLogin) {
                  stopVideo();
                }
                setIsFaceLogin(!isFaceLogin);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            >
              {isFaceLogin ? '← Back to password login' : 'Try facial recognition'}
            </button>
            <Link to="/signup" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;