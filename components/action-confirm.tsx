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

interface ActionConfirmProps {
  title: string;
  description: string;
  triggerContent: React.ReactNode;
  triggerClassName?: string;
  action: (formData: FormData) => Promise<void> | void;
  idName?: string;
  idValue?: string;
  confirmText?: string;
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
}: ActionConfirmProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={triggerClassName}>
        {triggerContent}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 pt-1">
            {description}
          </p>
        </DialogHeader>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Batal
          </Button>
          <form
            action={async (formData) => {
              setLoading(true);
              await action(formData);
              setLoading(false);
              setOpen(false);
            }}
          >
            {idValue && <input type="hidden" name={idName} value={idValue} />}
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? "Memproses..." : confirmText}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
