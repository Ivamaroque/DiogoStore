import { cn } from "@/lib/utils";

const Separator = ({ className, orientation = "horizontal", ...props }) => (
  <div
    className={cn(
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      "bg-zinc-800",
      className,
    )}
    {...props}
  />
);

export { Separator };