import React from "react";
import "./DriveItem.css";

type DriveItemProps = {
  startingAddress: string;
  endingAddress: string;
  createdAt: string;
  aproximatedTime: number;
  aproximatedCost: number;
  driveState: string;
  userType: string; // Dodato
  onAcceptDrive?: () => void; // Dodato, funkcija koja će biti pozvana kada se klikne dugme
};

const DriveItem: React.FC<DriveItemProps> = ({
  startingAddress,
  endingAddress,
  createdAt,
  aproximatedTime,
  aproximatedCost,
  driveState,
  userType,
  onAcceptDrive, // Dodato
}) => {
  return (
    <div className="drive-item">
      <p>
        <strong>Starting Address:</strong> {startingAddress}
      </p>
      <p>
        <strong>Ending Address:</strong> {endingAddress}
      </p>
      <p>
        <strong>Created At:</strong> {new Date(createdAt).toLocaleString()}
      </p>
      <p>
        <strong>Approx. Time:</strong> {aproximatedTime} seconds
      </p>
      <p>
        <strong>Approx. Cost:</strong> ${aproximatedCost}
      </p>
      <p>
        <strong>State:</strong>{" "}
        {driveState == "0" ? "User Ordered Ride" : driveState}
      </p>
      {userType === "2" && (
        <button onClick={onAcceptDrive}>Accept Drive</button>
      )}
    </div>
  );
};

export default DriveItem;
