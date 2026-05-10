const toneMap = {
  verified: "border-[#94C5CC]/50 bg-[#94C5CC]/20 text-[#000100]",
  accent: "border-[#B4D2E7]/60 bg-[#B4D2E7]/25 text-[#000100]",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  muted: "border-black/10 bg-black/[0.04] text-black/70",
  dark: "border-[#000100] bg-[#000100] text-white",
};

export default function BadgePill({ label, tone = "muted", className = "" }) {
  const toneClasses = toneMap[tone] || toneMap.muted;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${toneClasses} ${className}`}
    >
      {label}
    </span>
  );
}
