import React, { useState, useEffect } from "react";
import axios from "axios";
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
    averageRating?: number; // Optional prop
  };
  onVerify: (userId: string) => void;
  onRejection: (userId: string) => void;
  onBlocking: (userId: string) => void;
  onUnblocking: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onVerify,
  onRejection,
  onBlocking,
  onUnblocking,
}) => {
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.userType == "2") {
      const fetchAverageRating = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_BACKEND_URL_DRIVER_RATING_API}/getAverageRating/${user.id}`
          );
          setAverageRating(response.data);
        } catch (error) {
          console.error("Error fetching average rating:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchAverageRating();
    } else {
      setLoading(false);
    }
  }, [user.id, user.userType]);

  const getUserState = (state: string) => {
    if (state == "0") {
      return "Pending";
    } else if (state == "1") {
      return "Active";
    } else if (state == "2") {
      return "Rejected";
    } else if (state == "3") {
      return "Blocked";
    } else {
      return "Unknown";
    }
  };

  const getUserType = (type: string) => {
    if (type == "0") {
      return "Admin";
    } else if (type == "1") {
      return "User";
    } else if (type == "2") {
      return "Driver";
    } else {
      return "Unknown";
    }
  };

  return (
    <div className="user-card">
      <h3>{user.username}</h3>
      <hr />
      <p>
        <strong>First Name:</strong> {user.firstName}
      </p>
      <p>
        <strong>Last Name:</strong> {user.lastName}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <p>
        <strong>User Type:</strong> {getUserType(user.userType)}
      </p>
      {user.userType == "2" && (
        <p>
          <strong>Average Rating:</strong>{" "}
          {loading
            ? "Loading..."
            : averageRating != null
            ? averageRating.toFixed(2)
            : "N/A"}
        </p>
      )}
      <p>
        <strong>Status:</strong> {getUserState(user.userState)}
      </p>
      <div className="user-card-actions">
        {user.userState == "0" && (
          <>
            <button onClick={() => onVerify(user.id)}>Verify</button>
            <button onClick={() => onRejection(user.id)}>Reject</button>
          </>
        )}
        {user.userState == "1" && user.userType == "2" && (
          <button onClick={() => onBlocking(user.id)}>Block</button>
        )}
        {user.userState == "3" && user.userType == "2" && (
          <button onClick={() => onUnblocking(user.id)}>Unblock</button>
        )}
      </div>
    </div>
  );
};

export default UserCard;
