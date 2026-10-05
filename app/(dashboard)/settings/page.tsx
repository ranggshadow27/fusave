import { createClient } from "@/utils/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ComputerIcon,
  Wallet01Icon,
  Tag01Icon,
  Delete01Icon,
  Logout01Icon,
} from "hugeicons-react";
import { revalidatePath } from "next/cache";
import { formatRupiah } from "@/utils/format";
import { ActionConfirm } from "@/components/action-confirm";
import { logout } from "@/app/login/actions";
import { WalletForm, CategoryFormClient } from "@/components/settings-forms"; // <-- Import form interaktif baru

// === SERVER ACTIONS ===

async function addWallet(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const rawBalance = formData.get("balance") as string;

  const cleanBalance = Number(rawBalance.replace(/\./g, ""));
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { error } = await supabase
      .from("wallets")
      .insert([{ name, balance: cleanBalance, user_id: user.id }]);

    if (error) return { error: error.message };
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
    const { error } = await supabase
      .from("categories")
      .insert([{ name, type, icon, user_id: user.id }]);

    if (error) return { error: error.message };
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

      {/* 1. PREFERENSI TAMPILAN */}
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
            {/* Menggunakan Form Klien Interaktif */}
            <WalletForm addWalletAction={addWallet} />

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
                    <ActionConfirm
                      title="Hapus Dompet?"
                      description={`Yakin ingin menghapus dompet "${w.name}"? Saldo dan data terkait mungkin akan terpengaruh.`}
                      triggerContent={<Delete01Icon size={16} />}
                      triggerClassName="text-zinc-400 hover:text-rose-600 p-1.5 transition-colors flex items-center justify-center rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                      action={deleteWallet}
                      idValue={w.id}
                      confirmText="Ya, Hapus Dompet"
                      successMessage="Dompet berhasil dihapus!"
                    />
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
            {/* Menggunakan Form Klien Interaktif */}
            <CategoryFormClient addCategoryAction={addCategory} />

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
                    <ActionConfirm
                      title="Hapus Kategori?"
                      description={`Yakin ingin menghapus kategori "${c.name}"?`}
                      triggerContent={<Delete01Icon size={16} />}
                      triggerClassName="text-zinc-400 hover:text-rose-600 p-1.5 transition-colors flex items-center justify-center rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                      action={deleteCategory}
                      idValue={c.id}
                      confirmText="Ya, Hapus Kategori"
                      successMessage="Kategori berhasil dihapus!"
                    />
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

      {/* 3. ZONA KELUAR AKUN */}
      <Card className="shadow-sm border-rose-200 bg-rose-50/50 dark:border-rose-900/30 dark:bg-rose-950/20 mt-8">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
          <div className="text-center sm:text-left">
            <h3 className="text-base font-semibold text-rose-700 dark:text-rose-400">
              Keluar dari Aplikasi
            </h3>
            <p className="text-sm text-rose-600/80 dark:text-rose-400/80 mt-1">
              Sesi Anda akan diakhiri secara aman.
            </p>
          </div>
          <ActionConfirm
            title="Keluar Akun?"
            description="Apakah Anda yakin ingin keluar dari aplikasi Fusave?"
            triggerContent={
              <>
                <Logout01Icon size={18} /> Keluar Akun
              </>
            }
            triggerClassName="w-full sm:w-auto flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white h-9 px-4 rounded-4xl text-sm font-medium transition-colors cursor-pointer"
            action={logout}
            confirmText="Ya, Keluar"
          />
        </CardContent>
      </Card>
    </div>
  );
}
