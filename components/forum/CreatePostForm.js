"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FORUM_CATEGORIES, makeForumSlug, parseTags } from "@/lib/forum";

export default function CreatePostForm() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState(FORUM_CATEGORIES[0]);
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    const cleanTags = parseTags(tags);

    if (!cleanTitle || !cleanBody) {
      setError("Title and post content are required.");
      return;
    }

    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSubmitting(false);
      router.push("/join");
      return;
    }

    const slug = makeForumSlug(cleanTitle);

    const { error: insertError } = await supabase.from("forum_posts").insert({
      author_id: user.id,
      title: cleanTitle,
      slug,
      body: cleanBody,
      category,
      tags: cleanTags,
    });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push(`/forum/${slug}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#31424F]">
          Title
        </label>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-2xl border border-[#D3DDE5] bg-[#F9FBFC] px-4 py-3 outline-none focus:border-[#7EA9B9]"
          placeholder="What do you need help with?"
          maxLength={120}
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#31424F]">
          Category
        </label>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="w-full rounded-2xl border border-[#D3DDE5] bg-[#F9FBFC] px-4 py-3 outline-none focus:border-[#7EA9B9]"
        >
          {FORUM_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#31424F]">
          Tags
        </label>
        <input
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          className="w-full rounded-2xl border border-[#D3DDE5] bg-[#F9FBFC] px-4 py-3 outline-none focus:border-[#7EA9B9]"
          placeholder="Comma-separated, e.g. javascript, tutoring, canva"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#31424F]">
          Post content
        </label>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          className="min-h-[220px] w-full rounded-2xl border border-[#D3DDE5] bg-[#F9FBFC] px-4 py-3 outline-none focus:border-[#7EA9B9]"
          placeholder="Describe the skill exchange, help request, or offer."
          required
        />
      </div>

      {error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-2xl bg-[#12212B] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Publishing..." : "Publish post"}
        </button>
      </div>
    </form>
  );
}