import axios from "axios";
import { useAuth } from "../../../shared/hooks/AuthContext.jsx";
import { useMemo } from "react";

const API_URL = import.meta.env.VITE_API_URL + "/financials";

export function useFinancialApi() {
  const { jwt } = useAuth();

  const axiosInstance = useMemo(() => {
    return axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
  }, [jwt]);

  const getDashboard = async () => {
    const res = await axiosInstance.get(`${API_URL}/dashboard`);
    return res.data;
  };
  const getDayDetails = async (date) => {
    const res = await axiosInstance.get(`${API_URL}/day/${date}`);
    return res.data;
  };

  return { getDashboard, getDayDetails };
}
