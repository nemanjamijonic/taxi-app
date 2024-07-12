import React from "react";
import "./DriveItem.css";

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
  onAcceptDrive?: () => void;
  onDeclineDrive?: () => void;
  onCreateOffer?: () => void;
};

const DriveItem: React.FC<DriveItemProps> = ({
  id,
  startingAddress,
  endingAddress,
  createdAt,
  userUsername,
  driverUsername,
  aproximatedTime,
  aproximatedCost,
  driveState,
  userType,
  onAcceptDrive,
  onDeclineDrive,
  onCreateOffer,
}) => {
  return (
    <div className="drive-item">
      <h1>{id}</h1>
      <hr></hr>
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
        <strong>Drive Created By:</strong> {userUsername}
      </p>
      <p>
        <strong>Offer By Driver:</strong> {driverUsername}
      </p>
      <p>
        <strong>Approx. Time:</strong> {aproximatedTime} seconds
      </p>
      <p>
        <strong>Approx. Cost:</strong> ${aproximatedCost}
      </p>
      <p>
        <strong>State:</strong>
        {driveState == "0" && "User Ordered Ride"}
        {driveState == "1" && "Driver Created Offer"}
        {driveState == "2" && "User Accepted Drive"}
        {driveState == "3" && "User Declined Drive"}
        {driveState == "4" && "Drive Active"}
        {driveState == "5" && "Drive Completed"}
      </p>
      {userType == "1" && driveState == "1" && (
        <>
          <button onClick={onAcceptDrive}>Accept Drive</button>
          <button onClick={onDeclineDrive}>Decline Drive</button>
        </>
      )}
      {userType == "2" && driveState == "0" && (
        <button onClick={onCreateOffer}>Create Offer</button>
      )}
    </div>
  );
};

export default DriveItem;
