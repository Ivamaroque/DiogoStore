"use client";

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function FotoProdutoZoom({ src, nome, className }) {
  if (!src) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="shrink-0 cursor-zoom-in rounded-xl transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" aria-label={`Ampliar foto de ${nome}`}>
          <img src={src} alt="" className={className} />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-3 sm:p-5">
        <DialogTitle className="pr-8 text-base">{nome}</DialogTitle>
        <img src={src} alt={`Foto de ${nome}`} className="mx-auto max-h-[75vh] max-w-full rounded-xl object-contain" />
      </DialogContent>
    </Dialog>
  );
}
