import React from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

interface NavbarProps {
  username: string;
  userType: string;
  userImage: string;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  username,
  userType,
  userImage,
  onLogout,
}) => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-buttons">
          <button onClick={() => handleNavigation("/profile")}>Profile</button>
          {userType == "0" && (
            <>
              <button onClick={() => handleNavigation("/verification")}>
                Verification
              </button>
              <button onClick={() => handleNavigation("/all-rides")}>
                All Rides
              </button>
            </>
          )}
          {userType == "1" && (
            <>
              <button onClick={() => handleNavigation("/new-ride")}>
                New Ride
              </button>
              <button onClick={() => handleNavigation("/previous-rides")}>
                Previous Rides
              </button>
            </>
          )}
          {userType == "2" && (
            <>
              <button onClick={() => handleNavigation("/new-rides")}>
                New Rides
              </button>
              <button onClick={() => handleNavigation("/my-rides")}>
                My Rides
              </button>
            </>
          )}
        </div>
        <div className="navbar-user">
          {userImage && (
            <img src={userImage} alt="User" className="navbar-user-image" />
          )}
          <span>{username}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
