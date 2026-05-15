export function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 64 64" className="h-10 w-10 shrink-0" aria-hidden="true">
        <path d="M32 4 58 20 50 46 32 60 14 46 6 20 32 4Z" fill="none" stroke="white" strokeWidth="1.8" />
        <path d="M24 16h16l6 16-6 16H24l-6-16 6-16Z" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
        <path d="M31 18h8c4.2 0 7.5 3.4 7.5 7.6v12.8c0 4.2-3.3 7.6-7.5 7.6h-8V18Zm5.4 5.4v17.2h2.4c1.4 0 2.6-1.1 2.6-2.5V25.9c0-1.4-1.2-2.5-2.6-2.5h-2.4Z" fill="#ed6f1a" />
      </svg>
      {!compact ? (
        <div className="leading-tight">
          <div className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-300">Diogo Store</div>
          <div className="text-xs text-zinc-500">Gestão de Encomendas</div>
        </div>
      ) : null}
    </div>
  );
}