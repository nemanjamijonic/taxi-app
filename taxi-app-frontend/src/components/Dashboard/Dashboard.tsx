import React, { useEffect, useState } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Verification from "../Verification/Verification";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  const [username, setUsername] = useState("");
  const [userType, setUserType] = useState("");
  const [email, setEmail] = useState("");
  const [userImage, setUserImage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      navigate("/login");
    } else {
      fetch("http://localhost:8766/api/User/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setUsername(data.username);
          setEmail(data.email);
          setUserType(data.userType);
          setUserImage(
            `http://localhost:8766/api/User/get-image/${data.imagePath}`
          );
        })
        .catch((error) => console.error("Error fetching user data:", error));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/login");
  };

  return (
    <div>
      <Navbar
        username={username}
        userType={userType}
        userImage={userImage}
        onLogout={handleLogout}
      />
      <br></br>
      <div className="dashboard-content"></div>
    </div>
  );
};

export default Dashboard;
