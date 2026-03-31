import { useEffect, useState } from "react";
import { useInvoiceApi } from "../services/invoiceApi";
import Invoice from "../components/Invoice";

export default function InvoicesPage() {
  const { getInvoices, ensureInvoice } = useInvoiceApi();

  const [invoices, setInvoices] = useState([]);
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    if (selected) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.print();
        });
      });
    }
  }, [selected]);
  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    const res = await getInvoices();
    setInvoices(res.data);
  };

  const handlePrint = async (orderId) => {
    const res = await ensureInvoice(orderId);
    setSelected(res.data);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Invoices</h1>
      <div className="flex gap-2 mb-3">
        <input
          type="date"
          onChange={(e) => loadInvoices({ from: e.target.value })}
          className="border p-2 rounded"
        />

        <select
          onChange={(e) => loadInvoices({ status: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">All</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div className="space-y-3">
        {invoices.map((inv) => (
          <div
            key={inv._id}
            className="p-3 border rounded flex justify-between"
          >
            <div>
              <p className="font-bold">{inv.invoiceNumber}</p>
              <p className="text-sm">₱ {inv.total.toFixed(2)}</p>
              <p className="text-xs">
                {new Date(inv.issuedAt).toLocaleString()}
              </p>
            </div>

            <button
              onClick={() => handlePrint(inv.orderId)}
              className="px-3 py-2 bg-black text-white rounded"
            >
              Print
            </button>
          </div>
        ))}
      </div>

      {/* PRINT AREA */}
      {selected && (
        <div style={{ position: "absolute", top: "-9999px" }}>
          <Invoice invoice={selected} />
        </div>
      )}
    </div>
  );
}
