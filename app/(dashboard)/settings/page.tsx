import { createClient } from "@/utils/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ComputerIcon,
  Wallet01Icon,
  Tag01Icon,
  Delete01Icon,
} from "hugeicons-react";
import { revalidatePath } from "next/cache";
import { CurrencyInput } from "@/components/ui/currency-input";
import { formatRupiah } from "@/utils/format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select dari Shadcn

// === SERVER ACTIONS ===

async function addWallet(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const rawBalance = formData.get("balance") as string;

  // Bersihkan format titik
  const cleanBalance = Number(rawBalance.replace(/\./g, ""));
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase
      .from("wallets")
      .insert([{ name, balance: cleanBalance, user_id: user.id }]);
    revalidatePath("/settings");
  }
}

async function deleteWallet(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = formData.get("id") as string;

  await supabase.from("wallets").delete().eq("id", id);
  revalidatePath("/settings");
}

async function addCategory(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const icon = formData.get("icon") as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase
      .from("categories")
      .insert([{ name, type, icon, user_id: user.id }]);
    revalidatePath("/settings");
  }
}

async function deleteCategory(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = formData.get("id") as string;

  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/settings");
}

// === PAGE COMPONENT ===

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: wallets } = await supabase
    .from("wallets")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Pengaturan Master Data
        </h1>
        <p className="text-sm text-zinc-500">
          Kelola preferensi, sumber dana, dan kategori transaksi Anda di sini.
        </p>
      </div>

      {/* 1. PREFERENSI TAMPILAN (Full Width) */}
      <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <ComputerIcon size={20} />
            </div>
            <div>
              <CardTitle className="text-base">Tampilan & Tema</CardTitle>
              <CardDescription>
                Sesuaikan mode warna antarmuka Fusave
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-4">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Pilih Mode Tema
          </span>
          <ThemeToggle />
        </CardContent>
      </Card>

      {/* 2. GRID 2 KOLOM (Dompet & Kategori) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* === KARTU DOMPET === */}
        <Card className="shadow-sm border-zinc-200 dark:border-zinc-800 flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Wallet01Icon size={20} />
              </div>
              <div>
                <CardTitle className="text-base">
                  Dompet / Sumber Dana
                </CardTitle>
              </div>
            </div>
            <CardDescription>
              Tambahkan rekening bank atau dompet fisik.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 flex-1 flex flex-col">
            <form action={addWallet} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wallet-name">Nama Dompet</Label>
                <Input
                  id="wallet-name"
                  name="name"
                  placeholder="Misal: BCA, Gopay"
                  autoComplete="off"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wallet-balance">Saldo Awal</Label>
                <CurrencyInput
                  id="wallet-balance"
                  name="balance"
                  placeholder="0"
                  autoComplete="off"
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

            <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800 flex-1">
              <h4 className="mb-3 text-sm font-semibold">
                Daftar Dompet Anda:
              </h4>
              <ul className="space-y-2 text-sm">
                {wallets?.map((w) => (
                  <li
                    key={w.id}
                    className="flex items-center justify-between rounded-md bg-zinc-50 border border-zinc-100 p-2 dark:bg-zinc-900 dark:border-zinc-800"
                  >
                    <div>
                      <span className="font-medium">{w.name}</span>
                      <p
                        className="text-xs text-zinc-500 font-medium"
                        suppressHydrationWarning
                      >
                        {formatRupiah(Number(w.balance))}
                      </p>
                    </div>
                    <form action={deleteWallet}>
                      <input type="hidden" name="id" value={w.id} />
                      <button
                        type="submit"
                        className="text-zinc-400 hover:text-rose-600 p-1 transition-colors"
                      >
                        <Delete01Icon size={16} />
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
        <Card className="shadow-sm border-zinc-200 dark:border-zinc-800 flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Tag01Icon size={20} />
              </div>
              <div>
                <CardTitle className="text-base">Kategori Transaksi</CardTitle>
              </div>
            </div>
            <CardDescription>
              Kelompokkan pengeluaran & pemasukan.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 flex-1 flex flex-col">
            <form action={addCategory} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cat-name">Nama Kategori</Label>
                <Input
                  id="cat-name"
                  name="name"
                  placeholder="Misal: Makan, Gaji"
                  autoComplete="off"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cat-type">Tipe</Label>
                  {/* SHADCN SELECT DENGAN ATRIBUT NAME */}
                  <Select name="type">
                    <SelectTrigger id="cat-type" className="w-full">
                      <SelectValue placeholder="Pilih Tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Pengeluaran</SelectItem>
                      <SelectItem value="income">Pemasukan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cat-icon">Ikon</Label>
                  <Select name="icon">
                    <SelectTrigger id="cat-icon" className="w-full">
                      <SelectValue placeholder="Pilih Ikon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">Makanan</SelectItem>
                      <SelectItem value="transport">Transportasi</SelectItem>
                      <SelectItem value="shopping">Belanja</SelectItem>
                      <SelectItem value="salary">Gaji / Uang Masuk</SelectItem>
                      <SelectItem value="bill">Tagihan</SelectItem>
                      <SelectItem value="other">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Tambah Kategori
              </Button>
            </form>

            <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800 flex-1">
              <h4 className="mb-3 text-sm font-semibold">
                Daftar Kategori Anda:
              </h4>
              <ul className="space-y-2 text-sm">
                {categories?.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-md bg-zinc-50 border border-zinc-100 p-2 dark:bg-zinc-900 dark:border-zinc-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{c.name}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.type === "income" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"}`}
                      >
                        {c.type === "income" ? "Masuk" : "Keluar"}
                      </span>
                    </div>
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={c.id} />
                      <button
                        type="submit"
                        className="text-zinc-400 hover:text-rose-600 p-1 transition-colors"
                      >
                        <Delete01Icon size={16} />
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
