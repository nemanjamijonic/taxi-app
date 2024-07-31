import React, { useState } from "react";
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
  driverArrivalTime: number;
  driveDistance: number;
  driveState: string;
  userState: string;
  userType: string;
  onAcceptDrive?: () => void;
  onDeclineDrive?: () => void;
  onCreateOffer?: (arrivalTime: number) => void;
};

const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  if (minutes === 0) {
    return `${seconds}seconds`;
  } else if (seconds === 0) {
    return `${minutes} minutes`;
  }
  return `${minutes} minutes ${seconds} seconds`;
};

const formatDistance = (distanceInMeters: number): string => {
  const km = Math.floor(distanceInMeters / 1000);
  const m = distanceInMeters % 1000;
  if (km === 0) {
    return `${m}m`;
  } else if (m === 0) {
    return `${km}km`;
  }
  return `${km}km ${m}m`;
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
  driverArrivalTime,
  userType,
  driveDistance,
  userState,
  onAcceptDrive,
  onDeclineDrive,
  onCreateOffer,
}) => {
  const [arrivalTime, setArrivalTime] = useState<number>(0);

  const handleCreateOffer = () => {
    if (onCreateOffer) {
      onCreateOffer(arrivalTime);
    }
  };

  return (
    <div className="drive-item">
      <h1>{id}</h1>
      <hr />
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
        <strong>Offer By Driver:</strong>{" "}
        {driverUsername == "" ? "No current offer" : driverUsername}
      </p>
      <p>
        <strong>Driver Arrival Time:</strong>{" "}
        {driverArrivalTime == null ? "No current offer" : driverArrivalTime}
        {" minutes "}
      </p>
      <p>
        <strong>Approx. Drive Duration:</strong> {formatTime(aproximatedTime)}
      </p>
      <p>
        <strong>Approx. Drive Cost:</strong> {aproximatedCost.toFixed(2)}{" "}
        (Serbian Dinars)
      </p>
      <p>
        <strong>Approx. Drive Distance:</strong> {formatDistance(driveDistance)}
      </p>
      <p>
        <strong>State:</strong> {driveState == "0" && "User Ordered Ride"}
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
      {userType == "2" && driveState == "0" && userState == "1" && (
        <>
          <hr></hr>
          <div>
            <p> Driver Arrival time: </p>
            <input
              style={{ border: "2px solid", padding: "10px" }}
              type="number"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(Number(e.target.value))}
              placeholder="Arrival time in minutes"
            />
            <button style={{ width: "96%" }} onClick={handleCreateOffer}>
              Create Offer
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DriveItem;
