import { cn } from "@/lib/utils";

const Switch = ({ checked, onCheckedChange, className, ...props }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange?.(!checked)}
    className={cn(
      "relative inline-flex h-6 w-11 items-center rounded-full border border-zinc-700 transition-colors",
      checked ? "bg-brand" : "bg-zinc-800",
      className,
    )}
    {...props}
  >
    <span
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow transition-transform",
        checked ? "translate-x-5" : "translate-x-0.5",
      )}
    />
  </button>
);

export { Switch };