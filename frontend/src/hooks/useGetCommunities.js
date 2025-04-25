import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const useGetCommunities = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCommunities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/communities");
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
