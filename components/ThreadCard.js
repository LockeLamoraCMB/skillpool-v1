import Link from "next/link";
import Avatar from "@/components/Avatar";
import BadgePill from "@/components/BadgePill";

const statusToneMap = {
  Open: "verified",
  "In Progress": "accent",
  Completed: "success",
};

export default function ThreadCard({ listing, compact = false }) {
  const student = listing.poster;
  const program = listing.program;

  if (!student || !program) {
    return null;
  }

  return (
    <article className="section-card p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <Link href={`/profile/${student.username}`} aria-label={`View ${student.fullName} profile`}>
            <Avatar name={student.fullName} />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/profile/${student.username}`}
                className="font-semibold text-[#000100] transition hover:opacity-70"
              >
                {student.fullName}
              </Link>
              {student.isVerified ? <BadgePill label="Verified" tone="verified" /> : null}
              <BadgePill
                label={listing.roleType}
                tone={listing.roleType === "Tutor" ? "accent" : "muted"}
              />
            </div>
            <p className="mt-1 text-sm text-black/60">
              {program.name} • {listing.courseName}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <BadgePill label={listing.meetupOption} tone="muted" />
          <BadgePill label={listing.status} tone={statusToneMap[listing.status] || "muted"} />
        </div>
      </header>

      <div className="mt-4">
        <Link href={`/forum/${listing.id}`} className="block">
          <h3 className="text-xl font-bold tracking-tight text-[#000100] transition hover:opacity-80">
            {listing.title}
          </h3>
        </Link>
        <p className="mt-3 text-sm leading-6 text-black/70">{listing.description}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {listing.tags.map((tag) => (
          <span key={tag} className="tag-pill">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-black/6 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-black/65">
          <span className="font-semibold text-[#000100]">{listing.priceLabel}</span>
          <span>★ {listing.rating || "New"}</span>
          <span>{listing.replyCount} replies</span>
          <span>{listing.postedLabel}</span>
          {!compact ? <span>{listing.views} views</span> : null}
        </div>

        <Link
          href={`/forum/${listing.id}`}
          className="inline-flex items-center justify-center rounded-full bg-[#000100] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
