import axios from "axios";
import { useAuth } from "../../../shared/hooks/AuthContext.jsx";

const API = import.meta.env.VITE_API_URL + "/products";

export function useProductApi() {
  const { jwt } = useAuth();

  const axiosInstance = axios.create({
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  const getProducts = () => axiosInstance.get(API);
  const createProduct = (data) => axiosInstance.post(API, data);
  const getProductById = (personId, debt) =>
    axiosInstance.get(`${API}/${personId}`, debt);
  const updateProduct = (personId, payment) =>
    axiosInstance.put(`${API}/${personId}`, payment);
  const deleteProduct = (personId) =>
    axiosInstance.delete(`${API}/${personId}`);

  return { getProducts, createProduct, getProductById, updateProduct, deleteProduct };
}