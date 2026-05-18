"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  buildCommentTree,
  createComment,
  deleteComment,
  formatCommentDate,
  updateComment,
} from "@/lib/comments";

function authorName(comment) {
  return (
    comment.author?.full_name ||
    comment.author?.username ||
    "Skillpool student"
  );
}

function avatarSrc(comment) {
  return comment.author?.avatar_url || "/profile/avatar.png";
}

function removeCommentWithReplies(comments, commentId) {
  const idsToRemove = new Set([commentId]);
  let found = true;

  while (found) {
    found = false;
    for (const comment of comments) {
      if (
        comment.parent_comment_id &&
        idsToRemove.has(comment.parent_comment_id) &&
        !idsToRemove.has(comment.id)
      ) {
        idsToRemove.add(comment.id);
        found = true;
      }
    }
  }

  return comments.filter((comment) => !idsToRemove.has(comment.id));
}

function CommentForm({
  value,
  onChange,
  onSubmit,
  submitting,
  placeholder = "Write a comment...",
  submitLabel = "Post comment",
  compact = false,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-2xl border border-[#D3DDE5] bg-[#F9FBFC] px-4 py-3 text-sm leading-6 text-[#12212B] outline-none focus:border-[#7EA9B9] ${
          compact ? "min-h-[92px]" : "min-h-[130px]"
        }`}
        placeholder={placeholder}
        maxLength={2000}
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-2xl bg-[#12212B] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

function CommentItem({
  comment,
  depth,
  currentUserId,
  replyValue,
  onReplyValueChange,
  onReply,
  onEdit,
  onDelete,
  busyKey,
  editingId,
  editValue,
  onEditValueChange,
  onStartEdit,
  onCancelEdit,
}) {
  const isOwner = currentUserId === comment.user_id;
  const isEditing = editingId === comment.id;
  const isReplying = Object.prototype.hasOwnProperty.call(replyValue, comment.id);

  return (
    <article
      id={`comment-${comment.id}`}
      className="rounded-[20px] border border-[#E7EEF2] bg-[#F8FBFC] p-5"
      style={{ marginLeft: depth ? `${Math.min(depth, 3) * 18}px` : 0 }}
    >
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[#D7E1E8] bg-white">
          <img
            src={avatarSrc(comment)}
            alt={authorName(comment)}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-black text-[#12212B]">
              {comment.author?.username || authorName(comment)}
            </p>
            <span className="text-xs text-[#7B8794]">
              {formatCommentDate(comment.created_at)}
            </span>
            {comment.updated_at && comment.updated_at !== comment.created_at ? (
              <span className="text-xs text-[#9AA6B2]">Edited</span>
            ) : null}
          </div>

          {comment.author?.full_name ? (
            <p className="mt-1 text-xs text-[#6B7C88]">
              {comment.author.full_name}
            </p>
          ) : null}

          {isEditing ? (
            <form
              onSubmit={(event) => onEdit(event, comment.id)}
              className="mt-4 space-y-3"
            >
              <textarea
                value={editValue}
                onChange={(event) => onEditValueChange(event.target.value)}
                className="min-h-[100px] w-full rounded-2xl border border-[#D3DDE5] bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-[#7EA9B9]"
                maxLength={2000}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={busyKey === `edit:${comment.id}`}
                  className="rounded-2xl bg-[#12212B] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {busyKey === `edit:${comment.id}` ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="rounded-2xl border border-[#D7E1E8] bg-white px-4 py-2 text-sm font-semibold text-[#52606D]"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-[#334155]">
              {comment.content}
            </p>
          )}

          {!isEditing ? (
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  onReplyValueChange(
                    comment.id,
                    isReplying ? undefined : ""
                  )
                }
                className="text-sm font-bold text-[#245067]"
              >
                {isReplying ? "Cancel reply" : "Reply"}
              </button>

              {isOwner ? (
                <>
                  <button
                    type="button"
                    onClick={() => onStartEdit(comment)}
                    className="text-sm font-bold text-[#52606D]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(comment.id)}
                    disabled={busyKey === `delete:${comment.id}`}
                    className="text-sm font-bold text-[#9B1C1C] disabled:opacity-60"
                  >
                    {busyKey === `delete:${comment.id}` ? "Deleting..." : "Delete"}
                  </button>
                </>
              ) : null}
            </div>
          ) : null}

          {isReplying ? (
            <div className="mt-4">
              <CommentForm
                value={replyValue[comment.id] || ""}
                onChange={(nextValue) => onReplyValueChange(comment.id, nextValue)}
                onSubmit={(event) => onReply(event, comment.id)}
                submitting={busyKey === `reply:${comment.id}`}
                placeholder={`Reply to ${comment.author?.username || "this comment"}...`}
                submitLabel="Post reply"
                compact
              />
            </div>
          ) : null}
        </div>
      </div>

      {comment.replies?.length ? (
        <div className="mt-5 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              currentUserId={currentUserId}
              replyValue={replyValue}
              onReplyValueChange={onReplyValueChange}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              busyKey={busyKey}
              editingId={editingId}
              editValue={editValue}
              onEditValueChange={onEditValueChange}
              onStartEdit={onStartEdit}
              onCancelEdit={onCancelEdit}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}

export default function ForumComments({
  postId,
  currentUserId,
  initialComments = [],
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [comments, setComments] = useState(initialComments);
  const [draft, setDraft] = useState("");
  const [replyDrafts, setReplyDrafts] = useState({});
  const [editingId, setEditingId] = useState("");
  const [editDraft, setEditDraft] = useState("");
  const [busyKey, setBusyKey] = useState("");
  const [error, setError] = useState("");

  const tree = useMemo(() => buildCommentTree(comments), [comments]);
  const commentCount = comments.length;

  function setReplyDraft(commentId, value) {
    setReplyDrafts((current) => {
      const next = { ...current };

      if (value === undefined) {
        delete next[commentId];
      } else {
        next[commentId] = value;
      }

      return next;
    });
  }

  async function handleCreate(event) {
    event.preventDefault();
    setError("");

    if (!currentUserId) {
      setError("Please sign in to comment.");
      return;
    }

    setBusyKey("create");

    try {
      const comment = await createComment(supabase, {
        forumPostId: postId,
        userId: currentUserId,
        content: draft,
      });

      setComments((current) => [...current, comment]);
      setDraft("");
      router.refresh();
    } catch (commentError) {
      setError(commentError.message || "Comment could not be posted.");
    } finally {
      setBusyKey("");
    }
  }

  async function handleReply(event, parentCommentId) {
    event.preventDefault();
    setError("");

    setBusyKey(`reply:${parentCommentId}`);

    try {
      const comment = await createComment(supabase, {
        forumPostId: postId,
        userId: currentUserId,
        parentCommentId,
        content: replyDrafts[parentCommentId] || "",
      });

      setComments((current) => [...current, comment]);
      setReplyDraft(parentCommentId, undefined);
      router.refresh();
    } catch (commentError) {
      setError(commentError.message || "Reply could not be posted.");
    } finally {
      setBusyKey("");
    }
  }

  async function handleEdit(event, commentId) {
    event.preventDefault();
    setError("");
    setBusyKey(`edit:${commentId}`);

    try {
      const updated = await updateComment(supabase, {
        commentId,
        content: editDraft,
      });

      setComments((current) =>
        current.map((comment) => (comment.id === commentId ? updated : comment))
      );
      setEditingId("");
      setEditDraft("");
      router.refresh();
    } catch (commentError) {
      setError(commentError.message || "Comment could not be updated.");
    } finally {
      setBusyKey("");
    }
  }

  async function handleDelete(commentId) {
    setError("");

    if (!window.confirm("Delete this comment and any replies under it?")) {
      return;
    }

    setBusyKey(`delete:${commentId}`);

    try {
      await deleteComment(supabase, commentId);
      setComments((current) => removeCommentWithReplies(current, commentId));
      router.refresh();
    } catch (commentError) {
      setError(commentError.message || "Comment could not be deleted.");
    } finally {
      setBusyKey("");
    }
  }

  return (
    <section className="rounded-[28px] border border-[#D7E1E7] bg-white p-6 shadow-[0_12px_35px_rgba(23,43,58,0.06)] sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#12212B]">Comments</h2>
          <p className="mt-2 text-sm leading-6 text-[#61727E]">
            {commentCount
              ? `${commentCount} comment${commentCount === 1 ? "" : "s"} in this thread`
              : "Start the conversation for this thread."}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <CommentForm
          value={draft}
          onChange={setDraft}
          onSubmit={handleCreate}
          submitting={busyKey === "create"}
        />
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-6 space-y-4">
        {tree.length ? (
          tree.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              depth={0}
              currentUserId={currentUserId}
              replyValue={replyDrafts}
              onReplyValueChange={setReplyDraft}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
              busyKey={busyKey}
              editingId={editingId}
              editValue={editDraft}
              onEditValueChange={setEditDraft}
              onStartEdit={(commentToEdit) => {
                setEditingId(commentToEdit.id);
                setEditDraft(commentToEdit.content || "");
              }}
              onCancelEdit={() => {
                setEditingId("");
                setEditDraft("");
              }}
            />
          ))
        ) : (
          <div className="rounded-[20px] border border-dashed border-[#D7E1E8] bg-[#FAFCFD] p-5 text-sm text-[#61727E]">
            No comments yet. Be the first to ask a question or share helpful context.
          </div>
        )}
      </div>
    </section>
  );
}
