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
}

const UserCard: React.FC<UserCardProps> = ({ user, onVerify }) => {
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
      {user.userState == "0" ? (
        <p>
          <strong>Status:</strong> Unverified
        </p>
      ) : (
        <p>
          <strong>Status:</strong> Verified
        </p>
      )}
      <button onClick={() => onVerify(user.id)}>Verify Driver</button>
    </div>
  );
};

export default UserCard;
