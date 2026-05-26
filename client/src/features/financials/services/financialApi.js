import { useApi } from "../../../shared/utils/useApi";

export function useFinancialApi() {
  const api = useApi();
  const data = (res) => res.data?.data ?? res.data;

  const getSummary = async () => data(await api.get("/dashboard/summary"));

  const getRevenueByRange = async (range = "daily", from, to) =>
    data(await api.get("/dashboard/revenue", { params: { range, from, to } }));

  return {
    getSummary,
    getRevenueByRange,
  };
}
