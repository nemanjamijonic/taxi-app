import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CreateDrive.css";

type CreateDriveFormInputs = {
  startingAddress: string;
  endingAddress: string;
};

const CreateDrive: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateDriveFormInputs>();
  const navigate = useNavigate();

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
        navigate("/previous-rides"); // Navigate to the drives list page
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
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
  );
};

export default CreateDrive;
