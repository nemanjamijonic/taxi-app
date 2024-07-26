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
    <nav className="navbar">
      <div className="navbar-logo">
        <img
          src="/taxi-logo.png"
          alt="Taxi App Logo"
          className="navbar-logo-image"
        />
      </div>
      <div className="navbar-links">
        <span onClick={() => handleNavigation("/profile")}>Profile</span>
        {userType == "0" && (
          <>
            <span onClick={() => handleNavigation("/verification")}>
              Verification List
            </span>
            <span onClick={() => handleNavigation("/all-drives")}>
              All Drives
            </span>
            <span onClick={() => handleNavigation("/all-users")}>
              All Users
            </span>
          </>
        )}
        {userType == "1" && (
          <>
            <span onClick={() => handleNavigation("/dashboard")}>
              Dashboard
            </span>
            <span onClick={() => handleNavigation("/create-drive")}>
              Create Drive
            </span>
            <span onClick={() => handleNavigation("/previous-rides")}>
              Previous Drives
            </span>
          </>
        )}
        {userType == "2" && (
          <>
            <span onClick={() => handleNavigation("/dashboard")}>
              Dashboard
            </span>
            <span onClick={() => handleNavigation("/new-driver-rides")}>
              New Rides
            </span>
            <span onClick={() => handleNavigation("/my-rides")}>My Rides</span>
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
  );
};

export default Navbar;
