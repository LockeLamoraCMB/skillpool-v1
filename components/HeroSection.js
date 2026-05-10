import Link from "next/link";
import { heroHighlights } from "@/lib/siteData";

export default function HeroSection({ programs, stats, featuredListings }) {
  return (
    <section className="page-shell pt-8 pb-8 sm:pt-10">
      <div className="section-card hero-noise subtle-grid overflow-hidden p-6 sm:p-10 lg:p-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-3xl">
            <span className="tag-pill">Student-only marketplace • STI College Carmona</span>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-[#000100] sm:text-5xl lg:text-6xl">
              Your go-to skill exchange platform
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-black/70 sm:text-lg">
              Skillpool helps students find tutoring, academic assistance, creative work,
              multimedia help, and basic programming support in one trusted campus space.
              It feels like a polished marketplace with the energy of an active student forum.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/join"
                className="inline-flex items-center rounded-full bg-[#000100] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Join Skillpool
              </Link>
              <Link
                href="/forum"
                className="inline-flex items-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#000100] transition hover:border-black/20"
              >
                Browse Forum
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {heroHighlights.map((item) => (
                <span key={item} className="tag-pill">
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="soft-panel p-4">
                  <p className="text-2xl font-black text-[#000100]">{stat.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-black/45">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="soft-panel p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-black/45">Explore listings</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-[#000100]">
                    Programs with active requests today
                  </h2>
                </div>
                <div className="rounded-2xl bg-[#B4D2E7]/35 px-3 py-2 text-sm font-semibold text-[#000100]">
                  {programs.length} programs
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {programs.length ? (
                  programs.map((program) => (
                    <span key={program.id} className="tag-pill">
                      {program.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-black/55">Add program rows in Supabase to populate this area.</span>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="soft-panel p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-black/45">Trending asks</p>
                <ul className="mt-4 space-y-3">
                  {featuredListings.length ? (
                    featuredListings.slice(0, 3).map((listing) => (
                      <li key={listing.id} className="rounded-2xl border border-black/6 bg-[#F8F8F8] p-3">
                        <p className="text-sm font-semibold text-[#000100]">{listing.title}</p>
                        <p className="mt-1 text-xs text-black/55">
                          {listing.priceLabel} • {listing.meetupOption}
                        </p>
                      </li>
                    ))
                  ) : (
                    <li className="rounded-2xl border border-dashed border-black/10 bg-[#F8F8F8] p-3 text-sm text-black/55">
                      No live listings yet. Add rows to the listings table to show requests here.
                    </li>
                  )}
                </ul>
              </div>

              <div className="soft-panel p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-black/45">Why it works</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-black/68">
                  <li className="rounded-2xl border border-black/6 bg-[#F8F8F8] p-3">
                    Verified student-only access for stronger trust.
                  </li>
                  <li className="rounded-2xl border border-black/6 bg-[#F8F8F8] p-3">
                    Ratings, reviews, and badges make credibility visible.
                  </li>
                  <li className="rounded-2xl border border-black/6 bg-[#F8F8F8] p-3">
                    Forum-like activity keeps the platform feeling alive and useful.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
