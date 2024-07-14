import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import DriveItem from "../DriveItem/DriveItem";
import Navbar from "../Navbar/Navbar";
import "./AllDrives.css"; // Add any necessary styles for the list
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

type Drive = {
  id: string;
  startingAddress: string;
  endingAddress: string;
  createdAt: string;
  userUsername: string;
  driverUsername: string;
  aproximatedTime: number;
  aproximatedCost: number;
  driveState: string;
  userType: string;
};

const AllDrives: React.FC = () => {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [userType, setUserType] = useState<string>("");
  const [userImage, setUserImage] = useState<string>("");
  const navigate = useNavigate();

  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }
    const decodedToken: any = jwtDecode(token);
    if (decodedToken.role != "Admin") {
      navigate("/dashboard");
    }
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL_USER_API}/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const userData = response.data;
      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken.nameid;
      setUsername(userData.username);
      setUserType(userData.userType);
      setUserImage(
        `${process.env.REACT_APP_BACKEND_URL_USER_API}/get-image/${userId}`
      );
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to fetch user data. Please try again later.");
    }
  }, []);

  const fetchDrives = useCallback(async () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL_DRIVE_API}/drives`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDrives(response.data);
    } catch (error) {
      console.error("Error fetching drives:", error);
      setError("Failed to fetch drives. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    fetchDrives();
  }, [fetchUserData, fetchDrives]);

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    window.location.href = "/login";
  };

  if (loading) {
    return <div>Loading drives...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <Navbar
        username={username}
        userType={userType}
        userImage={userImage}
        onLogout={handleLogout}
      />
      <div className="drive-list">
        <h1>All Drives</h1>
        {drives.length === 0 ? (
          <p>No drives available.</p>
        ) : (
          drives.map((drive) => (
            <DriveItem
              key={drive.id}
              id={drive.id}
              startingAddress={drive.startingAddress}
              endingAddress={drive.endingAddress}
              createdAt={drive.createdAt}
              userUsername={drive.userUsername}
              driverUsername={drive.driverUsername}
              aproximatedTime={drive.aproximatedTime}
              aproximatedCost={drive.aproximatedCost}
              driveState={drive.driveState}
              userType={drive.userType}
              userState=""
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AllDrives;
