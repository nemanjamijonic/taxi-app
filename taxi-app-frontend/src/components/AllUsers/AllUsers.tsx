import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from "../Navbar/Navbar";
import UserCard from "../UserCard/UserCard";
import "./AllUsers.css";

interface User {
  id: string;
  username: string;
  userState: string;
  email: string;
  userType: string;
  firstName: string;
  lastName: string;
}

interface DecodedToken {
  unique_name: string;
  role: string;
}

const AllUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState("");
  const [userType, setUserType] = useState("");
  const [userImage, setUserImage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      navigate("/");
    } else {
      const fetchData = async () => {
        try {
          const response = await fetch("http://localhost:8766/api/User/users", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          setUsers(data);

          const decodedToken = jwtDecode<DecodedToken>(token);
          setUsername(decodedToken.unique_name);
          setUserType(decodedToken.role);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };
      fetchData();
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
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, userState: "1" } : user
          )
        );
      } else {
        console.error("Error verifying user:", response.statusText);
      }
    } catch (error) {
      console.error("Error verifying user:", error);
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
      <div className="all-users-container">
        <h2>All Users</h2>
        <div className="user-list">
          {users.map((user) => (
            <UserCard key={user.id} user={user} onVerify={handleVerify} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllUsers;
