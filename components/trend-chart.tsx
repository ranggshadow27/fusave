"use client";

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatRupiah } from "@/utils/format";

// Fungsi untuk menyingkat angka (Contoh: 2500000 -> 2,5jt)
const formatCompact = (num: number) => {
  if (num === 0) return "0";
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  let formatted = absNum.toString();
  if (absNum >= 1000000000) {
    formatted = (absNum / 1000000000).toFixed(1).replace(/\.0$/, "") + "M";
  } else if (absNum >= 1000000) {
    formatted = (absNum / 1000000).toFixed(1).replace(/\.0$/, "") + "jt";
  } else if (absNum >= 1000) {
    formatted = (absNum / 1000).toFixed(1).replace(/\.0$/, "") + "rb";
  }

  formatted = formatted.replace(".", ","); // Gunakan koma untuk desimal Indonesia
  return isNegative ? `-${formatted}` : formatted;
};

// Custom Tooltip agar saat di-hover angkanya tampil full Rupiah
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-md dark:border-zinc-800 dark:bg-zinc-950">
        <p className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <span style={{ color: entry.color }} className="font-medium">
              {entry.name}:
            </span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">
              {formatRupiah(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function TrendChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[350px] items-center justify-center text-sm text-zinc-500">
        Belum ada data tren di periode ini.
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 0, left: -15, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#52525b"
            opacity={0.2}
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            dy={10}
            stroke="#71717a"
          />
          <YAxis
            tickFormatter={formatCompact}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            stroke="#71717a"
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "#52525b", opacity: 0.1 }}
          />
          <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }} />

          <Bar
            dataKey="income"
            name="Pemasukan"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          <Bar
            dataKey="expense"
            name="Pengeluaran"
            fill="#f43f5e"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          <Line
            type="monotone"
            dataKey="profit"
            name="Profit / Selisih"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
