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
  dateOfBirth: string;
  address: string;
  userType: string;
  imageFile: FileList;
};

const Register: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>();
  const navigate = useNavigate();

  const onSubmit = async (data: RegisterFormInputs) => {
    const dateOfBirth = new Date(data.dateOfBirth);

    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("confirmPassword", data.confirmPassword);
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("dateOfBirth", dateOfBirth.toISOString());
    formData.append("address", data.address);
    formData.append("userType", data.userType);
    formData.append("ImageFile", data.imageFile[0]);

    try {
      const response = await axios.post(
        "http://localhost:8766/api/Auth/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const { token, imagePath } = response.data;
      localStorage.setItem("jwtToken", token);
      localStorage.setItem("imagePath", imagePath);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="register-container">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="register-form"
        encType="multipart/form-data"
      >
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
        <div className="form-group">
          <label>User Image</label>
          <input type="file" {...register("imageFile", { required: true })} />
          {errors.imageFile && (
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
