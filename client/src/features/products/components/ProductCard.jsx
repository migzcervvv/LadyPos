export default function ProductCard({ product, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 w-[48%] md:w-[30%] flex flex-col justify-between">

      <div>
        <h2 className="font-semibold text-lg">{product.name}</h2>
        <p className="text-sm text-gray-500">{product.category}</p>
      </div>

      <div className="mt-3">
        <p className="text-xl font-bold">₱{product.sellingPrice}</p>
        <p className="text-sm text-gray-500">
          Stock: {product.quantity}
        </p>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={onEdit}
          className="flex-1 bg-gray-100 p-2 rounded-lg"
        >
          Edit
        </button>

        <button
          onClick={onDelete}
          className="flex-1 bg-red-500 text-white p-2 rounded-lg"
        >
          Delete
        </button>
      </div>
    </div>
  );
}