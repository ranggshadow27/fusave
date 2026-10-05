"use client";

import { useState, useEffect } from "react";
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
import { PlusSignIcon, Calendar01Icon, Clock01Icon } from "hugeicons-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export function TransactionDialog({
  wallets,
  categories,
}: {
  wallets: any[];
  categories: any[];
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("expense");

  // State untuk Tanggal & Waktu terpisah agar mudah diatur
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [selectedWallet, setSelectedWallet] = useState(wallets[0]?.id || "");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    if (open) {
      const now = new Date();
      setSelectedDate(now);
      // Ambil jam dan menit saat ini (format HH:mm)
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

  const handleSubmit = async (formData: FormData) => {
    formData.append("type", type);
    formData.append("wallet_id", selectedWallet);
    formData.append("category_id", selectedCategory);

    // Gabungkan tanggal yang dipilih dari kalender dengan jam yang dipilih
    if (selectedDate) {
      const [hours, minutes] = selectedTime.split(":");
      const combinedDate = new Date(selectedDate);
      combinedDate.setHours(parseInt(hours || "0", 10));
      combinedDate.setMinutes(parseInt(minutes || "0", 10));

      formData.set("transaction_date", combinedDate.toISOString());
    }

    await addTransaction(formData);
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (isOpen) setOpen(true);
      }}
    >
      <DialogTrigger className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
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
              className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-700"
            >
              Pengeluaran
            </TabsTrigger>
            <TabsTrigger
              value="income"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700"
            >
              Pemasukan
            </TabsTrigger>
          </TabsList>

          <form action={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>Nominal</Label>
              <CurrencyInput name="amount" autoComplete="off" required />
            </div>

            {/* WAKTU TRANSAKSI MENGGUNAKAN KALENDER & JAM SHADCN */}
            <div className="space-y-2">
              <Label>Waktu Transaksi</Label>
              <div className="grid grid-cols-3 gap-2">
                {/* Popover Kalender */}
                <div className="col-span-2">
                  <Popover
                    open={isCalendarOpen}
                    onOpenChange={setIsCalendarOpen}
                  >
                    <PopoverTrigger className="inline-flex h-10 w-full items-center justify-start rounded-md border border-zinc-200 bg-transparent px-3 text-sm font-medium shadow-sm transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800">
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

                {/* Input Jam Manual */}
                {/* <div className="col-span-1 relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                    <Clock01Icon size={16} />
                  </div>
                  <Input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="pl-9 h-10 text-xs dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
                    required
                  />
                </div> */}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* DOMPET SELECT SHADCN */}
              <div className="space-y-2">
                <Label>Dompet</Label>
                <Select
                  value={selectedWallet}
                  onValueChange={(val) => setSelectedWallet(val || "")}
                >
                  <SelectTrigger className="w-full">
                    <span>
                      {wallets.find((w) => w.id === selectedWallet)?.name ||
                        "Pilih dompet"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* KATEGORI SELECT SHADCN */}
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(val) => setSelectedCategory(val || "")}
                >
                  <SelectTrigger className="w-full">
                    <span>
                      {filteredCategories.find((c) => c.id === selectedCategory)
                        ?.name || "Pilih kategori"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
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
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Simpan Transaksi
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
