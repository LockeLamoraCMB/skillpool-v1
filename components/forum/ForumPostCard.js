import Link from "next/link";
import { excerptFromHtml, formatForumDate } from "@/lib/forum";
import StarRatingDisplay from "@/components/forum/StarRatingDisplay";

export default function ForumPostCard({ post }) {
  return (
    <article className="rounded-[24px] border border-[#D9E2E8] bg-white p-6 shadow-[0_12px_35px_rgba(23,43,58,0.06)] transition hover:-translate-y-[1px]">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
                post.post_type === "offer"
                  ? "border border-[#B9D2DD] bg-[#EAF5F8] text-[#245067]"
                  : "border border-[#E6C98D] bg-[#FFF2D8] text-[#7A5312]"
              }`}
            >
              {post.post_type === "offer" ? "Offer a Skill" : "Need Help"}
            </span>

            <span className="rounded-full border border-[#D7E1E8] bg-[#F7FAFB] px-3 py-1 text-xs font-semibold text-[#52606D]">
              {post.program_name}
            </span>

            <span className="rounded-full border border-[#D7E1E8] bg-[#F7FAFB] px-3 py-1 text-xs font-semibold text-[#52606D]">
              {post.course_name}
            </span>

            <span className="text-sm text-[#7B8794]">
              {formatForumDate(post.created_at)}
            </span>

            {Number(post.price_amount || 0) > 0 ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">
                PHP {Number(post.price_amount).toLocaleString("en-PH")}
              </span>
            ) : null}
          </div>

          <Link href={`/forum/post/${post.slug}`} className="block">
            <h2 className="mt-4 text-2xl font-black tracking-tight text-[#12212B]">
              {post.title}
            </h2>
          </Link>

          <p className="mt-3 text-[15px] leading-7 text-[#52606D]">
            {excerptFromHtml(post.body_html)}
          </p>

          {post.tags?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#D7E1E8] bg-[#F8FBFC] px-3 py-1 text-xs font-semibold text-[#52606D]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="w-full rounded-[20px] bg-[#F8FBFC] p-4 md:max-w-[280px]">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-full border border-[#D7E1E8]">
              <img
                src={post.author_avatar_url || "/profile/avatar.png"}
                alt={post.author_username}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#12212B]">
                {post.author_username}
              </p>
              <p className="truncate text-xs text-[#6B7C88]">
                {post.author_role}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <StarRatingDisplay
              average={post.author_average_rating}
              count={post.author_review_count}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
