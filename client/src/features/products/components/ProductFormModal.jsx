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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl p-6">

        <h2 className="text-xl font-semibold mb-5">
          {product ? "Edit Product" : "Add Product"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* PRODUCT NAME */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Product Name <span className="text-gray-500">(required)</span>
            </label>
            <input
              name="name"
              placeholder="e.g. Coca-Cola 1.5L"
              value={form.name}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Category <span className="text-gray-500">(optional)</span>
            </label>
            <input
              name="category"
              placeholder="e.g. Beverages, Snacks"
              value={form.category}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* PRICES ROW */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Selling Price (₱) <span className="text-gray-500">(required)</span>
              </label>
              <input
                name="sellingPrice"
                type="number"
                placeholder="e.g. 50"
                value={form.sellingPrice}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Cost Price (₱) <span className="text-gray-500">(optional)</span>
              </label>
              <input
                name="costPrice"
                type="number"
                placeholder="e.g. 30"
                value={form.costPrice}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* QUANTITY */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Stock Quantity <span className="text-gray-500">(optional)</span>
            </label>
            <input
              name="quantity"
              type="number"
              placeholder="e.g. 100"
              value={form.quantity}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="flex-1 bg-black text-white p-3 rounded-lg"
            >
              {product ? "Update" : "Save"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 p-3 rounded-lg"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}