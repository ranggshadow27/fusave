"use client";

import { useEffect } from "react";
import { Tick02Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

export function ToastAlert({ message, type = "success", onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Hilang otomatis setelah 4 detik
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-2xl bg-zinc-900 px-4 py-3 text-white shadow-2xl ring-1 ring-white/10 dark:bg-zinc-100 dark:text-zinc-900 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full ${
          type === "success"
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-rose-500/20 text-rose-400"
        }`}
      >
        <HugeiconsIcon
          icon={type === "success" ? Tick02Icon : Cancel01Icon}
          size={16}
          strokeWidth={2.5}
        />
      </div>
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-zinc-400 hover:text-white dark:hover:text-zinc-900 cursor-pointer"
      >
        <HugeiconsIcon icon={Cancel01Icon} size={14} />
      </button>
    </div>
  );
}
