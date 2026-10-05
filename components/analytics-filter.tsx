"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar01Icon } from "hugeicons-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

export function AnalyticsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeStart = searchParams.get("start");
  const activeEnd = searchParams.get("end");

  const [date, setDate] = useState<DateRange | undefined>({
    from: activeStart ? new Date(activeStart) : undefined,
    to: activeEnd ? new Date(activeEnd) : undefined,
  });

  const [isOpen, setIsOpen] = useState(false);

  const applyFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (date?.from) params.set("start", format(date.from, "yyyy-MM-dd"));
    else params.delete("start");

    if (date?.to) params.set("end", format(date.to, "yyyy-MM-dd"));
    else params.delete("end");

    router.push(`/analytics?${params.toString()}`);
    setIsOpen(false);
  };

  const resetFilter = () => {
    setDate(undefined);
    router.push("/analytics");
    setIsOpen(false);
  };

  let buttonText = "Bulan Ini";
  if (activeStart && activeEnd) {
    buttonText = `${format(new Date(activeStart), "dd MMM yyyy")} - ${format(new Date(activeEnd), "dd MMM yyyy")}`;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      {/* SOLUSI 1: Styling langsung di PopoverTrigger, buang asChild dan komponen <Button> */}
      <PopoverTrigger className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-200 bg-transparent px-3 text-sm font-medium shadow-sm transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-50">
        <Calendar01Icon size={18} className="mr-2 text-zinc-500" />
        <span>{buttonText}</span>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-4" align="end">
        <div className="space-y-4">
          <div className="rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
            <Calendar
              // SOLUSI 2: initialFocus dihapus dari sini
              mode="range"
              defaultMonth={date?.from || new Date()}
              selected={date}
              onSelect={setDate}
              numberOfMonths={1}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={applyFilter}
            >
              Terapkan Tanggal
            </Button>
            {activeStart && (
              <Button
                variant="ghost"
                className="w-full text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                onClick={resetFilter}
              >
                Kembali ke Bulan Ini
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
