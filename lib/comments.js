export function formatCommentDate(value) {
  if (!value) return "Just now";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function buildCommentTree(comments = []) {
  const byId = new Map();
  const roots = [];

  for (const comment of comments) {
    byId.set(comment.id, { ...comment, replies: [] });
  }

  for (const comment of byId.values()) {
    if (comment.parent_comment_id && byId.has(comment.parent_comment_id)) {
      byId.get(comment.parent_comment_id).replies.push(comment);
    } else {
      roots.push(comment);
    }
  }

  return roots;
}

export function cleanCommentContent(content = "") {
  return String(content).replace(/\r\n/g, "\n").trim();
}

export async function fetchComments(supabase, forumPostId) {
  const { data, error } = await supabase
    .from("forum_comments")
    .select(`
      id,
      forum_post_id,
      user_id,
      parent_comment_id,
      content,
      created_at,
      updated_at,
      author:profiles!forum_comments_user_id_fkey (
        id,
        username,
        full_name,
        avatar_url,
        role,
        program
      )
    `)
    .eq("forum_post_id", forumPostId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createComment(
  supabase,
  { forumPostId, userId, parentCommentId = null, content }
) {
  const cleanContent = cleanCommentContent(content);

  if (!cleanContent) {
    throw new Error("Please write a comment first.");
  }

  const { data, error } = await supabase
    .from("forum_comments")
    .insert({
      forum_post_id: forumPostId,
      user_id: userId,
      parent_comment_id: parentCommentId,
      content: cleanContent,
    })
    .select(`
      id,
      forum_post_id,
      user_id,
      parent_comment_id,
      content,
      created_at,
      updated_at,
      author:profiles!forum_comments_user_id_fkey (
        id,
        username,
        full_name,
        avatar_url,
        role,
        program
      )
    `)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateComment(supabase, { commentId, content }) {
  const cleanContent = cleanCommentContent(content);

  if (!cleanContent) {
    throw new Error("Comment cannot be empty.");
  }

  const { data, error } = await supabase
    .from("forum_comments")
    .update({
      content: cleanContent,
      updated_at: new Date().toISOString(),
    })
    .eq("id", commentId)
    .select(`
      id,
      forum_post_id,
      user_id,
      parent_comment_id,
      content,
      created_at,
      updated_at,
      author:profiles!forum_comments_user_id_fkey (
        id,
        username,
        full_name,
        avatar_url,
        role,
        program
      )
    `)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteComment(supabase, commentId) {
  const { error } = await supabase
    .from("forum_comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    throw error;
  }
}
