import { cloneElement, forwardRef, isValidElement } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <section className={cn("rounded-[1.35rem] border border-stone-200/80 bg-white/86 p-4 shadow-soft backdrop-blur dark:border-stone-800 dark:bg-stone-950/74", className)}>
      {children}
    </section>
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
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.12em] text-rose-500 dark:text-rose-300">{eyebrow}</p> : null}
        <h2 className="text-lg font-black text-stone-950 dark:text-stone-50">{title}</h2>
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
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55",
    size === "sm" && "min-h-10 px-3 text-sm",
    size === "md" && "px-4 py-2 text-sm",
    size === "lg" && "min-h-14 px-5 text-base",
    variant === "primary" && "bg-[#f9735b] text-white shadow-lift hover:bg-[#ef674c]",
    variant === "secondary" && "bg-stone-100 text-stone-900 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-50 dark:hover:bg-stone-700",
    variant === "ghost" && "text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800",
    variant === "danger" && "bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-200",
    variant === "success" && "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-100",
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
      "min-h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#f9735b] focus:ring-4 focus:ring-[#f9735b]/15 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-50",
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
      "min-h-24 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#f9735b] focus:ring-4 focus:ring-[#f9735b]/15 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-50",
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
        "min-h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm font-bold text-stone-900 outline-none transition focus:border-[#f9735b] focus:ring-4 focus:ring-[#f9735b]/15 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-50",
        props.className
      )}
    />
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-bold text-stone-700 dark:text-stone-200">
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
    <div className="rounded-2xl border border-dashed border-stone-300 p-5 text-center dark:border-stone-700">
      <p className="font-black text-stone-900 dark:text-stone-50">{title}</p>
      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{body}</p>
    </div>
  );
}
