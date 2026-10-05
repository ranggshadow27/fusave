"use client";

import { useState } from "react";
import { formatRupiah } from "@/utils/format";
import { ArrowDown01Icon, ArrowUp01Icon, Wallet01Icon } from "hugeicons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteTransaction } from "@/app/(dashboard)/actions";

const formatDate = (dateString: string) => {
  if (!dateString) return "-";

  // Pastikan string waktu dibersihkan agar aman diparsing browser
  const date = new Date(dateString);

  if (isNaN(date.getTime())) return "-";

  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export function TransactionList({ transactions }: { transactions: any[] }) {
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mb-3">
          <Wallet01Icon size={24} />
        </div>
        <p className="text-sm text-zinc-500">Belum ada transaksi.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {transactions.map((tx) => {
          const cat = tx.category as any;
          const wallet = tx.wallet as any;
          // Mengambil nama user (asumsi tabel direlasikan sebagai 'profiles')
          const creatorName =
            tx.profiles?.email?.split("@")[0] ||
            tx.profiles?.full_name ||
            "User";

          return (
            <div
              key={tx.id}
              onClick={() => setSelectedTx(tx)}
              className="flex cursor-pointer items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-zinc-100 transition-all hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800/80"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    tx.type === "income"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-rose-100 text-rose-600"
                  }`}
                >
                  {tx.type === "income" ? (
                    <ArrowDown01Icon size={20} />
                  ) : (
                    <ArrowUp01Icon size={20} />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {cat?.name || "Tanpa Kategori"}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {wallet?.name} • {formatDate(tx.transaction_date)} • Oleh:{" "}
                    <span className="capitalize">{creatorName}</span>
                  </p>
                  {tx.notes && (
                    <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-[150px]">
                      {tx.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right flex flex-col items-end gap-1 shrink-0 ml-4">
                <span
                  className={`font-bold tracking-tight ${
                    tx.type === "income"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-400 dark:text-gray-600"
                  }`}
                >
                  {tx.type === "income" ? "+" : "- "}
                  {formatRupiah(tx.amount)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog
        open={!!selectedTx}
        onOpenChange={(open) => !open && setSelectedTx(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
          </DialogHeader>

          {selectedTx && (
            <div className="space-y-6 pt-4">
              <div className="flex flex-col items-center justify-center space-y-2 text-center border-b border-zinc-100 dark:border-zinc-800 pb-6">
                <span className="text-sm text-zinc-500">Nominal</span>
                <span
                  className={`text-4xl font-bold tracking-tight ${
                    selectedTx.type === "income"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-400 dark:text-gray-600"
                  }`}
                >
                  {selectedTx.type === "income" ? "+" : "- "}
                  {formatRupiah(selectedTx.amount)}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Kategori</span>
                  <span className="font-medium">
                    {(selectedTx.category as any)?.name || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Sumber Dana</span>
                  <span className="font-medium">
                    {(selectedTx.wallet as any)?.name || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tanggal</span>
                  <span className="font-medium">
                    {formatDate(selectedTx.transaction_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Dibuat Oleh</span>
                  <span className="font-medium capitalize">
                    {selectedTx.profiles?.email?.split("@")[0] ||
                      selectedTx.profiles?.full_name ||
                      "User"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Catatan</span>
                  <span className="font-medium text-right max-w-[200px]">
                    {selectedTx.notes || "-"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <form
                  action={async (formData) => {
                    await deleteTransaction(formData);
                    setSelectedTx(null);
                  }}
                >
                  <input type="hidden" name="id" value={selectedTx.id} />
                  <Button
                    type="submit"
                    variant="destructive"
                    className="bg-rose-100 text-rose-700 hover:bg-rose-200 hover:text-rose-800 dark:bg-rose-900/30 dark:hover:bg-rose-900/50"
                  >
                    Hapus Data
                  </Button>
                </form>

                <Button variant="outline" onClick={() => setSelectedTx(null)}>
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
