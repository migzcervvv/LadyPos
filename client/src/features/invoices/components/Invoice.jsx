import { useAuth } from "../../../shared/hooks/AuthContext";

export default function Invoice({ invoice }) {
  const { user } = useAuth();
  if (!invoice) return null;

  return (
    <div id="print-area" className="p-6 bg-white text-black max-w-md mx-auto">
      <h1 className="text-center text-xl font-bold">
        {user?.name || "My Store"}
      </h1>

      <p className="text-center text-xs mb-4">
        {user?.phone || ""} {user?.address || ""}
      </p>

      <div className="flex justify-between mb-3 text-sm">
        <span>Invoice #: {invoice.invoiceNumber}</span>
        <span>{new Date(invoice.issuedAt).toLocaleDateString()}</span>
      </div>

      <hr className="mb-2" />

      {invoice.items.map((i, idx) => (
        <div key={idx} className="flex justify-between text-sm">
          <span>
            {i.productName} x{i.quantity}
          </span>
          <span>₱ {i.total.toFixed(2)}</span>
        </div>
      ))}

      <hr className="my-2" />

      <div className="text-sm text-right">
        <p>Total: ₱ {invoice.total.toFixed(2)}</p>
      </div>

      <p className="text-center text-xs mt-4">Thank you for your purchase!</p>
    </div>
  );
}
