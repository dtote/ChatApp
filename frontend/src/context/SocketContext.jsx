import { createContext, useEffect, useState, useContext } from 'react';
import { useAuthContext } from './AuthContext';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocketContext = () => {
	return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
	const [socket, setSocket] = useState(null);
	const [onlineUsers, setOnlineUsers] = useState([]);
	const { authUser } = useAuthContext();

	useEffect(() => {
		if (authUser) {
			// La URL del servidor deberia ser la raíz del servidor donde está corriendo tu backend
			// Aunque en este caso vamos a usar localhost para desarrollo
			// const socketURI = ""
			const socket = io("http://localhost:4000", {
				query: {
					userId: authUser._id,
				},
				secure: true, // Asegura que se use HTTPS
				transports: ["websocket"], // Usar solo WebSockets
			}
			);

			setSocket(socket);

			socket.on("connect", () => {
				console.log("Conectado al servidor:", socket.id); // Esto debería confirmarte la conexión desde el cliente
			});

			socket.on("connect_error", (err) => {
				console.error("Error de conexión:", err.message, err);
			});

			// socket.on() is used to listen to the events. can be used both on client and server side
			socket.on("getOnlineUsers", (users) => {
				setOnlineUsers(users);
			});

			return () => socket.close();
		} else {
			if (socket) {
				socket.close();
				setSocket(null);
			}
		}
	}, [authUser]);

	return (
		<SocketContext.Provider value={{ socket, onlineUsers }}>
			{children}
		</SocketContext.Provider>)
};