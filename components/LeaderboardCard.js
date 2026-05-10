import Link from "next/link";
import Avatar from "@/components/Avatar";
import BadgePill from "@/components/BadgePill";

export default function LeaderboardCard({ entry, detailed = false }) {
  const student = entry.profile;

  if (!student) {
    return null;
  }

  return (
    <article className="section-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#000100] text-base font-black text-white">
            #{entry.rank}
          </div>
          <Link href={`/profile/${student.username}`} className="flex items-center gap-3">
            <Avatar name={student.fullName} />
            <div>
              <p className="font-semibold text-[#000100]">{student.fullName}</p>
              <p className="text-sm text-black/60">
                {student.program} • {student.headline}
              </p>
            </div>
          </Link>
        </div>
        <BadgePill label={`${entry.averageRating || 0} ★`} tone="verified" />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-black/6 bg-[#F8F8F8] px-3 py-3 text-center">
          <p className="text-xs uppercase tracking-wide text-black/45">Completed</p>
          <p className="mt-2 text-lg font-black text-[#000100]">{entry.completedRequests}</p>
        </div>
        <div className="rounded-2xl border border-black/6 bg-[#F8F8F8] px-3 py-3 text-center">
          <p className="text-xs uppercase tracking-wide text-black/45">Replies</p>
          <p className="mt-2 text-lg font-black text-[#000100]">{entry.replyCount}</p>
        </div>
        <div className="rounded-2xl border border-black/6 bg-[#F8F8F8] px-3 py-3 text-center">
          <p className="text-xs uppercase tracking-wide text-black/45">Score</p>
          <p className="mt-2 text-lg font-black text-[#000100]">{entry.score}</p>
        </div>
      </div>

      {detailed && student.badges?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {student.badges.map((badge) => (
            <BadgePill
              key={`${student.id}-${badge}`}
              label={badge}
              tone={badge.includes("Verified") ? "verified" : "accent"}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}
