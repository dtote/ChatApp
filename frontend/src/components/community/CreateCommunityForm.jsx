import React, { useState } from "react";
import axios from "axios";

const CreateCommunityForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("https://chatapp-7lh7.onrender.com/api/communities", { name, description })
      .then(response => {
        console.log("Community created:", response.data);
      })
      .catch(error => console.error("Error creating community:", error));
  };

  return (
    <div>
      <h1>Create Community</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Description:</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <button type="submit">Create</button>
      </form>
    </div>
  );
};

export default CreateCommunityForm;
