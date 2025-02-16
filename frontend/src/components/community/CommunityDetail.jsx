import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const CommunityDetail = () => {
  const { id } = useParams(); 
  const [community, setCommunity] = useState(null);
  const [userId, setUserId] = useState(""); 

  useEffect(() => {
    axios.get(`https://chatapp-7lh7.onrender.com/api/communities/${id}`)
      .then(response => setCommunity(response.data))
      .catch(error => console.error("Error fetching community:", error));
  }, [id]);

  const joinCommunity = () => {
    axios.post(`https://chatapp-7lh7.onrender.com/api/communities/${id}/join`, { userId })
      .then(response => setCommunity(response.data))
      .catch(error => console.error("Error joining community:", error));
  };

  const leaveCommunity = () => {
    axios.post(`https://chatapp-7lh7.onrender.com/api/communities/${id}/leave`, { userId })
      .then(response => setCommunity(response.data))
      .catch(error => console.error("Error leaving community:", error));
  };

  if (!community) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{community.name}</h1>
      {community.image && <img src={community.image} alt="Community profile" style={{ width: '150px', height: '150px' }} />}
      <p>{community.description}</p>
      <h3>Members:</h3>
      <ul>
        {community.members.map(member => (
          <li key={member._id}>{member.name}</li>
        ))}
      </ul>

      <button onClick={joinCommunity}>Join Community</button>
      <button onClick={leaveCommunity}>Leave Community</button>
    </div>
  );
};

export default CommunityDetail;
