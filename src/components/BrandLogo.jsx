/** PropAI wordmark used in the sidebar, login and auth screens. */
export function BrandMark({ size = 40 }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-400 text-white shadow-lg shadow-brand-950/30"
      style={{ width: size, height: size }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 11l9-7 9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-5h6v5" />
      </svg>
    </span>
  );
}

export default function BrandLogo({ dark = false, compact = false, size = 40 }) {
  return (
    <span className="inline-flex items-center gap-3">
      <BrandMark size={size} />
      {!compact && (
        <span className="min-w-0 leading-tight">
          <span className={`block font-display text-lg font-extrabold tracking-tight ${dark ? "text-white" : "text-brand-950"}`}>PropAI</span>
          <span className={`block text-[11px] font-medium ${dark ? "text-brand-200/80" : "text-ink-500"}`}>by Deific Digital</span>
        </span>
      )}
    </span>
  );
}
