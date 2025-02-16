import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthContext } from '../context/AuthContext';

const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const { authUser, setAuthUser } = useAuthContext();

  const signup = async ({ username, email, password, confirmPassword, gender, faceImage }) => {
    const success = handleInputErrors({ username, email, password, confirmPassword, gender });
    if (!success) return;

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('confirmpassword', confirmPassword);
    formData.append('gender', gender);

    if (faceImage) {
      formData.append('faceImage', faceImage); // Agregar la imagen facial al FormData
    }

    setLoading(true); // Iniciar carga

    try {
      // Determinar la ruta según si se incluye una imagen facial
      const apiEndpoint = faceImage ? 'https://chatapp-7lh7.onrender.com/api/auth/signupFacial' : 'https://chatapp-7lh7.onrender.com/api/auth/signup';

      const res = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData, // Enviar el FormData
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
      console.error(error); // Registrar el error en consola
      toast.error('Error en el registro. Por favor intenta nuevamente.');
    } finally {
      setLoading(false); // Finalizar carga
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
