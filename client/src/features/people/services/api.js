import { useApi } from "../../../shared/utils/useApi";

export function usePersonApi() {
  const api = useApi();

  const getPersons = async () => {
    const res = await api.get("/people");
    return res;
  };

  const createPerson = async (data) => {
    const res = await api.post("/people", data);
    return res;
  };

  const getPersonById = async (id) => {
    const res = await api.get(`/people/${id}`);
    return res;
  };

  const addDebt = async (personId, data) => {
    const res = await api.post(`/people/${personId}/debts`, data);
    return res;
  };

  const addPayment = async (personId, data) => {
    const res = await api.post(`/people/${personId}/payments`, data);
    return res;
  };

  const payAllDebts = async (personId) => {
    const res = await api.post(`/people/${personId}/pay-all`);
    return res;
  };

  return {
    getPersons,
    createPerson,
    getPersonById,
    addDebt,
    addPayment,
    payAllDebts,
  };
}
