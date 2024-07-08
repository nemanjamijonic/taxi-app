import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import UserCard from "../UserCard/UserCard";
import "./Verification.css";

interface User {
  id: string;
  username: string;
  userState: string;
  email: string;
  firstName: string;
  lastName: string;
}

const Verification: React.FC = () => {
  const [unverifiedUsers, setUnverifiedUsers] = useState<User[]>([]);
  const [username, setUsername] = useState("");
  const [userType, setUserType] = useState("");
  const [userImage, setUserImage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      navigate("/login");
    } else {
      // Fetch unverified drivers
      fetch("http://localhost:8766/api/User/unverified-drivers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data: User[]) => {
          setUnverifiedUsers(data);
        })
        .catch((error) =>
          console.error("Error fetching unverified users:", error)
        );

      // Fetch logged-in user data
      fetch("http://localhost:8766/api/User/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setUsername(data.username);
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

  const handleVerify = async (userId: string) => {
    const token = localStorage.getItem("jwtToken");
    try {
      const response = await fetch(
        `http://localhost:8766/api/User/validate/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Update the user state in the unverifiedUsers array
        setUnverifiedUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, userState: "1" } : user
          )
        );
        alert("Driver validated successfully");
      } else {
        const errorMessage = await response.text();
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error verifying driver:", error);
      alert("An error occurred while verifying the driver.");
    }
  };

  return (
    <div>
      <Navbar
        username={username}
        userType={userType}
        userImage={userImage}
        onLogout={handleLogout}
      />
      <div className="verification-content">
        <h1>Unverified Drivers</h1>
        {unverifiedUsers.length === 0 ? (
          <h2>No unverified users found.</h2>
        ) : (
          <div className="user-grid">
            {unverifiedUsers.map((user) => (
              <UserCard key={user.id} user={user} onVerify={handleVerify} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Verification;
