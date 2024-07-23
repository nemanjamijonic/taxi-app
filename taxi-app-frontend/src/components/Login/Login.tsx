import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";



type LoginFormInputs = {
  email: string;
  password: string;
};



const Login: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL_AUTH_API}/login`,
        data
      );
      const token = response.data.token;
      localStorage.setItem("jwtToken", token); // Store the token in local storage
      navigate("/dashboard"); // Navigate to Dashboard page
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2>Login</h2>
        <div className="form-group">
          <label>Email:</label>
          <input type="email" {...register("email", { required: true })} />
          {errors.email && (
            <span className="error">This field is required</span>
          )}
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type={showPassword ? "text" : "password"}
            {...register("password", { required: true })}
          />
          {errors.password && (
            <span className="error">This field is required</span>
          )}
        </div>
        <br></br>
        <div className="form-group checkbox">
          <input
            type="checkbox"
            id="showPassword"
            onChange={(e) => setShowPassword(e.target.checked)}
          />
          <label className="label-login" htmlFor="showPassword">
            Show Password
          </label>
        </div>
        <button type="submit" className="btn">
          Sign In
        </button>
      </form>
      <div className="links">
        <a href="/register">Don't have an account? Sign up</a>
      </div>
    </div>
  );
};

export default Login;
