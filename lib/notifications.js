export function formatNotificationDate(value) {
  if (!value) return "Just now";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getNotificationHref(notification) {
  if (!notification) return "/notifications";

  if (notification.type === "direct_message" && notification.actor_id) {
    return `/messages/${notification.actor_id}`;
  }

  if (
    ["forum_comment", "comment_reply"].includes(notification.type) &&
    notification.post?.slug
  ) {
    const commentHash = notification.related_comment_id
      ? `#comment-${notification.related_comment_id}`
      : "";
    return `/forum/post/${notification.post.slug}${commentHash}`;
  }

  return "/notifications";
}

export async function fetchNotifications(supabase, { limit = 20 } = {}) {
  let query = supabase
    .from("notifications")
    .select(`
      id,
      user_id,
      actor_id,
      type,
      related_post_id,
      related_comment_id,
      related_message_id,
      content,
      is_read,
      created_at,
      actor:profiles!notifications_actor_id_fkey (
        id,
        username,
        full_name,
        avatar_url,
        role,
        program
      ),
      post:forum_posts!notifications_related_post_id_fkey (
        id,
        slug,
        title
      ),
      comment:forum_comments!notifications_related_comment_id_fkey (
        id,
        content
      ),
      message:messages!notifications_related_message_id_fkey (
        id,
        sender_id,
        receiver_id,
        is_read,
        created_at
      )
    `)
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createNotification(
  supabase,
  {
    userId,
    actorId,
    type,
    relatedPostId = null,
    relatedCommentId = null,
    relatedMessageId = null,
    content,
  }
) {
  const cleanContent = String(content || "").trim();

  if (!cleanContent) {
    throw new Error("Notification content is required.");
  }

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      actor_id: actorId,
      type,
      related_post_id: relatedPostId,
      related_comment_id: relatedCommentId,
      related_message_id: relatedMessageId,
      content: cleanContent,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function markNotificationAsRead(supabase, notificationId) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) {
    throw error;
  }
}

export async function markAllNotificationsAsRead(supabase) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("is_read", false);

  if (error) {
    throw error;
  }
}
