import { useEffect, useState } from "react";
import { useOrderApi } from "../services/ordersApi";
import UpdateOrderModal from "../components/UpdateOrderModal";
import { useNavigate } from "react-router";

export default function OrdersPage() {
  const { getOrders } = useOrderApi();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("pending");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    const res = await getOrders();
    setOrders(res.data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = orders.filter((o) =>
    tab === "pending"
      ? o.orderStatus !== "completed"
      : o.orderStatus === "completed",
  );

  return (
    <div
      className="min-h-screen p-3"
      style={{
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text)",
      }}
    >
      <h1 className="text-xl font-bold mb-3">Orders</h1>
      <button
        onClick={() => navigate("/pos")}
        className="mb-3 px-3 py-2 rounded"
        style={{ backgroundColor: "var(--color-secondary)" }}
      >
        ← Back to POS
      </button>
      {/* TABS */}
      <div className="flex mb-3 gap-2">
        <button
          onClick={() => setTab("pending")}
          className="flex-1 py-2 rounded"
          style={{
            backgroundColor:
              tab === "pending"
                ? "var(--color-primary)"
                : "var(--color-surface)",
          }}
        >
          Pending
        </button>

        <button
          onClick={() => setTab("completed")}
          className="flex-1 py-2 rounded"
          style={{
            backgroundColor:
              tab === "completed"
                ? "var(--color-primary)"
                : "var(--color-surface)",
          }}
        >
          Completed
        </button>
      </div>

      {/* ORDER LIST */}
      <div className="flex flex-col gap-3">
        {filtered.map((order) => (
          <div
            key={order._id}
            onClick={() => setSelectedOrder(order)}
            className="p-4 rounded-xl shadow cursor-pointer"
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <p className="font-bold">₱ {order.total}</p>

            <p className="text-sm">{order.products.length} items</p>

            <p className="text-sm">
              Customer: {order.personId?.name || "Walk-in"}
            </p>

            <p className="text-xs" style={{ color: "var(--color-muted)" }}>
              {order.orderStatus}
            </p>
          </div>
        ))}
      </div>

      {/* UPDATE MODAL */}
      {selectedOrder && (
        <UpdateOrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSuccess={() => {
            setSelectedOrder(null);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}
