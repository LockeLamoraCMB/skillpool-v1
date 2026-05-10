import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getForumTaxonomy } from "@/lib/forum";
import PostEditorForm from "@/components/forum/PostEditorForm";

export default async function EditForumPostPage({ params }) {
  const { slug } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/join");
  }

  const { data: post, error: postError } = await supabase
    .from("forum_posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (postError) {
    throw new Error(postError.message);
  }

  if (!post) {
    notFound();
  }

  if (post.author_id !== user.id) {
    redirect(`/forum/post/${slug}`);
  }

  const { data: attachments, error: attachmentsError } = await supabase
    .from("forum_post_attachments")
    .select("*")
    .eq("post_id", post.id)
    .eq("is_inline", false)
    .order("created_at", { ascending: true });

  if (attachmentsError) {
    throw new Error(attachmentsError.message);
  }

  const { programs, courses } = await getForumTaxonomy(supabase);

  const selectedProgram = programs.find((program) => program.id === post.program_id);
  const selectedCourse = courses.find((course) => course.id === post.course_id);

  const initialPost = {
    ...post,
    program_slug: selectedProgram?.slug || "",
    course_slug: selectedCourse?.slug || "",
  };

  return (
    <main className="min-h-screen bg-[#EFF3F5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1120px]">
        <div className="rounded-[28px] border border-[#D7E1E7] bg-white p-6 shadow-[0_12px_35px_rgba(23,43,58,0.06)] sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#7B8794]">
            Edit thread
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[#12212B]">
            Update your post
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-[#52606D]">
            You can edit your content, attachments, course selection, and whether this
            thread is offering a skill or asking for help.
          </p>

          <div className="mt-8">
            <PostEditorForm
              mode="edit"
              programs={programs}
              courses={courses}
              initialProgramSlug={selectedProgram?.slug || ""}
              initialCourseSlug={selectedCourse?.slug || ""}
              initialPost={initialPost}
              initialAttachments={attachments || []}
              currentUserId={user.id}
            />
          </div>
        </div>
      </div>
    </main>
  );
}