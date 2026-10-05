"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ActionConfirmProps {
  title: string;
  description: string;
  triggerContent: React.ReactNode;
  triggerClassName?: string;
  action: (formData: FormData) => Promise<{ error?: string } | void> | void;
  idName?: string;
  idValue?: string;
  confirmText?: string;
  successMessage?: string;
}

export function ActionConfirm({
  title,
  description,
  triggerContent,
  triggerClassName,
  action,
  idName = "id",
  idValue,
  confirmText = "Ya, Lanjutkan",
  successMessage,
}: ActionConfirmProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await action(formData);
      if (result && "error" in result && result.error) {
        toast.error("Gagal memproses: " + result.error);
      } else if (successMessage) {
        toast.success(successMessage);
      }
      setOpen(false);
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={triggerClassName}>
        {triggerContent}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]" showCloseButton={!loading}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 pt-1">
            {description}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4">
          {idValue && <input type="hidden" name={idName} value={idValue} />}

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={loading}
              className="bg-rose-600 text-white hover:bg-rose-700 cursor-pointer active:scale-[0.98] disabled:opacity-75 flex items-center gap-2"
            >
              {loading ? (
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
                  <span>Memproses...</span>
                </>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
