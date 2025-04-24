import React, { useState } from "react";
import axios from "axios";

const CreateCommunityForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");  // Nueva imagen de perfil

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("api/communities", { name, description, image })
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
        <div>
          <label>Image URL:</label>
          <input type="text" value={image} onChange={(e) => setImage(e.target.value)} />  {/* Campo para la imagen */}
        </div>
        <button type="submit">Create</button>
      </form>
    </div>
  );
};

export default CreateCommunityForm;
