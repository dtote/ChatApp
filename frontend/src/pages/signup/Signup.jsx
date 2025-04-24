import { useState, useRef } from 'react';
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
  const videoRef = useRef(null);
  const { loading, signup } = useSignup();

  const handleCheckboxChange = (gender) => {
    setInputs({ ...inputs, gender });
  };

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => {
        videoRef.current.srcObject = stream;
      })
      .catch(err => console.error(err));
  };

  const captureImage = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      toast.success('Modelos cargados correctamente');

      const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();
      if (detections.length > 0) {
        setFaceDescriptor(detections[0].descriptor);
        console.log('Descriptor Facial:', detections[0].descriptor);
        toast.success('Cara detectada correctamente');
      } else {
        toast.error('No se detectó ninguna cara.');
      }
    } catch (error) {
      console.error('Error al detectar la cara:', error);
      toast.error('Error al detectar la cara.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, gender } = inputs;
    const confirmPassword = inputs.password;
    await signup({ username, email, password, confirmPassword, gender, faceDescriptor });
  };

  return (
    <div className='min-h-screen w-[50vw] flex items-center justify-center  bg-gradient-to-br to-slate-950 px-4'>
    <div className='w-full max-w-6xl bg-white/10 backdrop-blur-md shadow-xl rounded-xl p-8 mt-10'>
      <h1 className='text-4xl font-bold text-center text-white mb-6'>
        Sign Up to <span className='text-green-400'>ChatApp</span>
      </h1>

        <form onSubmit={handleSubmit} className='grid gap-4 lg:grid-cols-2'>
          <div>
            <label className='label'>
              <span className='label-text text-white'>Username</span>
            </label>
            <input type='text' placeholder='Type here' value={inputs.username}
              onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
              className='input input-bordered w-full' />
          </div>

          <div>
            <label className='label'>
              <span className='label-text text-white'>Email</span>
            </label>
            <input type='text' placeholder='Type here' value={inputs.email}
              onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
              className='input input-bordered w-full' />
          </div>

          <div>
            <label className='label'>
              <span className='label-text text-white'>Password</span>
            </label>
            <input type='password' placeholder='Enter password' value={inputs.password}
              onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
              className='input input-bordered w-full' />
          </div>

          <div>
            <label className='label'>
              <span className='label-text text-white'>Confirm Password</span>
            </label>
            <input type='password' placeholder='Confirm password' value={inputs.confirmPassword}
              onChange={(e) => setInputs({ ...inputs, confirmPassword: e.target.value })}
              className='input input-bordered w-full' />
          </div>

          <div className='lg:col-span-2'>
            <GenderCheckbox onCheckboxChange={handleCheckboxChange} selectedGender={inputs.gender} />
          </div>

          <div className='lg:col-span-2'>
            <div className='flex flex-col items-center space-y-2'>
              <button onClick={startVideo} type="button" className="btn btn-outline btn-info">Start Video</button>
              <video ref={videoRef} autoPlay className="rounded-lg w-full max-w-sm h-auto bg-black" />
              <button onClick={captureImage} type="button" className="btn btn-success">Capture Image</button>
            </div>
          </div>

          <div className='lg:col-span-2 flex justify-between items-center mt-4'>
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
