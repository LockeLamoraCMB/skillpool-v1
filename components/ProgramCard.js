import Link from "next/link";
import BadgePill from "@/components/BadgePill";

export default function ProgramCard({ program, compact = false }) {
  return (
    <article className="section-card h-full p-6 transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <BadgePill label={program.name} tone="accent" />
          <h3 className="mt-4 text-2xl font-bold text-[#000100]">{program.name}</h3>
          <p className="mt-2 text-sm leading-6 text-black/65">
            {compact ? program.shortDescription : program.description}
          </p>
        </div>
        <div className="rounded-2xl border border-black/5 bg-[#F8F8F8] px-3 py-2 text-right">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/45">Course Forums</p>
          <p className="text-xl font-black text-[#000100]">{program.courses.length}</p>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {program.courses.map((course) => (
          <div
            key={course.id}
            className="rounded-2xl border border-black/6 bg-[#F8F8F8] px-4 py-3"
          >
            <p className="text-sm font-semibold text-[#000100]">{course.name}</p>
            <p className="mt-1 text-xs leading-5 text-black/60">{course.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          href={`/forum?program=${program.slug}`}
          className="inline-flex items-center rounded-full bg-[#000100] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Explore {program.name}
        </Link>
        <Link
          href="/programs"
          className="inline-flex items-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#000100] transition hover:border-black/20"
        >
          View program guide
        </Link>
      </div>
    </article>
  );
}
