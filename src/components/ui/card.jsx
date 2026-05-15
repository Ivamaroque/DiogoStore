import { cn } from "@/lib/utils";

const Card = ({ className, ...props }) => <div className={cn("rounded-2xl border border-zinc-800 bg-zinc-900/90 shadow-lg shadow-black/20", className)} {...props} />;
const CardHeader = ({ className, ...props }) => <div className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />;
const CardTitle = ({ className, ...props }) => <h3 className={cn("text-lg font-semibold tracking-tight text-white", className)} {...props} />;
const CardDescription = ({ className, ...props }) => <p className={cn("text-sm text-zinc-400", className)} {...props} />;
const CardContent = ({ className, ...props }) => <div className={cn("p-6 pt-0", className)} {...props} />;
const CardFooter = ({ className, ...props }) => <div className={cn("flex items-center p-6 pt-0", className)} {...props} />;

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };