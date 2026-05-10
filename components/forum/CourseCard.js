import Link from "next/link";

export default function CourseCard({ course, programSlug }) {
  return (
    <Link
      href={`/forum/program/${programSlug}/course/${course.slug}`}
      className="rounded-[24px] border border-[#D9E2E8] bg-[#F8FBFC] p-5 shadow-[0_12px_35px_rgba(23,43,58,0.05)] transition hover:-translate-y-[1px]"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="rounded-full border border-[#D7E1E8] bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#52606D]">
          {course.code || "Course"}
        </span>
        <span className="text-sm font-bold text-[#12212B]">View →</span>
      </div>

      <h3 className="mt-4 text-xl font-black tracking-tight text-[#12212B]">
        {course.name}
      </h3>

      <p className="mt-3 text-[14px] leading-7 text-[#61727E]">
        {course.description || "View threads and create course-specific posts."}
      </p>
    </Link>
  );
}