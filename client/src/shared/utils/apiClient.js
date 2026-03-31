// apiClient.js
import axios from "axios";

export const createApiClient = (jwt) => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        console.warn("Unauthorized - redirect to login");
      }
      return Promise.reject(err);
    },
  );

  return instance;
};
