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
        setDrives(response.data);
      } catch (err) {
        setError("Failed to fetch drives.");
        console.error(err);
      }
    };

    fetchDrives();
  }, [navigate]);

  const handleAcceptDrive = (driveId: string) => {
    // Implementirajte logiku za prihvatanje vožnje
    console.log(`Drive accepted: ${driveId}`);
  };

  const handleCreateOffer = async (driveId: string) => {
    try {
      const token = localStorage.getItem("jwtToken");
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL_DRIVE_API}/create-offer/${driveId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Osvježite listu vožnji nakon uspešnog kreiranja ponude
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
              aproximatedTime={drive.aproximatedTime}
              aproximatedCost={drive.aproximatedCost}
              driveState={drive.driveState}
              userType={"2"}
              onAcceptDrive={() => handleAcceptDrive(drive.id)}
              onCreateOffer={() => handleCreateOffer(drive.id)} // Dodato
            />
          ))
        )}
      </div>
    </div>
  );
};

export default DriveList;
