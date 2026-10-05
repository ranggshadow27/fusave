"use client";

import { useState, useEffect, useTransition } from "react"; // <-- Import useTransition
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addTransaction } from "@/app/(dashboard)/actions";
import { PlusSignIcon, Calendar01Icon } from "hugeicons-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner"; // <-- Import toast dari sonner

export function TransactionDialog({
  wallets,
  categories,
}: {
  wallets: any[];
  categories: any[];
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("expense");
  const [isPending, startTransition] = useTransition(); // <-- Hook transisi untuk loading state

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [selectedWallet, setSelectedWallet] = useState(wallets[0]?.id || "");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    if (open) {
      const now = new Date();
      setSelectedDate(now);
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setSelectedTime(`${hours}:${minutes}`);

      if (wallets.length > 0) setSelectedWallet(wallets[0].id);
    }
  }, [open, wallets]);

  const filteredCategories = categories.filter((c) => c.type === type);
  useEffect(() => {
    if (filteredCategories.length > 0) {
      setSelectedCategory(filteredCategories[0].id);
    } else {
      setSelectedCategory("");
    }
  }, [type, categories]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    formData.append("type", type);
    formData.append("wallet_id", selectedWallet);
    formData.append("category_id", selectedCategory);

    if (selectedDate) {
      const [hours, minutes] = selectedTime.split(":");
      const combinedDate = new Date(selectedDate);
      combinedDate.setHours(parseInt(hours || "0", 10));
      combinedDate.setMinutes(parseInt(minutes || "0", 10));

      formData.set("transaction_date", combinedDate.toISOString());
    }

    // Bungkus dengan startTransition agar isPending bernilai true saat server action berjalan
    startTransition(async () => {
      const result = await addTransaction(formData);

      if (result?.error) {
        toast.error("Gagal menyimpan transaksi: " + result.error);
      } else {
        toast.success("Transaksi berhasil dicatat!");
        setOpen(false); // Tutup dialog hanya jika sukses
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (isOpen) setOpen(true);
        else setOpen(false);
      }}
    >
      <DialogTrigger className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 cursor-pointer">
        <PlusSignIcon size={28} />
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Catat Transaksi</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="expense" onValueChange={setType} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="expense"
              className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-700 cursor-pointer"
            >
              Pengeluaran
            </TabsTrigger>
            <TabsTrigger
              value="income"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 cursor-pointer"
            >
              Pemasukan
            </TabsTrigger>
          </TabsList>

          {/* Gunakan onSubmit biasa agar kita bisa kontrol via startTransition */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>Nominal</Label>
              <CurrencyInput name="amount" autoComplete="off" required />
            </div>

            <div className="space-y-2">
              <Label>Waktu Transaksi</Label>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-3">
                  <Popover
                    open={isCalendarOpen}
                    onOpenChange={setIsCalendarOpen}
                  >
                    <PopoverTrigger className="inline-flex h-10 w-full items-center justify-start rounded-md border border-zinc-200 bg-transparent px-3 text-sm font-medium shadow-sm transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
                      <Calendar01Icon
                        size={18}
                        className="mr-2 text-zinc-500 shrink-0"
                      />
                      <span className="truncate">
                        {selectedDate
                          ? format(selectedDate, "dd MMM yyyy", { locale: id })
                          : "Pilih tanggal"}
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          if (date) {
                            setSelectedDate(date);
                            setIsCalendarOpen(false);
                          }
                        }}
                        defaultMonth={selectedDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dompet</Label>
                <Select
                  value={selectedWallet}
                  onValueChange={(val) => setSelectedWallet(val || "")}
                >
                  <SelectTrigger className="w-full cursor-pointer">
                    <span>
                      {wallets.find((w) => w.id === selectedWallet)?.name ||
                        "Pilih dompet"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((w) => (
                      <SelectItem
                        key={w.id}
                        value={w.id}
                        className="cursor-pointer"
                      >
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(val) => setSelectedCategory(val || "")}
                >
                  <SelectTrigger className="w-full cursor-pointer">
                    <span>
                      {filteredCategories.find((c) => c.id === selectedCategory)
                        ?.name || "Pilih kategori"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((c) => (
                      <SelectItem
                        key={c.id}
                        value={c.id}
                        className="cursor-pointer"
                      >
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Catatan (Opsional)</Label>
              <Input
                name="notes"
                placeholder="Misal: Makan siang"
                autoComplete="off"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer active:scale-[0.98] disabled:opacity-75 flex items-center gap-2"
              >
                {isPending ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Simpan Transaksi</span>
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
