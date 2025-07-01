import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthContext } from '/src/context/AuthContext.jsx';

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useAuthContext();

  const login = async (username, password) => {
    const success = handleInputErrors(username, password);
    if (!success) return;
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include"
      });

      if (!res.ok) {
        const errorMessage = `Error ${res.status}: ${res.statusText}`;
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      const responseText = await res.text();
      let data = {};
      if (responseText) {
        data = JSON.parse(responseText);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      localStorage.setItem("chat-user", JSON.stringify(data));

      if (data.sessionId) {
        localStorage.setItem("sessionId", data.sessionId);
      }

      setAuthUser(data);

      toast.success('Login successful!');
    } catch (error) {
      console.log('Error:', error);
      toast.error(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return { loading, login };
};

export default useLogin;

function handleInputErrors(username, password) {
  if (!username || !password) {
    toast.error('Please fill out both fields');
    return false;
  }
  if (password.length < 6) {
    toast.error('Password must be at least 6 characters long');
    return false;
  }
  return true;
}
