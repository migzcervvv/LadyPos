import axios from "axios";
import { useAuth } from "../../../shared/hooks/AuthContext.jsx";

const API_URL = import.meta.env.VITE_API_URL + "/financials";

export function useFinancialApi() {
  const { jwt } = useAuth();

  const axiosInstance = axios.create({
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  const getDashboard = async () => {
    const res = await axiosInstance.get(`${API_URL}/dashboard`);
    return res.data;
  };

  return { getDashboard };
}
