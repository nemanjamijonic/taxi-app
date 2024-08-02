import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import { jwtDecode } from "jwt-decode";
import DriveItem from "../DriveItem/DriveItem";
import "./MyRides.css"; // Add any necessary styles for the list

type Drive = {
  id: string;
  startingAddress: string;
  endingAddress: string;
  createdAt: string;
  userUsername: string;
  driverUsername: string;
  aproximatedTime: number;
  driverArrivalTime: number;
  driveDistance: number;
  aproximatedCost: number;
  driveState: string;
  userType: string;
};

const MyRides: React.FC = () => {
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
      navigate("/login");
      setLoading(false);
      return;
    }

    const decodedToken: any = jwtDecode(token);
    const userId = decodedToken.nameid;
    if (decodedToken.role != "Driver") {
      navigate("/dashboard");
    }

    try {
      const userResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL_USER_API}/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const userData = userResponse.data;
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
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL_DRIVE_API}/all-user-drives`,
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
    // Redirect to login or home page
    window.location.href = "/login";
  };

  if (loading) {
    return <div>Loading rides...</div>;
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
      <div className="ride-list">
        <br></br>
        <h1>My Rides</h1>
        <div className="drive-items-container">
          {drives.length === 0 ? (
            <p>No rides available.</p>
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
                driverArrivalTime={drive.driverArrivalTime}
                aproximatedTime={drive.aproximatedTime}
                driveDistance={drive.driveDistance}
                aproximatedCost={drive.aproximatedCost}
                driveState={drive.driveState}
                userState={drive.userUsername}
                userType={drive.userType}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyRides;
