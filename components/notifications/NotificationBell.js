"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  fetchNotifications,
  formatNotificationDate,
  getNotificationHref,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/notifications";

export default function NotificationBell({ currentUserId }) {
  const supabase = useMemo(() => createClient(), []);
  const dropdownRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async function loadNotifications() {
    if (!currentUserId) return;

    setLoading(true);
    setError("");

    try {
      const rows = await fetchNotifications(supabase, { limit: 8 });
      setNotifications(rows);
    } catch (notificationError) {
      setError(notificationError.message || "Notifications could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [currentUserId, supabase]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!currentUserId) return null;

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  async function handleNotificationClick(notification) {
    if (!notification.is_read) {
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, is_read: true } : item
        )
      );
      await markNotificationAsRead(supabase, notification.id).catch(() => null);
    }

    setOpen(false);
  }

  async function handleMarkAll() {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, is_read: true }))
    );
    await markAllNotificationsAsRead(supabase).catch(() => null);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          if (!open) loadNotifications();
        }}
        className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D6E1E7] bg-white text-lg shadow-sm transition hover:bg-[#F7FAFC]"
        aria-label="Notifications"
      >
        <span aria-hidden="true">🔔</span>
        {unreadCount ? (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#12212B] px-1.5 text-[11px] font-black text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[360px] overflow-hidden rounded-[20px] border border-[#D7E1E8] bg-white shadow-[0_20px_50px_rgba(18,33,43,0.14)]">
          <div className="flex items-center justify-between border-b border-[#E7EEF2] bg-[#F8FBFC] px-4 py-3">
            <div>
              <p className="text-sm font-black text-[#12212B]">Notifications</p>
              <p className="mt-1 text-xs text-[#7B8794]">
                {unreadCount ? `${unreadCount} unread` : "No unread alerts"}
              </p>
            </div>

            {unreadCount ? (
              <button
                type="button"
                onClick={handleMarkAll}
                className="text-xs font-bold text-[#245067]"
              >
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="max-h-[390px] overflow-y-auto p-2">
            {loading ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-[76px] animate-pulse rounded-[16px] bg-[#F2F6F8]"
                  />
                ))}
              </div>
            ) : null}

            {error ? (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            {!loading && !error && notifications.length ? (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={getNotificationHref(notification)}
                    onClick={() => handleNotificationClick(notification)}
                    className={`block rounded-[16px] px-3 py-3 transition hover:bg-[#F8FBFC] ${
                      notification.is_read ? "bg-white" : "bg-[#EEF5F8]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#D7E1E8] bg-white">
                        <img
                          src={notification.actor?.avatar_url || "/profile/avatar.png"}
                          alt={notification.actor?.username || "Student"}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-6 text-[#12212B]">
                          {notification.content}
                        </p>
                        <p className="mt-1 text-xs text-[#7B8794]">
                          {formatNotificationDate(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}

            {!loading && !error && !notifications.length ? (
              <div className="rounded-[16px] border border-dashed border-[#D7E1E8] bg-[#FAFCFD] p-5 text-center text-sm text-[#61727E]">
                No notifications yet.
              </div>
            ) : null}
          </div>

          <div className="border-t border-[#E7EEF2] p-2">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-3 text-center text-sm font-semibold text-[#12212B] transition hover:bg-[#F8FBFC]"
            >
              View all notifications
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
