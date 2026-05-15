import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Label = forwardRef(function Label({ className, ...props }, ref) {
  return <label ref={ref} className={cn("text-sm font-medium text-zinc-300", className)} {...props} />;
});

export { Label };