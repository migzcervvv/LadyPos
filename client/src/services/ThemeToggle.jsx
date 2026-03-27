import { useState, useEffect } from "react";

function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Load stored theme on mount
    const stored = localStorage.getItem("theme");
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <button
      onClick={toggleTheme}
      className="px-4 py-2 rounded bg-(--color-primary) text-white"
    >
      {theme === "light" ? "Dark Mode" : "Light Mode"}
    </button>
  );
}

export default ThemeToggle;
