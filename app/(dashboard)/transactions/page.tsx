import { createClient } from "@/utils/supabase/server";
import { TransactionList } from "@/components/transaction-list";
import { TransactionFilter } from "@/components/transaction-filter";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  const page = typeof params.page === "string" ? parseInt(params.page) : 1;
  const startDate = typeof params.start === "string" ? params.start : null;
  const endDate = typeof params.end === "string" ? params.end : null;
  const type = typeof params.type === "string" ? params.type : null;
  const search = typeof params.search === "string" ? params.search : null;

  const ITEMS_PER_PAGE = 5;
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  // Sesuaikan alias relasi agar cocok dengan transaction-list (categories dan wallets)
  let query = supabase.from("transactions").select(
    `
      *, 
      categories:categories(name), 
      wallets:wallets(name),
      profiles:profiles(full_name)
    `,
    { count: "exact" },
  );

  // === FILTER TANGGAL ===
  if (startDate) query = query.gte("transaction_date", `${startDate}T00:00:00`);
  if (endDate) query = query.lte("transaction_date", `${endDate}T23:59:59`);

  // === FILTER TIPE ===
  if (type) query = query.eq("type", type);

  // === GLOBAL SEARCH (Pencarian Dinamis Lintas Tabel) ===
  if (search) {
    const searchLower = search.toLowerCase();

    // 1. Cari ID Kategori yang namanya cocok
    const { data: cats } = await supabase
      .from("categories")
      .select("id")
      .ilike("name", `%${searchLower}%`);
    const catIds = cats?.map((c) => c.id).join(",") || "";

    // 2. Cari ID Dompet yang namanya cocok
    const { data: wals } = await supabase
      .from("wallets")
      .select("id")
      .ilike("name", `%${searchLower}%`);
    const walIds = wals?.map((w) => w.id).join(",") || "";

    // 3. Rakit Filter OR untuk Transaksi
    let orString = `notes.ilike.%${searchLower}%`;
    if (catIds) orString += `,category_id.in.(${catIds})`;
    if (walIds) orString += `,wallet_id.in.(${walIds})`;

    query = query.or(orString);
  }

  // === EKSEKUSI KUERI ===
  const { data: transactions, count } = await query
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalItems = count || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Riwayat Transaksi
        </h1>
        <p className="text-sm text-zinc-500">
          Seluruh jejak keuangan Anda tercatat di sini.
        </p>
      </div>

      <div className="space-y-6 rounded-xl bg-white p-4 shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
        {/* Render Komponen Filter UI */}
        <TransactionFilter totalPages={totalPages} currentPage={page} />

        {/* Render List Transaksi */}
        <TransactionList transactions={transactions || []} />
      </div>
    </div>
  );
}
