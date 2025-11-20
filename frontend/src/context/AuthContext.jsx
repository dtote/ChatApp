import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
	return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
  // Función helper para obtener el usuario de localStorage de forma segura
  const getStoredUser = () => {
    try {
      const chatUser = localStorage.getItem('chat-user');
      if (chatUser) {
        const parsed = JSON.parse(chatUser);
        // Validar que tenga las propiedades mínimas
        if (parsed && (parsed._id || parsed.username)) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
      // Limpiar localStorage si hay un error de parseo
      localStorage.removeItem('chat-user');
    }
    return null;
  };

  const [authUser, setAuthUser] = useState(getStoredUser);

  // Sincronizar con localStorage cuando cambie (solo para cambios desde otros tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'chat-user') {
        const storedUser = getStoredUser();
        setAuthUser(storedUser);
      }
    };

    // Escuchar cambios en localStorage desde otros tabs
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Función mejorada para actualizar el usuario
  const updateAuthUser = (userData) => {
    if (userData) {
      localStorage.setItem('chat-user', JSON.stringify(userData));
      setAuthUser(userData);
    } else {
      localStorage.removeItem('chat-user');
      setAuthUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser: updateAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
};