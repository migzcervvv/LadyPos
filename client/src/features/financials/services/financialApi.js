import { useApi } from "../../../shared/utils/useApi";

export function useFinancialApi() {
  const api = useApi();

  const getSummary = async (range = "daily") => {
    const res = await api.get(`/financials/summary`, {
      params: { range },
    });
    return res.data;
  };

  const getDashboard = async () => {
    const res = await api.get(`/financials/dashboard`);
    return res;
  };

  const getDayDetails = async (date) => {
    if (!date) throw new Error("date is required");

    const res = await api.get(`/financials/day/${date}`);
    return res;
  };

  return {
    getSummary,
    getDashboard,
    getDayDetails,
  };
}
