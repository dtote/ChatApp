import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import DeletedUserIndicator from "../messages/DeletedUserIndicator.jsx";

const CommunityDetail = () => {
  const { id } = useParams();
  const [community, setCommunity] = useState(null);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("chat-user"))?.token;

    if (!token) {
      console.error("No authentication token found");
      return;
    }

    axios.get(`api/communities/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => setCommunity(response.data))
      .catch(error => console.error("Error fetching community:", error));
  }, [id]);

  const joinCommunity = () => {
    const token = JSON.parse(localStorage.getItem("chat-user"))?.token;

    if (!token) {
      console.error("No authentication token found");
      return;
    }

    axios.post(`api/communities/${id}/join`, { userId }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => setCommunity(response.data))
      .catch(error => console.error("Error joining community:", error));
  };

  const leaveCommunity = () => {
    const token = JSON.parse(localStorage.getItem("chat-user"))?.token;

    if (!token) {
      console.error("No authentication token found");
      return;
    }

    axios.post(`api/communities/${id}/leave`, { userId }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
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
          <li key={member._id}>
            <div className="flex items-center gap-2">
              <img
                src={member.profilePic || 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg'}
                alt="Profile"
                className="w-6 h-6 rounded-full"
              />
              <DeletedUserIndicator
                username={member.username || 'Deleted User'}
                isDeleted={member.isDeleted || false}
              />
            </div>
          </li>
        ))}
      </ul>

      <h3>Admins:</h3>
      <ul>
        {community.admins.map(admin => (
          <li key={admin._id}>
            <div className="flex items-center gap-2">
              <img
                src={admin.profilePic || 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg'}
                alt="Profile"
                className="w-6 h-6 rounded-full"
              />
              <DeletedUserIndicator
                username={admin.username || 'Deleted User'}
                isDeleted={admin.isDeleted || false}
              />
            </div>
          </li>
        ))}
      </ul>

      <button onClick={joinCommunity}>Join Community</button>
      <button onClick={leaveCommunity}>Leave Community</button>
    </div>
  );
};

export default CommunityDetail;
