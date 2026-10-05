"use client";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Sun01Icon, Moon01Icon } from "hugeicons-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme("light")}
        className={`h-8 px-3 text-xs ${theme === "light" ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50" : "text-zinc-500"}`}
      >
        <Sun01Icon size={14} className="mr-1.5" /> Terang
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme("dark")}
        className={`h-8 px-3 text-xs ${theme === "dark" ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50" : "text-zinc-500"}`}
      >
        <Moon01Icon size={14} className="mr-1.5" /> Gelap
      </Button>
    </div>
  );
}
