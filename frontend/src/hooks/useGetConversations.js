import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";

const useGetConversations = () => {
	const [loading, setLoading] = useState(false);
	const [conversations, setConversations] = useState([]);
	const { authUser, setAuthUser } = useAuthContext();

	useEffect(() => {
		const getConversations = async () => {
			// Si no hay usuario autenticado, no hacer nada (estado normal, no es un error)
			if (!authUser) {
				setLoading(false);
				return;
			}

			setLoading(true);

			// Intentar obtener el token de múltiples fuentes
			const chatUser = localStorage.getItem("chat-user");
			const tokenFromStorage = localStorage.getItem("token");
			const token = chatUser ? JSON.parse(chatUser)?.token : tokenFromStorage;

			try {
				const res = await fetch("/api/users", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						...(token && { Authorization: `Bearer ${token}` })
					}
				});

				// Si el backend rechaza por falta de autenticación, limpiar authUser
				// y dejar que App.jsx redirija automáticamente al login
				if (res.status === 401 || res.status === 403) {
					setAuthUser(null);
					localStorage.removeItem("chat-user");
					localStorage.removeItem("token");
					localStorage.removeItem("sessionId");
					return;
				}

				const data = await res.json();
				if (data.error) {
					throw new Error(data.error);
				}
				setConversations(data);
			} catch (error) {
				// Solo mostrar error si no es un error de autenticación (ya manejado arriba)
				if (error.message && !error.message.includes("401") && !error.message.includes("403")) {
					toast.error(error.message || "Error fetching conversations");
				}
			} finally {
				setLoading(false);
			}
		};

		getConversations();
	}, [authUser]);

	return { loading, conversations };
};

export default useGetConversations;
