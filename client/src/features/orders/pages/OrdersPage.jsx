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
  const [typeFilter, setTypeFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  const [search, setSearch] = useState("");

  const formatDateTime = (date) => {
    const d = new Date(date);
    const now = new Date();

    const isToday = d.toDateString() === now.toDateString();

    return isToday
      ? d.toLocaleTimeString("en-PH", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : d.toLocaleDateString("en-PH", {
          month: "short",
          day: "numeric",
        });
  };

  const fetchOrders = async () => {
    const res = await getOrders();
    setOrders(res.data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = orders.filter((o) => {
    // TAB (existing)
    const matchesTab =
      tab === "pending"
        ? o.orderStatus !== "completed"
        : o.orderStatus === "completed";

    // CUSTOMER TYPE
    const matchesType = typeFilter === "all" || o.customerType === typeFilter;

    // PAYMENT
    const matchesPayment =
      paymentFilter === "all" || o.paymentStatus === paymentFilter;

    // DATE
    const now = new Date();
    const orderDate = new Date(o.createdAt);

    let matchesDate = true;
    if (dateFilter === "today") {
      matchesDate = orderDate.toDateString() === now.toDateString();
    } else if (dateFilter === "7days") {
      const diff = (now - orderDate) / (1000 * 60 * 60 * 24);
      matchesDate = diff <= 7;
    }

    // SEARCH (name or reference)
    const matchesSearch =
      !search ||
      o.personId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.reference?.toLowerCase().includes(search.toLowerCase());

    return (
      matchesTab &&
      matchesType &&
      matchesPayment &&
      matchesDate &&
      matchesSearch
    );
  });

  return (
    <div
      className="h-screen flex flex-col p-3 overflow-y-scroll"
      style={{
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text)",
      }}
    >
      <div className="flex-shrink-0">
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
        <div className="flex-1 overflow-y-scroll pr-1 pb-20">
          {/* FILTERS */}
          <div className="flex flex-col gap-2 mb-3">
            {/* SEARCH */}
            <input
              placeholder="Search customer / reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-2 rounded border"
            />

            {/* ROW 1 */}
            <div className="grid grid-cols-3 gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="p-2 rounded border"
              >
                <option value="all">All Types</option>
                <option value="walkin">Walk-in</option>
                <option value="customer">Customer</option>
                <option value="grab">Grab</option>
                <option value="foodpanda">Foodpanda</option>
              </select>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="p-2 rounded border"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="debt">Debt</option>
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="p-2 rounded border"
              >
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
          {/* ORDER LIST */}
          <div className="flex flex-col gap-3">
            {filtered.map((order) => (
              <div
                key={order._id}
                onClick={() => setSelectedOrder(order)}
                className="p-3 rounded-xl shadow cursor-pointer flex flex-col gap-2"
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: `1px solid ${
                    order.paymentStatus === "debt"
                      ? "red"
                      : order.customerType === "grab"
                        ? "green"
                        : "var(--color-border)"
                  }`,
                }}
              >
                {/* TOP ROW */}
                <div className="flex justify-between items-center">
                  <p className="font-bold text-lg">₱ {order.total}</p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>

                {/* CUSTOMER */}
                <div className="text-sm">
                  <span className="font-medium">
                    {order.personId?.name || "Walk-in"}
                  </span>
                </div>

                {/* META TAGS */}
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs px-2 py-1 rounded bg-gray-200">
                    {order.customerType} {order.reference || ""}
                  </span>

                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      order.paymentStatus === "debt"
                        ? "bg-red-200"
                        : "bg-green-200"
                    }`}
                  >
                    {order.orderStatus} • {order.paymentStatus}
                  </span>

                  <span className="text-xs px-2 py-1 rounded bg-blue-100">
                    {order.products.length} items
                  </span>
                </div>

                {/* NOTES */}
                {order.notes && (
                  <div className="p-2 rounded bg-yellow-50 border text-xs line-clamp-2">
                    <span className="font-medium">Note:</span> {order.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
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
