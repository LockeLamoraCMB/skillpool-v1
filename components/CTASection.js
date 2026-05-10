import Link from "next/link";

export default function CTASection({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}) {
  return (
    <section className="page-shell py-12 sm:py-16">
      <div className="section-card hero-noise overflow-hidden p-8 sm:p-10 lg:p-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black/45">
              Ready to join the pool?
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#000100] sm:text-4xl">
              {title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-black/68 sm:text-lg">
              {description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={primaryHref}
              className="inline-flex items-center rounded-full bg-[#000100] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {primaryLabel}
            </Link>
            {secondaryHref && secondaryLabel ? (
              <Link
                href={secondaryHref}
                className="inline-flex items-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#000100] transition hover:border-black/20"
              >
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
