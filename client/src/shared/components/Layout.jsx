import { useState, useEffect } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext.jsx";

export default function Layout() {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  // ✅ Reactive mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // ✅ Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  // ✅ Sync on resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (!mobile) {
        setSidebarOpen(true); // always open on desktop
      } else {
        setSidebarOpen(false); // closed by default on mobile
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const tabs = [
    { name: "Profile", path: "/profile" },
    { name: "Customers", path: "/customers" },
    { name: "Orders", path: "/pos" },
    { name: "Products", path: "/products" },
    { name: "Invoices", path: "/invoices" },
    { name: "Finances", path: "/finances" },
    { name: "Expenses", path: "/expenses" },
    { name: "Logout", path: "/logout" },
  ];

  const handleTabClick = (tab) => {
    if (isMobile) setSidebarOpen(false);

    if (tab.name === "Logout") {
      logout();
      navigate("/login");
    } else {
      navigate(tab.path);
    }
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text)",
      }}
    >
      {/* ✅ Sidebar */}
      <div
        key={sidebarOpen ? "open" : "closed"} // 🔥 prevents transform bug
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[var(--color-surface)] shadow-lg
          transform transition-transform duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] will-change-transform
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between border-b border-[var(--color-border)] px-4">
          <img src="/serveflow.svg" alt="Logo" className="h-10 w-auto" />

          <button
            className="p-1 rounded hover:bg-[var(--color-secondary)] transition"
            onClick={() => setSidebarOpen(false)}
          >
            <svg
              className="w-5 h-5 text-[var(--color-text)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => handleTabClick(tab)}
              className={`w-full text-left flex items-center px-3 py-2 rounded-lg transition-colors duration-200
                ${
                  location.pathname === tab.path
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-[var(--color-text)] hover:bg-[var(--color-secondary)]"
                }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* ✅ Overlay (mobile only) */}
      {isMobile && sidebarOpen && (
        <div
          className={`fixed inset-0 z-30 backdrop-blur-sm transition-opacity duration-300
${sidebarOpen ? "bg-black/40 opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ✅ Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between h-16 px-4 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            {/* ✅ Toggle button */}
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="p-2 rounded-lg hover:bg-[var(--color-secondary)] transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <span className="font-semibold">Dashboard</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-3 md:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
