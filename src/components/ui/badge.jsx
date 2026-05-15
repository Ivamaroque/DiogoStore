import { cn } from "@/lib/utils";

const Badge = ({ className, variant = "default", ...props }) => {
  const variants = {
    default: "border border-zinc-700 bg-zinc-800 text-zinc-100",
    success: "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    warning: "border border-amber-500/30 bg-amber-500/10 text-amber-300",
    danger: "border border-red-500/30 bg-red-500/10 text-red-300",
    info: "border border-sky-500/30 bg-sky-500/10 text-sky-300",
    brand: "border border-brand/30 bg-brand/10 text-brand",
  };

  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", variants[variant], className)} {...props} />;
};

export { Badge };