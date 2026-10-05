"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatRupiah } from "@/utils/format";

interface MonthlyTickerProps {
  income: number;
  expense: number;
}

export function MonthlyTicker({ income, expense }: MonthlyTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const items = [
    {
      label: "pemasukan bulan ini",
      value: `+ ${formatRupiah(income)}`,
      color: "text-emerald-400 dark:text-emerald-600",
    },
    {
      label: "pengeluaran bulan ini",
      value: `- ${formatRupiah(expense)}`,
      color: "text-rose-400 dark:text-rose-600",
    },
  ];

  // Ganti slide setiap 3 detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % 2);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-4 flex h-6 items-center relative overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentIndex}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="absolute flex items-center text-sm"
        >
          <span className={`font-medium ${items[currentIndex].color}`}>
            {items[currentIndex].value}
          </span>
          <span className="ml-2 opacity-70">{items[currentIndex].label}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
