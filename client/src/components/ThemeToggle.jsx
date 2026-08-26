"use client";

import { useSyncExternalStore, useEffect } from "react";
import { SunIcon, MoonIcon } from "./Icons";

function getSnapshot() {
  return localStorage.getItem("theme") === "dark";
}

function getServerSnapshot() {
  return false;
}

function subscribe(callback) {
  window.addEventListener("theme-change", callback);
  return () => window.removeEventListener("theme-change", callback);
}

export default function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    window.dispatchEvent(new Event("theme-change"));
  };

  return (
    <button
      onClick={toggle}
      className="fixed top-3 right-3 z-50 flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-(--border) bg-(--surface) text-(--text-secondary) shadow-(--shadow) transition-all duration-200 hover:border-(--text-muted) hover:text-(--text) hover:shadow-(--shadow-lg) sm:top-4 sm:right-4"
      aria-label="Toggle dark mode"
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
