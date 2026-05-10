function Icon({ icon }) {
  const common = "h-5 w-5";
  const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (icon) {
    case "shield":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path d="M12 3 5 6v5c0 5 3.4 8.6 7 10 3.6-1.4 7-5 7-10V6l-7-3Z" {...stroke} />
          <path d="m9.5 12 1.7 1.8 3.5-4" {...stroke} />
        </svg>
      );
    case "search":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" {...stroke} />
          <path d="m16 16 4 4" {...stroke} />
        </svg>
      );
    case "forum":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path d="M5 6h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-7l-4 3v-3H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" {...stroke} />
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path d="m12 3 2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.3l1-6.2L3 9.7l6.2-.9L12 3Z" {...stroke} />
        </svg>
      );
    case "bolt":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path d="M13 2 5 13h5l-1 9 8-11h-5l1-9Z" {...stroke} />
        </svg>
      );
    case "sparkles":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path d="m12 3 1.4 4.1L18 8.5l-4.6 1.4L12 14l-1.4-4.1L6 8.5l4.6-1.4L12 3Z" {...stroke} />
          <path d="m19 14 .7 2 .8.2-.8.3-.7 2-.6-2-.9-.3.9-.2.6-2Z" {...stroke} />
          <path d="m5 15 .8 2.2 2.2.8-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15Z" {...stroke} />
        </svg>
      );
    case "campus":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path d="m3 9 9-5 9 5" {...stroke} />
          <path d="M5 10v7m4-7v7m6-7v7m4-7v7M3 20h18" {...stroke} />
        </svg>
      );
    case "growth":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path d="M4 19h16" {...stroke} />
          <path d="m7 15 3-3 3 2 4-5" {...stroke} />
          <path d="M17 9h3v3" {...stroke} />
        </svg>
      );
    case "people":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" {...stroke} />
          <path d="M3.5 19a4.5 4.5 0 0 1 9 0m3.5 0a3.5 3.5 0 0 1 4.5-3.3" {...stroke} />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <circle cx="12" cy="12" r="7" {...stroke} />
        </svg>
      );
  }
}

export default function FeatureCard({ feature }) {
  return (
    <article className="section-card h-full p-6">
      <div className="inline-flex rounded-2xl bg-[#B4D2E7]/35 p-3 text-[#000100]">
        <Icon icon={feature.icon} />
      </div>
      <h3 className="mt-5 text-xl font-bold text-[#000100]">{feature.title}</h3>
      <p className="mt-3 text-sm leading-6 text-black/68">{feature.description}</p>
    </article>
  );
}
