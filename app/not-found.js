import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-shell py-20">
      <div className="section-card mx-auto max-w-2xl p-8 text-center sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black/45">
          Not found
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-[#000100]">
          We could not find that page
        </h1>
        <p className="mt-4 text-base leading-7 text-black/68">
          The profile or listing does not exist.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/forum"
            className="inline-flex items-center rounded-full bg-[#000100] px-5 py-3 text-sm font-semibold text-white"
          >
            Browse forum
          </Link>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#000100]"
          >
            Back home
          </Link>
        </div>
      </div>
    </section>
  );
}
