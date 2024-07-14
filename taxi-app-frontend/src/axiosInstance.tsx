import axios from "axios";

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use((config) => {
  if (!config.headers) {
    config.headers = {};
  }
  config.headers["referrerPolicy"] = "strict-origin-when-cross-origin";
  return config;
});

export default axiosInstance;
