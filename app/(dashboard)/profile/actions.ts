"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addWallet(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const name = formData.get("name") as string;
  const balance = parseFloat(formData.get("balance") as string) || 0;

  const { error } = await supabase.from("wallets").insert({
    user_id: user.id,
    name,
    balance,
  });

  // Munculkan error di terminal VS Code jika gagal
  if (error) console.error("Error Tambah Dompet:", error.message);

  revalidatePath("/profile");
}

export async function addCategory(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const icon = formData.get("icon") as string;

  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    name,
    type,
    icon,
  });

  // Munculkan error di terminal VS Code jika gagal
  if (error) console.error("Error Tambah Kategori:", error.message);

  revalidatePath("/profile");
}

// Tambahkan fungsi ini di dalam app/(dashboard)/profile/actions.ts

export async function deleteWallet(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  await supabase.from("wallets").delete().eq("id", id);
  revalidatePath("/profile");
}

export async function deleteCategory(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/profile");
}
