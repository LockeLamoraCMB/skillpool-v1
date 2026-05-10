import Link from "next/link";

export default function ProgramCard({ program, courseCount = 0 }) {
  return (
    <Link
      href={`/forum/program/${program.slug}`}
      className="rounded-[24px] border border-[#D9E2E8] bg-[#F8FBFC] p-5 shadow-[0_12px_35px_rgba(23,43,58,0.05)] transition hover:-translate-y-[1px]"
    >
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#7B8794]">
        Program
      </p>
      <h3 className="mt-3 text-2xl font-black tracking-tight text-[#12212B]">
        {program.name}
      </h3>
      <p className="mt-3 text-[14px] leading-7 text-[#61727E]">
        {program.description || "Course-specific threads, offers, and help requests."}
      </p>
      <div className="mt-5 flex items-center justify-between">
        <span className="text-sm font-semibold text-[#52606D]">
          {courseCount} course{courseCount === 1 ? "" : "s"}
        </span>
        <span className="text-sm font-bold text-[#12212B]">View →</span>
      </div>
    </Link>
  );
}