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
    <div
      className="p-4 space-y-4"
      style={{
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text)",
        minHeight: "100vh",
      }}
    >
      <h1 className="text-xl font-bold">Invoices</h1>

      {/* FILTERS */}
      <div
        className="flex gap-2 p-3 rounded-xl border"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <input
          type="date"
          onChange={(e) => loadInvoices({ from: e.target.value })}
          className="input"
        />

        <select
          onChange={(e) => loadInvoices({ status: e.target.value })}
          className="input"
        >
          <option value="">All</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {invoices.map((inv) => (
          <div
            key={inv._id}
            className="p-4 rounded-xl border flex justify-between items-center"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}
          >
            <div>
              <p className="font-bold">{inv.invoiceNumber}</p>

              <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                ₱ {inv.total.toFixed(2)}
              </p>

              <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                {new Date(inv.issuedAt).toLocaleString()}
              </p>
            </div>

            <button
              onClick={() => handlePrint(inv.orderId)}
              className="px-3 py-2 rounded text-white"
              style={{
                backgroundColor: "var(--color-primary)",
              }}
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
