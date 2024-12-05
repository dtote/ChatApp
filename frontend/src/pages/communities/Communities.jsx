// src/pages/Communities.jsx
import React from "react";
import { Link, Routes, Route } from "react-router-dom";
import CommunityList from "../../components/community/CommunityList.jsx";
import CommunityDetail from "../../components/community/CommunityDetail.jsx";
import CreateCommunityForm from "../../components/community/CreateCommunityForm.jsx";

const Communities = () => {
  return (
    <div>
      <h1>Communities</h1>

      {/* Gestionar las rutas con Routes en lugar de Switch */}
      <Routes>
        <Route path="/" element={<CommunityList />} />
        <Route path="create" element={<CreateCommunityForm />} />
        <Route path=":id" element={<CommunityDetail />} />
      </Routes>
    </div>
  );
};

export default Communities;
