import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthContext } from '../context/AuthContext';

const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const { authUser, setAuthUser } = useAuthContext();

  const signup = async ({ username, email, password, confirmPassword, gender, faceDescriptor }) => {
    const success = handleInputErrors({ username, email, password, confirmPassword, gender });
    if (!success) return;
    
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('confirmpassword', confirmPassword);
    formData.append('gender', gender);

    if (faceDescriptor) {
      formData.append('faceDescriptor', JSON.stringify(faceDescriptor));
    }

    setLoading(true);

    try {
      const apiEndpoint = faceDescriptor ? '/api/auth/signupFacial' : '/api/auth/signup';
      
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
      } else {
        console.log(data);
        localStorage.setItem('chat-user', JSON.stringify(data));
        setAuthUser(data);
        toast.success('Signup successful');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error en el registro. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return { loading, signup };
};

export default useSignup;

function handleInputErrors({ username, password, confirmPassword, gender }) {
  if (!username || !password || !confirmPassword || !gender) {
    toast.error('Please fill all the fields');
    return false;
  }

  if (password !== confirmPassword) {
    toast.error('Passwords do not match');
    return false;
  }

  if (password.length < 6) {
    toast.error('Password must be at least 6 characters long');
    return false;
  }

  return true;
}
