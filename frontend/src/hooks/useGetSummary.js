import axios from "axios";

const useGetSummary = () => {
  const getSummary = async (ids, type, limit = 50) => {
    try {
      const token = JSON.parse(localStorage.getItem("chat-user"))?.token;
      const response = await axios.post(
        "/api/summary",
        { ids, type, limit },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.summary;
    } catch (error) {
      console.error("Error fetching summary:", error);
      return null;
    }
  };

  return getSummary;
};

export default useGetSummary;