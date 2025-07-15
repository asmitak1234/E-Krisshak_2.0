import axios from "axios";
import Cookies from "js-cookie";

const instance = axios.create({
  baseURL: "https://web-production-f62a7.up.railway.app/api/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const lang = Cookies.get("preferredLanguage");
  const token = localStorage.getItem("accessToken");

  const publicEndpoints = ["/forgot-password", "/reset-password"];
  const isPublic = publicEndpoints.some((endpoint) => config.url.includes(endpoint));

  if (lang) {
    config.headers["Accept-Language"] = lang;
  }

  if (token && !isPublic) {
    config.headers["Authorization"] = `Token ${token}`;
    if (process.env.NODE_ENV === "development") {
      console.log("✅ Token attached");
    }
  } else if (!token && !isPublic && process.env.NODE_ENV === "development") {
    console.warn("❌ No token found in localStorage");
  }

  return config;
});

export default instance;
