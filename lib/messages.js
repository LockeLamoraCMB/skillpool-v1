const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value = "") {
  return UUID_PATTERN.test(String(value));
}

export function cleanMessageContent(content = "") {
  return String(content).replace(/\r\n/g, "\n").trim();
}

export function formatMessageDate(value) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getProfileName(profile) {
  return profile?.full_name || profile?.username || "Skillpool student";
}

export function summarizeConversations(messages = [], currentUserId) {
  const summaries = new Map();

  for (const message of messages) {
    const isSender = message.sender_id === currentUserId;
    const otherUserId = isSender ? message.receiver_id : message.sender_id;
    const otherProfile = isSender ? message.receiver : message.sender;

    if (!otherUserId) continue;

    const unreadIncrement =
      message.receiver_id === currentUserId && !message.is_read ? 1 : 0;
    const existing = summaries.get(otherUserId);

    if (!existing) {
      summaries.set(otherUserId, {
        userId: otherUserId,
        profile: otherProfile,
        latestMessage: message,
        unreadCount: unreadIncrement,
      });
      continue;
    }

    existing.unreadCount += unreadIncrement;

    if (
      new Date(message.created_at).getTime() >
      new Date(existing.latestMessage.created_at).getTime()
    ) {
      existing.latestMessage = message;
      existing.profile = otherProfile || existing.profile;
    }
  }

  return Array.from(summaries.values()).sort(
    (a, b) =>
      new Date(b.latestMessage.created_at).getTime() -
      new Date(a.latestMessage.created_at).getTime()
  );
}

export async function fetchConversationSummaries(supabase, currentUserId) {
  if (!isUuid(currentUserId)) {
    throw new Error("Missing current user.");
  }

  const { data, error } = await supabase
    .from("messages")
    .select(`
      id,
      sender_id,
      receiver_id,
      content,
      is_read,
      created_at,
      sender:profiles!messages_sender_id_fkey (
        id,
        username,
        full_name,
        avatar_url,
        role,
        program
      ),
      receiver:profiles!messages_receiver_id_fkey (
        id,
        username,
        full_name,
        avatar_url,
        role,
        program
      )
    `)
    .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw error;
  }

  return summarizeConversations(data || [], currentUserId);
}

export async function fetchConversationMessages(
  supabase,
  currentUserId,
  otherUserId
) {
  if (!isUuid(currentUserId) || !isUuid(otherUserId)) {
    throw new Error("Invalid conversation.");
  }

  const { data, error } = await supabase
    .from("messages")
    .select(`
      id,
      sender_id,
      receiver_id,
      content,
      is_read,
      created_at,
      sender:profiles!messages_sender_id_fkey (
        id,
        username,
        full_name,
        avatar_url,
        role,
        program
      ),
      receiver:profiles!messages_receiver_id_fkey (
        id,
        username,
        full_name,
        avatar_url,
        role,
        program
      )
    `)
    .or(
      `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`
    )
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function sendDirectMessage(
  supabase,
  { senderId, receiverId, content }
) {
  const cleanContent = cleanMessageContent(content);

  if (!isUuid(senderId) || !isUuid(receiverId)) {
    throw new Error("Invalid message recipient.");
  }

  if (senderId === receiverId) {
    throw new Error("Choose another student to message.");
  }

  if (!cleanContent) {
    throw new Error("Please write a message first.");
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content: cleanContent,
    })
    .select(`
      id,
      sender_id,
      receiver_id,
      content,
      is_read,
      created_at,
      sender:profiles!messages_sender_id_fkey (
        id,
        username,
        full_name,
        avatar_url,
        role,
        program
      ),
      receiver:profiles!messages_receiver_id_fkey (
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

export async function markConversationMessagesRead(
  supabase,
  currentUserId,
  otherUserId
) {
  if (!isUuid(currentUserId) || !isUuid(otherUserId)) return;

  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("sender_id", otherUserId)
    .eq("receiver_id", currentUserId)
    .eq("is_read", false);

  if (error) {
    throw error;
  }
}
