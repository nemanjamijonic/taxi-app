import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
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
      // Fetch user data
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
      <div className="dashboard-content">
        <h1>Welcome to the Dashboard</h1>
        <p>Username: {username}</p>
        <p>Email: {email}</p>
        <p>User Type: {userType}</p>
      </div>
    </div>
  );
};

export default Dashboard;
