"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home01Icon,
  Wallet01Icon,
  PieChartIcon,
  UserIcon,
  Settings01Icon,
} from "hugeicons-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* SIDEBAR DESKTOP (Sembunyi di Mobile) */}
      <aside className="hidden w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:fixed md:inset-y-0 md:flex">
        <div className="flex h-16 items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            fusave<span className="text-blue-600">.</span>
          </h1>
        </div>
        <nav className="flex flex-col gap-2 p-4">
          <NavItem href="/" icon={<Home01Icon size={20} />} label="Beranda" />
          <NavItem
            href="/transactions"
            icon={<Wallet01Icon size={20} />}
            label="Transaksi"
          />
          <NavItem
            href="/analytics"
            icon={<PieChartIcon size={20} />}
            label="Analitik"
          />
          <NavItem
            href="/settings"
            icon={<Settings01Icon size={20} />}
            label="Pengaturan"
          />
        </nav>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 pb-20 md:pb-0 md:pl-64">
        <div className="mx-auto max-w-3xl p-4 md:p-8">{children}</div>
      </main>

      {/* BOTTOM NAV MOBILE (Sembunyi di Desktop) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-zinc-200 bg-white pb-safe pt-1 dark:border-zinc-800 dark:bg-zinc-900 md:hidden">
        <MobileNavItem
          href="/"
          icon={<Home01Icon size={24} />}
          label="Beranda"
        />
        <MobileNavItem
          href="/transactions"
          icon={<Wallet01Icon size={24} />}
          label="Transaksi"
        />
        <MobileNavItem
          href="/analytics"
          icon={<PieChartIcon size={24} />}
          label="Analitik"
        />
        <MobileNavItem
          href="/settings"
          icon={<UserIcon size={24} />}
          label="Pengaturan"
        />
      </nav>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium 
        transition-all duration-300 ease-out
        hover:-translate-y-0.5 active:scale-95
        ${
          isActive
            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold shadow-sm"
            : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
        }
      `}
    >
      <span
        className={`transition-colors ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`}
      >
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}

function MobileNavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`
        flex flex-col items-center gap-1 p-2 rounded-lg
        transition-all duration-300 ease-out active:scale-90
        ${
          isActive
            ? "text-blue-600 dark:text-blue-400 font-semibold"
            : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
        }
      `}
    >
      {icon}
      <span className="text-[10px]">{label}</span>
    </Link>
  );
}
