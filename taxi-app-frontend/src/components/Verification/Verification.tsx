import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import UserCard from "../UserCard/UserCard";
import "./Verification.css";
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  username: string;
  userState: string;
  email: string;
  userType: string;
  firstName: string;
  lastName: string;
  averageRating: number;
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
      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken.nameid;
      const role = decodedToken.role;

      if (role != "Admin") {
        navigate("/dashboard");
      }

      // Fetch unverified drivers
      fetch(
        `${process.env.REACT_APP_BACKEND_URL_USER_API}/unverified-drivers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then((response) => response.json())
        .then((data: User[]) => {
          setUnverifiedUsers(data);
        })
        .catch((error) =>
          console.error("Error fetching unverified users:", error)
        );

      // Fetch logged-in user data
      fetch(`${process.env.REACT_APP_BACKEND_URL_USER_API}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setUsername(data.username);
          setUserType(data.userType);
          setUserImage(
            `${process.env.REACT_APP_BACKEND_URL_USER_API}/get-image/${userId}`
          );
        })
        .catch((error) => console.error("Error fetching user data:", error));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/login");
  };

  const handleBlocking = () => {};
  const handleUnblock = () => {};

  const handleVerify = async (userId: string) => {
    const token = localStorage.getItem("jwtToken");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL_USER_API}/validate/${userId}`,
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

  const handleRejection = async (userId: string) => {
    const token = localStorage.getItem("jwtToken");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL_USER_API}/reject/${userId}`,
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
            user.id === userId ? { ...user, userState: "2" } : user
          )
        );
        alert("Driver rejected successfully");
      } else {
        const errorMessage = await response.text();
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error rejecting driver:", error);
      alert("An error occurred while rejecting the driver.");
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
      <h1>Driver Verification List</h1>
      <div className="verification-content">
        {unverifiedUsers.length === 0 ? (
          <h2>No unverified users found.</h2>
        ) : (
          <div className="user-grid">
            {unverifiedUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onVerify={handleVerify}
                onRejection={handleRejection}
                onBlocking={handleBlocking}
                onUnblocking={handleUnblock}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Verification;
