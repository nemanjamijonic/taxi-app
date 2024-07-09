import React, { useEffect, useState } from "react";
import axios from "axios";
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

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL_DRIVE_API}/new-driver-drives`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDrives(response.data);

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
      } catch (err) {
        setError("Failed to fetch drives.");
        console.error(err);
      }
    };

    fetchDrives();
  }, []);

  const handleAcceptDrive = (driveId: string) => {
    // Implementirajte logiku za prihvatanje vožnje
    console.log(`Drive accepted: ${driveId}`);
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
              startingAddress={drive.startingAddress}
              endingAddress={drive.endingAddress}
              createdAt={drive.createdAt}
              aproximatedTime={drive.aproximatedTime}
              aproximatedCost={drive.aproximatedCost}
              driveState={drive.driveState}
              userType={"2"} // Ili izmenite prema potrebi
              onAcceptDrive={() => handleAcceptDrive(drive.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default DriveList;
