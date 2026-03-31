import { useApi } from "../../../shared/utils/useApi";

export function useInvoiceApi() {
  const api = useApi();

  const getInvoices = async (params = {}) => {
    const res = await api.get("/invoices", { params });
    return res;
  };

  const ensureInvoice = async (orderId) => {
    if (!orderId) throw new Error("orderId is required");

    const res = await api.get(`/invoices/order/${orderId}/ensure`);
    return res;
  };

  return {
    getInvoices,
    ensureInvoice,
  };
}
