import { createClient } from "@/utils/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ExpenseChart } from "@/components/expense-chart";
import { TrendChart } from "@/components/trend-chart";
import { formatRupiah } from "@/utils/format";
import { AnalyticsFilter } from "@/components/analytics-filter";
import { TrendFilter } from "@/components/trend-filter";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const supabase = await createClient();
  const params = await searchParams; // Next.js 15 requires awaiting searchParams

  // ==========================================
  // SECTION 1: DATA DISTRIBUSI PENGELUARAN
  // ==========================================
  const startDateParam = params.start;
  const endDateParam = params.end;

  let startIso, endIso;
  let dateTitle = "Bulan Ini";

  if (startDateParam && endDateParam) {
    startIso = `${startDateParam}T00:00:00`;
    endIso = `${endDateParam}T23:59:59`;
    const formatD = (d: string) =>
      new Date(d).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    dateTitle = `${formatD(startDateParam)} - ${formatD(endDateParam)}`;
  } else {
    const currentDate = new Date();
    startIso = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    ).toISOString();
    endIso = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    ).toISOString();
  }

  const { data: donutTransactions } = await supabase
    .from("transactions")
    .select(`amount, type, category:categories(name)`)
    .gte("transaction_date", startIso)
    .lte("transaction_date", endIso);

  let totalExpense = 0;
  const expenseByCategory: Record<string, number> = {};

  donutTransactions?.forEach((tx) => {
    if (tx.type === "expense") {
      const amount = Number(tx.amount);
      totalExpense += amount;
      const catName = (tx.category as any)?.name || "Tanpa Kategori";
      expenseByCategory[catName] = (expenseByCategory[catName] || 0) + amount;
    }
  });

  const donutData = Object.keys(expenseByCategory)
    .map((key) => ({ name: key, value: expenseByCategory[key] }))
    .sort((a, b) => b.value - a.value);

  // ==========================================
  // SECTION 2: DATA TREN KEUANGAN PER BULAN
  // ==========================================
  const trendStartParam = params.trend_start;
  const trendEndParam = params.trend_end;

  let trendStartIso, trendEndIso;
  let trendTitle = "6 Bulan Terakhir";

  if (trendStartParam && trendEndParam) {
    trendStartIso = `${trendStartParam}T00:00:00`;
    trendEndIso = `${trendEndParam}T23:59:59`;
    const formatD = (d: string) =>
      new Date(d).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    trendTitle = `${formatD(trendStartParam)} - ${formatD(trendEndParam)}`;
  } else {
    // Default 6 bulan terakhir
    const d = new Date();
    trendEndIso = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString();
    trendStartIso = new Date(
      d.getFullYear(),
      d.getMonth() - 5,
      1,
    ).toISOString();
  }

  const { data: trendTransactions } = await supabase
    .from("transactions")
    .select(`amount, type, transaction_date`)
    .gte("transaction_date", trendStartIso)
    .lte("transaction_date", trendEndIso)
    .order("transaction_date", { ascending: true });

  // Grouping per bulan (contoh: "Okt 2026")
  const monthlyData: Record<string, any> = {};

  trendTransactions?.forEach((tx) => {
    const d = new Date(tx.transaction_date);
    const monthKey = d.toLocaleString("id-ID", {
      month: "short",
      year: "numeric",
    }); // Label Tampilan
    const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; // Key Urutan Asli

    if (!monthlyData[sortKey]) {
      monthlyData[sortKey] = {
        name: monthKey,
        sortKey,
        income: 0,
        expense: 0,
        profit: 0,
      };
    }

    const amount = Number(tx.amount);
    if (tx.type === "income") monthlyData[sortKey].income += amount;
    if (tx.type === "expense") monthlyData[sortKey].expense += amount;

    // Kalkulasi Profit
    monthlyData[sortKey].profit =
      monthlyData[sortKey].income - monthlyData[sortKey].expense;
  });

  // Konversi object ke array dan urutkan berdasarkan sortKey (Tahun-Bulan)
  const trendChartData = Object.values(monthlyData).sort((a, b) =>
    a.sortKey.localeCompare(b.sortKey),
  );

  return (
    <div className="space-y-12 pb-10">
      {/* ========================================== */}
      {/* SECTION 1: DISTRIBUSI KATEGORI */}
      {/* ========================================== */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Analitik
            </h1>
            <p className="text-sm text-zinc-500">
              Peta pengeluaran Anda untuk periode{" "}
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {dateTitle}
              </span>
              .
            </p>
          </div>
          <AnalyticsFilter />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Kartu Grafik Donut */}
          <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle>Distribusi Pengeluaran</CardTitle>
              <CardDescription>
                Berdasarkan kategori yang dipilih
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseChart data={donutData} />
            </CardContent>
          </Card>

          {/* Kartu Ringkasan Teks & Progress Bar */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Rincian Terbesar</CardTitle>
              <CardDescription>
                Kategori yang paling banyak menyedot saldo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-rose-600 mb-6">
                {formatRupiah(totalExpense)}
                <span className="block text-sm font-normal text-zinc-500 mt-1">
                  Total Keluar Periode Ini
                </span>
              </div>

              <div className="space-y-4">
                {donutData.length === 0 ? (
                  <p className="text-sm text-zinc-500">
                    Belum ada pengeluaran di periode ini.
                  </p>
                ) : (
                  donutData.map((item, index) => {
                    const percentage =
                      totalExpense > 0
                        ? ((item.value / totalExpense) * 100).toFixed(1)
                        : 0;

                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {item.name}
                          </span>
                          <span className="font-bold">
                            {formatRupiah(item.value)}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <hr className="border-zinc-200 dark:border-zinc-800/80" />

      {/* ========================================== */}
      {/* SECTION 2: TREND BALANCE & PROFIT */}
      {/* ========================================== */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Tren Saldo & Profitabilitas
            </h2>
            <p className="text-sm text-zinc-500">
              Rasio pemasukan terhadap pengeluaran untuk periode{" "}
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {trendTitle}
              </span>
              .
            </p>
          </div>
          {/* Tombol Filter Terpisah Khusus Tren */}
          <TrendFilter />
        </div>

        <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle>Arus Kas Bulanan</CardTitle>
            <CardDescription>
              Pantau pergerakan profit dan defisit Anda secara keseluruhan.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <TrendChart data={trendChartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
