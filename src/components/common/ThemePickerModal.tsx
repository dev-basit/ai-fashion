"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Check } from "lucide-react";

const STORAGE_KEY = "gbm-theme-chosen";

function LightPreview() {
  return (
    <svg viewBox="0 0 160 100" fill="none" className="w-full h-auto rounded-lg">
      <rect width="160" height="100" rx="8" fill="#ffffff" stroke="#e5e5e5" strokeWidth="1" />
      <rect width="160" height="28" rx="8" fill="#f5f5f5" />
      <rect y="20" width="160" height="8" fill="#f5f5f5" />
      <rect x="10" y="9" width="50" height="8" rx="2" fill="#d4d4d4" />
      <rect x="130" y="9" width="20" height="8" rx="2" fill="#d4d4d4" />
      <rect x="10" y="38" width="44" height="44" rx="6" fill="#f5f5f5" stroke="#e5e5e5" strokeWidth="1" />
      <rect x="17" y="46" width="28" height="5" rx="1.5" fill="#d4d4d4" />
      <rect x="17" y="57" width="20" height="8" rx="2" fill="#a3a3a3" />
      <rect x="62" y="38" width="44" height="44" rx="6" fill="#f5f5f5" stroke="#e5e5e5" strokeWidth="1" />
      <rect x="69" y="46" width="28" height="5" rx="1.5" fill="#d4d4d4" />
      <rect x="69" y="57" width="20" height="8" rx="2" fill="#a3a3a3" />
      <rect x="114" y="38" width="36" height="44" rx="6" fill="#f5f5f5" stroke="#e5e5e5" strokeWidth="1" />
      <rect x="121" y="46" width="22" height="5" rx="1.5" fill="#d4d4d4" />
      <rect x="121" y="57" width="16" height="8" rx="2" fill="#a3a3a3" />
    </svg>
  );
}

function DarkPreview() {
  return (
    <svg viewBox="0 0 160 100" fill="none" className="w-full h-auto rounded-lg">
      <rect width="160" height="100" rx="8" fill="#0d0d0d" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <rect width="160" height="28" rx="8" fill="#141414" />
      <rect y="20" width="160" height="8" fill="#141414" />
      <rect x="10" y="9" width="50" height="8" rx="2" fill="#2a2a2a" />
      <rect x="130" y="9" width="20" height="8" rx="2" fill="#2a2a2a" />
      <rect
        x="10"
        y="38"
        width="44"
        height="44"
        rx="6"
        fill="#191919"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />
      <rect x="17" y="46" width="28" height="5" rx="1.5" fill="#333" />
      <rect x="17" y="57" width="20" height="8" rx="2" fill="rgba(255,255,255,0.3)" />
      <rect
        x="62"
        y="38"
        width="44"
        height="44"
        rx="6"
        fill="#191919"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />
      <rect x="69" y="46" width="28" height="5" rx="1.5" fill="#333" />
      <rect x="69" y="57" width="20" height="8" rx="2" fill="rgba(255,255,255,0.3)" />
      <rect
        x="114"
        y="38"
        width="36"
        height="44"
        rx="6"
        fill="#191919"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />
      <rect x="121" y="46" width="22" height="5" rx="1.5" fill="#333" />
      <rect x="121" y="57" width="16" height="8" rx="2" fill="rgba(255,255,255,0.3)" />
    </svg>
  );
}

export function ThemePickerModal() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<"light" | "dark" | null>(null);
  const { setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem(STORAGE_KEY)) {
      setOpen(true);
    }
  }, []);

  function confirm() {
    if (!selected) return;
    setTheme(selected);
    localStorage.setItem(STORAGE_KEY, selected);
    setOpen(false);
  }

  if (!mounted || !open) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
    >
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold tracking-tight text-foreground mb-2">Choose your look</h2>
          <p className="text-sm text-muted-foreground">
            Pick a theme to get started. You can change it anytime from the navbar.
          </p>
        </div>

        {/* Theme cards */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {/* Light */}
          <button
            onClick={() => setSelected("light")}
            className="relative rounded-xl border-2 p-3 text-left transition-all duration-150 hover:scale-[1.02] focus:outline-none"
            style={{
              borderColor: selected === "light" ? "var(--foreground)" : "var(--border)",
              background: selected === "light" ? "var(--muted)" : "transparent",
            }}
          >
            {selected === "light" && (
              <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
                <Check className="h-3 w-3 text-background" strokeWidth={3} />
              </div>
            )}
            <div className="mb-3">
              <LightPreview />
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.8} />
              <span className="text-sm font-medium text-foreground">Light</span>
            </div>
          </button>

          {/* Dark */}
          <button
            onClick={() => setSelected("dark")}
            className="relative rounded-xl border-2 p-3 text-left transition-all duration-150 hover:scale-[1.02] focus:outline-none"
            style={{
              borderColor: selected === "dark" ? "var(--foreground)" : "var(--border)",
              background: selected === "dark" ? "var(--muted)" : "transparent",
            }}
          >
            {selected === "dark" && (
              <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
                <Check className="h-3 w-3 text-background" strokeWidth={3} />
              </div>
            )}
            <div className="mb-3">
              <DarkPreview />
            </div>
            <div className="flex items-center gap-2">
              <Moon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.8} />
              <span className="text-sm font-medium text-foreground">Dark</span>
            </div>
          </button>
        </div>

        {/* Confirm */}
        <button
          onClick={confirm}
          disabled={!selected}
          className="w-full py-3 rounded-full text-sm font-semibold transition-opacity"
          style={{
            background: selected ? "var(--foreground)" : "var(--muted)",
            color: selected ? "var(--background)" : "var(--muted-foreground)",
            opacity: selected ? 1 : 0.5,
            cursor: selected ? "pointer" : "not-allowed",
          }}
        >
          {selected ? `Continue with ${selected} mode` : "Select a theme to continue"}
        </button>
      </div>
    </div>
  );
}
