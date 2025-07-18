import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSignup from '../../hooks/useSignup.js';
import '@tensorflow/tfjs';
import * as faceapi from 'face-api.js';
import { toast } from 'react-hot-toast';

const Signup = () => {
  const [inputs, setInputs] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const { loading, signup } = useSignup();

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
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      const stream = videoRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
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
      console.error(err);
      toast.error("Failed to access the camera.");
    }
  };

  const stopVideo = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      videoRef.current.srcObject = null;
    }

    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    setFaceDetected(false);
    setFaceDescriptor(null);
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
      setFaceDescriptor(detection.descriptor);
    } else {
      setFaceDetected(false);
      setFaceDescriptor(null);
      console.warn('No face detected. Make sure your face is well-lit and within the frame.');
    }

    animationFrameRef.current = requestAnimationFrame(detectFaceLoop);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword } = inputs;

    if (!faceDescriptor) {
      toast.error("Please capture your face before signing up.");
      return;
    }

    const result = await signup({ username, email, password, confirmPassword, faceDescriptor });

    // If signup was successful, stop the camera
    if (result && result.success) {
      stopVideo();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-w-96 mx-auto relative">
      <div className="w-full max-w-4xl p-3 sm:p-4 lg:p-6 rounded-lg shadow-lg bg-white border border-gray-200 relative z-10">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-center text-gray-800 mb-4 sm:mb-6">
          Sign Up to <span className="text-blue-500">PQCare</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Responsive layout: 2 columns on large+ screens, 1 column on smaller screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Input fields column */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div>
                  <label className="label p-2">
                    <span className="text-sm sm:text-base label-text text-gray-700">Username</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter your username" 
                    value={inputs.username}
                    onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
                    className="w-full input input-bordered h-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm" 
                  />
                </div>

                <div>
                  <label className="label p-2">
                    <span className="text-sm sm:text-base label-text text-gray-700">Email</span>
                  </label>
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={inputs.email}
                    onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
                    className="w-full input input-bordered h-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm" 
                  />
                </div>

                <div>
                  <label className="label p-2">
                    <span className="text-sm sm:text-base label-text text-gray-700">Password</span>
                  </label>
                  <input 
                    type="password" 
                    placeholder="Enter your password" 
                    value={inputs.password}
                    onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                    className="w-full input input-bordered h-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm" 
                  />
                </div>

                <div>
                  <label className="label p-2">
                    <span className="text-sm sm:text-base label-text text-gray-700">Confirm Password</span>
                  </label>
                  <input 
                    type="password" 
                    placeholder="Confirm your password" 
                    value={inputs.confirmPassword}
                    onChange={(e) => setInputs({ ...inputs, confirmPassword: e.target.value })}
                    className="w-full input input-bordered h-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm" 
                  />
                </div>
              </div>
            </div>

            {/* Facial Recognition Section - Only visible on large+ screens */}
            <div className="hidden lg:block space-y-4">
              <div className="text-center">
                <span className="text-lg font-medium text-gray-700">Facial Recognition</span>
                <p className="text-sm text-gray-500 mt-1">Capture your face for secure login</p>
              </div>
              
              <div className="relative w-full max-w-xs aspect-square mx-auto">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  onPlay={detectFaceLoop}
                  className="rounded-2xl w-full h-full object-cover bg-gray-100"
                />
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full rounded-2xl" />
                
                {/* Subtle detection frame */}
                <div className="absolute border border-blue-300 rounded-xl
                  w-[75%] aspect-square top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                  z-20 pointer-events-none" />
                
                {/* Status indicator */}
                {faceDetected && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    ✓ Detected
                  </div>
                )}
              </div>
              
              {/* Simple progress bar */}
              <div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${faceDetected ? 100 : 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  {faceDetected ? 'Face captured successfully!' : 'Position your face in the center'}
                </p>
              </div>
              
              {/* Simplified buttons */}
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
                  onClick={stopVideo} 
                  className="w-full py-2 px-4 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Stop Camera
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Facial Recognition Section - Expandable */}
          <div className="lg:hidden">
            <div className="border-t border-gray-200 pt-4">
              <div className="text-center mb-4">
                <span className="text-base font-medium text-gray-700">Facial Recognition (Optional)</span>
                <p className="text-xs text-gray-500 mt-1">Add face login for extra security</p>
              </div>
              
              <div className="flex justify-center space-x-3">
                <button 
                  type="button" 
                  onClick={startVideo} 
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
                >
                  Start Camera
                </button>
                <button 
                  type="button" 
                  onClick={stopVideo} 
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Stop Camera
                </button>
              </div>
              
              {faceDetected && (
                <div className="mt-3 text-center">
                  <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <span className="mr-2">✓</span>
                    Face captured successfully!
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
            <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              Already have an account?
            </Link>
            <button 
              className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-all duration-200 text-sm ${
                faceDetected && !loading 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={loading || !faceDetected}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Sign Up'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
