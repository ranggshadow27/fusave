"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Wallet01Icon, Tag01Icon } from "hugeicons-react";

// Server action wrapper (atau import langsung dari actions)
interface SettingsFormsProps {
  addWalletAction: (formData: FormData) => Promise<{ error?: string } | void>;
  addCategoryAction: (formData: FormData) => Promise<{ error?: string } | void>;
}

export function WalletForm({
  addWalletAction,
}: {
  addWalletAction: (formData: FormData) => Promise<any>;
}) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nama dompet tidak boleh kosong!");
      return;
    }
    if (!balance.trim()) {
      toast.error("Saldo awal wajib diisi!");
      return;
    }

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await addWalletAction(formData);
      if (result?.error) {
        toast.error("Gagal menambah dompet: " + result.error);
      } else {
        toast.success("Dompet berhasil ditambahkan!");
        setName("");
        setBalance("");
        // Hapus baris e.currentTarget.reset() di sini agar tidak error!
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="wallet-name">Nama Dompet</Label>
        <Input
          id="wallet-name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Misal: BCA, Gopay"
          autoComplete="off"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="wallet-balance">Saldo Awal</Label>
        <CurrencyInput
          id="wallet-balance"
          name="balance"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          placeholder="0"
          autoComplete="off"
        />
      </div>
      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-[0.98] disabled:opacity-75 flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
            <span>Menambahkan...</span>
          </>
        ) : (
          <span>Tambah Dompet</span>
        )}
      </Button>
    </form>
  );
}

export function CategoryFormClient({
  addCategoryAction,
}: {
  addCategoryAction: (formData: FormData) => Promise<any>;
}) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [icon, setIcon] = useState("food");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nama kategori tidak boleh kosong!");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("icon", icon);

    startTransition(async () => {
      const result = await addCategoryAction(formData);
      if (result?.error) {
        toast.error("Gagal menambah kategori: " + result.error);
      } else {
        toast.success("Kategori berhasil ditambahkan!");
        setName("");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cat-name">Nama Kategori</Label>
        <Input
          id="cat-name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Misal: Makan, Gaji"
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cat-type">Tipe</Label>
          {/* Bungkus dengan fungsi untuk menangani potensi nilai null */}
          <Select
            value={type}
            onValueChange={(val) => {
              if (val) setType(val);
            }}
          >
            <SelectTrigger id="cat-type" className="w-full cursor-pointer">
              <SelectValue placeholder="Pilih Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense" className="cursor-pointer">
                Pengeluaran
              </SelectItem>
              <SelectItem value="income" className="cursor-pointer">
                Pemasukan
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cat-icon">Ikon</Label>
          {/* Bungkus dengan fungsi untuk menangani potensi nilai null */}
          <Select
            value={icon}
            onValueChange={(val) => {
              if (val) setIcon(val);
            }}
          >
            <SelectTrigger id="cat-icon" className="w-full cursor-pointer">
              <SelectValue placeholder="Pilih Ikon" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="food" className="cursor-pointer">
                Makanan
              </SelectItem>
              <SelectItem value="transport" className="cursor-pointer">
                Transportasi
              </SelectItem>
              <SelectItem value="shopping" className="cursor-pointer">
                Belanja
              </SelectItem>
              <SelectItem value="salary" className="cursor-pointer">
                Gaji / Masuk
              </SelectItem>
              <SelectItem value="bill" className="cursor-pointer">
                Tagihan
              </SelectItem>
              <SelectItem value="other" className="cursor-pointer">
                Lainnya
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-[0.98] disabled:opacity-75 flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
            <span>Menambahkan...</span>
          </>
        ) : (
          <span>Tambah Kategori</span>
        )}
      </Button>
    </form>
  );
}
