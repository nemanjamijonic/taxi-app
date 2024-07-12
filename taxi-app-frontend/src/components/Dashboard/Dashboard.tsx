import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Navbar from "../Navbar/Navbar";
import DriveItem from "../DriveItem/DriveItem";
import "./Dashboard.css";

type Drive = {
  id: string;
  startingAddress: string;
  endingAddress: string;
  createdAt: string;
  userUsername: string;
  driverUsername: string;
  aproximatedTime: number;
  aproximatedCost: number;
  driveState: string;
};

const Dashboard: React.FC = () => {
  const [username, setUsername] = useState("");
  const [userType, setUserType] = useState("");
  const [email, setEmail] = useState("");
  const [userImage, setUserImage] = useState("");
  const [userDrive, setUserDrive] = useState<Drive | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [rideTimeLeft, setRideTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [arrivalNotified, setArrivalNotified] = useState(false);
  const [completionNotified, setCompletionNotified] = useState(false);
  const [completionMessage, setCompletionMessage] = useState(false);
  const navigate = useNavigate();

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        navigate("/login");
        return;
      }
      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken.nameid;
      const userRole = decodedToken.role; // Get the user role from the token
      console.log(userRole);
      const userResponse = await axios.get(
        "http://localhost:8766/api/User/user",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const userData = userResponse.data;
      setUsername(userData.username);
      setUserType(userData.userType);
      setEmail(userData.email);
      setUserImage(`http://localhost:8766/api/User/get-image/${userId}`);

      // Determine the appropriate endpoint based on the user role
      const endpoint =
        userRole == "User"
          ? "http://localhost:8351/api/Drive/current-user-drive"
          : "http://localhost:8351/api/Drive/current-driver-drive";

      const driveResponse = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserDrive(driveResponse.data);
      if (driveResponse.data.driveState == 2) {
        setTimeLeft(driveResponse.data.aproximatedTime);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft !== null && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => (prevTime ? prevTime - 1 : 0));
      }, 1000);
    } else if (timeLeft === 0 && !arrivalNotified && userDrive) {
      setArrivalNotified(true);
      const token = localStorage.getItem("jwtToken");
      if (token) {
        axios
          .post(
            `http://localhost:8351/api/Drive/drive-arrived/${userDrive.id}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then(() => {
            setRideTimeLeft(10); // Start the ride time countdown
            fetchUserData(); // Reload the component
          })
          .catch((error) =>
            console.error("Error notifying drive arrival:", error)
          );
      }
    }
    return () => clearInterval(timer);
  }, [timeLeft, userDrive, arrivalNotified, fetchUserData]);

  useEffect(() => {
    let rideTimer: NodeJS.Timeout;
    if (rideTimeLeft !== null && rideTimeLeft > 0) {
      rideTimer = setInterval(() => {
        setRideTimeLeft((prevTime) => (prevTime ? prevTime - 1 : 0));
      }, 1000);
    } else if (rideTimeLeft === 0 && !completionNotified && userDrive) {
      setCompletionNotified(true);
      const token = localStorage.getItem("jwtToken");
      if (token) {
        axios
          .post(
            `http://localhost:8351/api/Drive/drive-completed/${userDrive.id}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then(() => {
            setCompletionMessage(true); // Show completion message
            setTimeout(() => {
              setCompletionMessage(false);
              fetchUserData(); // Reload the component
            }, 3000); // Display the message for 3 seconds
          })
          .catch((error) =>
            console.error("Error notifying drive completion:", error)
          );
      }
    }
    return () => clearInterval(rideTimer);
  }, [rideTimeLeft, userDrive, completionNotified, fetchUserData]);

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/login");
  };

  const handleAcceptDrive = async (driveId: string) => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) return;

      await axios.post(
        `http://localhost:8351/api/Drive/accept-drive/${driveId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh the drive data
      fetchUserData();
    } catch (error) {
      console.error("Error accepting drive:", error);
    }
  };

  const handleDeclineDrive = async (driveId: string) => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) return;

      await axios.post(
        `http://localhost:8351/api/Drive/decline-drive/${driveId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh the drive data
      fetchUserData();
    } catch (error) {
      console.error("Error declining drive:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Display a loading message while fetching data
  }

  return (
    <div
      className={
        timeLeft !== null || rideTimeLeft !== null ? "disable-interaction" : ""
      }
    >
      <Navbar
        username={username}
        userType={userType}
        userImage={userImage}
        onLogout={handleLogout}
      />
      <div className="dashboard-container">
        <h1>Welcome, {username}</h1>
        <h2>User Information</h2>
        <p>
          <strong>Email:</strong> {email}
        </p>
        {userType == "2" && (
          <>
            <p>userstate</p>
          </>
        )}
        <p>
          <strong>User Type:</strong> {userType == "1" ? "User" : "Driver"}
        </p>

        {userDrive ? (
          <div>
            <h2>Active Drive</h2>
            {userDrive.driveState == "2" && timeLeft !== null && (
              <div>
                <h3>Your drive is coming in: {timeLeft} seconds</h3>
              </div>
            )}
            {rideTimeLeft !== null && (
              <div>
                <h3>Ride in progress: {rideTimeLeft} seconds remaining</h3>
              </div>
            )}
            <DriveItem
              id={userDrive.id}
              startingAddress={userDrive.startingAddress}
              endingAddress={userDrive.endingAddress}
              createdAt={userDrive.createdAt}
              userUsername={userDrive.userUsername}
              driverUsername={userDrive.driverUsername}
              aproximatedTime={userDrive.aproximatedTime}
              aproximatedCost={userDrive.aproximatedCost}
              driveState={userDrive.driveState}
              userType={userType}
              onAcceptDrive={() => handleAcceptDrive(userDrive.id)}
              onDeclineDrive={() => handleDeclineDrive(userDrive.id)}
            />
          </div>
        ) : (
          <p>No active drive.</p>
        )}

        {completionMessage && (
          <div className="completion-message">
            <p>Ride successfully completed!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
