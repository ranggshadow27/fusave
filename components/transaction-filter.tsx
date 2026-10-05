"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Search01Icon,
  FilterIcon,
  Refresh01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "hugeicons-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

interface FilterProps {
  totalPages: number;
  currentPage: number;
}

export function TransactionFilter({ totalPages, currentPage }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [date, setDate] = useState<DateRange | undefined>({
    from: searchParams.get("start")
      ? new Date(searchParams.get("start") as string)
      : undefined,
    to: searchParams.get("end")
      ? new Date(searchParams.get("end") as string)
      : undefined,
  });

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const applyFilters = (newSearch?: string) => {
    const params = new URLSearchParams();

    const searchValue = newSearch !== undefined ? newSearch : search;
    if (searchValue) params.set("search", searchValue);
    if (type) params.set("type", type);
    if (date?.from) params.set("start", format(date.from, "yyyy-MM-dd"));
    if (date?.to) params.set("end", format(date.to, "yyyy-MM-dd"));

    params.set("page", "1");

    router.push(`/transactions?${params.toString()}`);
    setIsPopoverOpen(false);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search !== (searchParams.get("search") || "")) {
        applyFilters(search);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleReset = () => {
    setSearch("");
    setType("");
    setDate(undefined);
    router.push("/transactions");
  };

  // --- LOGIKA ACTIVE BADGES ---
  const activeSearch = searchParams.get("search");
  const activeType = searchParams.get("type");
  const activeStart = searchParams.get("start");
  const activeEnd = searchParams.get("end");

  const activeBadges = [];
  if (activeSearch) activeBadges.push(`Pencarian: "${activeSearch}"`);
  if (activeType === "income") activeBadges.push("Pemasukan");
  if (activeType === "expense") activeBadges.push("Pengeluaran");

  const formatFilterDate = (dString: string) => {
    return new Date(dString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (activeStart && activeEnd) {
    activeBadges.push(
      `${formatFilterDate(activeStart)} - ${formatFilterDate(activeEnd)}`,
    );
  } else if (activeStart) {
    activeBadges.push(`Sejak ${formatFilterDate(activeStart)}`);
  } else if (activeEnd) {
    activeBadges.push(`Hingga ${formatFilterDate(activeEnd)}`);
  }

  // --- LOGIKA GENERATE ANGKA PAGINATION ---
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        );
      }
    }
    return pages;
  };

  const changePage = (pageNumber: number | string) => {
    if (pageNumber === "...") return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    router.push(`/transactions?${params.toString()}`);
  };

  const selectStyle =
    "flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:focus-visible:ring-zinc-300";

  return (
    <div className="space-y-4">
      {/* BARIS UTAMA: Search & Actions */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search01Icon
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            size={18}
          />
          <Input
            placeholder="Cari catatan, kategori, atau dompet..."
            className="pl-10 h-10 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-transparent px-3 text-sm font-medium shadow-sm transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 relative">
            <FilterIcon
              size={20}
              className="sm:mr-2 text-zinc-600 dark:text-zinc-400"
            />
            <span className="hidden sm:inline font-medium">Filter</span>
            {(type || date?.from) && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3 rounded-full bg-blue-600"></span>
            )}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipe Transaksi</Label>
                <select
                  className={selectStyle}
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="">Semua Tipe</option>
                  <option value="income">Pemasukan</option>
                  <option value="expense">Pengeluaran</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Rentang Tanggal</Label>
                <div className="rounded-md border border-zinc-200 dark:border-zinc-800 p-2">
                  <Calendar
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={1}
                  />
                </div>
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => applyFilters()}
              >
                Terapkan Filter
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {activeBadges.length > 0 && (
          <Button
            variant="ghost"
            className="h-10 px-3 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            onClick={handleReset}
          >
            <Refresh01Icon size={20} className="sm:mr-2" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        )}
      </div>

      {/* INDIKATOR FILTER AKTIF */}
      {activeBadges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-sm text-zinc-500">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Menampilkan hasil untuk:
          </span>
          {activeBadges.map((badge, index) => (
            <span
              key={index}
              className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            >
              {badge}
            </span>
          ))}
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 text-center sm:text-left">
            Menampilkan halaman{" "}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {currentPage}
            </span>{" "}
            dari{" "}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {totalPages}
            </span>
          </p>

          <div className="flex items-center justify-center gap-1">
            {/* Tombol Sebelumnya */}
            <button
              disabled={currentPage <= 1}
              onClick={() => changePage(currentPage - 1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-transparent text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:pointer-events-none disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 sm:w-auto sm:px-3 sm:py-1 sm:text-xs"
            >
              <ArrowLeft01Icon size={16} className="sm:mr-1" />
              <span className="hidden sm:inline font-medium">Sebelumnnya</span>
            </button>

            {/* Deretan Angka Halaman */}
            <div className="flex items-center gap-1 px-2">
              {getPageNumbers().map((num, idx) => (
                <button
                  key={idx}
                  onClick={() => changePage(num)}
                  disabled={num === "..."}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors ${
                    num === currentPage
                      ? "bg-blue-600 font-semibold text-white hover:bg-blue-700 shadow-sm"
                      : num === "..."
                        ? "cursor-default text-zinc-400 dark:text-zinc-600"
                        : "font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Tombol Selanjutnya */}
            <button
              disabled={currentPage >= totalPages}
              onClick={() => changePage(currentPage + 1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-transparent text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:pointer-events-none disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 sm:w-auto sm:px-3 sm:py-1 sm:text-xs"
            >
              <span className="hidden sm:inline font-medium">Selanjutnya</span>
              <ArrowRight01Icon size={16} className="sm:ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
