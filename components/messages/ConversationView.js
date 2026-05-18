"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  fetchConversationMessages,
  formatMessageDate,
  getProfileName,
  markConversationMessagesRead,
  sendDirectMessage,
} from "@/lib/messages";

export default function ConversationView({ currentUserId, targetProfile }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const bottomRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const targetName = getProfileName(targetProfile);

  const loadConversation = useCallback(async function loadConversation() {
    setLoading(true);
    setError("");

    try {
      const rows = await fetchConversationMessages(
        supabase,
        currentUserId,
        targetProfile.id
      );
      setMessages(rows);

      await markConversationMessagesRead(
        supabase,
        currentUserId,
        targetProfile.id
      );

      setMessages((current) =>
        current.map((message) =>
          message.receiver_id === currentUserId
            ? { ...message, is_read: true }
            : message
        )
      );
      router.refresh();
    } catch (conversationError) {
      setError(conversationError.message || "Conversation could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [currentUserId, router, supabase, targetProfile.id]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const message = await sendDirectMessage(supabase, {
        senderId: currentUserId,
        receiverId: targetProfile.id,
        content: draft,
      });

      setMessages((current) => [...current, message]);
      setDraft("");
      router.refresh();
    } catch (messageError) {
      setError(messageError.message || "Message could not be sent.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-[#D7E1E7] bg-white shadow-[0_12px_35px_rgba(23,43,58,0.06)]">
      <div className="border-b border-[#E7EEF2] bg-[#F8FBFC] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-[#D7E1E8] bg-white">
              <img
                src={targetProfile.avatar_url || "/profile/avatar.png"}
                alt={targetName}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#7B8794]">
                Conversation
              </p>
              <h1 className="mt-1 truncate text-3xl font-black text-[#12212B]">
                {targetProfile.username || targetName}
              </h1>
              <p className="mt-1 text-sm text-[#61727E]">{targetName}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/messages"
              className="rounded-2xl border border-[#D7E1E8] bg-white px-4 py-2 text-sm font-semibold text-[#12212B]"
            >
              Inbox
            </Link>
            {targetProfile.username ? (
              <Link
                href={`/profile/${targetProfile.username}`}
                className="rounded-2xl bg-[#12212B] px-4 py-2 text-sm font-semibold text-white"
              >
                Profile
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {error ? (
        <p className="mx-5 mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-6">
          {error}
        </p>
      ) : null}

      <div className="max-h-[560px] min-h-[360px] space-y-4 overflow-y-auto bg-white p-5 sm:p-6">
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[78px] animate-pulse rounded-[20px] bg-[#F2F6F8]"
              />
            ))}
          </div>
        ) : null}

        {!loading && messages.length ? (
          messages.map((message) => {
            const mine = message.sender_id === currentUserId;

            return (
              <div
                key={message.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] rounded-[20px] px-4 py-3 ${
                    mine
                      ? "bg-[#12212B] text-white"
                      : "border border-[#E7EEF2] bg-[#F8FBFC] text-[#12212B]"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-6">
                    {message.content}
                  </p>
                  <div
                    className={`mt-2 flex items-center gap-2 text-[11px] ${
                      mine ? "text-white/70" : "text-[#7B8794]"
                    }`}
                  >
                    <span>{formatMessageDate(message.created_at)}</span>
                    {mine ? (
                      <span>{message.is_read ? "Read" : "Sent"}</span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        ) : null}

        {!loading && !messages.length ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-[20px] border border-dashed border-[#D7E1E8] bg-[#FAFCFD] p-6 text-center">
            <div>
              <h2 className="text-2xl font-black text-[#12212B]">
                Start the conversation
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-[#61727E]">
                Send a private message to coordinate details without exposing the conversation in the forum.
              </p>
            </div>
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-[#E7EEF2] bg-[#F8FBFC] p-5 sm:p-6"
      >
        <label className="sr-only" htmlFor="message-content">
          Message
        </label>
        <textarea
          id="message-content"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="min-h-[118px] w-full rounded-2xl border border-[#D3DDE5] bg-white px-4 py-3 text-sm leading-6 text-[#12212B] outline-none focus:border-[#7EA9B9]"
          placeholder={`Message ${targetProfile.username || targetName}...`}
          maxLength={3000}
        />

        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-2xl bg-[#12212B] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Sending..." : "Send message"}
          </button>
        </div>
      </form>
    </section>
  );
}
