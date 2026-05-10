"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Avatar from "@/components/Avatar";
import BadgePill from "@/components/BadgePill";
import SidebarWidget from "@/components/SidebarWidget";
import ThreadCard from "@/components/ThreadCard";
import { announcements, forumTabs } from "@/lib/siteData";

export default function ForumClient({ programs, listings, leaderboardStats, badges, courseForums, trendingDiscussions, latestActivity }) {
  const searchParams = useSearchParams();
  const queryProgram = searchParams.get("program") || "all";

  const [activeProgram, setActiveProgram] = useState(queryProgram);
  const [activeTab, setActiveTab] = useState("All Posts");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setActiveProgram(queryProgram);
  }, [queryProgram]);

  const filteredListings = useMemo(() => {
    let items = [...listings];

    if (activeProgram !== "all") {
      items = items.filter((item) => item.programSlug === activeProgram);
    }

    if (search.trim()) {
      const value = search.toLowerCase();
      items = items.filter((item) =>
        [
          item.title,
          item.description,
          item.courseName,
          item.program?.name,
          item.roleType,
          item.poster?.fullName,
        ]
          .join(" ")
          .toLowerCase()
          .includes(value)
      );
    }

    switch (activeTab) {
      case "Looking for Tutor":
        items = items.filter((item) => item.roleType === "Client");
        break;
      case "Offering Service":
        items = items.filter((item) => item.roleType === "Tutor");
        break;
      case "Completed":
        items = items.filter((item) => item.status === "Completed");
        break;
      case "Most Active":
        items = items.sort((a, b) => b.replyCount + b.views / 10 - (a.replyCount + a.views / 10));
        break;
      case "Most Recent":
      case "All Posts":
      default:
        items = items.sort((a, b) => a.postedMinutesAgo - b.postedMinutesAgo);
        break;
    }

    return items;
  }, [activeProgram, activeTab, search, listings]);

  const pinnedPosts = filteredListings.filter((item) => item.isPinned && item.status !== "Completed");
  const feedPosts = filteredListings.filter((item) => !item.isPinned || item.status === "Completed");

  const visibleCourseForums =
    activeProgram === "all"
      ? courseForums.slice(0, 8)
      : courseForums.filter((item) => item.programSlug === activeProgram);

  const leaderboardPreview = leaderboardStats.slice(0, 3);

  return (
    <section className="page-shell py-10 sm:py-14">
      <div className="section-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black/45">Forum / Listings</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-[#000100] sm:text-5xl">
              Discover tutors, clients, and active campus threads
            </h1>
            <p className="mt-4 text-base leading-7 text-black/68 sm:text-lg">
              Skillpool’s forum blends category browsing, thread density, and marketplace-style
              discovery so listings feel active, organized, and easy to trust.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/join" className="inline-flex items-center rounded-full bg-[#000100] px-4 py-2 text-sm font-semibold text-white">
              + Post as Tutor
            </Link>
            <Link href="/join" className="inline-flex items-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#000100]">
              + Post as Client
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <label htmlFor="forum-search" className="sr-only">Search listings</label>
            <input
              id="forum-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tutors, clients, course forums, or listing titles..."
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 pr-11 text-sm text-[#000100] outline-none transition focus:border-black/25"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/35">⌕</span>
          </div>
          <div className="rounded-2xl border border-black/10 bg-[#F8F8F8] px-4 py-3 text-sm text-black/65">
            {filteredListings.length} result{filteredListings.length === 1 ? "" : "s"} shown
          </div>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveProgram("all")}
            className={`rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap ${
              activeProgram === "all" ? "bg-[#000100] text-white" : "border border-black/10 bg-white text-black/65"
            }`}
          >
            All Programs
          </button>
          {programs.map((program) => (
            <button
              key={program.id}
              type="button"
              onClick={() => setActiveProgram(program.slug)}
              className={`rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap ${
                activeProgram === program.slug ? "bg-[#000100] text-white" : "border border-black/10 bg-white text-black/65"
              }`}
            >
              {program.name}
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {forumTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap ${
                activeTab === tab ? "bg-[#B4D2E7]/45 text-[#000100]" : "border border-black/10 bg-white text-black/60"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
        <aside className="space-y-6">
          <SidebarWidget title="Programs" description="Switch between major hubs and browse the course-based spaces under each one.">
            <div className="space-y-2">
              {programs.map((program) => (
                <button
                  key={program.id}
                  type="button"
                  onClick={() => setActiveProgram(program.slug)}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                    activeProgram === program.slug ? "bg-[#000100] text-white" : "border border-black/10 bg-white text-[#000100]"
                  }`}
                >
                  <span>{program.name}</span>
                  <span className="text-xs opacity-70">{listings.filter((item) => item.programSlug === program.slug).length}</span>
                </button>
              ))}
            </div>
          </SidebarWidget>

          <SidebarWidget title="Course forums" description="Subforums you can highlight within each program.">
            <div className="space-y-2">
              {visibleCourseForums.length ? visibleCourseForums.map((course) => (
                <div key={course.id} className="rounded-2xl border border-black/8 bg-white px-4 py-3">
                  <p className="text-sm font-semibold text-[#000100]">{course.courseName}</p>
                  <p className="mt-1 text-xs leading-5 text-black/60">{course.description}</p>
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-black/10 bg-white px-4 py-3 text-sm text-black/55">
                  Add courses in Supabase to populate this area.
                </div>
              )}
            </div>
          </SidebarWidget>

          <SidebarWidget title="Quick community pulse">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl border border-black/6 bg-[#F8F8F8] px-3 py-4">
                <p className="text-xl font-black text-[#000100]">{pinnedPosts.length}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-black/45">Pinned now</p>
              </div>
              <div className="rounded-2xl border border-black/6 bg-[#F8F8F8] px-3 py-4">
                <p className="text-xl font-black text-[#000100]">{listings.reduce((sum, item) => sum + item.replyCount, 0)}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-black/45">Replies</p>
              </div>
            </div>
          </SidebarWidget>
        </aside>

        <div className="space-y-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-black/45">Pinned posts</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-[#000100]">Important listings and urgent requests</h2>
              </div>
              <BadgePill label={`${pinnedPosts.length} pinned`} tone="accent" />
            </div>

            {pinnedPosts.length > 0 ? (
              <div className="space-y-4">
                {pinnedPosts.map((listing) => (
                  <ThreadCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="section-card p-6 text-sm text-black/60">No pinned posts match the current filter.</div>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-black/45">Latest posts</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-[#000100]">Active listings across the community</h2>
              </div>
              <BadgePill label={activeTab} tone="muted" />
            </div>

            <div className="space-y-4">
              {feedPosts.length ? feedPosts.map((listing) => <ThreadCard key={listing.id} listing={listing} />) : (
                <div className="section-card p-6 text-sm text-black/60">No live listings yet. Add rows to the listings table to show them here.</div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <SidebarWidget title="Trending discussions">
            {trendingDiscussions.length ? trendingDiscussions.map((discussion) => (
              <Link key={discussion.id} href={`/forum/${discussion.id}`} className="block rounded-2xl border border-black/8 bg-white px-4 py-3 transition hover:border-black/15">
                <p className="text-sm font-semibold text-[#000100]">{discussion.title}</p>
                <p className="mt-1 text-xs text-black/55">{discussion.replies} replies • {discussion.programSlug.toUpperCase()}</p>
              </Link>
            )) : <div className="rounded-2xl border border-dashed border-black/10 bg-white px-4 py-3 text-sm text-black/55">Discussions appear here once listings exist.</div>}
          </SidebarWidget>

          <SidebarWidget title="Latest activity">
            {latestActivity.length ? latestActivity.map((activity) => (
              <div key={activity.id} className="rounded-2xl border border-black/8 bg-white px-4 py-3">
                <p className="text-sm leading-6 text-[#000100]">{activity.text}</p>
                <p className="mt-1 text-xs text-black/50">{activity.time}</p>
              </div>
            )) : <div className="rounded-2xl border border-dashed border-black/10 bg-white px-4 py-3 text-sm text-black/55">Activity will appear here after your first posts and replies.</div>}
          </SidebarWidget>

          <SidebarWidget title="Top tutors">
            {leaderboardStats.length ? leaderboardStats.slice(0, 4).map((entry) => (
              <Link
                key={entry.id}
                href={`/profile/${entry.profile?.username}`}
                className="flex items-center justify-between rounded-2xl border border-black/8 bg-white px-4 py-3 transition hover:border-black/15"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={entry.profile?.fullName || "Student"} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-[#000100]">{entry.profile?.fullName}</p>
                    <p className="text-xs text-black/55">{entry.profile?.program}</p>
                  </div>
                </div>
                <BadgePill label={`#${entry.rank}`} tone="accent" />
              </Link>
            )) : <div className="rounded-2xl border border-dashed border-black/10 bg-white px-4 py-3 text-sm text-black/55">Leaderboard entries will appear after you add stats rows.</div>}
          </SidebarWidget>

          <SidebarWidget title="Top badges">
            {badges.length ? badges.map((badge) => (
              <div key={badge.id} className="flex items-center justify-between rounded-2xl border border-black/8 bg-white px-4 py-3">
                <p className="text-sm font-semibold text-[#000100]">{badge.name}</p>
                <span className="text-xs text-black/55">{badge.count} users</span>
              </div>
            )) : <div className="rounded-2xl border border-dashed border-black/10 bg-white px-4 py-3 text-sm text-black/55">Award badges in Supabase to see usage here.</div>}
          </SidebarWidget>

          <SidebarWidget title="Leaderboard preview">
            <div className="space-y-3">
              {leaderboardPreview.length ? leaderboardPreview.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-black/8 bg-white px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#000100]">#{entry.rank} {entry.profile?.fullName}</p>
                    <span className="text-xs text-black/55">{entry.score} pts</span>
                  </div>
                  <p className="mt-1 text-xs text-black/55">{entry.completedRequests} completed • {entry.averageRating}★ rating</p>
                </div>
              )) : <div className="rounded-2xl border border-dashed border-black/10 bg-white px-4 py-3 text-sm text-black/55">Leaderboard preview appears after adding stats.</div>}
            </div>
          </SidebarWidget>

          <SidebarWidget title="Announcements">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="rounded-2xl border border-black/8 bg-white px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#000100]">{announcement.title}</p>
                  <BadgePill label={announcement.label} tone="verified" />
                </div>
                <p className="mt-2 text-xs leading-5 text-black/58">{announcement.summary}</p>
              </div>
            ))}
          </SidebarWidget>
        </aside>
      </div>
    </section>
  );
}
