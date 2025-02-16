import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const useGetConversations = () => {
	const [loading, setLoading] = useState(false);
	const [conversations, setConversations] = useState([]);

	useEffect(() => {
		const getConversations = async () => {
			setLoading(true);
			try {
				const token = localStorage.getItem("token"); // Obtener el token almacenado

    		const res = await fetch("/api/users", {
    		  method: "GET",
    		  headers: {
    		    "Content-Type": "application/json",
    		    "Authorization": `Bearer ${token}`, // Agregar el token al header
    		  },
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