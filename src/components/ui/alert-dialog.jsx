"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { cn } from "@/lib/utils";

const AlertDialog = DialogPrimitive.Root;
const AlertDialogTrigger = DialogPrimitive.Trigger;
const AlertDialogPortal = DialogPrimitive.Portal;

const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn("inline-flex h-10 items-center justify-center rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400/40 disabled:pointer-events-none disabled:opacity-50", className)}
    {...props}
  />
));
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Close
    ref={ref}
    className={cn("inline-flex h-10 items-center justify-center rounded-xl border border-zinc-700 bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:pointer-events-none disabled:opacity-50", className)}
    {...props}
  />
));
AlertDialogCancel.displayName = DialogPrimitive.Close.displayName;

const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)}
    {...props}
  />
));
AlertDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const AlertDialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-black/50 max-h-[calc(100vh-2rem)] overflow-y-auto sm:w-full",
        className,
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </AlertDialogPortal>
));
AlertDialogContent.displayName = DialogPrimitive.Content.displayName;

const AlertDialogHeader = ({ className, ...props }) => <div className={cn("flex flex-col gap-1.5 text-center sm:text-left", className)} {...props} />;
const AlertDialogFooter = ({ className, ...props }) => <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight text-white", className)} {...props} />
));
AlertDialogTitle.displayName = DialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm text-zinc-400", className)} {...props} />
));
AlertDialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
};