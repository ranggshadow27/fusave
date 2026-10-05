import { createClient } from "@/utils/supabase/server";
import { cache } from "react";

// Menggunakan React cache agar data dompet tidak dipanggil berulang-ulang kali dalam 1 render page
export const getCachedWallets = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("wallets")
    .select("*")
    .order("balance", { ascending: false });
  return data || [];
});

export const getCachedCategories = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
});
