import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8766",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default axiosInstance;
