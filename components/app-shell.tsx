"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Baby, CheckSquare, Headphones, Home, Moon, RotateCcw, Settings, ShoppingBasket, Sun, UsersRound } from "lucide-react";
import { Button } from "@/components/ui";
import { usePeacefulParents } from "@/lib/store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/tracker", label: "Baby", icon: Baby },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/turns", label: "Turns", icon: RotateCcw },
  { href: "/audio", label: "Audio", icon: Headphones },
  { href: "/supplies", label: "Supplies", icon: ShoppingBasket },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { darkMode, setDarkMode, caregivers } = usePeacefulParents();
  const isLanding = pathname === "/";

  return (
    <MotionConfig transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}>
    <div className="ambient-shell min-h-screen pb-24 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-[var(--pp-line)] bg-[rgba(249,241,226,0.72)] backdrop-blur-2xl dark:bg-[rgba(24,29,33,0.72)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[linear-gradient(145deg,#485f6f,#2f4151)] text-[#fff7e8] shadow-soft dark:bg-[linear-gradient(145deg,#455969,#24323c)]">
              <UsersRound size={22} strokeWidth={2.7} />
            </div>
            <div>
              <p className="text-base font-black leading-tight pp-ink">PeacefulParents</p>
              <p className="text-xs font-bold pp-muted">{caregivers.map((caregiver) => caregiver.name).join(" + ")}</p>
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
                        "inline-flex min-h-10 items-center gap-1.5 rounded-2xl px-3 text-sm font-black transition duration-300",
                        active && "bg-[rgba(255,250,240,0.68)] text-[var(--pp-accent)] shadow-sm dark:bg-[rgba(255,244,224,0.09)]",
                        !active && "text-[var(--pp-muted)] hover:bg-[rgba(255,250,240,0.46)] dark:hover:bg-[rgba(255,244,224,0.07)]"
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

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-5 md:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {!isLanding ? (
        <>
          <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--pp-line)] bg-[rgba(255,250,240,0.82)] px-2 pb-[max(env(safe-area-inset-bottom),0.4rem)] pt-2 shadow-[0_-16px_45px_rgba(50,43,35,0.12)] backdrop-blur-2xl dark:bg-[rgba(25,31,35,0.88)] md:hidden">
            <div className="grid grid-cols-7 gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "grid min-h-14 place-items-center rounded-2xl text-[0.68rem] font-black text-[var(--pp-muted)] transition duration-300",
                      active && "bg-[var(--pp-navy)] text-[#fff7e8] shadow-soft",
                      !active && "hover:bg-[rgba(255,250,240,0.6)] dark:hover:bg-[rgba(255,244,224,0.08)]"
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
    </MotionConfig>
  );
}
