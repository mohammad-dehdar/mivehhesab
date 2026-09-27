"use client";

import { DownloadIcon } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Button } from "@/shared/ui/button";

type InstallPromptEvent = Event & { prompt: () => Promise<void> };
export type InstallState = "installed" | "available" | "unavailable";

// Chrome fires `beforeinstallprompt` once, early; keep it for whenever the button is shown.
let deferred: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    notify();
  });
}

function snapshot(): InstallState {
  if (window.matchMedia("(display-mode: standalone)").matches) return "installed";
  return deferred ? "available" : "unavailable";
}

export function useInstallState(): InstallState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    snapshot,
    () => "unavailable",
  );
}

/** One-tap install when Chrome offers it; renders nothing otherwise. */
export function InstallButton() {
  const state = useInstallState();
  if (state !== "available") return null;
  return (
    <Button
      size="lg"
      onClick={async () => {
        await deferred?.prompt();
        deferred = null;
        notify();
      }}
    >
      <DownloadIcon />
      نصب برنامه
    </Button>
  );
}
