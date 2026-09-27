"use client";

import { CheckCircle2Icon, TriangleAlertIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";

type Flash = { tone: "success" | "danger"; text: string };

/** Short-lived status message ("saved", "failed") shown at the top of the screen. */
export function useFlash(duration = 3000) {
  const [flash, setFlash] = useState<Flash | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback(
    (tone: Flash["tone"], text: string) => {
      clearTimeout(timer.current);
      setFlash({ tone, text });
      timer.current = setTimeout(() => setFlash(null), duration);
    },
    [duration],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  const element = flash && (
    <div
      role="status"
      className={cn(
        "fixed inset-x-4 top-20 z-50 mx-auto flex max-w-md items-center gap-3 rounded-(--radius-card) p-4 font-semibold text-white shadow-lg",
        flash.tone === "success" ? "bg-success" : "bg-danger",
      )}
    >
      {flash.tone === "success" ? (
        <CheckCircle2Icon className="size-6 shrink-0" />
      ) : (
        <TriangleAlertIcon className="size-6 shrink-0" />
      )}
      {flash.text}
    </div>
  );

  return { show, element };
}
