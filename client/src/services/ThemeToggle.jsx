import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="w-full flex items-center justify-between px-3 py-2 rounded-lg
                 text-[var(--color-text)] hover:bg-[var(--color-secondary)]
                 transition-colors duration-200"
    >
      {/* Left side */}
      <div className="flex items-center gap-2">
        <span className="text-lg">{isDark ? "🌙" : "☀️"}</span>
        <span className="text-sm font-medium">
          {isDark ? "Dark Mode" : "Light Mode"}
        </span>
      </div>

      {/* Right side switch */}
      <div
        className={`w-10 h-5 flex items-center rounded-full p-1 transition
          ${isDark ? "bg-[var(--color-primary)]" : "bg-gray-400"}`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition
            ${isDark ? "translate-x-5" : "translate-x-0"}`}
        />
      </div>
    </button>
  );
}
