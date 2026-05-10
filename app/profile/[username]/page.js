"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isAllowedStudentEmail } from "@/lib/auth/student";

const BADGE_OPTIONS = [
  { value: "rank-1", label: "Rank 1 in Leaderboards" },
  { value: "quick-response", label: "Quick Response" },
  { value: "top-rated-tutor", label: "Top Rated Tutor" },
];

const tabs = ["Profile", "Badges", "Ratings"];
const DEFAULT_AVATAR = "/profile/avatar.png";
const DEFAULT_BANNER = "/profile/banner.jpg";
const STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_PROFILE_BUCKET || "profile-media";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function normalizeUsername(value = "") {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_")
    .slice(0, 20);
}

function initials(name = "ST") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function normalizeProfile(profile) {
  return {
    ...profile,
    role: profile.role || profile.program || "STI Student",
    bio: profile.bio || "",
    about: profile.about || "",
    avatar_url: profile.avatar_url || DEFAULT_AVATAR,
    banner_url: profile.banner_url || DEFAULT_BANNER,
    badges: Array.isArray(profile.badges) ? profile.badges : [],
    tags: Array.isArray(profile.tags) ? profile.tags : [],
    connections: Array.isArray(profile.connections) ? profile.connections : [],
  };
}

function formatDate(value) {
  if (!value) return "Recently";
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function Avatar({ profile, preview }) {
  const src = preview || profile.avatar_url;

  if (src) {
    return (
      <img
        src={src}
        alt={profile.full_name || profile.username}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[#DDE7EC] text-3xl font-black text-[#31424F]">
      {initials(profile.full_name || profile.username)}
    </div>
  );
}

function RatingCard({ item, type }) {
  const person = type === "given" ? item.reviewed_user : item.reviewer;

  return (
    <article className="rounded-[20px] border border-[#E4ECF1] bg-white/85 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-[16px] font-black text-[#12212B]">
            {person?.full_name || person?.username || "Skillpool student"}
          </p>
          <p className="mt-1 text-[13px] text-[#6D7A86]">
            @{person?.username || "student"} - {formatDate(item.created_at)}
          </p>
        </div>
        <span className="rounded-full border border-[#D7A93A]/40 bg-[#FFF4D8] px-3 py-1 text-sm font-black text-[#7A5312]">
          {Number(item.rating || 0).toFixed(0)}/5
        </span>
      </div>
      {item.comment ? (
        <p className="mt-3 text-[14px] leading-7 text-[#3F4D58]">{item.comment}</p>
      ) : null}
    </article>
  );
}

export default function ProfilePage({ params }) {
  const { username: routeUsername } = use(params);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [profile, setProfile] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("Profile");
  const [newBadge, setNewBadge] = useState("");
  const [newTag, setNewTag] = useState("");
  const [connectionType, setConnectionType] = useState("facebook");
  const [connectionLink, setConnectionLink] = useState("");
  const [ratings, setRatings] = useState({ received: [], given: [] });
  const [avatarSelection, setAvatarSelection] = useState({
    file: null,
    previewUrl: "",
    error: "",
  });
  const [bannerSelection, setBannerSelection] = useState({
    file: null,
    previewUrl: "",
    error: "",
  });

  const isOwner = profile?.id && currentProfile?.id && profile.id === currentProfile.id;

  async function ensureProfileRow(user) {
    const { data: existing, error: existingError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing?.username) {
      if (!existing.is_verified) {
        await supabase
          .from("profiles")
          .update({ is_verified: true, updated_at: new Date().toISOString() })
          .eq("id", user.id);
      }
      return normalizeProfile(existing);
    }

    const fallbackSeed = user.email?.split("@")[0] || "student";
    const { data: generatedUsername, error: usernameError } = await supabase.rpc(
      "generate_unique_username",
      {
        desired_username: normalizeUsername(user.user_metadata?.username || ""),
        fallback_seed: fallbackSeed,
        current_user_id: user.id,
      }
    );

    if (usernameError) throw usernameError;

    const payload = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || fallbackSeed,
      username: generatedUsername,
      role: "Student",
      bio: "",
      about: "",
      avatar_url: DEFAULT_AVATAR,
      banner_url: DEFAULT_BANNER,
      badges: [],
      tags: [],
      connections: [],
      is_verified: true,
      joined_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert(payload)
      .select("*")
      .single();

    if (error) throw error;
    return normalizeProfile(data);
  }

  async function fetchProfileRatings(profileId) {
    const [receivedRes, givenRes] = await Promise.all([
      supabase
        .from("exchange_reviews")
        .select(`
          id,
          exchange_id,
          reviewer_id,
          reviewed_user_id,
          rating,
          comment,
          created_at,
          updated_at,
          reviewer:profiles!exchange_reviews_reviewer_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("reviewed_user_id", profileId)
        .order("created_at", { ascending: false }),
      supabase
        .from("exchange_reviews")
        .select(`
          id,
          exchange_id,
          reviewer_id,
          reviewed_user_id,
          rating,
          comment,
          created_at,
          updated_at,
          reviewed_user:profiles!exchange_reviews_reviewed_user_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("reviewer_id", profileId)
        .order("created_at", { ascending: false }),
    ]);

    if (receivedRes.error) throw receivedRes.error;
    if (givenRes.error) throw givenRes.error;

    return {
      received: receivedRes.data || [],
      given: givenRes.data || [],
    };
  }

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace(`/join?next=${encodeURIComponent(`/profile/${routeUsername}`)}`);
        return;
      }

      if (!isAllowedStudentEmail(user.email)) {
        await supabase.auth.signOut();
        router.replace("/join?error=student_email_required");
        return;
      }

      try {
        const viewerProfile = await ensureProfileRow(user);
        if (!active) return;
        setCurrentProfile(viewerProfile);

        const { data: viewedProfile, error: viewedError } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", routeUsername)
          .maybeSingle();

        if (viewedError) throw viewedError;

        const resolvedProfile =
          viewedProfile || (viewerProfile.username === routeUsername ? viewerProfile : null);

        if (!resolvedProfile) {
          setProfile(null);
          setRatings({ received: [], given: [] });
          return;
        }

        const normalized = normalizeProfile(resolvedProfile);
        setProfile(normalized);
        const ratingData = await fetchProfileRatings(normalized.id);
        if (!active) return;
        setRatings(ratingData);
      } catch (loadError) {
        console.error(loadError);
        if (active) setErrorMessage("Profile could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [routeUsername, router, supabase]);

  useEffect(() => {
    return () => {
      if (avatarSelection.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarSelection.previewUrl);
      }
    };
  }, [avatarSelection.previewUrl]);

  useEffect(() => {
    return () => {
      if (bannerSelection.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(bannerSelection.previewUrl);
      }
    };
  }, [bannerSelection.previewUrl]);

  function handleImageSelection(kind, file) {
    if (!isOwner || !file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      const message = "Please choose a JPG, PNG, WEBP, GIF, or AVIF image.";
      if (kind === "avatar") {
        setAvatarSelection((current) => ({ ...current, error: message }));
      } else {
        setBannerSelection((current) => ({ ...current, error: message }));
      }
      return;
    }

    const limit = kind === "avatar" ? 4 * 1024 * 1024 : 8 * 1024 * 1024;
    if (file.size > limit) {
      const message = `Please keep the ${kind} image under ${Math.round(limit / 1024 / 1024)} MB.`;
      if (kind === "avatar") {
        setAvatarSelection((current) => ({ ...current, error: message }));
      } else {
        setBannerSelection((current) => ({ ...current, error: message }));
      }
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    if (kind === "avatar") {
      setAvatarSelection({ file, previewUrl, error: "" });
    } else {
      setBannerSelection({ file, previewUrl, error: "" });
    }
  }

  async function uploadProfileAsset(userId, file, kind) {
    const extension = file.name.split(".").pop() || "jpg";
    const path = `${userId}/${kind}-${Date.now()}.${extension}`;
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
      upsert: true,
      cacheControl: "3600",
      contentType: file.type,
    });

    if (error) throw error;

    const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);
    return urlData.publicUrl;
  }

  async function saveProfile() {
    if (!profile || !isOwner) return;

    setSaving(true);
    setNotice("");
    setErrorMessage("");

    let nextAvatarUrl = profile.avatar_url || "";
    let nextBannerUrl = profile.banner_url || "";

    try {
      if (avatarSelection.file) {
        nextAvatarUrl = await uploadProfileAsset(profile.id, avatarSelection.file, "avatar");
      }
      if (bannerSelection.file) {
        nextBannerUrl = await uploadProfileAsset(profile.id, bannerSelection.file, "banner");
      }

      const updates = {
        full_name: profile.full_name?.trim() || "",
        role: profile.role?.trim() || "Student",
        program: profile.program || null,
        bio: profile.bio || "",
        about: profile.about || "",
        avatar_url: nextAvatarUrl,
        banner_url: nextBannerUrl,
        badges: (profile.badges || []).filter(Boolean).slice(0, 3),
        tags: (profile.tags || []).filter(Boolean).slice(0, 12),
        connections: profile.connections || [],
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profile.id);

      if (error) throw error;

      setProfile((current) => normalizeProfile({ ...current, ...updates }));
      setCurrentProfile((current) => normalizeProfile({ ...current, ...updates }));
      setAvatarSelection({ file: null, previewUrl: "", error: "" });
      setBannerSelection({ file: null, previewUrl: "", error: "" });
      setNotice("Profile saved successfully.");
    } catch (saveError) {
      console.error(saveError);
      setErrorMessage(saveError.message || "Profile could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#ECEFF2] px-3 py-6 sm:px-5">
        <div className="mx-auto max-w-[1180px] rounded-[32px] bg-[#C9D2DB] p-8 text-[#12212B]">
          Loading profile...
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#ECEFF2] px-3 py-6 sm:px-5">
        <div className="mx-auto max-w-[1180px] rounded-[32px] bg-white p-8 text-[#12212B] shadow-sm">
          <h1 className="text-2xl font-black">Profile not found</h1>
          <p className="mt-2 text-sm text-[#61727E]">
            This student profile does not exist or is not available.
          </p>
        </div>
      </main>
    );
  }

  const avatarPreview = avatarSelection.previewUrl || profile.avatar_url || "";
  const bannerPreview = bannerSelection.previewUrl || profile.banner_url || "";
  const averageRating = ratings.received.length
    ? (
        ratings.received.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
        ratings.received.length
      ).toFixed(1)
    : "0.0";

  return (
    <main className="min-h-screen bg-[#ECEFF2] px-3 py-4 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1180px]">
        <section className="overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,#f0f2f6_0%,#b7c3cf_100%)] pb-5 shadow-[0_18px_60px_rgba(18,33,43,0.08)]">
          <div className="relative overflow-visible">
            <div className="relative h-[235px] overflow-hidden rounded-b-[42px] rounded-t-[32px] bg-[#B9C4CE] sm:h-[270px] lg:h-[305px]">
              {bannerPreview ? (
                <img src={bannerPreview} alt="" className="h-full w-full object-cover" />
              ) : null}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,33,43,0.08),rgba(18,33,43,0.22))]" />
              {isOwner ? (
                <>
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    className="absolute right-6 top-5 rounded-full bg-[#33455F] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(31,47,71,0.2)]"
                  >
                    Change banner
                  </button>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => handleImageSelection("banner", event.target.files?.[0])}
                  />
                </>
              ) : null}
            </div>

            <div className="absolute left-6 top-[160px] h-[122px] w-[122px] overflow-hidden rounded-full border-[4px] border-[#EEF3F7] bg-[#DDE7EC] sm:left-8 sm:top-[190px] sm:h-[128px] sm:w-[128px] lg:top-[216px]">
              <Avatar profile={profile} preview={avatarPreview} />
              {isOwner ? (
                <>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#33455F] text-white"
                    aria-label="Choose profile image"
                  >
                    +
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => handleImageSelection("avatar", event.target.files?.[0])}
                  />
                </>
              ) : null}
            </div>
          </div>

          <div className="px-4 pt-[78px] sm:px-5 sm:pt-[84px]">
            {notice ? (
              <div className="mb-4 rounded-[16px] bg-green-50 px-4 py-3 text-sm text-green-700">
                {notice}
              </div>
            ) : null}
            {errorMessage || avatarSelection.error || bannerSelection.error ? (
              <div className="mb-4 rounded-[16px] bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage || avatarSelection.error || bannerSelection.error}
              </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
              <div>
                <h1 className="font-etna text-[44px] font-black leading-none tracking-[-0.01em] text-black sm:text-[54px]">
                  {profile.username}
                </h1>
                <p className="mt-2 text-[14px] italic text-[#697784]">
                  {profile.email}
                </p>

                <div className="mt-5 grid max-w-[620px] gap-3 sm:grid-cols-2">
                  {isOwner ? (
                    <>
                      <input
                        value={profile.full_name || ""}
                        onChange={(event) =>
                          setProfile((current) => ({
                            ...current,
                            full_name: event.target.value,
                          }))
                        }
                        className="h-[42px] rounded-[10px] border border-white/70 bg-[#F7F7F7] px-4 text-[14px] italic text-[#22323D] outline-none"
                        placeholder="Full name"
                      />
                      <input
                        value={profile.role || ""}
                        onChange={(event) =>
                          setProfile((current) => ({ ...current, role: event.target.value }))
                        }
                        className="h-[42px] rounded-[10px] border border-white/70 bg-[#F7F7F7] px-4 text-[14px] italic text-[#22323D] outline-none"
                        placeholder="Title"
                      />
                    </>
                  ) : (
                    <>
                      <p className="rounded-[14px] bg-white/60 px-4 py-3 text-sm font-bold text-[#22323D]">
                        {profile.full_name || "Skillpool Student"}
                      </p>
                      <p className="rounded-[14px] bg-white/60 px-4 py-3 text-sm font-bold text-[#22323D]">
                        {profile.role || profile.program || "STI Student"}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 rounded-[24px] bg-white/45 p-4">
                <div className="rounded-[18px] bg-white/75 p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7B8794]">
                    Rating
                  </p>
                  <p className="mt-2 text-2xl font-black text-[#12212B]">
                    {averageRating}
                  </p>
                </div>
                <div className="rounded-[18px] bg-white/75 p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7B8794]">
                    Reviews
                  </p>
                  <p className="mt-2 text-2xl font-black text-[#12212B]">
                    {ratings.received.length}
                  </p>
                </div>
                <div className="rounded-[18px] bg-white/75 p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7B8794]">
                    Badges
                  </p>
                  <p className="mt-2 text-2xl font-black text-[#12212B]">
                    {profile.badges.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-[18px] font-black text-black">Bio</h2>
              {isOwner ? (
                <textarea
                  value={profile.bio || ""}
                  onChange={(event) =>
                    setProfile((current) => ({ ...current, bio: event.target.value }))
                  }
                  className="mt-3 min-h-[120px] w-full rounded-[10px] border border-white/70 bg-[#F7F7F7] px-4 py-3 text-[14px] italic text-[#22323D] outline-none"
                  placeholder="Edit your bio..."
                />
              ) : (
                <p className="mt-3 min-h-[80px] rounded-[16px] bg-white/55 px-4 py-4 text-[15px] leading-7 text-[#22323D]">
                  {profile.bio || "This student has not added a bio yet."}
                </p>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "min-w-[92px] rounded-[14px] px-5 py-3 text-[15px] font-semibold transition",
                    activeTab === tab
                      ? "bg-[linear-gradient(180deg,#33455f_0%,#1f2f47_100%)] text-white shadow-[0_10px_18px_rgba(31,47,71,0.18)]"
                      : "bg-[linear-gradient(180deg,#ffffff_0%,#bcc6d2_100%)] text-[#1B2431]"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </section>

        {activeTab === "Profile" ? (
          <section className="mt-4 rounded-[32px] bg-[#C9D2DB] p-5">
            <h3 className="text-[20px] font-black text-black">About</h3>
            {isOwner ? (
              <textarea
                value={profile.about || ""}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, about: event.target.value }))
                }
                className="mt-3 min-h-[170px] w-full rounded-[10px] border border-white/70 bg-[#F7F7F7] px-4 py-3 text-[14px] italic text-[#22323D] outline-none"
                placeholder="Tell people more about yourself..."
              />
            ) : (
              <p className="mt-3 min-h-[120px] rounded-[18px] bg-white/60 p-5 text-[15px] leading-8 text-[#22323D]">
                {profile.about || "No detailed profile story yet."}
              </p>
            )}

            <div className="mt-6">
              <h3 className="text-[20px] font-black text-black">Connections</h3>

              {isOwner ? (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <select
                    value={connectionType}
                    onChange={(event) => setConnectionType(event.target.value)}
                    className="h-[40px] rounded-[10px] bg-[#2C3E57] px-3 text-[13px] font-semibold text-white outline-none"
                  >
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                  </select>
                  <input
                    value={connectionLink}
                    onChange={(event) => setConnectionLink(event.target.value)}
                    className="h-[42px] min-w-[240px] flex-1 rounded-[10px] border border-white/70 bg-[#F7F7F7] px-4 text-[14px] italic text-[#22323D] outline-none"
                    placeholder="Paste a profile link..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = connectionLink.trim();
                      if (!trimmed) return;
                      const nextConnections = [
                        ...(profile.connections || []),
                        { type: connectionType, url: trimmed },
                      ];
                      setProfile((current) => ({
                        ...current,
                        connections: nextConnections,
                      }));
                      setConnectionLink("");
                    }}
                    className="rounded-full bg-white/70 px-4 py-2 text-sm font-black text-[#1D2834]"
                  >
                    Add
                  </button>
                </div>
              ) : null}

              {profile.connections?.length ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {profile.connections.map((item, index) => {
                    const href =
                      item.url?.startsWith("http://") || item.url?.startsWith("https://")
                        ? item.url
                        : `https://${item.url || ""}`;
                    return (
                      <div
                        key={`${item.type}-${item.url}-${index}`}
                        className="flex items-center justify-between gap-3 rounded-[18px] bg-white/70 p-4"
                      >
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="min-w-0 truncate text-sm font-bold text-[#12212B]"
                        >
                          {item.type}: {item.url}
                        </a>
                        {isOwner ? (
                          <button
                            type="button"
                            onClick={() =>
                              setProfile((current) => ({
                                ...current,
                                connections: current.connections.filter((_, i) => i !== index),
                              }))
                            }
                            className="text-sm font-black text-[#6C7783]"
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-4 text-[14px] italic text-[#697784]">
                  No public connections yet.
                </p>
              )}
            </div>
          </section>
        ) : null}

        {activeTab === "Badges" ? (
          <section className="mt-4 rounded-[32px] bg-[#C9D2DB] px-6 py-7 sm:px-8">
            {isOwner ? (
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-[20px] font-black text-black">Add Badges</h3>
                  <div className="mt-3 flex items-center gap-3">
                    <select
                      value={newBadge}
                      onChange={(event) => setNewBadge(event.target.value)}
                      className="h-[42px] w-full rounded-[10px] border border-white/70 bg-[#F7F7F7] px-4 text-[14px] text-[#22323D] outline-none"
                    >
                      <option value="">Select a badge...</option>
                      {BADGE_OPTIONS.map((badge) => (
                        <option
                          key={badge.value}
                          value={badge.value}
                          disabled={profile.badges.includes(badge.value)}
                        >
                          {badge.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newBadge || profile.badges.length >= 3) return;
                        setProfile((current) => ({
                          ...current,
                          badges: [...current.badges, newBadge],
                        }));
                        setNewBadge("");
                      }}
                      className="rounded-full bg-white/70 px-4 py-2 text-sm font-black text-[#1D2834]"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-[20px] font-black text-black">Add Tags</h3>
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      value={newTag}
                      onChange={(event) => setNewTag(event.target.value)}
                      className="h-[42px] w-full rounded-[10px] border border-white/70 bg-[#F7F7F7] px-4 text-[14px] italic text-[#22323D] outline-none"
                      placeholder="Display a tag..."
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const value = newTag.trim();
                        if (!value) return;
                        setProfile((current) => ({
                          ...current,
                          tags: [...current.tags, value],
                        }));
                        setNewTag("");
                      }}
                      className="rounded-full bg-white/70 px-4 py-2 text-sm font-black text-[#1D2834]"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-8">
              <p className="text-[18px] font-black uppercase text-black">Badges</p>
              <div className="mt-5 grid gap-y-8 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => {
                  const badgeValue = profile.badges[index] || "";
                  const badgeMeta = BADGE_OPTIONS.find((item) => item.value === badgeValue);

                  return (
                    <div key={`badge-slot-${index}`} className="flex flex-col items-center text-center">
                      <div className="flex h-[150px] w-[210px] items-center justify-center">
                        {badgeValue ? (
                          <img
                            src={`/badges/${badgeValue}.png`}
                            alt={badgeMeta?.label || badgeValue}
                            className="max-h-[190px] max-w-[290px] object-contain"
                          />
                        ) : (
                          <div className="flex h-[130px] w-[180px] items-center justify-center rounded-[18px] border-2 border-dashed border-[#95A5B4] text-[14px] italic text-[#657482]">
                            Empty badge slot
                          </div>
                        )}
                      </div>
                      <div className="mt-2 min-h-[32px] text-[16px] font-semibold text-black">
                        {badgeMeta?.label || ""}
                      </div>
                      {badgeValue && isOwner ? (
                        <button
                          type="button"
                          onClick={() =>
                            setProfile((current) => ({
                              ...current,
                              badges: current.badges.filter((_, i) => i !== index),
                            }))
                          }
                          className="mt-2 text-[13px] font-medium text-[#314455] underline"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-10">
              <p className="text-[18px] font-black uppercase text-black">Tags</p>
              {profile.tags.length ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  {profile.tags.map((tag, index) => (
                    <button
                      key={`${tag}-${index}`}
                      type="button"
                      disabled={!isOwner}
                      onClick={() =>
                        isOwner &&
                        setProfile((current) => ({
                          ...current,
                          tags: current.tags.filter((_, i) => i !== index),
                        }))
                      }
                      className="rounded-full border border-[#D5DEE5] bg-white/80 px-4 py-2 text-sm font-medium text-[#22323D]"
                    >
                      {tag}
                      {isOwner ? " x" : ""}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-4 text-[14px] italic text-[#697784]">No tags yet.</div>
              )}
            </div>
          </section>
        ) : null}

        {activeTab === "Ratings" ? (
          <section className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[32px] bg-[#C9D2DB] p-5">
              <h3 className="text-[20px] font-black text-black">Ratings Received</h3>
              <div className="mt-4 min-h-[220px] rounded-[20px] bg-white/45 p-4">
                {ratings.received.length ? (
                  <div className="space-y-4">
                    {ratings.received.map((item) => (
                      <RatingCard key={item.id} item={item} type="received" />
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-[180px] items-center justify-center text-[14px] italic text-[#697784]">
                    No ratings received yet.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[32px] bg-[#C9D2DB] p-5">
              <h3 className="text-[20px] font-black text-black">Ratings Given</h3>
              <div className="mt-4 min-h-[220px] rounded-[20px] bg-white/45 p-4">
                {ratings.given.length ? (
                  <div className="space-y-4">
                    {ratings.given.map((item) => (
                      <RatingCard key={item.id} item={item} type="given" />
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-[180px] items-center justify-center text-[14px] italic text-[#697784]">
                    No ratings given yet.
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : null}

        {isOwner ? (
          <div className="mt-4 flex justify-end">
            <button
              onClick={saveProfile}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-[16px] bg-[linear-gradient(180deg,#33455f_0%,#1f2f47_100%)] px-5 py-3 text-base font-semibold text-white shadow-[0_12px_24px_rgba(31,47,71,0.22)]"
            >
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
