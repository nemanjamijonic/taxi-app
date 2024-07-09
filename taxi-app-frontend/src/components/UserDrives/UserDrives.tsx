import React, { useEffect, useState } from "react";
import axios from "axios";
import DriveItem from "../DriveItem/DriveItem";
import "./UserDrives.css";

type Drive = {
  startingAddress: string;
  endingAddress: string;
  createdAt: string;
  approximatedTime: number;
  approximatedCost: number;
  driveState: string;
};

const UserDrives: React.FC = () => {
  const [drives, setDrives] = useState<Drive[]>([]);

  useEffect(() => {
    const fetchDrives = async () => {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        throw new Error("No token found, please log in.");
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
    };

    fetchDrives();
  }, []);

  return (
    <div className="user-drives">
      <h2>Your Drives</h2>
      {drives.length === 0 ? (
        <p>No drives found.</p>
      ) : (
        drives.map((drive, index) => (
          <DriveItem
            key={index}
            startingAddress={drive.startingAddress}
            endingAddress={drive.endingAddress}
            createdAt={drive.createdAt}
            approximatedTime={drive.approximatedTime}
            approximatedCost={drive.approximatedCost}
            driveState={drive.driveState}
          />
        ))
      )}
    </div>
  );    
};

export default UserDrives;
