"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export function CategoryForm() {
  const [mounted, setMounted] = useState(false);
  const [type, setType] = useState("Pengeluaran");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Pastikan komponen hanya aktif setelah sukses dimuat di client
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setLoading(true);
    const supabase = createClient();
    await supabase.from("categories").insert([{ name, type }]);

    setName("");
    setLoading(false);
    router.refresh();
  };

  // Jika belum mounted, render skeleton/placeholder sederhana agar HTML server & client identik
  if (!mounted) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="h-10 rounded-md bg-zinc-100 dark:bg-zinc-800 animate-pulse sm:col-span-1" />
        <div className="h-10 rounded-md bg-zinc-100 dark:bg-zinc-800 animate-pulse sm:col-span-1" />
        <div className="h-10 rounded-md bg-zinc-100 dark:bg-zinc-800 animate-pulse sm:col-span-1" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleAddCategory}
      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
    >
      <div className="sm:col-span-1">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama Kategori"
          autoComplete="off"
          required
        />
      </div>
      <div className="sm:col-span-1">
        <Select
          value={type}
          onValueChange={(val) => setType(val || "Pengeluaran")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pengeluaran">Pengeluaran</SelectItem>
            <SelectItem value="Pemasukan">Pemasukan</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="sm:col-span-1">
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? "Menyimpan..." : "Tambah"}
        </Button>
      </div>
    </form>
  );
}
