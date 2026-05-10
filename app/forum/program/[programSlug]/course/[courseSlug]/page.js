import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  applyPostFeedFilters,
  getForumTaxonomy,
  normalizeForumFilters,
} from "@/lib/forum";
import ForumFilterPanel from "@/components/forum/ForumFilterPanel";
import ForumPostCard from "@/components/forum/ForumPostCard";

export default async function CoursePage({ params, searchParams }) {
  const { programSlug, courseSlug } = await params;
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

  const course = courses.find(
    (item) => item.slug === courseSlug && item.program_id === program.id
  );
  if (!course) {
    notFound();
  }

  let feedQuery = supabase
    .from("forum_post_feed")
    .select("*")
    .limit(40);

  feedQuery = applyPostFeedFilters(feedQuery, filters, {
    programSlug,
    courseSlug,
  });

  const { data: posts, error } = await feedQuery;

  return (
    <main className="min-h-screen bg-[#EFF3F5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1380px] space-y-6">
        <section className="rounded-[28px] border border-[#D7E1E7] bg-white p-6 shadow-[0_12px_35px_rgba(23,43,58,0.06)] sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#7B8794]">
                {program.name}
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-[#12212B]">
                {course.name}
              </h1>
              <p className="mt-3 max-w-[760px] text-[15px] leading-7 text-[#52606D]">
                {course.description || "Discuss projects, offer skills, or ask for help inside this course."}
              </p>
            </div>

            <Link
              href={`/forum/new?program=${program.slug}&course=${course.slug}`}
              className="inline-flex rounded-2xl bg-[#12212B] px-5 py-3 text-sm font-semibold text-white"
            >
              Post in this course
            </Link>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <ForumFilterPanel
            programs={programs}
            courses={[course]}
            filters={filters}
            lockedProgramSlug={program.slug}
            lockedCourseSlug={course.slug}
          />

          <section className="space-y-5">
            <div className="rounded-[24px] border border-[#D9E2E8] bg-white p-5 shadow-[0_12px_35px_rgba(23,43,58,0.06)]">
              <h2 className="text-2xl font-black text-[#12212B]">
                Threads in {course.name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#61727E]">
                Filter by author, post type, date, and sort order.
              </p>
            </div>

            {error ? (
              <div className="rounded-[24px] border border-red-200 bg-red-50 p-6 text-red-700">
                Failed to load posts: {error.message}
              </div>
            ) : null}

            {!error && (!posts || posts.length === 0) ? (
              <div className="rounded-[24px] border border-[#D9E2E8] bg-white p-10 text-center shadow-[0_12px_35px_rgba(23,43,58,0.06)]">
                <h3 className="text-2xl font-black text-[#12212B]">No course posts yet</h3>
                <p className="mt-3 text-[15px] leading-7 text-[#52606D]">
                  Start the first discussion or skill exchange in this course.
                </p>
                <Link
                  href={`/forum/new?program=${program.slug}&course=${course.slug}`}
                  className="mt-6 inline-flex rounded-2xl bg-[#12212B] px-5 py-3 text-sm font-semibold text-white"
                >
                  Create a post
                </Link>
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