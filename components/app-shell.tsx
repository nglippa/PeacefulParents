"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Baby, CheckSquare, ClipboardList, Home, Moon, RotateCcw, Settings, ShoppingBasket, Sun, UsersRound } from "lucide-react";
import { Button } from "@/components/ui";
import { useDadMode } from "@/lib/store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/tracker", label: "Baby", icon: Baby },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/turns", label: "Turns", icon: RotateCcw },
  { href: "/supplies", label: "Supplies", icon: ShoppingBasket },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { darkMode, setDarkMode, caregivers } = useDadMode();
  const isLanding = pathname === "/";

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-[#fff8f0]/86 backdrop-blur-xl dark:border-stone-800/80 dark:bg-stone-950/82">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f9735b] text-white shadow-lift">
              <UsersRound size={22} strokeWidth={2.7} />
            </div>
            <div>
              <p className="text-base font-black leading-tight text-stone-950 dark:text-stone-50">DadMode</p>
              <p className="text-xs font-bold text-stone-500 dark:text-stone-400">{caregivers.map((caregiver) => caregiver.name).join(" + ")}</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            {!isLanding ? (
              <nav className="hidden items-center gap-1 md:flex">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "inline-flex min-h-10 items-center gap-1.5 rounded-2xl px-3 text-sm font-black transition",
                        active && "bg-white text-[#f9735b] shadow-sm dark:bg-stone-900 dark:text-rose-200",
                        !active && "text-stone-600 hover:bg-white dark:text-stone-300 dark:hover:bg-stone-900"
                      )}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            ) : null}
            <Button
              aria-label={darkMode ? "Use light mode" : "Use dark mode"}
              variant="secondary"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
              className="h-11 w-11 px-0"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-5 md:py-8">{children}</main>

      {!isLanding ? (
        <>
          <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/94 px-2 pb-[max(env(safe-area-inset-bottom),0.4rem)] pt-2 shadow-[0_-8px_35px_rgba(45,40,35,0.12)] backdrop-blur-xl dark:border-stone-800 dark:bg-stone-950/94 md:hidden">
            <div className="grid grid-cols-6 gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "grid min-h-14 place-items-center rounded-2xl text-[0.68rem] font-black text-stone-500 transition",
                      active && "bg-[#f9735b] text-white shadow-lift",
                      !active && "hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-900"
                    )}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </>
      ) : null}
    </div>
  );
}
