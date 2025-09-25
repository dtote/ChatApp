import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const useGetCommunities = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCommunities = useCallback(async () => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem("chat-user"))?.token;

      if (!token) {
        setError(new Error("No authentication token found"));
        setLoading(false);
        return;
      }

      const response = await axios.get("/api/communities", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setCommunities(response.data);
    } catch (error) {
      console.error("Error fetching communities:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  return { loading, communities, error, refetch: fetchCommunities };
};

export default useGetCommunities;
