import React, { useEffect, useState } from "react";
import axios from "axios";
import DriveItem from "../DriveItem/DriveItem";
import Navbar from "../Navbar/Navbar";
import { jwtDecode } from "jwt-decode";
import "./UserDrives.css";
import { useNavigate } from "react-router-dom";

type Drive = {
  id: string; // Dodato, da bi svaki Drive imao jedinstveni ključ
  startingAddress: string;
  endingAddress: string;
  createdAt: string;
  userUsername: string;
  driverUsername: string;
  driverArrivalTime: number;
  driveDistance: number;
  aproximatedTime: number;
  aproximatedCost: number;
  driveState: string;
};

const UserDrives: React.FC = () => {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [username, setUsername] = useState("");
  const [userType, setUserType] = useState("");
  const [userImage, setUserImage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDrives = async () => {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        navigate("/login");
        return;
      }

      // Decode the token to get the userId
      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken.nameid;
      if (decodedToken.role != "User") {
        navigate("/dashboard");
      }
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL_DRIVE_API}/user-drives`,
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
        `${process.env.REACT_APP_BACKEND_URL_USER_API}/get-image/${userId}`
      );
    };

    fetchDrives();
  }, [navigate]);

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
      <div className="user-drives">
        <h2>Your Completed Drives</h2>
        {drives.length === 0 ? (
          <p>No drives found.</p>
        ) : (
          drives.map((drive) => (
            <div className="drive-item-container" key={drive.id}>
              <DriveItem
                id={drive.id} // Dodato
                startingAddress={drive.startingAddress}
                endingAddress={drive.endingAddress}
                createdAt={drive.createdAt}
                userUsername={drive.userUsername}
                driverArrivalTime={drive.driverArrivalTime}
                driverUsername={drive.driverUsername}
                aproximatedTime={drive.aproximatedTime}
                driveDistance={drive.driveDistance}
                aproximatedCost={drive.aproximatedCost}
                driveState={drive.driveState}
                userState={drive.driveState}
                userType={userType} // Prosleđivanje userType-a
                onAcceptDrive={() => handleAcceptDrive(drive.id)} // Prosleđivanje funkcije za prihvatanje
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserDrives;
