import { useEffect, useState } from "react";
import { useProductApi } from "../services/productApi";

export default function ActiveProductsModal({ onClose, onSuccess }) {
  const { getProducts, setActiveProducts } = useProductApi();

  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const res = await getProducts();

    const sorted = res.data.sort((a, b) => a.name.localeCompare(b.name));

    setProducts(sorted);

    const activeIds = sorted.filter((p) => p.active).map((p) => p._id);

    setSelected(activeIds);
  }

  function toggle(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleSelectAll() {
    const visibleIds = filtered.map((p) => p._id);
    setSelected((prev) => Array.from(new Set([...prev, ...visibleIds])));
  }

  function handleClearAll() {
    const visibleIds = filtered.map((p) => p._id);
    setSelected((prev) => prev.filter((id) => !visibleIds.includes(id)));
  }

  async function handleSubmit() {
    console.log("Selected product IDs:", selected);
    await setActiveProducts(selected);
    onSuccess();
  }

  // 🔍 FILTERING
  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());

    const matchCategory = category === "all" || p.category === category;

    return matchSearch && matchCategory;
  });

  // 📦 GET UNIQUE CATEGORIES
  const categories = [
    "all",
    ...new Set(products.map((p) => p.category || "General")),
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl w-full max-w-3xl p-6">
        <h2 className="text-xl font-semibold mb-4">
          Set Active Products (POS)
        </h2>

        {/* 🔍 SEARCH + FILTER */}
        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 p-2 border rounded-lg"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="p-2 border rounded-lg"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* ⚡ ACTION BUTTONS */}
        <div className="flex gap-2 mb-2">
          <button
            onClick={handleSelectAll}
            className="px-3 py-1 border rounded-lg text-sm"
          >
            Select All
          </button>
          <button
            onClick={handleClearAll}
            className="px-3 py-1 border rounded-lg text-sm"
          >
            Clear All
          </button>
        </div>

        {/* TABLE */}
        <div className="max-h-96 overflow-y-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="p-3 text-left">Active</th>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Price</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(p._id)}
                      onChange={() => toggle(p._id)}
                    />
                  </td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.category || "General"}</td>
                  <td className="p-3">₱ {p.sellingPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No products found
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-black text-white rounded-lg"
          >
            Save
          </button>
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
