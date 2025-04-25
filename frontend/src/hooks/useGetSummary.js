import axios from "axios";
import useSecurity from "../zustand/useSecurity";

const useGetSummary = () => {
  const { selectedKeySize } = useSecurity(); 

  const getSummary = async (conversationId, limit = 50) => {
    try {
      const res = await axios.post(`/api/summary?selectedKeySize=${selectedKeySize}`, { conversationId, limit });
      return res.data.summary;
    } catch (error) {
      console.error("Error fetching summary:", error);
      return null;
    }
  };

  return getSummary;
};

export default useGetSummary;