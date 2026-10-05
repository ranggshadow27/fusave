"use client";

import { Input } from "@/components/ui/input";
import { forwardRef } from "react";

export const CurrencyInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ ...props }, ref) => {
  // Fungsi format angka dengan titik pemisah ribuan
  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    // Hanya ambil angka
    let value = input.value.replace(/\D/g, "");

    if (value) {
      // Format ke ribuan Indonesia (titik)
      value = new Intl.NumberFormat("id-ID").format(Number(value));
    }

    input.value = value;
  };

  return (
    <Input
      {...props}
      ref={ref}
      type="text"
      inputMode="numeric"
      onInput={handleInput}
      placeholder={props.placeholder || "0"}
    />
  );
});

CurrencyInput.displayName = "CurrencyInput";
