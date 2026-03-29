import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const authHeader = (jwt) => ({
  headers: {
    Authorization: `Bearer ${jwt}`,
  },
});

export const registerUser = async (userData, jwt) => {
  const response = await axios.post(
    `${API_URL}/users/register`,
    userData,
    authHeader(jwt),
  );
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await axios.post(`${API_URL}/users/login`, credentials);
  return response.data;
};

export const editUser = async (userData, jwt) => {
  const response = await axios.put(
    `${API_URL}/users/${userData._id}`,
    userData,
    authHeader(jwt),
  );
  return response.data;
};

export const deleteUser = async (userId, jwt) => {
  const response = await axios.delete(
    `${API_URL}/users/${userId}`,
    authHeader(jwt),
  );
  return response.data;
};

export const getUsers = async (jwt) => {
  const response = await axios.get(`${API_URL}/users`, authHeader(jwt));
  return response.data;
};
