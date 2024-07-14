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
}

const UserCard: React.FC<UserCardProps> = ({ user, onVerify, onRejection }) => {
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.userType == "2") {
      const fetchAverageRating = async () => {
        try {
          const response = await axios.get(
            `http://localhost:8351/api/DriverRating/getAverageRating/${user.id}`
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
    if (state == "0" && user.userType == "2") return "Unverified";
    if (state == "0" && user.userType == "1") return "Verified";
    if (state == "0" && user.userType == "0") return "Verified";
    if (state == "1") return "Verified";
    if (state == "2") return "Rejected";
  };

  return (
    <div className="user-card">
      <h3>{user.id}</h3>
      <hr />
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
          <strong>User Type:</strong> Driver
        </p>
      )}
      <p>
        <strong>Full Name:</strong> {user.firstName} {user.lastName}
      </p>
      <p>
        <strong>Status:</strong> {getUserState(user.userState)}
      </p>
      {user.userType == "2" && averageRating != 0 && (
        <p>
          <strong>Average Rating: {averageRating}</strong>
        </p>
      )}
      {user.userType == "2" && averageRating === 0 && (
        <p>
          <strong>Driver Has No Ratings Yet</strong>
        </p>
      )}
      {user.userType == "1" && (
        <p>
          <strong>User Can't Be Rated</strong>
        </p>
      )}
      {user.userType == "2" && user.userState == "0" && (
        <>
          <button onClick={() => onVerify(user.id)}>Verify Driver</button>
          <button onClick={() => onRejection(user.id)}>Reject Driver</button>
        </>
      )}
    </div>
  );
};

export default UserCard;
