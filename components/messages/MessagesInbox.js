"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  fetchConversationSummaries,
  formatMessageDate,
  getProfileName,
} from "@/lib/messages";

function previewText(message, currentUserId) {
  const prefix = message.sender_id === currentUserId ? "You: " : "";
  const content = message.content || "";
  return `${prefix}${content.length > 90 ? `${content.slice(0, 90)}...` : content}`;
}

export default function MessagesInbox({ currentUserId }) {
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState("");

  const loadInbox = useCallback(async function loadInbox() {
    setLoading(true);
    setError("");

    try {
      const rows = await fetchConversationSummaries(supabase, currentUserId);
      setConversations(rows);
    } catch (inboxError) {
      setError(inboxError.message || "Inbox could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [supabase, currentUserId]);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  const unreadTotal = conversations.reduce(
    (sum, conversation) => sum + conversation.unreadCount,
    0
  );

  return (
    <section className="rounded-[28px] border border-[#D7E1E7] bg-white p-6 shadow-[0_12px_35px_rgba(23,43,58,0.06)] sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#7B8794]">
            Private messages
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[#12212B]">
            Inbox
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-[#52606D]">
            {unreadTotal
              ? `${unreadTotal} unread message${unreadTotal === 1 ? "" : "s"}`
              : "All caught up."}
          </p>
        </div>

        <button
          type="button"
          onClick={loadInbox}
          className="rounded-2xl border border-[#D7E1E8] bg-[#F8FBFC] px-5 py-3 text-sm font-semibold text-[#12212B]"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="mt-8 grid gap-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[104px] animate-pulse rounded-[20px] bg-[#F2F6F8]"
            />
          ))}
        </div>
      ) : null}

      {!loading && !error && conversations.length ? (
        <div className="mt-8 grid gap-4">
          {conversations.map((conversation) => {
            const profile = conversation.profile;
            const name = getProfileName(profile);

            return (
              <Link
                key={conversation.userId}
                href={`/messages/${conversation.userId}`}
                className="rounded-[20px] border border-[#E7EEF2] bg-[#F8FBFC] p-5 transition hover:border-[#B9D2DD] hover:bg-white"
              >
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-[#D7E1E8] bg-white">
                    <img
                      src={profile?.avatar_url || "/profile/avatar.png"}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-lg font-black text-[#12212B]">
                          {profile?.username || name}
                        </p>
                        <p className="mt-1 text-sm text-[#61727E]">
                          {name}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {conversation.unreadCount ? (
                          <span className="rounded-full bg-[#12212B] px-2.5 py-1 text-xs font-black text-white">
                            {conversation.unreadCount}
                          </span>
                        ) : null}
                        <span className="text-xs text-[#7B8794]">
                          {formatMessageDate(conversation.latestMessage.created_at)}
                        </span>
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#52606D]">
                      {previewText(conversation.latestMessage, currentUserId)}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : null}

      {!loading && !error && !conversations.length ? (
        <div className="mt-8 rounded-[20px] border border-dashed border-[#D7E1E8] bg-[#FAFCFD] p-8 text-center">
          <h2 className="text-2xl font-black text-[#12212B]">No messages yet</h2>
          <p className="mt-3 text-sm leading-6 text-[#61727E]">
            Open a student profile or a forum post author card to start a private conversation.
          </p>
        </div>
      ) : null}
    </section>
  );
}
