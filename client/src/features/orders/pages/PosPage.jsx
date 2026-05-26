import { useEffect, useMemo, useState } from "react";
import { useProductApi } from "../../products/services/productApi";
import { usePersonApi } from "../../people/services/api";
import { useOrderApi } from "../services/ordersApi";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const formatMoney = (centavos = 0) =>
  `PHP ${(Number(centavos) / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const toCentavos = (value) => Math.round((Number(value) || 0) * 100);

const statusFor = (amountPaid, total) => {
  if (total <= 0 || amountPaid <= 0) return "DEBT";
  if (amountPaid >= total) return "PAID";
  return "PARTIAL";
};

export default function POSPage() {
  const { getProducts } = useProductApi();
  const { getPersons, createPerson } = usePersonApi();
  const { createOrder } = useOrderApi();

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentReference, setPaymentReference] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [productRes, customerRes] = await Promise.all([
      getProducts({ limit: 200, isActive: true, sortBy: "name" }),
      getPersons({ limit: 200, sortBy: "name" }),
    ]);
    setProducts(productRes.data);
    setCustomers(customerRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const visibleProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      const isActive = product.isActive ?? product.active;
      if (!isActive) return false;
      if (!needle) return true;
      return `${product.name} ${product.sku || ""}`
        .toLowerCase()
        .includes(needle);
    });
  }, [products, query]);

  const customerOptions = useMemo(() => {
    const needle = customerSearch.trim().toLowerCase();
    if (!needle) return customers;
    return customers.filter((customer) =>
      `${customer.name} ${customer.phone || customer.contactInfo || ""}`
        .toLowerCase()
        .includes(needle),
    );
  }, [customers, customerSearch]);

  const total = cart.reduce((sum, line) => sum + line.quantity * line.price, 0);
  const paidCentavos = Math.min(toCentavos(amountPaid), total);
  const balance = Math.max(0, total - paidCentavos);
  const status = statusFor(paidCentavos, total);
  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  const addToCart = (product) => {
    if ((product.stock ?? product.quantity ?? 0) <= 0) return;
    setCartOpen(true);
    setCart((current) => {
      const existing = current.find((line) => line.product === product._id);
      if (existing) {
        return current.map((line) =>
          line.product === product._id
            ? {
                ...line,
                quantity: Math.min(
                  line.quantity + 1,
                  product.stock ?? product.quantity ?? 0,
                ),
              }
            : line,
        );
      }
      return [
        ...current,
        {
          product: product._id,
          name: product.name,
          price: product.price ?? product.sellingPrice,
          stock: product.stock ?? product.quantity ?? 0,
          quantity: 1,
        },
      ];
    });
  };

  const setQuantity = (productId, quantity) => {
    setCart((current) =>
      current
        .map((line) =>
          line.product === productId
            ? { ...line, quantity: Math.min(Math.max(0, quantity), line.stock) }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  };

  const createInlineCustomer = async () => {
    const name = newCustomerName.trim();
    if (!name) return;
    const res = await createPerson({ name, phone: customerSearch });
    setCustomers((current) => [res.data, ...current]);
    setCustomerId(res.data._id);
    setNewCustomerName("");
  };

  const submit = async () => {
    if (!customerId || cart.length === 0) return;
    setSaving(true);
    try {
      await createOrder({
        orderStatus: "pending",
        customer: customerId,
        items: cart.map((line) => ({
          product: line.product,
          quantity: line.quantity,
        })),
        amountPaid: paidCentavos,
        paymentMethod,
        paymentReference,
        paymentStatus: status,
        notes,
      });
      toast.success("Sale submitted");
      setCart([]);
      setCartOpen(false);
      setAmountPaid("");
      setPaymentReference("");
      setNotes("");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit sale");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pos-shell min-h-full overflow-x-hidden pb-24 md:pb-0">
      <section className="pos-products">
        <div className="sticky top-0 z-10 bg-[var(--color-bg)] pb-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h1 className="text-xl font-semibold">POS</h1>
            <Link
              className="secondary-action inline-flex items-center justify-center gap-2"
              to="/orders"
            >
              <span aria-hidden="true">#</span>
              Orders
            </Link>
          </div>
          <input
            className="input min-h-11"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search or scan products"
            inputMode="search"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {visibleProducts.map((product) => {
            const stock = product.stock ?? product.quantity ?? 0;
            return (
              <button
                key={product._id}
                onClick={() => addToCart(product)}
                disabled={stock <= 0}
                className="min-h-32 rounded-lg border p-3 text-left transition active:scale-[0.99] disabled:opacity-50"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                }}
              >
                <div className="flex h-full flex-col justify-between gap-3">
                  <p className="break-words text-sm font-semibold leading-snug">
                    {product.name}
                  </p>
                  <div className="space-y-2">
                    <p className="text-base font-bold">
                      {formatMoney(product.price ?? product.sellingPrice)}
                    </p>
                    <span
                      className={`stock-pill ${stock === 0 ? "stock-out" : stock < 10 ? "stock-low" : "stock-ok"}`}
                    >
                      {stock} left
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <aside className={`pos-cart ${cartOpen ? "is-open" : ""}`}>
        <button
          className="md:hidden cart-grip"
          onClick={() => setCartOpen((open) => !open)}
          aria-label="Toggle cart"
        />
        <CartPanel
          cart={cart}
          total={total}
          customerId={customerId}
          setCustomerId={setCustomerId}
          customerSearch={customerSearch}
          setCustomerSearch={setCustomerSearch}
          customerOptions={customerOptions}
          newCustomerName={newCustomerName}
          setNewCustomerName={setNewCustomerName}
          createInlineCustomer={createInlineCustomer}
          amountPaid={amountPaid}
          setAmountPaid={setAmountPaid}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          paymentReference={paymentReference}
          setPaymentReference={setPaymentReference}
          balance={balance}
          status={status}
          notes={notes}
          setNotes={setNotes}
          setQuantity={setQuantity}
          submit={submit}
          saving={saving}
        />
      </aside>

      <button
        className="cart-summary md:hidden"
        onClick={() => setCartOpen(true)}
      >
        <span>{itemCount} items</span>
        <strong>{formatMoney(total)}</strong>
        <span>Checkout</span>
      </button>
    </div>
  );
}

function CartPanel({
  cart,
  total,
  customerId,
  setCustomerId,
  customerSearch,
  setCustomerSearch,
  customerOptions,
  newCustomerName,
  setNewCustomerName,
  createInlineCustomer,
  amountPaid,
  setAmountPaid,
  paymentMethod,
  setPaymentMethod,
  paymentReference,
  setPaymentReference,
  balance,
  status,
  notes,
  setNotes,
  setQuantity,
  submit,
  saving,
}) {
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-scroll">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Cart</h1>
          <strong>{formatMoney(total)}</strong>
        </div>

        <div className="max-h-52 space-y-2 overflow-y-auto pr-1 md:max-h-72">
          {cart.length === 0 && (
            <p className="text-sm text-[var(--color-muted)]">No items yet</p>
          )}
          {cart.map((line) => (
            <div key={line.product} className="cart-line">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{line.name}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  {formatMoney(line.price)} x {line.quantity}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="qty-button"
                  onClick={() => setQuantity(line.product, line.quantity - 1)}
                >
                  -
                </button>
                <span className="w-7 text-center text-sm">{line.quantity}</span>
                <button
                  className="qty-button"
                  onClick={() => setQuantity(line.product, line.quantity + 1)}
                >
                  +
                </button>
              </div>
              <strong className="text-right text-sm">
                {formatMoney(line.price * line.quantity)}
              </strong>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid gap-2">
          <input
            className="input min-h-11"
            placeholder="Find customer"
            value={customerSearch}
            onChange={(event) => setCustomerSearch(event.target.value)}
          />
          <select
            className="input min-h-11"
            value={customerId}
            onChange={(event) => setCustomerId(event.target.value)}
          >
            <option value="">Select customer</option>
            {customerOptions.map((customer) => (
              <option key={customer._id} value={customer._id}>
                {customer.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              className="input min-h-11"
              placeholder="New customer"
              value={newCustomerName}
              onChange={(event) => setNewCustomerName(event.target.value)}
            />
            <button
              className="secondary-action"
              onClick={createInlineCustomer}
              type="button"
            >
              Add
            </button>
          </div>
        </div>

        <input
          className="input min-h-11"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={amountPaid}
          onChange={(event) => setAmountPaid(event.target.value)}
          placeholder="Amount paid"
        />

        <div className="grid grid-cols-4 gap-2">
          {["cash", "gcash", "bank", "credit"].map((item) => (
            <button
              key={item}
              className={`pay-method ${paymentMethod === item ? "selected" : ""}`}
              onClick={() => setPaymentMethod(item)}
              type="button"
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>

        {["gcash", "bank"].includes(paymentMethod) && (
          <input
            className="input min-h-11"
            value={paymentReference}
            onChange={(event) => setPaymentReference(event.target.value)}
            placeholder={
              paymentMethod === "bank"
                ? "Bank reference number"
                : "GCash reference number"
            }
          />
        )}

        <div className="balance-row">
          <span>{status}</span>
          <strong>{formatMoney(balance)} balance</strong>
        </div>

        <textarea
          className="input min-h-20"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Notes"
        />
      </div>

      <button
        className="primary-action"
        disabled={
          !customerId ||
          cart.length === 0 ||
          saving ||
          (["gcash", "bank"].includes(paymentMethod) &&
            !paymentReference.trim())
        }
        onClick={submit}
      >
        {saving ? "Saving..." : "Submit sale"}
      </button>
    </div>
  );
}
