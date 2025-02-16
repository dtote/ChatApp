import { useEffect, useState } from "react";
import axios from "axios";

const useGetCommunities = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await axios.get("https://chatapp-7lh7.onrender.com/api/communities");
        setCommunities(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching communities:", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []); // El array vacío asegura que el hook se ejecute solo al montar el componente.

  return { loading, communities, error };
};

export default useGetCommunities;
