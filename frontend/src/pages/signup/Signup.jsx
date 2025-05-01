import { useState, useRef, useEffect } from 'react';
import GenderCheckbox from './GenderCheckBox.jsx';
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
    confirmPassword: '',
    gender: ''
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

  const handleCheckboxChange = (gender) => {
    setInputs({ ...inputs, gender });
  };

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
    const { username, email, password, gender, confirmPassword } = inputs;

    if (!faceDescriptor) {
      toast.error("Please capture your face before signing up.");
      return;
    }

    await signup({ username, email, password, confirmPassword, gender, faceDescriptor });
  };

  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-gradient-to-br to-slate-950 px-4 py-8'>
      <div className="w-full max-w-3xl bg-white/10 backdrop-blur-md shadow-xl rounded-xl p-20 sm:p-8">
        <h1 className='text-4xl font-bold text-center text-white mb-6'>
          Sign Up to <span className='text-green-400'>ChatApp</span>
        </h1>

        <form onSubmit={handleSubmit} className='grid gap-4 grid-cols-1 md:grid-cols-2'>
          <div>
            <label className='label'><span className='label-text text-white'>Username</span></label>
            <input type='text' placeholder='Enter your username' value={inputs.username}
              onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
              className='input input-bordered w-full' />
          </div>

          <div>
            <label className='label'><span className='label-text text-white'>Email</span></label>
            <input type='text' placeholder='Enter your email' value={inputs.email}
              onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
              className='input input-bordered w-full' />
          </div>

          <div>
            <label className='label'><span className='label-text text-white'>Password</span></label>
            <input type='password' placeholder='Enter your password' value={inputs.password}
              onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
              className='input input-bordered w-full' />
          </div>

          <div>
            <label className='label'><span className='label-text text-white'>Confirm Password</span></label>
            <input type='password' placeholder='Confirm your password' value={inputs.confirmPassword}
              onChange={(e) => setInputs({ ...inputs, confirmPassword: e.target.value })}
              className='input input-bordered w-full' />
          </div>

          <div className='md:col-span-2'>
            <GenderCheckbox onCheckboxChange={handleCheckboxChange} selectedGender={inputs.gender} />
          </div>

          <div className='md:col-span-2 relative'>
            <div className='flex flex-col items-center space-y-2'>
              <button onClick={startVideo} type="button" className="btn btn-outline btn-info">
                Start Camera
              </button>

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
              </div>

              {faceDetected && (
                <p className='text-green-400 text-center'>Face detected successfully! 👤</p>
              )}
              {!faceDetected && (
                <p className='text-red-400 text-center'>No face detected yet.</p>
              )}
            </div>
          </div>

          <div className='md:col-span-2 flex justify-between items-center mt-4'>
            <Link className='text-sm text-gray-300 hover:underline' to="/login">
              Already have an account?
            </Link>
            <button className='btn btn-primary' disabled={loading}>
              {loading ? <span className='loading loading-spinner'></span> : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
