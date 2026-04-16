import { useEffect, useState } from "react";
import { useProductApi } from "../services/productApi";
import ProductCard from "../components/ProductCard";
import ProductFormModal from "../components/ProductFormModal";
import ActiveProductsModal from "../components/ActiveProductsModal";

export default function ProductPage() {
  const { getProducts, deleteProduct } = useProductApi();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showActiveModal, setShowActiveModal] = useState(false);
  async function loadProducts() {
    const res = await getProducts();
    setProducts(res.data);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-4 pb-24 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Products</h1>

        <button
          onClick={() => setShowActiveModal(true)}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg"
        >
          Set Active (POS)
        </button>
      </div>
      {/* Search */}
      <input
        className="w-full p-3 rounded-xl border mb-4"
        placeholder="Search product..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* EMPTY STATE */}
      {filtered.length === 0 && (
        <div className="text-center mt-16 text-gray-500">
          <p className="text-lg font-medium">No products yet</p>
          <p className="text-sm mt-2">
            Start by adding your first product using the + button below.
          </p>
        </div>
      )}

      {/* FLEX WRAP GRID */}
      <div className="flex flex-wrap gap-4">
        {filtered.map((p) => (
          <ProductCard
            key={p._id}
            product={p}
            onEdit={() => {
              setSelectedProduct(p);
              setShowModal(true);
            }}
            onDelete={async () => {
              await deleteProduct(p._id);
              loadProducts();
            }}
          />
        ))}
      </div>

      {/* ADD BUTTON */}
      <button
        onClick={() => {
          setSelectedProduct(null);
          setShowModal(true);
        }}
        className="fixed bottom-6 right-6 bg-black text-white w-14 h-14 rounded-full text-2xl shadow-lg"
      >
        +
      </button>

      {/* MODAL */}
      {showModal && (
        <ProductFormModal
          product={selectedProduct}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadProducts();
          }}
        />
      )}

      {showActiveModal && (
        <ActiveProductsModal
          onClose={() => setShowActiveModal(false)}
          onSuccess={() => {
            setShowActiveModal(false);
            loadProducts(); // refresh list
          }}
        />
      )}
    </div>
  );
}
