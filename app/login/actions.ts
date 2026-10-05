"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  // Catatan: Nilai 'remember' bisa diekstrak dari formData.get("remember")
  // Namun, @supabase/ssr secara default sudah menangani persistent session secara aman.
  // Keberadaan checkbox di UI lebih kepada UX standar (placebo/kenyamanan visual pengguna).

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login?error=Email atau password salah");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();

  // Hapus session dari Supabase (termasuk hapus cookies)
  await supabase.auth.signOut();

  // Revalidasi seluruh layout agar state UI kembali bersih
  revalidatePath("/", "layout");
  redirect("/login");
}
