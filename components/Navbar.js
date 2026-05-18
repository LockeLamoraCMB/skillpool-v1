"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { siteLinks } from "@/lib/siteData";
import { isAllowedStudentEmail } from "@/lib/auth/student";
import NotificationBell from "@/components/notifications/NotificationBell";

function isActive(pathname, href) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const profileRef = useRef(null);

  async function ensureProfileRow(user) {
    const { data: existing, error: existingError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existing?.username) {
      return {
        ...existing,
        role: existing.role || existing.program || "Student",
        avatar_url: existing.avatar_url || "/profile/avatar.png",
      };
    }

    const fallbackSeed = user.email?.split("@")[0] || "student";

    const { data: generatedUsername, error: usernameError } = await supabase.rpc(
      "generate_unique_username",
      {
        desired_username: user.user_metadata?.username || "",
        fallback_seed: fallbackSeed,
        current_user_id: user.id,
      }
    );

    if (usernameError) {
      throw usernameError;
    }

    const payload = {
      id: user.id,
      email: user.email,
      full_name: existing?.full_name || user.user_metadata?.full_name || "",
      username: generatedUsername,
      role: existing?.role || existing?.program || "Student",
      bio: existing?.bio || "",
      about: existing?.about || "",
      avatar_url: existing?.avatar_url || "/profile/avatar.png",
      banner_url: existing?.banner_url || "/profile/banner.jpg",
      badges: existing?.badges || [],
      tags: existing?.tags || [],
      joined_at: existing?.joined_at || existing?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if ("program" in (existing || {})) {
      payload.program = existing?.program || null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .upsert(payload)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return {
      ...data,
      role: data.role || data.program || "Student",
      avatar_url: data.avatar_url || "/profile/avatar.png",
    };
  }

  async function loadCurrentProfile() {
    setProfileLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    if (!isAllowedStudentEmail(user.email)) {
      await supabase.auth.signOut();
      setProfile(null);
      setProfileLoading(false);
      router.push("/join?error=student_email_required");
      return;
    }

    try {
      const resolvedProfile = await ensureProfileRow(user);
      setProfile(resolvedProfile);
    } catch (loadError) {
      console.error(loadError);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }

  useEffect(() => {
    loadCurrentProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadCurrentProfile();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setProfile(null);
    setProfileOpen(false);
    router.push("/join");
    router.refresh();
  }

  const navLinks = profile
    ? siteLinks.filter((link) => link.href !== "/join")
    : siteLinks;

  const profileHref = profile?.username ? `/profile/${profile.username}` : "/join";

  return (
    <header className="sticky top-0 z-50 border-b border-black/6 bg-white/80 backdrop-blur-xl">
      <div className="page-shell">
        <nav className="flex h-20 items-center justify-between gap-4" aria-label="Primary">
          <Link href="/" className="flex items-start">
            <div className="flex flex-col items-start">
              <Image
                src="/logo.png"
                alt="Skillpool logo"
                width={150}
                height={40}
                priority
                className="h-auto w-[150px] object-contain"
              />
              <p className="mt-0 text-[12px] leading-none text-black/55 sm:text-[13px]">
                Share a skill. Make it real.
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-[#000100] text-white"
                      : "text-black/65 hover:bg-black/[0.04] hover:text-[#000100]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:block">
            {profileLoading ? (
              <div className="h-12 w-[180px] animate-pulse rounded-2xl bg-black/5" />
            ) : profile ? (
              <div className="flex items-center gap-3">
                <NotificationBell currentUserId={profile.id} />

                <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-3 rounded-2xl border border-[#D6E1E7] bg-white px-3 py-2 shadow-sm transition hover:bg-[#F7FAFC]"
                >
                  <div className="h-10 w-10 overflow-hidden rounded-full border border-[#D7E1E8]">
                    <img
                      src={profile.avatar_url || "/profile/avatar.png"}
                      alt="Profile avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col items-start leading-none">
                    <span className="text-sm font-bold text-[#12212B]">
                      {profile.username}
                    </span>
                    <span className="mt-1 text-xs text-[#6B7C88]">
                      {profile.role || "Student"}
                    </span>
                  </div>

                  <span className="text-xs text-[#6B7C88]">
                    {profileOpen ? "▴" : "▾"}
                  </span>
                </button>

                {profileOpen ? (
                  <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[320px] overflow-hidden rounded-[20px] border border-[#D7E1E8] bg-white shadow-[0_20px_50px_rgba(18,33,43,0.14)]">
                    <div className="border-b border-[#E7EEF2] bg-[linear-gradient(90deg,#F7FAFB_0%,#EDF3F6_100%)] px-4 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 overflow-hidden rounded-full border border-[#D7E1E8]">
                          <img
                            src={profile.avatar_url || "/profile/avatar.png"}
                            alt="Profile avatar"
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <Link
                            href={profileHref}
                            onClick={() => setProfileOpen(false)}
                            className="text-lg font-black text-[#12212B] hover:text-[#2E67F8]"
                          >
                            {profile.username}
                          </Link>
                          <p className="mt-1 text-sm text-[#52606D]">
                            {profile.full_name || "Skillpool Student"}
                          </p>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#7B8794]">
                            {profile.role || "Student"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-1 p-2">
                      <Link
                        href={profileHref}
                        onClick={() => setProfileOpen(false)}
                        className="rounded-xl px-3 py-3 text-sm font-semibold text-[#12212B] transition hover:bg-[#F8FBFC]"
                      >
                        View profile
                      </Link>

                      <Link
                        href="/notifications"
                        onClick={() => setProfileOpen(false)}
                        className="rounded-xl px-3 py-3 text-sm font-semibold text-[#12212B] transition hover:bg-[#F8FBFC]"
                      >
                        Notifications
                      </Link>

                      <Link
                        href="/forum"
                        onClick={() => setProfileOpen(false)}
                        className="rounded-xl px-3 py-3 text-sm font-semibold text-[#12212B] transition hover:bg-[#F8FBFC]"
                      >
                        Go to forum
                      </Link>

                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#9B1C1C] transition hover:bg-[#FFF5F5]"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                ) : null}
                </div>
              </div>
            ) : (
              <Link
                href="/join"
                className="inline-flex rounded-full bg-[#B4D2E7]/50 px-5 py-2.5 text-sm font-semibold text-[#000100] transition hover:bg-[#B4D2E7]"
              >
                SIGN-UP NOW!
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-black/10 bg-white text-[#000100] md:hidden"
            aria-expanded={isOpen}
            aria-label="Toggle menu"
          >
            <span className="text-lg">{isOpen ? "×" : "☰"}</span>
          </button>
        </nav>

        {isOpen ? (
          <div className="border-t border-black/6 py-4 md:hidden">
            <div className="grid gap-2">
              {navLinks.map((link) => {
                const active = isActive(pathname, link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                      active ? "bg-[#000100] text-white" : "bg-black/[0.03] text-black/70"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {profile ? (
                <>
                  <Link
                    href={profileHref}
                    onClick={() => setIsOpen(false)}
                    className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3"
                  >
                    <div className="h-10 w-10 overflow-hidden rounded-full border border-[#D7E1E8]">
                      <img
                        src={profile.avatar_url || "/profile/avatar.png"}
                        alt="Profile avatar"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex flex-col items-start leading-none">
                      <span className="text-sm font-bold text-[#12212B]">
                        {profile.username}
                      </span>
                      <span className="mt-1 text-xs text-[#6B7C88]">
                        {profile.role || "Student"}
                      </span>
                    </div>
                  </Link>

                  <Link
                    href="/notifications"
                    onClick={() => setIsOpen(false)}
                    className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-[#12212B]"
                  >
                    Notifications
                  </Link>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-left text-sm font-semibold text-red-700"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/join"
                  onClick={() => setIsOpen(false)}
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-[#12212B]"
                >
                  Join Us
                </Link>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
