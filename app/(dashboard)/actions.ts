"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addTransaction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const type = formData.get("type") as string; // 'expense' atau 'income'
  const amount = parseFloat(formData.get("amount") as string);
  const wallet_id = formData.get("wallet_id") as string;
  const category_id = formData.get("category_id") as string;
  const transaction_date = formData.get("transaction_date") as string;
  const notes = formData.get("notes") as string;

  // 1. Catat Transaksinya
  const { error: txError } = await supabase.from("transactions").insert({
    user_id: user.id,
    wallet_id,
    category_id,
    amount,
    type,
    transaction_date,
    notes,
  });

  if (txError) return { error: txError.message };

  // 2. Update Saldo Dompet (Kalkulasi Otomatis)
  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance")
    .eq("id", wallet_id)
    .single();

  if (wallet) {
    const currentBalance = Number(wallet.balance);
    const newBalance =
      type === "income" ? currentBalance + amount : currentBalance - amount;

    await supabase
      .from("wallets")
      .update({ balance: newBalance })
      .eq("id", wallet_id);
  }

  // Refresh semua halaman yang terpengaruh
  revalidatePath("/");
  revalidatePath("/profile");

  return { success: true };
}

export async function deleteTransaction(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  // 1. Ambil detail transaksi yang mau dihapus untuk tahu nominal & dompetnya
  const { data: tx } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .single();

  if (tx) {
    // 2. Ambil saldo dompet saat ini
    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("id", tx.wallet_id)
      .single();

    if (wallet) {
      const currentBalance = Number(wallet.balance);

      // 3. Kembalikan saldo (Refund)
      // Jika yang dihapus pengeluaran, uangnya balik (+). Jika pemasukan, uangnya ditarik (-).
      const newBalance =
        tx.type === "expense"
          ? currentBalance + Number(tx.amount)
          : currentBalance - Number(tx.amount);

      await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("id", tx.wallet_id);
    }
  }

  // 4. Hapus data transaksinya
  await supabase.from("transactions").delete().eq("id", id);

  revalidatePath("/");
  revalidatePath("/profile");
}
