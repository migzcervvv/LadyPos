import { useApi } from "../../../shared/utils/useApi";

export function useInvoiceApi() {
  const api = useApi();
  const unwrap = (res) => ({ ...res, data: res.data?.data ?? res.data });

  const getInvoices = async (params = {}) => {
    const res = await api.get("/invoices", { params });
    return unwrap(res);
  };

  const ensureInvoice = async (orderId) => {
    if (!orderId) throw new Error("orderId is required");

    const res = await api.get(`/invoices/order/${orderId}/ensure`);
    return unwrap(res);
  };

  return {
    getInvoices,
    ensureInvoice,
  };
}
