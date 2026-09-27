"use client";

import { RefreshCwIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/button";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Registers the offline service worker (production builds only) and, when a
 * new version has been downloaded, offers to switch to it. Switching is the
 * user's choice so a half-typed day is never lost to a surprise reload.
 */
export function ServiceWorker() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    let reloading = false;
    const onControllerChange = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    navigator.serviceWorker.register(`${basePath}/sw.js`, { scope: `${basePath}/` }).then((reg) => {
      const track = (worker: ServiceWorker | null) => {
        worker?.addEventListener("statechange", () => {
          // "installed" while another worker controls the page = an update is ready
          if (worker.state === "installed" && navigator.serviceWorker.controller)
            setWaiting(worker);
        });
      };
      if (reg.waiting && navigator.serviceWorker.controller) setWaiting(reg.waiting);
      track(reg.installing);
      reg.addEventListener("updatefound", () => track(reg.installing));
    });

    return () =>
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
  }, []);

  if (!waiting) return null;

  return (
    <div
      role="status"
      className="bg-card no-print fixed inset-x-4 bottom-20 z-50 mx-auto flex max-w-md items-center gap-3 rounded-(--radius-card) border p-4 shadow-lg md:bottom-6"
    >
      <RefreshCwIcon className="text-primary size-6 shrink-0" />
      <span className="flex-1 font-medium">نسخه‌ی جدید برنامه آماده است</span>
      <Button size="sm" onClick={() => waiting.postMessage({ type: "SKIP_WAITING" })}>
        به‌روزرسانی
      </Button>
    </div>
  );
}
