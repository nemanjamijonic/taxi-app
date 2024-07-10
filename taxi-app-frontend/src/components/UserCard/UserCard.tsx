import React from "react";
import "./UserCard.css";

interface UserCardProps {
  user: {
    id: string;
    username: string;
    userState: string;
    email: string;
    userType: string;
    firstName: string;
    lastName: string;
  };
  onVerify: (userId: string) => void;
  onRejection: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onVerify, onRejection }) => {
  const getUserState = (state: string) => {
    if (state == "0" && user.userType == "2") return "Unverified";
    if (state == "0" && user.userType == "1") return "Verified";
    if (state == "0" && user.userType == "0") return "Verified";
    if (state == "1") return "Verified";
    if (state == "2") return "Rejected";
  };

  return (
    <div className="user-card">
      <p>
        <strong>Username:</strong> {user.username}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      {user.userType == "1" ? (
        <p>
          <strong>Type:</strong> User
        </p>
      ) : (
        <p>
          <strong>Type:</strong> Driver
        </p>
      )}
      <p>
        <strong>Name:</strong> {user.firstName} {user.lastName}
      </p>
      <p>
        <strong>Status:</strong> {getUserState(user.userState)}
      </p>
      {user.userType == "2" && (
        <>
          <button onClick={() => onVerify(user.id)}>Verify Driver</button>
          <button onClick={() => onRejection(user.id)}>Reject Driver</button>
        </>
      )}
    </div>
  );
};

export default UserCard;
