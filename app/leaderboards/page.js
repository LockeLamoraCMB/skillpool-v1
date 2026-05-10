import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLeaderboardEntries } from "@/lib/leaderboard";
import { isAllowedStudentEmail } from "@/lib/auth/student";

export const metadata = {
  title: "Leaderboard",
};

const periodTabs = [
  { value: "overall", label: "Overall" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "all-time", label: "All-time" },
];

function initials(name = "ST") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function Avatar({ profile, size = "md" }) {
  const sizeClass =
    size === "lg"
      ? "h-24 w-24 text-2xl"
      : size === "xl"
      ? "h-32 w-32 text-4xl"
      : "h-14 w-14 text-base";

  if (profile.avatarUrl) {
    return (
      <img
        src={profile.avatarUrl}
        alt={profile.fullName}
        className={`${sizeClass} rounded-full border border-white/60 object-cover shadow-[0_18px_45px_rgba(18,33,43,0.18)]`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-full border border-white/60 bg-[linear-gradient(135deg,#f7fafb_0%,#b4d2e7_48%,#d7a93a_100%)] font-black text-[#12212B] shadow-[0_18px_45px_rgba(18,33,43,0.18)]`}
    >
      {initials(profile.fullName)}
    </div>
  );
}

function hrefForPeriod(period, search) {
  const params = new URLSearchParams();
  if (period !== "overall") params.set("period", period);
  if (search) params.set("q", search);
  const query = params.toString();
  return `/leaderboards${query ? `?${query}` : ""}`;
}

function Metric({ label, value }) {
  return (
    <div className="rounded-[18px] border border-white/45 bg-white/70 px-4 py-3 backdrop-blur">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#687887]">
        {label}
      </p>
      <p className="mt-1 text-xl font-black text-[#12212B]">{value}</p>
    </div>
  );
}

function TopCard({ entry, featured = false }) {
  const profile = entry.profile;

  return (
    <article
      className={`relative overflow-hidden rounded-[28px] border bg-white shadow-[0_22px_65px_rgba(18,33,43,0.12)] transition duration-300 hover:-translate-y-1 ${
        featured
          ? "border-[#D7A93A]/45 lg:-mt-8"
          : "border-[#D7E1E7]"
      }`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-32 ${
          featured
            ? "bg-[linear-gradient(135deg,#17212b_0%,#445c74_55%,#d7a93a_100%)]"
            : "bg-[linear-gradient(135deg,#2f3f57_0%,#7ea9b9_100%)]"
        }`}
      />
      <div className="relative p-6 text-center">
        <div className="mx-auto flex w-max items-center justify-center rounded-full bg-white/20 p-2 backdrop-blur">
          <Avatar profile={profile} size={featured ? "xl" : "lg"} />
        </div>

        <div className="mt-5">
          <span className="inline-flex rounded-full bg-[#12212B] px-4 py-1.5 text-sm font-black text-white">
            #{entry.rank}
          </span>
          <Link href={`/profile/${profile.username}`}>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-[#12212B]">
              {profile.fullName}
            </h2>
          </Link>
          <p className="mt-1 text-sm font-semibold text-[#687887]">
            @{profile.username} - {profile.program}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <Metric label="Score" value={entry.score} />
          <Metric label="Rating" value={entry.averageRating || "0.0"} />
          <Metric label="Done" value={entry.completedRequests} />
        </div>

        {profile.badges?.length ? (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {profile.badges.slice(0, 3).map((badge) => (
              <span
                key={`${profile.id}-${badge}`}
                className="rounded-full border border-[#D7E1E8] bg-[#F8FBFC] px-3 py-1 text-xs font-bold text-[#52606D]"
              >
                {badge}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function RankedRow({ entry }) {
  const profile = entry.profile;

  return (
    <Link
      href={`/profile/${profile.username}`}
      className="group grid gap-4 rounded-[24px] border border-[#D9E2E8] bg-white p-5 shadow-[0_14px_40px_rgba(18,33,43,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#9EC4D0] sm:grid-cols-[72px_minmax(0,1fr)_auto]"
    >
      <div className="flex items-center gap-4 sm:block">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12212B] text-base font-black text-white">
          #{entry.rank}
        </div>
        <div className="sm:hidden">
          <Avatar profile={profile} />
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-4">
        <div className="hidden sm:block">
          <Avatar profile={profile} />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-black text-[#12212B] group-hover:text-[#245067]">
            {profile.fullName}
          </h3>
          <p className="mt-1 text-sm font-semibold text-[#687887]">
            @{profile.username} - {profile.program}
          </p>
          {profile.badges?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.badges.slice(0, 2).map((badge) => (
                <span
                  key={`${profile.id}-${badge}`}
                  className="rounded-full border border-[#D7E1E8] bg-[#F8FBFC] px-2.5 py-1 text-[11px] font-bold text-[#52606D]"
                >
                  {badge}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:min-w-[260px]">
        <Metric label="Score" value={entry.score} />
        <Metric label="Rating" value={entry.averageRating || "0.0"} />
        <Metric label="Reviews" value={entry.reviewCount} />
      </div>
    </Link>
  );
}

export default async function LeaderboardsPage({ searchParams }) {
  const params = await searchParams;
  const period = ["weekly", "monthly", "all-time"].includes(params.period)
    ? params.period
    : "overall";
  const search = typeof params.q === "string" ? params.q.trim() : "";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/join?next=${encodeURIComponent("/leaderboards")}`);
  }

  if (!isAllowedStudentEmail(user.email)) {
    await supabase.auth.signOut();
    redirect("/join?error=student_email_required");
  }

  const entries = await getLeaderboardEntries(supabase, { period, search });
  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);
  const totalReviews = entries.reduce((sum, entry) => sum + entry.reviewCount, 0);
  const totalCompleted = entries.reduce((sum, entry) => sum + entry.completedRequests, 0);

  return (
    <main className="min-h-screen bg-[#EFF3F5]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#0f1720_0%,#33455f_42%,#8fb8c7_100%)]" />
        <div className="absolute inset-0 opacity-30 subtle-grid" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#D7A93A]">
                Skillpool leaderboard
              </p>
              <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
                The students everyone trusts.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
                Rankings blend completed exchanges, received ratings, forum contribution, badges, and confirmed PayMongo activity into one reputation score.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-[28px] border border-white/18 bg-white/12 p-4 backdrop-blur-xl">
              <Metric label="Ranked" value={entries.length} />
              <Metric label="Reviews" value={totalReviews} />
              <Metric label="Done" value={totalCompleted} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-[28px] border border-[#D9E2E8] bg-white p-4 shadow-[0_14px_45px_rgba(18,33,43,0.06)] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {periodTabs.map((tab) => (
              <Link
                key={tab.value}
                href={hrefForPeriod(tab.value, search)}
                className={`rounded-2xl px-4 py-2.5 text-sm font-black transition ${
                  period === tab.value || (period === "overall" && tab.value === "overall")
                    ? "bg-[#12212B] text-white"
                    : "bg-[#F4F8FA] text-[#52606D] hover:bg-[#E7F0F3]"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          <form className="flex w-full gap-2 lg:max-w-md">
            {period !== "overall" ? (
              <input type="hidden" name="period" value={period} />
            ) : null}
            <input
              name="q"
              defaultValue={search}
              placeholder="Search students, programs, badges"
              className="min-w-0 flex-1 rounded-2xl border border-[#D3DDE5] bg-[#F9FBFC] px-4 py-3 text-sm outline-none focus:border-[#7EA9B9]"
            />
            <button className="rounded-2xl bg-[#12212B] px-5 py-3 text-sm font-bold text-white">
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        {entries.length ? (
          <>
            <div className="grid gap-5 lg:grid-cols-3 lg:items-start">
              {topThree.map((entry) => (
                <TopCard key={entry.id} entry={entry} featured={entry.rank === 1} />
              ))}
            </div>

            <div className="mt-8 space-y-4">
              {rest.map((entry) => (
                <RankedRow key={entry.id} entry={entry} />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-[32px] border border-dashed border-[#B8C7D1] bg-white p-10 text-center shadow-[0_18px_55px_rgba(18,33,43,0.06)]">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#7B8794]">
              No rankings yet
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#12212B]">
              Reputation starts with the first exchange.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-[#61727E]">
              Complete an exchange, leave a review, award badges, or confirm a payment and this board will come alive automatically.
            </p>
            <Link
              href="/forum"
              className="mt-7 inline-flex rounded-2xl bg-[#12212B] px-5 py-3 text-sm font-semibold text-white"
            >
              Browse the forum
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
