import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionDialog } from "@/components/transaction-dialog";
import { formatRupiah } from "@/utils/format";
import { MonthlyTicker } from "@/components/monthly-ticker";
import Link from "next/link";
import { TransactionList } from "@/components/transaction-list";
import { Wallet01Icon } from "hugeicons-react";
// Import komponen Dialog Shadcn
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Ambil Profil User untuk Display Name
  let userDisplayName = "User";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    // Gunakan full_name jika ada, jika kosong fallback ke nama email
    userDisplayName = profile?.full_name || user.email?.split("@")[0] || "User";
  }

  // 2. Ambil data dompet (diurutkan berdasarkan saldo terbesar)
  const { data: wallets } = await supabase
    .from("wallets")
    .select("*")
    .order("balance", { ascending: false });

  const { data: categories } = await supabase.from("categories").select("*");

  const totalBalance =
    wallets?.reduce((sum, wallet) => sum + Number(wallet.balance), 0) || 0;

  // 3. Ambil transaksi 10 terakhir (disinkronkan dengan pesan penutup)
  const { data: transactions } = await supabase
    .from("transactions")
    .select(
      `
    *, 
    category:categories(name), 
    wallet:wallets(name),
    profiles(full_name) 
  `,
    )
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(10);

  // 4. Hitung pemasukan & pengeluaran khusus bulan ini
  const currentDate = new Date();
  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).toISOString();
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).toISOString();

  const { data: monthTx } = await supabase
    .from("transactions")
    .select("amount, type")
    .gte("transaction_date", startOfMonth)
    .lte("transaction_date", endOfMonth);

  let incomeMonth = 0;
  let expenseMonth = 0;

  monthTx?.forEach((tx) => {
    if (tx.type === "income") incomeMonth += Number(tx.amount);
    if (tx.type === "expense") expenseMonth += Number(tx.amount);
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Selamat datang kembali,
          </h2>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 capitalize">
            {userDisplayName}
          </h1>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800">
          <span className="text-sm font-bold text-blue-700 dark:text-blue-400 capitalize">
            {userDisplayName.charAt(0)}
          </span>
        </div>
      </header>

      {/* KARTU SALDO PREMIUM (Adaptive Light & Dark Mode) */}
      <Card className="relative overflow-hidden border shadow-xl transition-all duration-500 border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-zinc-100 dark:border-zinc-800 dark:from-zinc-950 dark:via-zinc-900 dark:to-black dark:shadow-2xl">
        {/* Efek Cahaya Aurora (Gradient Mesh Blur) */}
        {/* Light Mode: Pastel cerah | Dark Mode: Warna lebih pekat/gelap */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-500/30 dark:to-purple-600/30"></div>
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full blur-3xl bg-gradient-to-tr from-emerald-400/20 to-blue-400/20 dark:from-emerald-500/20 dark:to-blue-600/20"></div>

        {/* Tekstur Noise Opsional */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.02] dark:opacity-[0.04] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

        <CardHeader className="relative z-10 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-300">
              Total Saldo Aktif
            </CardTitle>

            {/* DIALOG RINCIAN DOMPET */}
            <Dialog>
              <DialogTrigger
                className="flex items-center justify-center rounded-full p-1.5 text-zinc-400 transition-all hover:bg-zinc-200/60 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                title="Lihat rincian dompet"
              >
                <Wallet01Icon size={20} />
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Rincian Saldo Dompet</DialogTitle>
                </DialogHeader>

                <div className="mt-4 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                  {wallets?.map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 p-3 shadow-sm transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <Wallet01Icon size={16} />
                        </div>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {w.name}
                        </span>
                      </div>
                      <span
                        className="font-bold tracking-tight text-zinc-900 dark:text-white"
                        suppressHydrationWarning
                      >
                        {formatRupiah(Number(w.balance))}
                      </span>
                    </div>
                  ))}

                  {(!wallets || wallets.length === 0) && (
                    <p className="text-center text-sm text-zinc-500 py-4">
                      Belum ada dompet terdaftar.
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="relative z-10">
          <div className="text-4xl font-extrabold tracking-tight drop-shadow-sm mb-6 text-zinc-900 dark:text-white">
            {formatRupiah(totalBalance)}
          </div>

          {/* Pembatas Tipis */}
          <div className="border-t border-zinc-200/80 pt-4 dark:border-white/10">
            <MonthlyTicker income={incomeMonth} expense={expenseMonth} />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Transaksi Terakhir
          </h3>
          <Link
            href="/transactions"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-zinc-100 hover:text-blue-700 dark:hover:bg-zinc-800"
          >
            Lihat Semua
          </Link>
        </div>

        {/* === CONTAINER SCROLL & FADE (Menggunakan CSS Masking) === */}
        <div
          className="max-h-[380px] overflow-y-auto pr-2 pb-8
          [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full 
          [&::-webkit-scrollbar-thumb]:bg-zinc-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-800"
          style={{
            // Teknik Masking: 85% ke atas solid, 15% kebawah memudar jadi transparan sempurna
            maskImage:
              "linear-gradient(to bottom, black 85%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 85%, transparent 100%)",
          }}
        >
          <TransactionList transactions={transactions || []} />

          {/* Pesan Penutup */}
          {transactions && transactions.length === 10 && (
            <div className="mt-6 text-center pb-4">
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Menampilkan 10 riwayat terbaru.
                <br className="sm:hidden" />
                Untuk histori lengkap, silakan akses menu{" "}
                <span className="font-medium text-blue-500">Lihat Semua</span>.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-20 right-4 z-50">
        <TransactionDialog
          wallets={wallets || []}
          categories={categories || []}
        />
      </div>
    </div>
  );
}
