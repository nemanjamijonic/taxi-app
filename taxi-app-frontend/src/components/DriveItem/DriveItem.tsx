import React from "react";
import "./DriveItem.css";

type DriveItemProps = {
  startingAddress: string;
  endingAddress: string;
  createdAt: string;
  approximatedTime: number;
  approximatedCost: number;
  driveState: string;
};

const DriveItem: React.FC<DriveItemProps> = ({
  startingAddress,
  endingAddress,
  createdAt,
  approximatedTime,
  approximatedCost,
  driveState,
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
        <strong>Approx. Time:</strong> {approximatedTime} minutes
      </p>
      <p>
        <strong>Approx. Cost:</strong> ${approximatedCost}
      </p>
      <p>
        <strong>State:</strong> {driveState}
      </p>
    </div>
  );
};

export default DriveItem;
