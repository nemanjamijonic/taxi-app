import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Navbar from "../Navbar/Navbar";
import DriveItem from "../DriveItem/DriveItem";
import "./Dashboard.css";
import ReactStars from "react-rating-stars-component";
import { CButton } from "@coreui/react";
import { HubConnection } from "@microsoft/signalr";
import ChatApp from "../ChatApp/ChatApp";

type Drive = {
  id: string;
  startingAddress: string;
  endingAddress: string;
  createdAt: string;
  userId: string;
  userUsername: string;
  driverArrivalTime: number;
  driverUsername: string;
  aproximatedTime: number;
  aproximatedCost: number;
  driveDistance: number;
  driveState: string;
};

interface Message {
  username: string;
  msg: string;
}

const Dashboard: React.FC = () => {
  const [username, setUsername] = useState("");
  const [userType, setUserType] = useState("");
  const [userState, setUserState] = useState("");
  const [email, setEmail] = useState("");
  const [userImage, setUserImage] = useState("");
  const [userDrive, setUserDrive] = useState<Drive | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [rideTimeLeft, setRideTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [arrivalNotified, setArrivalNotified] = useState(false);
  const [completionNotified, setCompletionNotified] = useState(false);
  const [completionMessage, setCompletionMessage] = useState(false);
  const [currentRating, setCurrentRating] = useState<number | null>(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [conn, setConnection] = useState<HubConnection | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const navigate = useNavigate();

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      console.log(token);
      if (!token) {
        navigate("/login");
        return;
      }
      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken.nameid;
      const userRole = decodedToken.role;
      console.log("UserRole: " + userRole);
      const userResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL_USER_API}/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(userResponse.data);
      setUserState(userResponse.data.userState);
      const userData = userResponse.data;
      setUsername(userData.username);
      setUserType(userData.userType);
      setEmail(userData.email);
      setUserImage(
        `${process.env.REACT_APP_BACKEND_URL_USER_API}/get-image/${userId}`
      );

      const endpoint =
        userRole == "User"
          ? `${process.env.REACT_APP_BACKEND_URL_DRIVE_API}/current-user-drive`
          : `${process.env.REACT_APP_BACKEND_URL_DRIVE_API}/current-driver-drive`;

      const driveResponse = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserDrive(driveResponse.data);
      console.log(
        "Drive response distance: " + driveResponse.data.driveDistance
      );
      if (driveResponse.data.driveState == "2") {
        setTimeLeft(driveResponse.data.driverArrivalTime);
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
            `${process.env.REACT_APP_BACKEND_URL_DRIVE_API}/drive-arrived/${userDrive.id}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then(() => {
            setRideTimeLeft(userDrive.aproximatedTime);
            fetchUserData();
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
            `${process.env.REACT_APP_BACKEND_URL_DRIVE_API}/drive-completed/${userDrive.id}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then(() => {
            setCompletionMessage(true);
            setShowRatingForm(true);
            setTimeout(() => {
              setCompletionMessage(false);
              fetchUserData();
            }, 3000);
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
        `${process.env.REACT_APP_BACKEND_URL_DRIVE_API}/accept-drive/${driveId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
        `${process.env.REACT_APP_BACKEND_URL_DRIVE_API}/decline-drive/${driveId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchUserData();
    } catch (error) {
      console.error("Error declining drive:", error);
    }
  };

  const handleRatingSubmit = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token || !userDrive || currentRating === null) return;

      const ratingData = {
        DriveId: userDrive.id,
        Rating: currentRating,
      };

      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL_DRIVER_RATING_API}/createDriverRating`,
        ratingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShowRatingForm(false);
      alert("Rating submitted successfully!");
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Error submitting rating.");
    }
  };

  useEffect(() => {
    // Kontrola vidljivosti chata
    console.log(userDrive?.driveState);
    if (
      timeLeft != 0 &&
      userDrive &&
      (userDrive.driveState == "2" ||
        userDrive.driveState == "4" ||
        userDrive.driveState == "5")
    ) {
      setIsChatVisible(true);
    } else if (rideTimeLeft !== null && rideTimeLeft > 0) {
      setIsChatVisible(true);
    } else {
      setIsChatVisible(false);
    }
  }, [timeLeft, rideTimeLeft, userDrive]);

  if (loading) {
    return <div>Loading...</div>;
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
        {userDrive && userDrive.driveState != "4" ? (
          <p>
            <strong>User Type: </strong>
            {userType == "0"
              ? "Admin"
              : userType == "1"
              ? "User"
              : userType == "2"
              ? "Driver"
              : "Unknown"}
          </p>
        ) : (
          <div>
            <h1>
              Welcome to Dashboard, <b>{username}</b>
            </h1>

            <p>
              <strong>User Type: </strong>
              {userType == "0"
                ? "Admin"
                : userType == "1"
                ? "User"
                : userType == "2"
                ? "Driver"
                : "Unknown"}
            </p>
            <p>
              <strong>User Status:</strong>{" "}
              {userState == "0"
                ? "Created"
                : userState == "1"
                ? "Verified"
                : userState == "2"
                ? "Rejected"
                : userState == "3"
                ? "Blocked"
                : "Unknown"}
            </p>
          </div>
        )}

        {userDrive && userDrive.driveState != "5" ? (
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
              driverArrivalTime={userDrive.driverArrivalTime}
              driveDistance={userDrive.driveDistance}
              driveState={userDrive.driveState}
              userType={userType}
              userState={userState}
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

        {showRatingForm && userDrive && userType == "1" && (
          <div className="rating-form">
            <p className="rating-form-title">
              Rate the driver: {userDrive.driverUsername}
            </p>
            <div className="rating-stars-container">
              <ReactStars
                count={5}
                onChange={(value: number) => setCurrentRating(value)}
                size={24}
                activeColor="#ffd700"
                value={currentRating || 0}
              />
            </div>
            <CButton
              className="rating-reset-button"
              color="danger"
              onClick={() => setCurrentRating(null)}
            >
              Reset
            </CButton>
            <CButton
              color="success"
              className="rating-submit-button"
              onClick={handleRatingSubmit}
            >
              Submit Rating
            </CButton>
          </div>
        )}

        {isChatVisible && userDrive && (
          <ChatApp username={username} chatroom={userDrive.id} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
