import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext.jsx";
import ThemeToggle from "../../services/ThemeToggle.jsx";

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_TABS = [
  { name: "Profile", path: "/profile" },
  { name: "Customers", path: "/customers" },
  { name: "Orders", path: "/pos" },
  { name: "Products", path: "/products" },
  { name: "Invoices", path: "/invoices" },
  { name: "Finances", path: "/finances" },
  { name: "Expenses", path: "/expenses" },
];

const MOBILE_BREAKPOINT = 768;

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavItem({ name, path, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`
        w-full text-left px-3 py-2 rounded-lg text-sm font-medium
        transition-colors duration-150 select-none
        ${
          isActive
            ? "bg-[var(--color-primary)] text-white"
            : "text-[var(--color-text)] hover:bg-[var(--color-secondary)]"
        }
      `}
    >
      {name}
    </button>
  );
}

function SidebarContent({
  currentPath,
  onNavigate,
  onLogout,
  showClose,
  onClose,
}) {
  return (
    <>
      {/* Header */}
      <div className="h-16 flex items-center justify-between border-b border-[var(--color-border)] px-4 flex-shrink-0">
        <img src="/serveflow.svg" alt="ServeFlow" className="h-10 w-auto" />

        {showClose && (
          <button
            aria-label="Close navigation menu"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--color-secondary)] transition-colors duration-150"
          >
            <svg
              className="w-5 h-5 text-[var(--color-text)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav
        aria-label="Main navigation"
        className="flex-1 overflow-y-auto px-3 py-4 space-y-1"
      >
        {NAV_TABS.map((tab) => (
          <NavItem
            key={tab.path}
            name={tab.name}
            path={tab.path}
            isActive={currentPath === tab.path}
            onClick={() => onNavigate(tab.path)}
          />
        ))}
      </nav>

      {/* Footer: logout + theme */}
      <div className="px-3 py-4 flex flex-col gap-2 border-t border-[var(--color-border)] flex-shrink-0">
        <button
          onClick={onLogout}
          className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-secondary)] transition-colors duration-150 select-none"
          aria-label="Log out of your account"
        >
          Logout
        </button>
        <ThemeToggle />
      </div>
    </>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // SSR-safe: initialize false, detect in effect via matchMedia
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef(null);

  // ── Responsive detection ──────────────────────────────────────────────────
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = (e) => {
      setIsMobile(e.matches);
      if (!e.matches) setMobileOpen(false); // entering desktop: always close drawer
    };

    setIsMobile(mql.matches); // set initial value synchronously after mount
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // ── Close drawer on route change (mobile only) ────────────────────────────
  useEffect(() => {
    // isMobile intentionally omitted: if a navigation fires while mobile,
    // we want to close regardless of a simultaneous resize race.
    setMobileOpen(false);
  }, [location.pathname]);

  // ── ESC key ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  // ── Body scroll lock ──────────────────────────────────────────────────────
  useEffect(() => {
    const shouldLock = mobileOpen && isMobile;
    document.body.style.overflow = shouldLock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, isMobile]);

  // ── Focus trap ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mobileOpen || !sidebarRef.current) return;

    const sidebar = sidebarRef.current;
    const focusable = Array.from(
      sidebar.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => !el.disabled);

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const trapTab = (e) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    sidebar.addEventListener("keydown", trapTab);
    return () => sidebar.removeEventListener("keydown", trapTab);
  }, [mobileOpen]);

  // ── Stable callbacks ──────────────────────────────────────────────────────
  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate],
  );
  const handleLogout = useCallback(() => {
    setMobileOpen(false);
    logout();
    navigate("/login");
  }, [logout, navigate]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
    >
      {/* ── Desktop sidebar ─────────────────────────────────────────────────
          Always in DOM; CSS-hidden below md breakpoint.
          No animation, no overlay, never closes.
      ────────────────────────────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-64 flex-shrink-0 bg-[var(--color-surface)] border-r border-[var(--color-border)]"
        aria-label="Desktop navigation"
      >
        <SidebarContent
          currentPath={location.pathname}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          showClose={false}
        />
      </aside>

      {/* ── Mobile sidebar + backdrop ────────────────────────────────────────
          Only rendered in the DOM when on a mobile viewport.
          Controlled entirely by mobileOpen state.
      ────────────────────────────────────────────────────────────────────── */}
      {isMobile && (
        <>
          {/* Backdrop — pointer-events disabled when invisible to prevent
              ghost click capture while the panel is closed.             */}
          <div
            aria-hidden="true"
            onClick={closeMobile}
            className={`
              fixed inset-0 z-30
              bg-black/50 backdrop-blur-sm
              transition-opacity duration-300
              ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
            `}
          />

          {/* Drawer panel */}
          <aside
            ref={sidebarRef}
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className={`
              fixed inset-y-0 left-0 z-40
              w-64 flex flex-col
              bg-[var(--color-surface)] shadow-2xl
              transform transition-transform duration-300 ease-in-out
              ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
            `}
          >
            <SidebarContent
              currentPath={location.pathname}
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              showClose={true}
              onClose={closeMobile}
            />
          </aside>
        </>
      )}

      {/* ── Main content area ────────────────────────────────────────────────
          min-w-0 prevents flex child from overflowing on long content.
          On desktop the aside takes its 64 width naturally; no margin needed.
      ────────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center h-16 px-4 flex-shrink-0 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
          aria-label="Top bar"
        >
          <div className="flex items-center gap-3">
            {/* Hamburger only on mobile; desktop sidebar is always visible */}
            {isMobile && (
              <button
                onClick={openMobile}
                aria-label="Open navigation menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav"
                className="p-2 rounded-lg hover:bg-[var(--color-secondary)] transition-colors duration-150"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}

            <span className="font-semibold text-[var(--color-text)]">
              Dashboard
            </span>
          </div>
        </header>

        {/* Page content */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto p-3 md:p-4"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
