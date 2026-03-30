import axios from "axios";
import { useAuth } from "../../../shared/hooks/AuthContext.jsx";

const API = import.meta.env.VITE_API_URL + "/people";

export function usePersonApi() {
  const { jwt } = useAuth();

  const axiosInstance = axios.create({
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  const getPersons = () => axiosInstance.get(API);
  const createPerson = (data) => axiosInstance.post(API, data);
  const getPersonById = (id) => axiosInstance.get(`${API}/${id}`);
  const addDebt = (personId, debt) =>
    axiosInstance.post(`${API}/${personId}/debts`, debt);
  const addPayment = (personId, payment) =>
    axiosInstance.post(`${API}/${personId}/payments`, payment);
  const payAllDebts = (personId) =>
    axiosInstance.post(`${API}/${personId}/pay-all`);

  return {
    getPersons,
    createPerson,
    addDebt,
    addPayment,
    payAllDebts,
    getPersonById,
  };
}
