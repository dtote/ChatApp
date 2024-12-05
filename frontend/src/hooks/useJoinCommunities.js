import axios from "axios";
import { toast } from "react-toastify";

const useCommunityActions = () => {
  const joinCommunity = async (communityId, userId) => {
    try {
      await axios.post(`/api/communities/${communityId}/join`, { userId });
      toast.success("Joined community successfully!");
    } catch (error) {
      toast.error("Error joining community.");
    }
  };

  const leaveCommunity = async (communityId, userId) => {
    try {
      await axios.post(`/api/communities/${communityId}/leave`, { userId });
      toast.success("Left community successfully!");
    } catch (error) {
      toast.error("Error leaving community.");
    }
  };

  return { joinCommunity, leaveCommunity };
};

export default useCommunityActions;
