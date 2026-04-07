import { useEffect, useState } from "react";
import { useProductApi } from "../../products/services/productApi";
import { usePersonApi } from "../../people/services/api";
import { useOrderApi } from "../services/ordersApi";
import { useInvoiceApi } from "../../invoices/services/invoiceApi";
import Invoice from "../../invoices/components/Invoice";
import { useAuth } from "../../../shared/hooks/AuthContext";

export default function UpdateOrderModal({ order, onClose, onSuccess }) {
  const { getProducts } = useProductApi();
  const { getPersons } = usePersonApi();
  const { updateOrder } = useOrderApi();
  const { ensureInvoice } = useInvoiceApi();
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [persons, setPersons] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [personId, setPersonId] = useState("");
  const [invoice, setInvoice] = useState(null);

  const isAdmin = user?.role === "admin";
  const isCompleted = order?.orderStatus?.toLowerCase() === "completed";

  // 🔹 LOAD DATA
  useEffect(() => {
    getProducts().then((res) => setProducts(res.data));
    getPersons().then((res) => setPersons(res.data));

    if (order) {
      setPersonId(order.personId?._id || order.personId || "");

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
    if (invoice) {
      setTimeout(() => {
        window.print();
      }, 100);
    }
  }, [invoice]);

  // 🔹 ADD PRODUCT
  const addProduct = (product) => {
    if (!isAdmin && isCompleted) return;

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

  // 🔹 UPDATE QTY
  const updateQty = (id, qty) => {
    if (!isAdmin && isCompleted) return;

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
  const handlePrintInvoice = async () => {
    try {
      const res = await ensureInvoice(order._id);

      setInvoice(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate invoice");
    }
  };
  // 🔹 COMPLETE ORDER
  const completeOrder = async (paymentType) => {
    if (paymentType === "debt" && !personId) {
      return alert("Debt requires customer");
    }

    await updateOrder(order._id, {
      orderStatus: "completed",
      paymentStatus: paymentType,
      personId: personId || null,
    });

    // 🔥 ALWAYS ensure invoice after completion
    const res = await ensureInvoice(order._id);
    setInvoice(res.data);

    onSuccess();
  };
  return (
    <>
      {/* 🔥 PRINT AREA (VERY IMPORTANT) */}
      {invoice && (
        <div style={{ position: "absolute", top: "-9999px" }}>
          <Invoice invoice={invoice} />
        </div>
      )}
      {/* 🔥 MODAL */}
      <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center">
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
            <button onClick={onClose}>✕</button>
          </div>

          {/* LOCK MESSAGE */}
          {isCompleted && !isAdmin && (
            <div className="mb-3 p-2 rounded bg-gray-200 text-center text-sm">
              🔒 Completed order (read-only)
            </div>
          )}

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto pr-1">
            {/* CUSTOMER */}
            <div className="mb-3">
              <label className="text-sm">Customer</label>
              <select
                disabled={!isAdmin && isCompleted}
                value={personId}
                onChange={(e) => setPersonId(e.target.value)}
                className="w-full p-3 border rounded"
              >
                <option value="">Walk-in</option>
                {persons.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* PRODUCTS */}
            <div className="mb-3">
              <p className="text-sm font-semibold">Products</p>
              <div className="flex gap-2 overflow-x-auto">
                {products.map((p) => (
                  <button
                    key={p._id}
                    disabled={!isAdmin && isCompleted}
                    onClick={() => addProduct(p)}
                    className="p-2 border rounded"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* ITEMS */}
            <div className="mb-4 space-y-2">
              {selectedProducts.map((p) => (
                <div
                  key={p.productId}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <div>
                    <p>{p.name}</p>
                    <p className="text-xs">₱ {p.price}</p>
                  </div>

                  <div className="flex gap-2 items-center">
                    <button
                      disabled={!isAdmin && isCompleted}
                      onClick={() => updateQty(p.productId, p.quantity - 1)}
                    >
                      -
                    </button>

                    <span>{p.quantity}</span>

                    <button
                      disabled={!isAdmin && isCompleted}
                      onClick={() => updateQty(p.productId, p.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER */}
          <div className="pt-3 border-t">
            <div className="flex justify-between mb-2">
              <span>Total</span>
              <span className="font-bold">₱ {total}</span>
            </div>
            <div className="flex flex-col gap-2">
              {/* ✅ COMPLETED → PRINT ONLY */}
              {isCompleted ? (
                <button
                  onClick={handlePrintInvoice}
                  className="w-full py-3 rounded text-white bg-black"
                >
                  🧾 Print Invoice
                </button>
              ) : (
                <>
                  <button
                    onClick={() => completeOrder("paid")}
                    className="w-full py-3 bg-green-600 text-white rounded"
                  >
                    ✅ Complete (Paid)
                  </button>

                  <button
                    onClick={() => completeOrder("debt")}
                    className="w-full py-3 bg-orange-500 text-white rounded"
                  >
                    💳 Complete as Debt
                  </button>
                </>
              )}

              <button onClick={onClose} className="border py-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
