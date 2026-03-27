import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext.jsx";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const tabs = [
    { name: "Profile", path: "/profile" },
    { name: "Customers", path: "/customers" },
    { name: "Orders", path: "/orders" },
    { name: "Debts", path: "/debts" },
    { name: "Finances", path: "/finances" },
    { name: "Logout", path: "/logout" }, // We'll handle logout specially
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

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
    >
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-(--color-surface) shadow-lg transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:shadow-none`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-(--color-border)">
          <img src="/serveflow.svg" alt="Logo" className="h-10 w-auto" />
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => handleTabClick(tab)}
              className={`w-full text-left block px-3 py-2 rounded transition-colors
                ${
                  location.pathname === tab.path
                    ? "bg-(--color-primary) text-white"
                    : "text-(--color-text) hover:bg-(--color-secondary)"
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
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="flex items-center h-16 px-4 bg-(--color-surface) shadow md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-accent) focus:ring-offset-2 rounded"
          >
            {/* Hamburger icon */}
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
          <span className="ml-4 font-bold text-lg">Page</span>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
