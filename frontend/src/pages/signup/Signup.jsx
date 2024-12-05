import { useState, useRef } from 'react';
import GenderCheckbox from './GenderCheckBox.jsx';
import { Link } from 'react-router-dom';
import useSignup from '../../hooks/useSignup.js';
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
  const [faceImage, setFaceImage] = useState(null); // Para almacenar la imagen facial
  const videoRef = useRef(null);
  const { loading, signup } = useSignup();

  const handleCheckboxChange = (gender) => {
    setInputs({ ...inputs, gender: gender });
  };

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => {
        videoRef.current.srcObject = stream;
      })
      .catch(err => console.error(err));
  };

  const captureImage = async () => {
    const canvas = faceapi.createCanvasFromMedia(videoRef.current);
    document.body.append(canvas);
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');

    const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();

    if (detections.length > 0) {
      const imageBlob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg'); // Captura la imagen en un blob
      });
      setFaceImage(imageBlob); // Guarda la imagen en el estado
    } else {
      toast.error('No se detectó ninguna cara.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(inputs);
    console.log(faceImage);
    await signup({ ...inputs, faceImage }); // Incluye la imagen facial en la firma
  };

  return (
    <div className='p-4 flex flex-col items-center justify-center min-w-96 mx-auto w-full max-w-xs bg-gray-400 rounded-md bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-40'>
      <div className='p-4'>
        <h1 className='text-3xl font-semibold text-center text-gray-300'>
          Signup
          <span className='text-green-500'>ChatApp</span>
        </h1>

        <form onSubmit={handleSubmit} className='p-4'>
          <div>
            <label className='label p-2'>
              <span className='text-base label-text'>Username</span>
            </label>
            <input type='text' placeholder='Type here' value={inputs.username}
              onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
              className='input input-bordered w-full max-w-xs text-center h-10' />
          </div>
          <div>
            <label className='label p-2'>
              <span className='text-base label-text'>Email</span>
            </label>
            <input type='text' placeholder='Type here' value={inputs.email}
              onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
              className='input input-bordered w-full max-w-xs text-center h-10' />
          </div>
          <div>
            <label className='label p-2'>
              <span className='text-base label-text'>Password</span>
            </label>
            <input type='password' placeholder='Enter password' value={inputs.password}
              onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
              className='input input-bordered w-full max-w-xs text-center h-10' />
          </div>
          <div>
            <label className='label p-2'>
              <span className='text-base label-text'>Confirm Password</span>
            </label>
            <input type='password' placeholder='Confirm password' value={inputs.confirmPassword}
              onChange={(e) => setInputs({ ...inputs, confirmPassword: e.target.value })}
              className='input input-bordered w-full max-w-xs text-center h-10' />
          </div>

          <GenderCheckbox onCheckboxChange={handleCheckboxChange} selectedGender={inputs.gender} />

          <div>
            <button onClick={startVideo} type="button" className="btn mt-2">Start Video</button>
            <video ref={videoRef} autoPlay className="mt-2" />
            <button onClick={captureImage} type="button" className="btn mt-2">Capture Image</button>
          </div>

          <Link className='text-sm hover:underline hover:text-green-600 mt-4 inline-block' to={"/login"} >
            {"Already have an account?"}
          </Link>

          <div>
            <button className='btn btn-block btn-sm mt-2 border border-slate-700' disabled={loading}>
              {loading ? <span className='loading loading-spinner'></span> : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
