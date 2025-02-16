import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const useGetConversations = () => {
	const [loading, setLoading] = useState(false);
	const [conversations, setConversations] = useState([]);

	useEffect(() => {
		const getConversations = async () => {
			setLoading(true);
			try {
				const token = localStorage.getItem("chat-user");

				const res = await fetch("https://chatapp-7lh7.onrender.com/api/users", {
				  method: "GET",
				  headers: {
				    "Content-Type": "application/json",
				    "Authorization": `Bearer ${token}`
				  },
				  credentials: "include", // Para enviar cookies (si es necesario)
				});

				const data = await res.json();
				if (data.error) {
					throw new Error(data.error);
				}
				setConversations(data);
			} catch (error) {
				toast.error(error.message);
			} finally {
				setLoading(false);
			}
		};

		getConversations();
	}, []);

	return { loading, conversations };
};
export default useGetConversations;