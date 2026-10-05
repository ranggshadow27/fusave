"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteTransaction } from "@/app/(dashboard)/actions";
import { formatRupiah } from "@/utils/format";
import {
  ArrowDownLeft01Icon,
  ArrowUpRight01Icon,
  Calendar01Icon,
  Wallet01Icon,
  Tag01Icon,
  Note01Icon,
  Delete01Icon,
  UserIcon,
} from "hugeicons-react";
import { toast } from "sonner";

interface TransactionListProps {
  transactions: any[];
}

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  const safeDateString = dateString.replace(" ", "T");
  const date = new Date(safeDateString);

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

export function TransactionList({ transactions }: TransactionListProps) {
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Belum ada riwayat transaksi tercatat.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {transactions.map((tx) => {
          const isIncome = tx.type === "income";
          const authorName = tx.profiles?.full_name || "Pengguna";

          return (
            <div
              key={tx.id}
              onClick={() => {
                setSelectedTx(tx);
                setIsConfirming(false);
              }}
              className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-zinc-100 transition-all duration-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800/50 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    isIncome
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                      : "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
                  }`}
                >
                  {isIncome ? (
                    <ArrowDownLeft01Icon size={20} />
                  ) : (
                    <ArrowUpRight01Icon size={20} />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {tx.categories?.name || "Tanpa Kategori"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>{tx.wallets?.name || "Dompet"}</span>
                    <span>•</span>
                    <span suppressHydrationWarning>
                      {formatDate(tx.transaction_date)}
                    </span>
                  </div>
                  {/* Informasi Oleh (Pembuat Transaksi) */}
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                    Oleh : {authorName}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p
                  className={`text-sm font-bold ${
                    isIncome
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-900 dark:text-zinc-100"
                  }`}
                >
                  {isIncome ? "+" : "-"} {formatRupiah(Number(tx.amount))}
                </p>
                {tx.notes && (
                  <p className="text-xs text-zinc-400 truncate max-w-[120px] sm:max-w-[200px]">
                    {tx.notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Detail Transaksi & Konfirmasi Hapus */}
      <Dialog
        open={!!selectedTx}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTx(null);
            setIsConfirming(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
          </DialogHeader>

          {selectedTx && (
            <div className="space-y-4 pt-2">
              {/* Nominal Banner */}
              <div
                className={`rounded-xl p-4 text-center ${
                  selectedTx.type === "income"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                    : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                }`}
              >
                <p className="text-xs font-medium uppercase tracking-wider opacity-80">
                  {selectedTx.type === "income" ? "Pemasukan" : "Pengeluaran"}
                </p>
                <p className="text-2xl font-bold mt-1">
                  {selectedTx.type === "income" ? "+" : "-"}{" "}
                  {formatRupiah(Number(selectedTx.amount))}
                </p>
              </div>

              {/* Informasi Detail */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="flex items-center gap-2 text-zinc-500">
                    <Tag01Icon size={16} /> Kategori
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {selectedTx.categories?.name || "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="flex items-center gap-2 text-zinc-500">
                    <Wallet01Icon size={16} /> Dompet
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {selectedTx.wallets?.name || "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="flex items-center gap-2 text-zinc-500">
                    <Calendar01Icon size={16} /> Waktu
                  </span>
                  <span
                    className="font-medium text-zinc-900 dark:text-zinc-100"
                    suppressHydrationWarning
                  >
                    {formatDate(selectedTx.transaction_date)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="flex items-center gap-2 text-zinc-500">
                    <UserIcon size={16} /> Oleh
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {selectedTx.profiles?.full_name || "Pengguna"}
                  </span>
                </div>

                {selectedTx.notes && (
                  <div className="flex flex-col gap-1 py-2">
                    <span className="flex items-center gap-2 text-zinc-500">
                      <Note01Icon size={16} /> Catatan
                    </span>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800">
                      {selectedTx.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Bagian Aksi (Hapus / Tutup / Konfirmasi) */}
              <div className="pt-4">
                {!isConfirming ? (
                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setIsConfirming(true)}
                      className="bg-rose-100 text-rose-700 hover:bg-rose-200 hover:text-rose-800 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 cursor-pointer"
                    >
                      <Delete01Icon size={16} className="mr-1.5" /> Hapus Data
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedTx(null)}
                      className="cursor-pointer"
                    >
                      Tutup
                    </Button>
                  </div>
                ) : (
                  <div className="flex w-full flex-col gap-3 rounded-xl bg-rose-50 p-4 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30 animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-sm font-medium text-rose-800 dark:text-rose-400 text-center">
                      Apakah Anda yakin ingin menghapus catatan transaksi ini?
                      Saldo dompet akan disesuaikan kembali.
                    </p>
                    <div className="flex justify-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsConfirming(false)}
                        disabled={isDeleting}
                        className="cursor-pointer"
                      >
                        Batal
                      </Button>
                      <form
                        action={(formData) => {
                          startDeleteTransition(async () => {
                            try {
                              await deleteTransaction(formData);
                              toast.success("Transaksi berhasil dihapus!");
                              setIsConfirming(false);
                              setSelectedTx(null);
                            } catch (error: any) {
                              toast.error(
                                "Gagal menghapus transaksi: " +
                                  (error?.message || "Terjadi kesalahan"),
                              );
                            }
                          });
                        }}
                      >
                        <input type="hidden" name="id" value={selectedTx.id} />
                        <Button
                          type="submit"
                          variant="destructive"
                          disabled={isDeleting}
                          className="bg-rose-600 text-white hover:bg-rose-700 cursor-pointer active:scale-[0.98] disabled:opacity-75 flex items-center gap-2"
                        >
                          {isDeleting ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              <span>Menghapus...</span>
                            </>
                          ) : (
                            <span>Ya, Hapus Permanen</span>
                          )}
                        </Button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
