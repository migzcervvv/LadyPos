import { useApi } from "../../../shared/utils/useApi";

export function usePersonApi() {
  const api = useApi();

  const getPersons = () => api.get("/people");

  const createPerson = (data) => api.post("/people", data);

  const updatePerson = (personId, data) => api.put(`/people/${personId}`, data);

  const deletePerson = (personId) => api.delete(`/people/${personId}`);

  const getPersonById = (id) => api.get(`/people/${id}`);

  const addDebt = (personId, data) =>
    api.post(`/people/${personId}/debts`, data);

  const addPayment = (personId, data) =>
    api.post(`/people/${personId}/payments`, data);

  const payAllDebts = (personId) => api.post(`/people/${personId}/pay-all`);

  const updateTransaction = (personId, debtId, data) =>
    api.put(`/people/${personId}/debts/${debtId}`, data);

  const deleteTransaction = (personId, debtId) =>
    api.delete(`/people/${personId}/debts/${debtId}`);

  return {
    getPersons,
    createPerson,
    updatePerson,
    deletePerson,
    getPersonById,
    addDebt,
    addPayment,
    payAllDebts,
    updateTransaction,
    deleteTransaction,
  };
}
