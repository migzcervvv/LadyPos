import { useState, useRef } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext.jsx";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(
    window.innerWidth >= 768, // open only on desktop
  );
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const tabs = [
    { name: "Profile", path: "/profile" },
    { name: "Customers", path: "/customers" },
    { name: "Orders", path: "/pos" },
    { name: "Products", path: "/products" },
    { name: "Finances", path: "/finances" },
    { name: "Logout", path: "/logout" },
  ];

  const handleTabClick = (tab) => {
    setSidebarOpen(false);
    if (tab.name === "Logout") {
      logout();
      navigate("/login");
    } else {
      navigate(tab.path);
    }
  };

  // Swipe to close
  const handleTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
  const handleTouchMove = (e) => (touchEndX.current = e.touches[0].clientX);
  const handleTouchEnd = () => {
    const deltaX = touchStartX.current - touchEndX.current;

    // CLOSE (swipe left)
    if (deltaX > 70 && sidebarOpen) {
      setSidebarOpen(false);
    }

    // OPEN (swipe right ONLY from edge)
    if (
      deltaX < -70 &&
      !sidebarOpen &&
      touchStartX.current < 50 // only from screen edge
    ) {
      setSidebarOpen(true);
    }
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
    >
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[var(--color-surface)] shadow-lg transform transition-transform duration-300 ease-in-out
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo & Close Button */}
        <div className="h-16 flex items-center justify-between border-b border-[var(--color-border)] px-4">
          <img src="/serveflow.svg" alt="Logo" className="h-10 w-auto" />
          {/* Close button always visible */}
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

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between h-16 px-4 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
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
          {" "}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
