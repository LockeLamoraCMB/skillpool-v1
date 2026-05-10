import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  applyPostFeedFilters,
  getForumTaxonomy,
  normalizeForumFilters,
} from "@/lib/forum";
import CourseCard from "@/components/forum/CourseCard";
import ForumFilterPanel from "@/components/forum/ForumFilterPanel";
import ForumPostCard from "@/components/forum/ForumPostCard";

export default async function ProgramPage({ params, searchParams }) {
  const { programSlug } = await params;
  const filters = normalizeForumFilters(await searchParams);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/join");
  }

  const { programs, courses } = await getForumTaxonomy(supabase);

  const program = programs.find((item) => item.slug === programSlug);
  if (!program) {
    notFound();
  }

  const programCourses = courses.filter((course) => course.program_id === program.id);

  let feedQuery = supabase
    .from("forum_post_feed")
    .select("*")
    .limit(40);

  feedQuery = applyPostFeedFilters(feedQuery, filters, {
    programSlug,
  });

  const { data: posts, error } = await feedQuery;

  return (
    <main className="min-h-screen bg-[#EFF3F5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1380px] space-y-6">
        <section className="rounded-[28px] border border-[#D7E1E7] bg-white p-6 shadow-[0_12px_35px_rgba(23,43,58,0.06)] sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#7B8794]">
                Program
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-[#12212B]">
                {program.name}
              </h1>
              <p className="mt-3 max-w-[760px] text-[15px] leading-7 text-[#52606D]">
                {program.description || "Browse course-specific threads and create targeted posts."}
              </p>
            </div>

            <Link
              href={`/forum/new?program=${program.slug}`}
              className="inline-flex rounded-2xl bg-[#12212B] px-5 py-3 text-sm font-semibold text-white"
            >
              New post in {program.slug.toUpperCase()}
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {programCourses.map((course) => (
              <CourseCard key={course.id} course={course} programSlug={program.slug} />
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <ForumFilterPanel
            programs={programs}
            courses={programCourses}
            filters={filters}
            lockedProgramSlug={program.slug}
          />

          <section className="space-y-5">
            <div className="rounded-[24px] border border-[#D9E2E8] bg-white p-5 shadow-[0_12px_35px_rgba(23,43,58,0.06)]">
              <h2 className="text-2xl font-black text-[#12212B]">Threads in {program.name}</h2>
              <p className="mt-2 text-sm leading-6 text-[#61727E]">
                Narrow posts by course, type, author, date, and sort order.
              </p>
            </div>

            {error ? (
              <div className="rounded-[24px] border border-red-200 bg-red-50 p-6 text-red-700">
                Failed to load posts: {error.message}
              </div>
            ) : null}

            {!error && (!posts || posts.length === 0) ? (
              <div className="rounded-[24px] border border-[#D9E2E8] bg-white p-10 text-center shadow-[0_12px_35px_rgba(23,43,58,0.06)]">
                <h3 className="text-2xl font-black text-[#12212B]">No posts in this program yet</h3>
                <p className="mt-3 text-[15px] leading-7 text-[#52606D]">
                  Create the first thread under one of the courses in this program.
                </p>
              </div>
            ) : null}

            {!error && posts?.length
              ? posts.map((post) => <ForumPostCard key={post.id} post={post} />)
              : null}
          </section>
        </div>
      </div>
    </main>
  );
}