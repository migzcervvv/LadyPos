import { useState, useEffect } from "react";
import { useProductApi } from "../../products/services/productApi";
import { usePersonApi } from "../../people/services/api";
import { useOrderApi } from "../services/ordersApi";

export default function AddOrderModal({ onClose, onSuccess }) {
  const { getProducts } = useProductApi();
  const { getPersons, createPerson } = usePersonApi();
  const { createOrder } = useOrderApi();

  const [products, setProducts] = useState([]);
  const [persons, setPersons] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [personId, setPersonId] = useState("");

  const [showAddPerson, setShowAddPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");

  const [total, setTotal] = useState(0);

  useEffect(() => {
    getProducts().then((res) => setProducts(res.data));
    getPersons().then((res) => setPersons(res.data));
  }, []);

  useEffect(() => {
    setTotal(
      selectedProducts.reduce((acc, p) => acc + p.quantity * p.price, 0),
    );
  }, [selectedProducts]);

  const toggleProduct = (product) => {
    const exists = selectedProducts.find((p) => p.productId === product._id);

    if (exists) {
      setSelectedProducts((prev) =>
        prev.filter((p) => p.productId !== product._id),
      );
    } else {
      setSelectedProducts((prev) => [
        ...prev,
        {
          productId: product._id,
          quantity: 1,
          price: product.sellingPrice,
          name: product.name,
        },
      ]);
    }
  };

  const updateQty = (id, qty) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.productId === id ? { ...p, quantity: qty } : p)),
    );
  };

  const handleAddPerson = async () => {
    if (!newPersonName.trim()) return alert("Enter name");

    const res = await createPerson({ name: newPersonName });

    setPersons((prev) => [...prev, res.data]);
    setPersonId(res.data._id);
    setNewPersonName("");
    setShowAddPerson(false);
  };

  const handleSubmit = async () => {
    if (!selectedProducts.length) return alert("Select products");

    await createOrder({
      products: selectedProducts,
      total,
      personId: personId || null,
    });

    onSuccess();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
    >
      <div
        className="w-full max-w-md p-6 rounded-xl border"
        style={{
          backgroundColor: "var(--color-surface)",
          color: "var(--color-text)",
          borderColor: "var(--color-border)",
        }}
      >
        <h2 className="text-xl font-bold mb-4">Add Order</h2>

        {/* CUSTOMER */}
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <label style={{ color: "var(--color-muted)" }}>Customer</label>

            <button
              onClick={() => setShowAddPerson(true)}
              style={{ color: "var(--color-primary)" }}
            >
              + Add
            </button>
          </div>

          <select
            className="input w-full"
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

          {showAddPerson && (
            <div className="mt-2">
              <input
                className="input w-full mb-2"
                placeholder="Customer name"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
              />

              <button
                onClick={handleAddPerson}
                className="w-full py-2 rounded text-white"
                style={{
                  backgroundColor: "var(--color-primary)",
                }}
              >
                Add Customer
              </button>
            </div>
          )}
        </div>

        {/* PRODUCTS */}
        <div
          className="mb-4 space-y-2"
          style={{ maxHeight: "200px", overflowY: "auto" }}
        >
          {products.map((p) => {
            const selected = selectedProducts.find(
              (sp) => sp.productId === p._id,
            );

            return (
              <div
                key={p._id}
                onClick={() => toggleProduct(p)}
                className="p-2 rounded cursor-pointer flex justify-between items-center border"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: selected
                    ? "var(--color-secondary)"
                    : "var(--color-bg)",
                }}
              >
                <span>{p.name}</span>

                {selected && (
                  <input
                    type="number"
                    min={1}
                    value={selected.quantity}
                    className="w-16 text-center input"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateQty(p._id, +e.target.value)}
                  />
                )}
              </div>
            );
          })}
        </div>

        <p className="mb-4 font-semibold">Total: ₱ {total}</p>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded border"
            style={{ borderColor: "var(--color-border)" }}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="flex-1 py-2 rounded text-white"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            Create Order
          </button>
        </div>
      </div>
    </div>
  );
}
