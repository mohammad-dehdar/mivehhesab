"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "../ui/button";

/** Switches between the default dark theme and the light theme (for bright shops). */
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    if (next === "light") root.dataset.theme = "light";
    else delete root.dataset.theme;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // storage unavailable (private mode) — the theme just won't persist
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="تغییر حالت روشن و تیره">
      <SunIcon className="light:hidden" />
      <MoonIcon className="light:block hidden" />
    </Button>
  );
}
