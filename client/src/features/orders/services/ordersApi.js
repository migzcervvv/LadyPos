import { useApi } from "../../../shared/utils/useApi";

export function useOrderApi() {
  const api = useApi();

  const getOrders = async () => {
    const res = await api.get("/orders");
    return res;
  };

  const getOrderById = async (orderId) => {
    if (!orderId) throw new Error("orderId is required");

    const res = await api.get(`/orders/${orderId}`);
    return res;
  };

  const createOrder = async (data) => {
    const res = await api.post("/orders", data);
    return res;
  };

  const updateOrder = async (orderId, data) => {
    const res = await api.put(`/orders/${orderId}`, data);
    return res;
  };

  const deleteOrder = async (orderId) => {
    const res = await api.delete(`/orders/${orderId}`);
    return res;
  };

  const markOrderPaid = async (orderId) => {
    const res = await api.patch(`/orders/${orderId}/pay`);
    return res;
  };

  const markOrderCompleted = async (orderId) => {
    const res = await api.patch(`/orders/${orderId}/complete`);
    return res;
  };

  return {
    getOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    markOrderPaid,
    markOrderCompleted,
  };
}
