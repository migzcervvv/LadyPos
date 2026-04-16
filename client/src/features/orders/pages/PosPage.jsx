import { useEffect, useMemo, useState } from "react";
import { useProductApi } from "../../products/services/productApi";
import { usePersonApi } from "../../people/services/api";
import { useOrderApi } from "../services/ordersApi";
import { useNavigate } from "react-router";

export default function POSPage() {
  const { getProducts } = useProductApi();
  const { getPersons } = usePersonApi();
  const { createOrder } = useOrderApi();
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [products, setProducts] = useState([]);
  const [persons, setPersons] = useState([]);
  const [customerType, setCustomerType] = useState("walkin");
  const [reference, setReference] = useState("");
  const [cart, setCart] = useState([]);
  const [personId, setPersonId] = useState("");
  const [orderInstructions, setOrderInstructions] = useState("");
  const navigate = useNavigate();
  // LOAD DATA
  useEffect(() => {
    getProducts().then((res) => setProducts(res.data));
    getPersons().then((res) => setPersons(res.data));
  }, []);
  const activeProducts = useMemo(() => {
    return products.filter((p) => p.active);
  }, [products]); // 🧠 ADD TO CART (core logic)
  const addToCart = (product) => {
    setCart((prev) => {
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
      setCart((prev) => prev.filter((p) => p.productId !== id));
      return;
    }

    setCart((prev) =>
      prev.map((p) => (p.productId === id ? { ...p, quantity: qty } : p)),
    );
  };

  const total = cart.reduce((acc, p) => acc + p.quantity * p.price, 0);

  // 🧾 CHECKOUT
  const handleCheckout = async () => {
    if (!cart.length) return alert("Cart is empty");

    try {
      await createOrder({
        products: cart,
        personId: customerType === "customer" ? personId : null,
        customerType,
        reference: ["grab", "foodpanda"].includes(customerType)
          ? reference
          : null,
        notes: orderInstructions, // ✅ add this
      });

      // reset
      setCart([]);
      setPersonId("");
      setOrderInstructions("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div
        className="h-screen flex flex-col md:flex-row overflow-hidden"
        style={{
          backgroundColor: "var(--color-bg)",
          color: "var(--color-text)",
        }}
      >
        {/* LEFT: PRODUCTS */}
        <div className="flex-1 md:w-2/3 p-3 md:p-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Products</h2>

          <button
            onClick={() => navigate("/orders")}
            className="px-3 py-2 mb-4 rounded"
            style={{ backgroundColor: "var(--color-secondary)" }}
          >
            View Orders
          </button>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {activeProducts.map((p) => (
              <button
                key={p._id}
                onClick={() => addToCart(p)}
                className="p-3 rounded-lg text-left"
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <p className="font-medium">{p.name}</p>
                <p style={{ color: "var(--color-muted)" }}>
                  ₱ {p.sellingPrice}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: CART */}
        <div
          className="max-h-[65%] md:h-auto md:w-1/3 p-3 md:p-4 flex flex-col border-t md:border-t-0 md:border-l overflow-auto"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold">Cart</h2>

              <button
                onClick={() => setShowAddPerson(true)}
                className="hidden md:block px-3 py-1 rounded text-sm"
                style={{ backgroundColor: "var(--color-secondary)" }}
              >
                + Add
              </button>
            </div>

            <button
              onClick={() => setShowAddPerson(true)}
              className="w-full py-2 rounded md:hidden"
              style={{ backgroundColor: "var(--color-secondary)" }}
            >
              + Add Customer
            </button>
          </div>

          {/* CUSTOMER TYPE */}
          <div className="mb-3">
            <div className="grid grid-cols-2 gap-2 mb-2">
              {["walkin", "customer", "grab", "foodpanda"].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setCustomerType(type);
                    setReference("");
                    if (type !== "customer") setPersonId("");
                  }}
                  className="py-2 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor:
                      customerType === type
                        ? "var(--color-primary)"
                        : "transparent",
                    color: customerType === type ? "#fff" : "var(--color-text)",
                    border:
                      customerType === type
                        ? "none"
                        : "1px solid var(--color-border)",
                  }}
                >
                  {type}
                </button>
              ))}
            </div>

            {customerType === "customer" && (
              <select
                className="input w-full"
                value={personId}
                onChange={(e) => setPersonId(e.target.value)}
              >
                <option value="">Select Customer</option>
                {persons.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}

            {(customerType === "grab" || customerType === "foodpanda") && (
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder={`${customerType} reference (optional)`}
                className="input w-full"
              />
            )}
          </div>

          {/* NOTES */}
          <div className="mb-3">
            <label
              className="block text-sm mb-1"
              style={{ color: "var(--color-muted)" }}
            >
              Order instructions
            </label>

            <textarea
              value={orderInstructions}
              onChange={(e) => setOrderInstructions(e.target.value)}
              placeholder="Add notes for this order..."
              className="input w-full"
              rows={2}
            />
          </div>

          {/* CART ITEMS */}
          <div
            className="flex-1 overflow-y-auto mb-4"
            style={{ maxHeight: "60vh", minHeight: "15vh" }}
          >
            {cart.length === 0 && (
              <p style={{ color: "var(--color-muted)" }}>No items yet</p>
            )}

            {cart.map((p) => (
              <div
                key={p.productId}
                className="mb-3 flex justify-between items-center"
              >
                <div>
                  <p>{p.name}</p>
                  <p style={{ color: "var(--color-muted)" }}>₱ {p.price}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(p.productId, p.quantity - 1)}
                    className="px-2 rounded border"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    -
                  </button>

                  <span>{p.quantity}</span>

                  <button
                    onClick={() => updateQty(p.productId, p.quantity + 1)}
                    className="px-2 rounded border"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* TOTAL */}
          <div className="mb-4 font-bold text-lg">Total: ₱ {total}</div>

          {/* CHECKOUT */}
          <button
            onClick={handleCheckout}
            className="py-3 rounded text-white"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            Checkout
          </button>
        </div>
      </div>

      {showAddPerson && (
        <AddPersonModal
          onClose={() => setShowAddPerson(false)}
          onCreated={(newPerson) => {
            setPersons((prev) => [...prev, newPerson]);
            setPersonId(newPerson._id);
          }}
        />
      )}
    </>
  );
}

function AddPersonModal({ onClose, onCreated }) {
  const { createPerson } = usePersonApi();
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) return;

    const res = await createPerson({ name });
    onCreated(res.data);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="w-full md:max-w-sm rounded-t-2xl md:rounded-xl p-4"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div
          className="w-10 h-1 rounded mx-auto mb-3 md:hidden"
          style={{ backgroundColor: "var(--color-border)" }}
        />

        <h3 className="text-lg font-semibold mb-3">New Customer</h3>

        <input
          className="input w-full mb-4"
          placeholder="Enter name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex flex-col gap-2">
          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded text-white"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            Save Customer
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 rounded border"
            style={{ borderColor: "var(--color-border)" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
