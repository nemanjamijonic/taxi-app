import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

interface DecodedToken {
  unique_name: string;
  email: string;
  role: string;
}

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
      const decodedToken = jwtDecode<DecodedToken>(token);
      setUsername(decodedToken.unique_name);
      setEmail(decodedToken.email);
      setUserType(decodedToken.role);

      // Fetch user image URL
      fetch("http://localhost:8969/api/User/get-image-url", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setUserImage(data.imageUrl);
        })
        .catch((error) => console.error("Error fetching user image:", error));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/login");
  };

  return (
    <div>
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
