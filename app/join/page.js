"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  getStudentEmailDomainHint,
  isAllowedStudentEmail,
} from "@/lib/auth/student";

const benefits = [
  "Verified student-only marketplace",
  "Find tutors, academic help, and creative support",
  "Build badges, reviews, and campus credibility",
];

function normalizeUsername(value = "") {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_")
    .slice(0, 20);
}

function isValidUsername(value) {
  return /^[a-z0-9_]{3,20}$/.test(value);
}

function JoinPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const nextPath = searchParams.get("next")?.startsWith("/")
    ? searchParams.get("next")
    : "/profile";
  const initialError = searchParams.get("error");
  const domainHint = getStudentEmailDomainHint();

  const [mode, setMode] = useState("signup");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [signUpForm, setSignUpForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  const [signInForm, setSignInForm] = useState({
    email: "",
    password: "",
  });

  function resetFeedback() {
    setError("");
    setMessage("");
  }

  async function ensureProfileRow(user, preferredUsername = "") {
    const { data: existing, error: existingError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existing?.username) {
      return existing;
    }

    const fallbackSeed = user.email?.split("@")[0] || "student";

    const { data: generatedUsername, error: usernameError } = await supabase.rpc(
      "generate_unique_username",
      {
        desired_username: preferredUsername || user.user_metadata?.username || "",
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

    return data;
  }

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!user) {
        setInitializing(false);
        return;
      }

      try {
        if (!isAllowedStudentEmail(user.email)) {
          await supabase.auth.signOut();
          if (active) {
            setError(`Please sign in with your STI email address (${domainHint}).`);
            setInitializing(false);
          }
          return;
        }

        const profile = await ensureProfileRow(user);
        if (!active) return;
        router.replace(nextPath === "/profile" ? `/profile/${profile.username}` : nextPath);
        router.refresh();
      } catch (bootstrapError) {
        console.error(bootstrapError);
        if (active) {
          setInitializing(false);
        }
      }
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, [domainHint, nextPath, router, supabase]);

  async function handleMicrosoftSignIn() {
  resetFeedback();
  setLoading(true);

  const callbackUrl = new URL("/auth/callback", window.location.origin);
  callbackUrl.searchParams.set("next", nextPath || "/profile");

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "azure",
    options: {
      scopes: "email",
      queryParams: {
        prompt: "select_account",
      },
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    setError(error.message);
    setLoading(false);
  }
}

  async function handleEmailSignUp(e) {
    e.preventDefault();
    resetFeedback();
    setLoading(true);

    const fullName = signUpForm.fullName.trim();
    const username = normalizeUsername(signUpForm.username);
    const email = signUpForm.email.trim().toLowerCase();
    const password = signUpForm.password;

    if (!fullName) {
      setError("Please enter your full name.");
      setLoading(false);
      return;
    }

    if (username && !isValidUsername(username)) {
      setError(
        "Username must be 3–20 characters and use only lowercase letters, numbers, or underscores."
      );
      setLoading(false);
      return;
    }

    if (!isAllowedStudentEmail(email)) {
      setError(`Please use your STI email address (${domainHint}).`);
      setLoading(false);
      return;
    }

    if (username) {
      const { data: available, error: availabilityError } = await supabase.rpc(
        "is_username_available",
        {
          desired_username: username,
        }
      );

      if (availabilityError) {
        setError(availabilityError.message);
        setLoading(false);
        return;
      }

      if (!available) {
        setError("That username is already taken.");
        setLoading(false);
        return;
      }
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath || "/profile")}`,
        data: {
          full_name: fullName,
          username,
          role: "Student",
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data?.user && data?.session) {
      try {
        const profile = await ensureProfileRow(data.user, username);
        setLoading(false);
        router.replace(nextPath === "/profile" ? `/profile/${profile.username}` : nextPath);
        router.refresh();
        return;
      } catch (profileError) {
        setError(profileError.message || "Account created, but profile sync failed.");
        setLoading(false);
        return;
      }
    }

    setMessage(
      "Account created. If email confirmation is enabled, confirm your email first, then sign in."
    );
    setLoading(false);
  }

  async function handleEmailSignIn(e) {
    e.preventDefault();
    resetFeedback();
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: signInForm.email.trim().toLowerCase(),
      password: signInForm.password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Signed in, but no active user session was found.");
      setLoading(false);
      return;
    }

    try {
      if (!isAllowedStudentEmail(user.email)) {
        await supabase.auth.signOut();
        setError(`Please sign in with your STI email address (${domainHint}).`);
        setLoading(false);
        return;
      }

      const profile = await ensureProfileRow(user);
      setLoading(false);
      router.replace(nextPath === "/profile" ? `/profile/${profile.username}` : nextPath);
      router.refresh();
    } catch (profileError) {
      setError(profileError.message || "Signed in, but profile sync failed.");
      setLoading(false);
    }
  }

  if (initializing) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] px-6 py-10">
        <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
          Checking your account...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <section className="grid min-h-[calc(100vh-88px)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#6B1F33_0%,#8A2D47_50%,#A64A61_100%)]" />
          <div className="absolute inset-0 bg-black/10" />

          <img
            src="/join-student.png"
            alt="Student working"
            className="absolute bottom-0 right-0 z-0 h-full w-full object-cover opacity-60"
          />

          <div className="relative z-20 flex w-full flex-col justify-between p-12 xl:p-16 text-white">
            <div className="max-w-xl">
              <h1 className="text-5xl font-black leading-tight xl:text-6xl">
                Success starts here
              </h1>

              <ul className="mt-10 space-y-6 text-xl leading-relaxed text-white/95">
                {benefits.map((item) => (
                  <li key={item} className="flex items-start gap-4">
                    <span className="mt-1 text-2xl">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-[560px] rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-10">
            <div className="mb-6 grid grid-cols-2 rounded-2xl bg-black/5 p-1">
              <button
                onClick={() => setMode("signin")}
                className={`rounded-2xl px-4 py-3 text-base font-semibold transition ${
                  mode === "signin" ? "bg-[#000100] text-white" : "text-black/60"
                }`}
              >
                Sign in
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`rounded-2xl px-4 py-3 text-base font-semibold transition ${
                  mode === "signup" ? "bg-[#000100] text-white" : "text-black/60"
                }`}
              >
                Create Account
              </button>
            </div>

            <h2 className="text-4xl font-black tracking-tight text-[#000100]">
              {mode === "signup" ? "Create a new account" : "Welcome back"}
            </h2>

            <p className="mt-4 text-lg text-black/75">
              {mode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
              <button
                onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                className="font-semibold text-[#6B1F33] underline underline-offset-4"
              >
                {mode === "signup" ? "Sign in" : "Create account"}
              </button>
            </p>

            <div className="mt-8">
              <button
                onClick={handleMicrosoftSignIn}
                disabled={loading}
                className="flex w-full items-center justify-center gap-4 rounded-2xl border border-black/10 bg-white px-5 py-4 text-xl font-semibold text-[#000100] hover:bg-black/[0.02] disabled:opacity-60"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B4D2E7] font-bold text-[#000100]">
                  M
                </span>
                Continue with STI Microsoft Account
              </button>
            </div>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-black/10" />
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-black/35">
                Or
              </span>
              <div className="h-px flex-1 bg-black/10" />
            </div>

            {mode === "signup" ? (
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <input
                  type="text"
                  placeholder="Full name"
                  value={signUpForm.fullName}
                  onChange={(e) =>
                    setSignUpForm((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-black/10 px-5 py-4 text-lg outline-none placeholder:text-black/35 focus:border-[#8A2D47]"
                  required
                />

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Choose a username (optional)"
                    value={signUpForm.username}
                    onChange={(e) =>
                      setSignUpForm((prev) => ({
                        ...prev,
                        username: normalizeUsername(e.target.value),
                      }))
                    }
                    className="w-full rounded-2xl border border-black/10 px-5 py-4 text-lg outline-none placeholder:text-black/35 focus:border-[#8A2D47]"
                  />
                  <p className="text-sm text-black/50">
                    3–20 characters, lowercase letters, numbers, and underscores only.
                  </p>
                </div>

                <input
                  type="email"
                  placeholder="STI edu mail"
                  value={signUpForm.email}
                  onChange={(e) =>
                    setSignUpForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-black/10 px-5 py-4 text-lg outline-none placeholder:text-black/35 focus:border-[#8A2D47]"
                  required
                />

                <input
                  type="password"
                  placeholder="Create password"
                  value={signUpForm.password}
                  onChange={(e) =>
                    setSignUpForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-black/10 px-5 py-4 text-lg outline-none placeholder:text-black/35 focus:border-[#8A2D47]"
                  required
                  minLength={6}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-[#000100] px-5 py-4 text-xl font-semibold text-white hover:opacity-95 disabled:opacity-60"
                >
                  {loading ? "Creating account..." : "Create Skillpool account"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <input
                  type="email"
                  placeholder="STI edu mail"
                  value={signInForm.email}
                  onChange={(e) =>
                    setSignInForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-black/10 px-5 py-4 text-lg outline-none placeholder:text-black/35 focus:border-[#8A2D47]"
                  required
                />

                <input
                  type="password"
                  placeholder="Enter password"
                  value={signInForm.password}
                  onChange={(e) =>
                    setSignInForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-black/10 px-5 py-4 text-lg outline-none placeholder:text-black/35 focus:border-[#8A2D47]"
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-[#000100] px-5 py-4 text-xl font-semibold text-white hover:opacity-95 disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign in to Skillpool"}
                </button>
              </form>
            )}

            {error || initialError ? (
              <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error ||
                  (initialError === "student_email_required"
                    ? `Skillpool is limited to STI email accounts (${domainHint}).`
                    : "Please sign in again to continue.")}
              </p>
            ) : null}

            {message ? (
              <p className="mt-5 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </p>
            ) : null}

            <p className="mt-10 text-sm leading-7 text-black/55">
              By joining, you agree to the Skillpool{" "}
              <span className="font-medium text-[#6B1F33]">Terms of Use</span> and
              campus verification rules. Only verified STI students can access the
              platform.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-10 lg:hidden">
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-[linear-gradient(135deg,#6B1F33_0%,#8A2D47_50%,#A64A61_100%)] p-8 text-white shadow-[0_20px_50px_rgba(107,31,51,0.24)]">
          <h3 className="text-3xl font-black">Success starts here</h3>
          <ul className="mt-6 space-y-4 text-base text-white/95">
            {benefits.map((item) => (
              <li key={item} className="flex gap-3">
                <span>✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f5f5f5] px-6 py-10">
          <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
            Loading sign-in...
          </div>
        </main>
      }
    >
      <JoinPageContent />
    </Suspense>
  );
}
