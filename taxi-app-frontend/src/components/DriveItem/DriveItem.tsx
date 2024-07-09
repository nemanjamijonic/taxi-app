import React from "react";
import "./DriveItem.css";

type DriveItemProps = {
  id: string;
  startingAddress: string;
  endingAddress: string;
  createdAt: string;
  aproximatedTime: number;
  aproximatedCost: number;
  driveState: string;
  userType: string; // Dodato
  onAcceptDrive?: () => void; // Dodato, funkcija koja će biti pozvana kada se klikne dugme
  onCreateOffer?: () => void; // Dodato, funkcija koja će biti pozvana kada se klikne dugme
};

const DriveItem: React.FC<DriveItemProps> = ({
  id, // Dodato
  startingAddress,
  endingAddress,
  createdAt,
  aproximatedTime,
  aproximatedCost,
  driveState,
  userType,
  onAcceptDrive, // Dodato
  onCreateOffer, // Dodato
}) => {
  const handleCreateOffer = async () => {
    if (onCreateOffer) {
      onCreateOffer();
    }
  };

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
        <strong>State:</strong> {driveState == "0" ? "User Ordered Ride" : ""}
        {driveState == "1" ? "Driver Created Offer" : ""}
        {driveState == "5" ? "Drive Completed" : ""}
      </p>
      {userType === "1" && (
        <button onClick={onAcceptDrive}>Accept Drive</button>
      )}
      {userType === "2" && (
        <button onClick={handleCreateOffer}>Create offer</button>
      )}
    </div>
  );
};

export default DriveItem;
