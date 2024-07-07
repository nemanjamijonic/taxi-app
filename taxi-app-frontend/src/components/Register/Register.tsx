import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./Register.css";

type RegisterFormInputs = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // Change Date type to string
  address: string;
  userType: string;
};

const Register: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>();
  const navigate = useNavigate();

  const onSubmit = async (data: RegisterFormInputs) => {
    // Convert dateOfBirth to a Date object
    const dateOfBirth = new Date(data.dateOfBirth);

    const payload = {
      ...data,
      dateOfBirth: dateOfBirth.toISOString(),
    };

    try {
      const response = await axios.post(
        "http://localhost:8766/api/Auth/register",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const token = response.data.token;
      localStorage.setItem("jwtToken", token); // Store the token in local storage
      navigate("/dashboard"); // Navigate to Dashboard page
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit(onSubmit)} className="register-form">
        <h2 className="form-title">Register</h2>
        <div className="form-group">
          <label>Username</label>
          <input type="text" {...register("username", { required: true })} />
          {errors.username && (
            <span className="error">This field is required</span>
          )}
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" {...register("email", { required: true })} />
          {errors.email && (
            <span className="error">This field is required</span>
          )}
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            {...register("password", { required: true })}
          />
          {errors.password && (
            <span className="error">This field is required</span>
          )}
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            {...register("confirmPassword", { required: true })}
          />
          {errors.confirmPassword && (
            <span className="error">This field is required</span>
          )}
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
          <input type="date" {...register("dateOfBirth", { required: true })} />
          {errors.dateOfBirth && (
            <span className="error">This field is required</span>
          )}
        </div>
        <div className="form-group">
          <label>Address</label>
          <input type="text" {...register("address", { required: true })} />
          {errors.address && (
            <span className="error">This field is required</span>
          )}
        </div>
        <div className="form-group">
          <label>User Type</label>
          <select
            className="form-group-select"
            {...register("userType", { required: true })}
          >
            <option value="User">User</option>
            <option value="Driver">Driver</option>
          </select>
          {errors.userType && (
            <span className="error">This field is required</span>
          )}
        </div>
        <button type="submit" className="btn button-register">
          Register
        </button>
        <div className="links">
          <Link to="/login">Already have an account? Login</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
