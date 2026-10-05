import { createClient } from "@/utils/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  addWallet,
  addCategory,
  deleteWallet,
  deleteCategory,
} from "./actions";
import { Delete02Icon } from "hugeicons-react"; // Pastikan icon sesuai atau pakai lucide

// Fungsi helper global untuk format mata uang Rupiah
const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: wallets } = await supabase
    .from("wallets")
    .select("*")
    .order("created_at", { ascending: false });
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: false });

  const selectStyle =
    "flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:focus-visible:ring-zinc-300";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Pengaturan Master Data
        </h1>
        <p className="text-sm text-zinc-500">
          Kelola sumber dana dan kategori transaksi Anda di sini.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* === KARTU DOMPET === */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Dompet / Sumber Dana</CardTitle>
            <CardDescription>
              Tambahkan rekening atau dompet fisik Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form action={addWallet} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wallet-name">Nama Dompet</Label>
                <Input
                  id="wallet-name"
                  name="name"
                  placeholder="Misal: BCA, Gopay, Tunai"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wallet-balance">Saldo Awal</Label>
                {/* Menggunakan CurrencyInput agar otomatis berformat titik ribuan */}
                <CurrencyInput
                  id="wallet-balance"
                  name="balance"
                  placeholder="0"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Tambah Dompet
              </Button>
            </form>

            <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <h4 className="mb-3 text-sm font-semibold">
                Daftar Dompet Anda:
              </h4>
              <ul className="space-y-2 text-sm">
                {wallets?.map((w) => (
                  <li
                    key={w.id}
                    className="flex items-center justify-between rounded-md bg-zinc-50 p-2 dark:bg-zinc-900"
                  >
                    <div>
                      <span className="font-medium">{w.name}</span>
                      <p className="text-xs text-zinc-500">
                        {formatRupiah(w.balance)}
                      </p>
                    </div>
                    <form action={deleteWallet}>
                      <input type="hidden" name="id" value={w.id} />
                      <button
                        type="submit"
                        className="text-zinc-400 hover:text-rose-600 p-1"
                      >
                        Hapus
                      </button>
                    </form>
                  </li>
                ))}
                {wallets?.length === 0 && (
                  <p className="text-zinc-500 text-sm">Belum ada dompet.</p>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* === KARTU KATEGORI === */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Kategori Transaksi</CardTitle>
            <CardDescription>
              Kelompokkan pengeluaran & pemasukan Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form action={addCategory} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cat-name">Nama Kategori</Label>
                <Input
                  id="cat-name"
                  name="name"
                  placeholder="Misal: Makan, Gaji, Transport"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cat-type">Tipe</Label>
                  <select id="cat-type" name="type" className={selectStyle}>
                    <option value="expense">Pengeluaran</option>
                    <option value="income">Pemasukan</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-icon">Ikon</Label>
                  <select id="cat-icon" name="icon" className={selectStyle}>
                    <option value="food">Makanan</option>
                    <option value="transport">Transportasi</option>
                    <option value="shopping">Belanja</option>
                    <option value="salary">Gaji / Uang Masuk</option>
                    <option value="bill">Tagihan</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Tambah Kategori
              </Button>
            </form>

            <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <h4 className="mb-3 text-sm font-semibold">
                Daftar Kategori Anda:
              </h4>
              <ul className="space-y-2 text-sm">
                {categories?.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-md bg-zinc-50 p-2 dark:bg-zinc-900"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{c.name}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.type === "income" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                      >
                        {c.type === "income" ? "Masuk" : "Keluar"}
                      </span>
                    </div>
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={c.id} />
                      <button
                        type="submit"
                        className="text-zinc-400 hover:text-rose-600 p-1 text-xs"
                      >
                        Hapus
                      </button>
                    </form>
                  </li>
                ))}
                {categories?.length === 0 && (
                  <p className="text-zinc-500 text-sm">Belum ada kategori.</p>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
