import { useEffect, useState } from "react";
import { useProductApi } from "../../products/services/productApi";
import { usePersonApi } from "../../people/services/api";
import { useOrderApi } from "../services/ordersApi";
import { useNavigate } from "react-router";

export default function POSPage() {
  const { getProducts } = useProductApi();
  const { getPersons } = usePersonApi();
  const { createOrder } = useOrderApi();

  const [products, setProducts] = useState([]);
  const [persons, setPersons] = useState([]);

  const [cart, setCart] = useState([]);
  const [personId, setPersonId] = useState("");
  const navigate = useNavigate();
  // LOAD DATA
  useEffect(() => {
    getProducts().then((res) => setProducts(res.data));
    getPersons().then((res) => setPersons(res.data));
  }, []);

  // 🧠 ADD TO CART (core logic)
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
        total,
        personId: personId || null,
      });

      // reset
      setCart([]);
      setPersonId("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="min-h-full flex"
      style={{
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text)",
      }}
    >
      {/* LEFT: PRODUCTS */}
      <div className="w-2/3 p-4">
        <h2 className="text-xl font-bold mb-4">Products</h2>
        <button
          onClick={() => navigate("/orders")}
          className="px-3 py-2 mb-4 rounded"
          style={{ backgroundColor: "var(--color-secondary)" }}
        >
          View Orders
        </button>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.map((p) => (
            <button
              key={p._id}
              onClick={() => addToCart(p)}
              className="p-3 rounded-lg text-left shadow"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <p className="font-medium">{p.name}</p>
              <p style={{ color: "var(--color-muted)" }}>₱ {p.sellingPrice}</p>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT: CART */}
      <div
        className="w-1/3 p-4 flex flex-col"
        style={{
          borderLeft: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <h2 className="text-xl font-bold mb-4">Cart</h2>

        {/* CUSTOMER */}
        <select
          className="mb-4 p-2 border rounded"
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

        {/* CART ITEMS */}
        <div
          className="flex-1 overflow-y-auto mb-4"
          style={{ maxHeight: "60vh" }}
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
                >
                  -
                </button>

                <span>{p.quantity}</span>

                <button
                  onClick={() => updateQty(p.productId, p.quantity + 1)}
                  className="px-2 rounded border"
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
  );
}
