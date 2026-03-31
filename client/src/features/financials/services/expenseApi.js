import { useApi } from "../../../shared/utils/useApi";

export function useExpenseApi() {
  const api = useApi();

  const getExpenses = async (params = {}) => {
    const res = await api.get("/expenses", { params });
    return res.data;
  };

  const createExpense = async (data) => {
    const res = await api.post("/expenses", data);
    return res;
  };

  const updateExpense = async (id, data) => {
    const res = await api.put(`/expenses/${id}`, data);
    return res;
  };

  const deleteExpense = async (id) => {
    const res = await api.delete(`/expenses/${id}`);
    return res;
  };

  return {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  };
}
