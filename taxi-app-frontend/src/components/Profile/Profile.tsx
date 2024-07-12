import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from "../Navbar/Navbar";
import "./Profile.css";

interface ProfileData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  userType: string;
  userImage: FileList;
}

interface DecodedToken {
  nameid: string;
  username: string;
  role: string;
}

const Profile: React.FC = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileData>();
  const [imageUrl, setImageUrl] = useState("");
  const [username, setUsername] = useState("");
  const [userType, setUserType] = useState("");
  const [userImage, setUserImage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      navigate("/");
    } else {
      const decodedToken = jwtDecode<DecodedToken>(token);

      fetch(`http://localhost:8766/api/User/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setValue("username", data.username);
          setValue("email", data.email);
          setValue("firstName", data.firstName);
          setValue("lastName", data.lastName);
          setValue("dateOfBirth", data.dateOfBirth);
          setValue("address", data.address);
          setValue("userType", data.userType);
          setImageUrl(
            `http://localhost:8766/api/User/get-image/${decodedToken.nameid}`
          );

          setUsername(data.username);
          setUserType(data.userType);
          setUserImage(
            `http://localhost:8766/api/User/get-image/${decodedToken.nameid}`
          );
        })
        .catch((error) => console.error("Error fetching profile data:", error));
    }
  }, [navigate, setValue]);

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/login");
  };

  const onSubmit = (data: ProfileData) => {
    const token = localStorage.getItem("jwtToken");

    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("password", data.password);
    formData.append("confirmpassword", data.confirmPassword);
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("dateOfBirth", data.dateOfBirth);
    formData.append("address", data.address);
    if (data.userImage.length > 0) {
      formData.append("userImage", data.userImage[0]);
    }

    fetch("http://localhost:8766/api/User/update-profile", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Profile updated successfully:", data);
        navigate("/dashboard");
      })
      .catch((error) => console.error("Error updating profile:", error));
  };

  const userTypeText = (type: string) => {
    if (userType == "0") return "Admin";
    if (userType == "1") return "User";
    if (userType == "2") return "Driver";
  };

  return (
    <div className="profile-div">
      <Navbar
        username={username}
        userType={userType}
        userImage={userImage}
        onLogout={handleLogout}
      />
      <div className="profile-container">
        <h2>Profile</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" {...register("username", { required: true })} />
            {errors.username && (
              <span className="error">This field is required</span>
            )}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              {...register("email", { required: true })}
              readOnly
            />
            {errors.email && (
              <span className="error">This field is required</span>
            )}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" {...register("password")} />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" {...register("confirmPassword")} />
          </div>
          <div className="form-group">
            <label>First Name</label>
            <input type="text" {...register("firstName", { required: true })} />
            {errors.firstName && (
              <span className="error">This field is required</span>
            )}
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" {...register("lastName", { required: true })} />
            {errors.lastName && (
              <span className="error">This field is required</span>
            )}
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              {...register("dateOfBirth", { required: true })}
            />
            {errors.dateOfBirth && (
              <span className="error">This field is required</span>
            )}
          </div>
          <div className="form-group">
            <label>User Type</label>
            <input type="text" value={userTypeText(userType)} readOnly />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input type="text" {...register("address", { required: true })} />
            {errors.address && (
              <span className="error">This field is required</span>
            )}
          </div>
          <div className="form-group">
            <label>User Image</label>
            <input type="file" {...register("userImage")} />
          </div>
          <button className="button-profile" type="submit">
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
