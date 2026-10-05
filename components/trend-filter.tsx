"use client";

import * as React from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar01Icon } from "hugeicons-react";
import { DateRange } from "react-day-picker";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function TrendFilter({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Baca state dari URL jika ada
  const startParam = searchParams.get("trend_start");
  const endParam = searchParams.get("trend_end");

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startParam ? new Date(startParam) : undefined,
    to: endParam ? new Date(endParam) : undefined,
  });

  const handleSelect = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate);
    const params = new URLSearchParams(searchParams);

    if (selectedDate?.from) {
      params.set("trend_start", format(selectedDate.from, "yyyy-MM-dd"));
    } else {
      params.delete("trend_start");
    }

    if (selectedDate?.to) {
      params.set("trend_end", format(selectedDate.to, "yyyy-MM-dd"));
    } else {
      params.delete("trend_end");
    }

    // Push ke URL tanpa merefresh keseluruhan halaman
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        {/* Hapus asChild dan pindahkan styling tombol langsung ke PopoverTrigger */}
        <PopoverTrigger
          className={cn(
            "flex h-9 w-full sm:w-[260px] items-center justify-start rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm font-normal shadow-sm transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus-visible:ring-zinc-300",
            !date && "text-zinc-500 dark:text-zinc-400",
          )}
        >
          <Calendar01Icon size={16} className="mr-2 opacity-50 shrink-0" />
          <span className="truncate">
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "d MMM yyyy", { locale: id })} -{" "}
                  {format(date.to, "d MMM yyyy", { locale: id })}
                </>
              ) : (
                format(date.from, "d MMM yyyy", { locale: id })
              )
            ) : (
              "Pilih periode tren"
            )}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          {/* Hapus initialFocus agar TypeScript tidak protes */}
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
