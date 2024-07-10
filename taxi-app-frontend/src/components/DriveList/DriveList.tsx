import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DriveItem from "../DriveItem/DriveItem";
import Navbar from "../Navbar/Navbar";
import "./DriveList.css";

type DriveItemProps = {
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

const DriveList: React.FC = () => {
  const [drives, setDrives] = useState<DriveItemProps[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [userType, setUserType] = useState("");
  const [userImage, setUserImage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
          navigate("/login");
          return;
        }

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
          `http://localhost:8766/api/User/get-image/${userData.imagePath}`
        );

        if (userData.userType !== 2) {
          navigate("/dashboard");
          return;
        }

        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL_DRIVE_API}/new-driver-drives`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Ensure userUsername is correctly populated
        const drivesData = response.data.map((drive: any) => ({
          ...drive,
          userUsername: drive.userUsername || "Unknown User",
        }));

        setDrives(drivesData);
      } catch (err) {
        setError("Failed to fetch drives.");
        console.error(err);
      }
    };

    fetchDrives();
  }, [navigate]);

  const handleAcceptDrive = async (driveId: string) => {
    try {
      const token = localStorage.getItem("jwtToken");

      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL_DRIVE_API}/accept-drive/${driveId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh the list of drives after a successful offer creation
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL_DRIVE_API}/new-driver-drives`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDrives(response.data);
    } catch (err) {
      setError("Failed to accept drive.");
      console.error(err);
    }
  };

  const handleCreateOffer = async (driveId: string) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const driverUsername = username; // assuming `username` state holds the driver's username

      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL_DRIVE_API}/create-offer/${driveId}`,
        { DriverUsername: driverUsername }, // include DriverUsername in the request body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh the list of drives after a successful offer creation
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL_DRIVE_API}/new-driver-drives`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDrives(response.data);
    } catch (err) {
      setError("Failed to create offer.");
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    window.location.href = "/login";
  };

  return (
    <div>
      <Navbar
        username={username}
        userType={userType}
        userImage={userImage}
        onLogout={handleLogout}
      />
      <div className="drive-list">
        <h1>Available Drives</h1>
        {error && <p className="error">{error}</p>}
        {drives.length === 0 ? (
          <p>No available drives at the moment.</p>
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
              userType={"2"}
              onAcceptDrive={() => handleAcceptDrive(drive.id)}
              onCreateOffer={() => handleCreateOffer(drive.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default DriveList;
