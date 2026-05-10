import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getForumTaxonomy } from "@/lib/forum";
import PostEditorForm from "@/components/forum/PostEditorForm";

export default async function NewForumPostPage({ searchParams }) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/join");
  }

  const { programs, courses } = await getForumTaxonomy(supabase);

  return (
    <main className="min-h-screen bg-[#EFF3F5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1120px]">
        <div className="rounded-[28px] border border-[#D7E1E7] bg-white p-6 shadow-[0_12px_35px_rgba(23,43,58,0.06)] sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#7B8794]">
            New thread
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[#12212B]">
            Create a course forum post
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-[#52606D]">
            Select a program, choose a course, then decide whether you are offering
            a skill or asking for help.
          </p>

          <div className="mt-8">
            <PostEditorForm
              mode="create"
              programs={programs}
              courses={courses}
              initialProgramSlug={params.program || ""}
              initialCourseSlug={params.course || ""}
            />
          </div>
        </div>
      </div>
    </main>
  );
}