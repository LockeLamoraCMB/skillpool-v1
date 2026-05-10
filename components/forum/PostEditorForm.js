"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { makeForumSlug, parseTags } from "@/lib/forum";
import PostTypeSelector from "@/components/forum/PostTypeSelector";
import RichTextEditor from "@/components/forum/RichTextEditor";
import AttachmentUploader from "@/components/forum/AttachmentUploader";

function hasVisibleBody(html = "") {
  const withoutTags = html.replace(/<[^>]*>/g, "").trim();
  return Boolean(withoutTags || html.includes("<img"));
}

function safeFileName(name = "") {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export default function PostEditorForm({
  mode = "create",
  programs = [],
  courses = [],
  initialProgramSlug = "",
  initialCourseSlug = "",
  initialPost = null,
  initialAttachments = [],
  currentUserId = null,
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [title, setTitle] = useState(initialPost?.title || "");
  const [programSlug, setProgramSlug] = useState(
    initialProgramSlug || initialPost?.program_slug || ""
  );
  const [courseSlug, setCourseSlug] = useState(
    initialCourseSlug || initialPost?.course_slug || ""
  );
  const [postType, setPostType] = useState(initialPost?.post_type || "offer");
  const [priceAmount, setPriceAmount] = useState(
    initialPost?.price_amount ? String(initialPost.price_amount) : ""
  );
  const [tagInput, setTagInput] = useState(
    (initialPost?.tags || []).join(", ")
  );
  const [bodyHtml, setBodyHtml] = useState(initialPost?.body_html || "<p></p>");
  const [existingAttachments, setExistingAttachments] = useState(initialAttachments || []);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState([]);
  const [stagedAttachments, setStagedAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const draftKey = useMemo(
    () => initialPost?.id || crypto.randomUUID(),
    [initialPost?.id]
  );

  const selectedProgram =
    programs.find((program) => program.slug === programSlug) || null;

  const availableCourses = selectedProgram
    ? courses.filter((course) => course.program_id === selectedProgram.id)
    : [];

  async function getCurrentUserId() {
    if (currentUserId) return currentUserId;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user?.id || null;
  }

  async function uploadToStorage(file, inline = false) {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("You must be signed in to upload attachments.");
    }

    const baseFolder = initialPost?.id
      ? `posts/${initialPost.id}`
      : `drafts/${draftKey}`;

    const path = `${userId}/${baseFolder}/${Date.now()}-${safeFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from("forum-attachments")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicData } = supabase.storage
      .from("forum-attachments")
      .getPublicUrl(path);

    const uploaded = {
      temp_id: crypto.randomUUID(),
      storage_path: path,
      public_url: publicData.publicUrl,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type || "application/octet-stream",
      is_image: file.type?.startsWith("image/") || false,
      is_inline: inline,
    };

    setStagedAttachments((current) => [...current, uploaded]);

    return uploaded;
  }

  async function handleFilesSelected(files) {
    setError("");

    for (const file of files) {
      try {
        await uploadToStorage(file, false);
      } catch (uploadError) {
        setError(uploadError.message);
        break;
      }
    }
  }

  async function handleInlineImageUpload(file) {
    setError("");

    try {
      return await uploadToStorage(file, true);
    } catch (uploadError) {
      setError(uploadError.message);
      return null;
    }
  }

  async function removeStagedAttachment(tempId) {
    const target = stagedAttachments.find((item) => item.temp_id === tempId);
    if (!target) return;

    await supabase.storage.from("forum-attachments").remove([target.storage_path]);
    setStagedAttachments((current) =>
      current.filter((item) => item.temp_id !== tempId)
    );
  }

  function removeExistingAttachment(id) {
    setRemovedAttachmentIds((current) =>
      current.includes(id) ? current : [...current, id]
    );
    setExistingAttachments((current) => current.filter((item) => item.id !== id));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const cleanTitle = title.trim();
    const cleanTags = parseTags(tagInput);
    const cleanPrice = Number(priceAmount || 0);

    if (!cleanTitle) {
      setError("Title is required.");
      return;
    }

    if (!selectedProgram) {
      setError("Please choose a program.");
      return;
    }

    const selectedCourse =
      availableCourses.find((course) => course.slug === courseSlug) || null;

    if (!selectedCourse) {
      setError("Please choose a course.");
      return;
    }

    if (!hasVisibleBody(bodyHtml)) {
      setError("Post content is required.");
      return;
    }

    if (!Number.isFinite(cleanPrice) || cleanPrice < 0) {
      setError("Service fee must be a valid amount.");
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

    let postId = initialPost?.id || "";
    let finalSlug = initialPost?.slug || makeForumSlug(cleanTitle);

    const payload = {
      author_id: user.id,
      program_id: selectedProgram.id,
      course_id: selectedCourse.id,
      post_type: postType,
      title: cleanTitle,
      slug: finalSlug,
      body_html: bodyHtml,
      price_amount: Number(cleanPrice.toFixed(2)),
      tags: cleanTags,
      updated_at: new Date().toISOString(),
    };

    if (mode === "create") {
      const { data: insertedPost, error: insertError } = await supabase
        .from("forum_posts")
        .insert(payload)
        .select("id, slug")
        .single();

      if (insertError) {
        setSubmitting(false);
        setError(insertError.message);
        return;
      }

      postId = insertedPost.id;
      finalSlug = insertedPost.slug;
    } else {
      const { error: updateError } = await supabase
        .from("forum_posts")
        .update(payload)
        .eq("id", initialPost.id)
        .eq("author_id", user.id);

      if (updateError) {
        setSubmitting(false);
        setError(updateError.message);
        return;
      }
    }

    if (removedAttachmentIds.length) {
      const attachmentsToDelete = initialAttachments.filter((attachment) =>
        removedAttachmentIds.includes(attachment.id)
      );

      if (attachmentsToDelete.length) {
        await supabase.storage
          .from("forum-attachments")
          .remove(attachmentsToDelete.map((item) => item.storage_path));

        await supabase
          .from("forum_post_attachments")
          .delete()
          .in("id", removedAttachmentIds);
      }
    }

    if (stagedAttachments.length) {
      const attachmentRows = stagedAttachments.map((attachment) => ({
        post_id: postId,
        uploader_id: user.id,
        bucket: "forum-attachments",
        storage_path: attachment.storage_path,
        file_name: attachment.file_name,
        file_size: attachment.file_size,
        mime_type: attachment.mime_type,
        public_url: attachment.public_url,
        is_image: attachment.is_image,
        is_inline: attachment.is_inline,
      }));

      const { error: attachmentsError } = await supabase
        .from("forum_post_attachments")
        .insert(attachmentRows);

      if (attachmentsError) {
        setSubmitting(false);
        setError(attachmentsError.message);
        return;
      }
    }

    setSubmitting(false);
    router.push(`/forum/post/${finalSlug}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#31424F]">
            Program
          </label>
          <select
            value={programSlug}
            onChange={(event) => {
              setProgramSlug(event.target.value);
              setCourseSlug("");
            }}
            className="w-full rounded-2xl border border-[#D3DDE5] bg-[#F9FBFC] px-4 py-3 outline-none focus:border-[#7EA9B9]"
            required
          >
            <option value="">Select a program</option>
            {programs.map((program) => (
              <option key={program.id} value={program.slug}>
                {program.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#31424F]">
            Course
          </label>
          <select
            value={courseSlug}
            onChange={(event) => setCourseSlug(event.target.value)}
            className="w-full rounded-2xl border border-[#D3DDE5] bg-[#F9FBFC] px-4 py-3 outline-none focus:border-[#7EA9B9]"
            required
            disabled={!selectedProgram}
          >
            <option value="">
              {selectedProgram ? "Select a course" : "Choose a program first"}
            </option>
            {availableCourses.map((course) => (
              <option key={course.id} value={course.slug}>
                {course.code ? `${course.code} — ` : ""}
                {course.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-3 block text-sm font-semibold text-[#31424F]">
          What kind of thread is this?
        </label>
        <PostTypeSelector value={postType} onChange={setPostType} />
      </div>

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
          Service fee
        </label>
        <div className="flex overflow-hidden rounded-2xl border border-[#D3DDE5] bg-[#F9FBFC] focus-within:border-[#7EA9B9]">
          <span className="flex items-center border-r border-[#D3DDE5] px-4 text-sm font-bold text-[#61727E]">
            PHP
          </span>
          <input
            type="number"
            min="0"
            step="1"
            value={priceAmount}
            onChange={(event) => setPriceAmount(event.target.value)}
            className="w-full bg-transparent px-4 py-3 outline-none"
            placeholder="0 for free exchange"
          />
        </div>
        <p className="mt-2 text-sm leading-6 text-[#61727E]">
          Add an amount only when this exchange should be paid through PayMongo.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#31424F]">
          Tags
        </label>
        <input
          value={tagInput}
          onChange={(event) => setTagInput(event.target.value)}
          className="w-full rounded-2xl border border-[#D3DDE5] bg-[#F9FBFC] px-4 py-3 outline-none focus:border-[#7EA9B9]"
          placeholder="Comma-separated, e.g. javascript, tutoring, canva"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#31424F]">
          Post content
        </label>
        <RichTextEditor
          value={bodyHtml}
          onChange={setBodyHtml}
          onUploadInlineImage={handleInlineImageUpload}
        />
      </div>

      <AttachmentUploader
        existingAttachments={existingAttachments}
        stagedAttachments={stagedAttachments}
        onFilesSelected={handleFilesSelected}
        onRemoveExisting={removeExistingAttachment}
        onRemoveStaged={removeStagedAttachment}
      />

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
          {submitting
            ? mode === "create"
              ? "Publishing..."
              : "Saving..."
            : mode === "create"
            ? "Publish post"
            : "Save changes"}
        </button>
      </div>
    </form>
  );
}
