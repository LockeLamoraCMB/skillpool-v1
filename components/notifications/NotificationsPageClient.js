"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  fetchNotifications,
  formatNotificationDate,
  getNotificationHref,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/notifications";

export default function NotificationsPageClient() {
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async function loadNotifications() {
    setLoading(true);
    setError("");

    try {
      const rows = await fetchNotifications(supabase, { limit: 100 });
      setNotifications(rows);
    } catch (notificationError) {
      setError(notificationError.message || "Notifications could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  async function handleClick(notification) {
    if (notification.is_read) return;

    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id ? { ...item, is_read: true } : item
      )
    );
    await markNotificationAsRead(supabase, notification.id).catch(() => null);
  }

  async function handleMarkAll() {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, is_read: true }))
    );
    await markAllNotificationsAsRead(supabase).catch(() => null);
  }

  return (
    <section className="rounded-[28px] border border-[#D7E1E7] bg-white p-6 shadow-[0_12px_35px_rgba(23,43,58,0.06)] sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#7B8794]">
            Activity
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[#12212B]">
            Notifications
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-[#52606D]">
            {unreadCount
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "Everything has been read."}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadNotifications}
            className="rounded-2xl border border-[#D7E1E8] bg-[#F8FBFC] px-5 py-3 text-sm font-semibold text-[#12212B]"
          >
            Refresh
          </button>

          {unreadCount ? (
            <button
              type="button"
              onClick={handleMarkAll}
              className="rounded-2xl bg-[#12212B] px-5 py-3 text-sm font-semibold text-white"
            >
              Mark all read
            </button>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="mt-8 grid gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-[96px] animate-pulse rounded-[20px] bg-[#F2F6F8]"
            />
          ))}
        </div>
      ) : null}

      {!loading && !error && notifications.length ? (
        <div className="mt-8 grid gap-4">
          {notifications.map((notification) => (
            <Link
              key={notification.id}
              href={getNotificationHref(notification)}
              onClick={() => handleClick(notification)}
              className={`rounded-[20px] border p-5 transition hover:bg-white ${
                notification.is_read
                  ? "border-[#E7EEF2] bg-[#F8FBFC]"
                  : "border-[#B9D2DD] bg-[#EEF5F8]"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#D7E1E8] bg-white">
                  <img
                    src={notification.actor?.avatar_url || "/profile/avatar.png"}
                    alt={notification.actor?.username || "Student"}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-base font-black text-[#12212B]">
                      {notification.content}
                    </p>
                    {!notification.is_read ? (
                      <span className="rounded-full bg-[#12212B] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-white">
                        New
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 text-sm text-[#7B8794]">
                    {formatNotificationDate(notification.created_at)}
                  </p>

                  {notification.post?.title ? (
                    <p className="mt-2 text-sm font-semibold text-[#52606D]">
                      {notification.post.title}
                    </p>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : null}

      {!loading && !error && !notifications.length ? (
        <div className="mt-8 rounded-[20px] border border-dashed border-[#D7E1E8] bg-[#FAFCFD] p-8 text-center">
          <h2 className="text-2xl font-black text-[#12212B]">
            No notifications yet
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#61727E]">
            Comment replies and direct messages will appear here.
          </p>
        </div>
      ) : null}
    </section>
  );
}
