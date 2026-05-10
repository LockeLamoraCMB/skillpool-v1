export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}) {
  const alignment = align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl";

  return (
    <div className={alignment}>
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-black/45">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-black tracking-tight text-[#000100] sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-7 text-black/68 sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
