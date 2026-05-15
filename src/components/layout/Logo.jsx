import Image from "next/image";
import logoImg from "@/assets/logo.png";

export function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 shrink-0 flex items-center justify-center">
        <Image src={logoImg} alt="Diogo Store" width={40} height={40} className="object-contain" />
      </div>

      {!compact ? (
        <div className="leading-tight">
          <div className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-300">Diogo Store</div>
          <div className="text-xs text-zinc-500">Gestão de Encomendas</div>
        </div>
      ) : null}
    </div>
  );
}