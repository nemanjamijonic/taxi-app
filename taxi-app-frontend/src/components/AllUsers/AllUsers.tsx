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
  averageRating: number;
}

interface DecodedToken {
  nameid: string;
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
      navigate("/login");
    } else {
      const decodedToken: any = jwtDecode(token);
      if (decodedToken.role != "Admin") {
        navigate("/dashboard");
      }
      const fetchData = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL_USER_API}/users`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await response.json();
          setUsers(data);

          const decodedToken = jwtDecode<DecodedToken>(token);
          setUsername(decodedToken.unique_name);
          const role = decodedToken.role;
          console.log(role);
          if (role == "Admin") {
            setUserType("0");
          }
          const userId = decodedToken.nameid;
          setUserImage(
            `${process.env.REACT_APP_BACKEND_URL_USER_API}/get-image/${userId}`
          );
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
        `${process.env.REACT_APP_BACKEND_URL_USER_API}/validate/${userId}`,
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
            user.id == userId ? { ...user, userState: "1" } : user
          )
        );
      } else {
        console.error("Error verifying user:", response.statusText);
      }
    } catch (error) {
      console.error("Error verifying user:", error);
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
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id == userId ? { ...user, userState: "2" } : user
          )
        );
      } else {
        console.error("Error rejecting user:", response.statusText);
      }
    } catch (error) {
      console.error("Error rejecting user:", error);
    }
  };

  const handleBlock = async (userId: string) => {
    const token = localStorage.getItem("jwtToken");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL_USER_API}/block/${userId}`,
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
            user.id == userId ? { ...user, userState: "3" } : user
          )
        );
      } else {
        console.error("Error blocking user:", response.statusText);
      }
    } catch (error) {
      console.error("Error blocking user:", error);
    }
  };

  const handleUnblock = async (userId: string) => {
    const token = localStorage.getItem("jwtToken");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL_USER_API}/unblock/${userId}`,
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
            user.id == userId ? { ...user, userState: "1" } : user
          )
        );
      } else {
        console.error("Error unblocking user:", response.statusText);
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
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
      <div className="user-list">
        <h1>All Users</h1>
        <div className="user-list-container">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onVerify={handleVerify}
              onRejection={handleRejection}
              onBlocking={handleBlock}
              onUnblocking={handleUnblock}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllUsers;
