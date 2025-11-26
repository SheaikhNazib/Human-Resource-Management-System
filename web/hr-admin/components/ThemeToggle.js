"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored) {
        setTheme(stored);
        return;
      }
      const prefersDark =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    } catch (e) {
      setTheme("light");
    }
  }, []);

  useEffect(() => {
    if (!theme) return;
    try {
      document.documentElement.setAttribute("data-theme", theme);
      if (theme === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", theme);
    } catch (e) {
      // ignore
    }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      title="Toggle light / dark"
      className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}
