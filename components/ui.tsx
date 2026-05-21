"use client";

import { cloneElement, forwardRef, isValidElement } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -1 }}
      className={cn("pp-card rounded-[1.55rem] p-4 transition-colors duration-500 sm:p-5", className)}
    >
      {children}
    </motion.section>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  action
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.14em] pp-accent">{eyebrow}</p> : null}
        <h2 className="text-lg font-black pp-ink">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Button({
  className,
  asChild = false,
  children,
  variant = "primary",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
}) {
  const buttonClassName = cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl font-bold transition duration-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55",
    size === "sm" && "min-h-10 px-3 text-sm",
    size === "md" && "px-4 py-2 text-sm",
    size === "lg" && "min-h-14 px-5 text-base",
    variant === "primary" && "bg-[var(--pp-navy)] text-[#fff7e8] shadow-soft hover:opacity-95",
    variant === "secondary" && "border border-[var(--pp-line)] bg-[rgba(255,250,240,0.56)] text-[var(--pp-ink)] hover:bg-[rgba(255,250,240,0.76)] dark:bg-[rgba(255,244,224,0.08)] dark:hover:bg-[rgba(255,244,224,0.13)]",
    variant === "ghost" && "text-[var(--pp-muted)] hover:bg-[rgba(255,250,240,0.5)] dark:hover:bg-[rgba(255,244,224,0.08)]",
    variant === "danger" && "bg-[#ead9ce] text-[#73564a] hover:bg-[#e3cfc1] dark:bg-[#4a3431]/70 dark:text-[#e8c6b9]",
    variant === "success" && "bg-[#dfe9df] text-[#526f62] hover:bg-[#d4e1d4] dark:bg-[#2e4038] dark:text-[#c3d6c8]",
    className
  );

  if (asChild && isValidElement<{ className?: string }>(children)) {
    return cloneElement(children, {
      className: cn(buttonClassName, children.props.className)
    });
  }

  return (
    <button
      className={buttonClassName}
      {...props}
    >
      {children}
    </button>
  );
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "min-h-12 w-full rounded-2xl border border-[var(--pp-line)] bg-[rgba(255,250,240,0.62)] px-4 text-sm font-semibold text-[var(--pp-ink)] outline-none transition placeholder:text-[var(--pp-muted)] focus:border-[var(--pp-accent)] focus:ring-4 focus:ring-[rgba(185,137,84,0.14)] dark:bg-[rgba(20,25,29,0.46)]",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-24 w-full rounded-2xl border border-[var(--pp-line)] bg-[rgba(255,250,240,0.62)] px-4 py-3 text-sm font-semibold text-[var(--pp-ink)] outline-none transition placeholder:text-[var(--pp-muted)] focus:border-[var(--pp-accent)] focus:ring-4 focus:ring-[rgba(185,137,84,0.14)] dark:bg-[rgba(20,25,29,0.46)]",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "min-h-12 w-full rounded-2xl border border-[var(--pp-line)] bg-[rgba(255,250,240,0.62)] px-4 text-sm font-bold text-[var(--pp-ink)] outline-none transition focus:border-[var(--pp-accent)] focus:ring-4 focus:ring-[rgba(185,137,84,0.14)] dark:bg-[rgba(20,25,29,0.46)]",
        props.className
      )}
    />
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-bold text-[var(--pp-muted)]">
      {label}
      {children}
    </label>
  );
}

export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-black", className)}>
      {children}
    </span>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--pp-line)] p-5 text-center">
      <p className="font-black pp-ink">{title}</p>
      <p className="mt-1 text-sm pp-muted">{body}</p>
    </div>
  );
}

export function CalmPageTitle({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <div className="mb-5">
      <p className="text-sm font-black uppercase tracking-[0.14em] pp-accent">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight pp-ink sm:text-4xl">{title}</h1>
      {body ? <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 pp-muted">{body}</p> : null}
    </div>
  );
}
