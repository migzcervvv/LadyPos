import axios from "axios";
import { useAuth } from "../../../shared/hooks/AuthContext.jsx";

const API = import.meta.env.VITE_API_URL + "/orders";
export function useOrderApi() {
  const { jwt } = useAuth();

  const axiosInstance = axios.create({
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

const getOrders = () => axiosInstance.get(API);
const createOrder = (data) => axiosInstance.post(API, data);
const getOrderById = (orderId) => axiosInstance.get(`${API}/${orderId}`);
const updateOrder = (orderId, data) => axiosInstance.put(`${API}/${orderId}`, data);
const deleteOrder = (orderId) => axiosInstance.delete(`${API}/${orderId}`);
const markOrderPaid = (orderId) => axiosInstance.patch(`${API}/${orderId}/pay`);
const markOrderCompleted = (orderId) => axiosInstance.patch(`${API}/${orderId}/complete`);

  return { getOrders, createOrder, 
    getOrderById, updateOrder, 
    deleteOrder, markOrderPaid, 
    markOrderCompleted };
}