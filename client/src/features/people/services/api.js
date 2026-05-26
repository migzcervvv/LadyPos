import { useApi } from "../../../shared/utils/useApi";

export function usePersonApi() {
  const api = useApi();
  const unwrap = (res) => ({ ...res, data: res.data?.data ?? res.data });

  const getPersons = (params = {}) =>
    api.get("/people", { params }).then(unwrap);

  const createPerson = (data) => api.post("/people", data).then(unwrap);

  const updatePerson = (personId, data) =>
    api.put(`/people/${personId}`, data).then(unwrap);

  const deletePerson = (personId) =>
    api.delete(`/people/${personId}`).then(unwrap);

  const getPersonById = (id, params = {}) =>
    api.get(`/people/${id}`, { params }).then(unwrap);

  const addDebt = (personId, data) =>
    api.post(`/people/${personId}/debts`, data).then(unwrap);

  const addPayment = (personId, data) =>
    api.post(`/people/${personId}/payments`, data).then(unwrap);

  const payAllDebts = (personId) =>
    api.post(`/people/${personId}/pay-all`).then(unwrap);

  const updateTransaction = (personId, debtId, data) =>
    api.put(`/people/${personId}/debts/${debtId}`, data).then(unwrap);

  const deleteTransaction = (personId, debtId) =>
    api.delete(`/people/${personId}/debts/${debtId}`).then(unwrap);

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
