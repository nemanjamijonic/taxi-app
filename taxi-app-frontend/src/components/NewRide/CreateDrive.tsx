import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode library
import "./CreateDrive.css";

type CreateDriveFormInputs = {
  startingAddress: string;
  endingAddress: string;
  userUsername: string;
};

const CreateDrive: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue, // Use setValue to set the form field value programmatically
  } = useForm<CreateDriveFormInputs>();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [userType, setUserType] = useState("");
  const [userImage, setUserImage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      navigate("/login");
    } else {
      const fetchUserData = async () => {
        const decodedToken: any = jwtDecode(token); // Decode the JWT token

        // Extract the username from the unique_name claim
        const extractedUsername = decodedToken.unique_name;
        const userId = decodedToken.nameid;
        setUsername(extractedUsername);
        if (decodedToken.role != "User") {
          navigate("/dashboard");
        }
        // Fetch additional user data from your backend if needed
        const userResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL_USER_API}/user`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userData = userResponse.data;
        setUserType(userData.userType);
        setUserImage(`http://localhost:8766/api/User/get-image/${userId}`);

        // Set the userUsername field in the form
        setValue("userUsername", extractedUsername);
      };

      fetchUserData();
    }
  }, [navigate, setValue]);

  const onSubmit = async (data: CreateDriveFormInputs) => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        throw new Error("No token found, please log in.");
      }

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL_DRIVE_API}/drive`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        navigate("/dashboard"); // Navigate to the drives list page
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 409) {
          alert("You can't create a drive. You have unfinished drives.");
        } else {
          console.error("Error response status:", error.response.status);
        }
      } else {
        console.error("Error:", error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    window.location.href = "/login";
  };

  return (
    <div>
      <Navbar
        username={username}
        userType={userType}
        userImage={userImage}
        onLogout={handleLogout}
      />
      <div className="create-drive-container">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2>Create Drive</h2>
          <div className="form-group">
            <label>Starting Address:</label>
            <input
              type="text"
              {...register("startingAddress", { required: true })}
            />
            {errors.startingAddress && (
              <span className="error">This field is required</span>
            )}
          </div>
          <div className="form-group">
            <label>Ending Address:</label>
            <input
              type="text"
              {...register("endingAddress", { required: true })}
            />
            {errors.endingAddress && (
              <span className="error">This field is required</span>
            )}
          </div>
          <button type="submit" className="btn">
            Create Drive
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateDrive;
