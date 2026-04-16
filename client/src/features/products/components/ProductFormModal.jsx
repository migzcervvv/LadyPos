import { useState } from "react";
import { useProductApi } from "../services/productApi";

export default function ProductFormModal({ product, onClose, onSuccess }) {
  const { createProduct, updateProduct } = useProductApi();

  const [form, setForm] = useState({
    name: product?.name || "",
    category: product?.category || "",
    sellingPrice: product?.sellingPrice || "",
    costPrice: product?.costPrice || "",
    quantity: product?.quantity || 0,
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (product) {
      await updateProduct(product._id, form);
    } else {
      await createProduct(form);
    }

    onSuccess();
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 border"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
          color: "var(--color-text)",
        }}
      >
        <h2 className="text-xl font-semibold mb-5">
          {product ? "Edit Product" : "Add Product"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm mb-1 block">Product Name</label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>

          <div>
            <label className="text-sm mb-1 block">Category</label>

            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              className="input w-full"
            />
          </div>

          <div className="flex gap-3">
            <input
              name="sellingPrice"
              type="number"
              value={form.sellingPrice}
              onChange={handleChange}
              placeholder="Selling Price"
              className="input w-full"
              required
            />

            <input
              name="costPrice"
              type="number"
              value={form.costPrice}
              onChange={handleChange}
              placeholder="Cost Price"
              className="input w-full"
            />
          </div>

          <input
            name="quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Stock"
            className="input w-full"
          />

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="flex-1 p-3 rounded-lg text-white"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {product ? "Update" : "Save"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-3 rounded-lg border"
              style={{ borderColor: "var(--color-border)" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
