import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Dashboard from "./components/Dashboard/Dashboard";
import Profile from "./components/Profile/Profile";
import Verification from "./components/Verification/Verification";
import CreateDrive from "./components/CreateDrive/CreateDrive";
import UserDrives from "./components/UserDrives/UserDrives";
import DriveList from "./components/DriveList/DriveList";
import AllUsers from "./components/AllUsers/AllUsers";
import AllDrives from "./components/AllDrives/AllDrives";
import MyRides from "./components/MyRides/MyRides";
import FavouriteAddresses from "./components/FavouriteAddresses/FavouriteAddresses";

import "./App.css";

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/create-drive" element={<CreateDrive />} />
          <Route path="/previous-rides" element={<UserDrives />} />
          <Route path="/new-driver-rides" element={<DriveList />} />
          <Route path="/all-users" element={<AllUsers />} />
          <Route path="/all-drives" element={<AllDrives />} />
          <Route path="/my-rides" element={<MyRides />} />
          <Route path="/favourite-address" element={<FavouriteAddresses />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
