import { useEffect, useState } from "react";
import { useProductApi } from "../../products/services/productApi";
import { usePersonApi } from "../../people/services/api";
import { useOrderApi } from "../services/ordersApi";

export default function UpdateOrderModal({ order, onClose, onSuccess }) {
  const { getProducts } = useProductApi();
  const { getPersons } = usePersonApi();
  const { updateOrder } = useOrderApi();

  const [products, setProducts] = useState([]);
  const [persons, setPersons] = useState([]);

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [personId, setPersonId] = useState("");

  const [orderStatus, setOrderStatus] = useState("pending");
  const [paymentStatus, setPaymentStatus] = useState("unpaid");

  // LOAD
  useEffect(() => {
    getProducts().then((res) => setProducts(res.data));
    getPersons().then((res) => setPersons(res.data));

    if (order) {
      setPersonId(order.personId?._id || order.personId || "");
      setOrderStatus(order.orderStatus);
      setPaymentStatus(order.paymentStatus);

      const mapped = order.products.map((p) => ({
        productId:
          typeof p.productId === "object" ? p.productId._id : p.productId,
        name:
          p.name ||
          (typeof p.productId === "object" ? p.productId.name : "Unknown"),
        price:
          p.price ||
          (typeof p.productId === "object" ? p.productId.sellingPrice : 0),
        quantity: p.quantity,
      }));

      setSelectedProducts(mapped);
    }
  }, [order]);

  useEffect(() => {
    if (orderStatus === "completed" && paymentStatus === "unpaid") {
      setPaymentStatus("paid"); // default
    }
  }, [orderStatus]);

  // ADD PRODUCT (increment if exists)
  const addProduct = (product) => {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p.productId === product._id);

      if (exists) {
        return prev.map((p) =>
          p.productId === product._id ? { ...p, quantity: p.quantity + 1 } : p,
        );
      }

      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.sellingPrice,
          quantity: 1,
        },
      ];
    });
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) {
      setSelectedProducts((prev) => prev.filter((p) => p.productId !== id));
      return;
    }

    setSelectedProducts((prev) =>
      prev.map((p) => (p.productId === id ? { ...p, quantity: qty } : p)),
    );
  };

  const total = selectedProducts.reduce(
    (acc, p) => acc + p.quantity * p.price,
    0,
  );

  const handleSubmit = async () => {
    // ❌ Cannot set debt without customer
    if (paymentStatus === "debt" && !personId) {
      return alert("Debt requires a customer");
    }

    // ❌ Cannot complete without payment decision
    if (orderStatus === "completed" && paymentStatus === "unpaid") {
      return alert("Completed order must be Paid or Debt");
    }

    try {
      await updateOrder(order._id, {
        products: selectedProducts,
        total,
        personId: personId || null,
        orderStatus,
        paymentStatus,
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center">
      {/* MODAL */}
      <div
        className="w-full h-[95vh] md:h-auto md:max-w-lg rounded-t-2xl md:rounded-xl p-4 flex flex-col"
        style={{
          backgroundColor: "var(--color-surface)",
          color: "var(--color-text)",
        }}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold">Update Order</h2>
          <button onClick={onClose} className="text-xl">
            ✕
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* CUSTOMER */}
          <div className="mb-3">
            <label className="text-sm font-medium mb-1 block">Customer</label>
            <select
              className="w-full p-3 rounded-lg border"
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
            >
              <option value="">Walk-in</option>
              {persons.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* ADD PRODUCTS */}
          <p className="text-sm font-semibold mb-1">Add Products</p>
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
            {products.map((p) => (
              <button
                key={p._id}
                onClick={() => addProduct(p)}
                className="min-w-[100px] p-3 rounded-lg text-sm"
                style={{
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* SELECTED PRODUCTS */}
          <p className="text-sm font-semibold mb-1">Items</p>

          <div className="space-y-2 mb-4">
            {selectedProducts.map((p) => (
              <div
                key={p.productId}
                className="flex justify-between items-center p-2 rounded-lg"
                style={{
                  border: "1px solid var(--color-border)",
                }}
              >
                <div>
                  <p className="text-sm">{p.name}</p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-muted)" }}
                  >
                    ₱ {p.price}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(p.productId, p.quantity - 1)}
                    className="px-3 py-1 rounded border"
                  >
                    -
                  </button>

                  <span>{p.quantity}</span>

                  <button
                    onClick={() => updateQty(p.productId, p.quantity + 1)}
                    className="px-3 py-1 rounded border"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER (STICKY ACTIONS) */}
        <div className="pt-3 border-t">
          <div className="flex justify-between mb-2">
            <span>Total</span>
            <span className="font-bold">₱ {total}</span>
          </div>

          {/* PRIMARY ACTIONS */}
          <div className="flex flex-col gap-2">
            <button
              onClick={async () => {
                if (!personId) {
                  return alert("Select customer first");
                }

                await updateOrder(order._id, {
                  orderStatus: "completed",
                  paymentStatus: "paid",
                  personId,
                });

                onSuccess();
                onClose();
              }}
              className="w-full py-3 rounded text-white"
              style={{ backgroundColor: "green" }}
            >
              ✅ Complete (Paid)
            </button>

            <button
              onClick={async () => {
                if (!personId) {
                  return alert("Debt requires customer");
                }

                await updateOrder(order._id, {
                  orderStatus: "completed",
                  paymentStatus: "debt",
                  personId,
                });

                onSuccess();
                onClose();
              }}
              className="w-full py-3 rounded text-white"
              style={{ backgroundColor: "orange" }}
            >
              💳 Complete as Debt
            </button>

            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded text-white"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              Save Changes
            </button>

            <button onClick={onClose} className="w-full py-2 rounded border">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
