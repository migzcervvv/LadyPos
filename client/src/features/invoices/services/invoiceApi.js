import axios from "axios";
import { useAuth } from "../../../shared/hooks/AuthContext.jsx";

const API = import.meta.env.VITE_API_URL + "/invoices";

export const useInvoiceApi = () => {
  const { jwt } = useAuth();

  const axiosInstance = axios.create({
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  const getInvoices = (params) => axiosInstance.get(API, { params });

  const ensureInvoice = (orderId) =>
    axiosInstance.get(`${API}/order/${orderId}/ensure`);
  return { getInvoices, ensureInvoice };
};
