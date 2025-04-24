import { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
	return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
  let chatUser = localStorage.getItem('chat-user');
  let initialAuthUser;
  if (chatUser) {
    initialAuthUser = JSON.parse(chatUser);
  } else {
    initialAuthUser = null;
  }
  const [authUser, setAuthUser] = useState(initialAuthUser);

  return <AuthContext.Provider value={{ authUser, setAuthUser }}>{children}</AuthContext.Provider>;
};