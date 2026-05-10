import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAllowedStudentEmail } from "@/lib/auth/student";

async function ensureProfileRow(supabase, user) {
  const { data: existing, error: existingError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing?.username) {
    if (!existing.is_verified) {
      await supabase
        .from("profiles")
        .update({ is_verified: true, updated_at: new Date().toISOString() })
        .eq("id", user.id);
    }

    return existing;
  }

  const fallbackSeed = user.email?.split("@")[0] || "student";

  const { data: generatedUsername, error: usernameError } = await supabase.rpc(
    "generate_unique_username",
    {
      desired_username:
        typeof user.user_metadata?.username === "string"
          ? user.user_metadata.username
          : "",
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
    full_name:
      existing?.full_name ||
      user.user_metadata?.full_name ||
      "",
    username: generatedUsername,
    role: existing?.role || existing?.program || "Student",
    bio: existing?.bio || "",
    about: existing?.about || "",
    avatar_url: existing?.avatar_url || "/profile/avatar.png",
    banner_url: existing?.banner_url || "/profile/banner.jpg",
    badges: existing?.badges || [],
    tags: existing?.tags || [],
    is_verified: true,
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

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    next = "/";
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let destination = next;

      if (user) {
        try {
          if (!isAllowedStudentEmail(user.email)) {
            await supabase.auth.signOut();
            return NextResponse.redirect(
              new URL("/join?error=student_email_required", origin)
            );
          }

          const profile = await ensureProfileRow(supabase, user);

          if (next === "/profile" && profile?.username) {
            destination = `/profile/${profile.username}`;
          }
        } catch (profileError) {
          console.error(profileError);
          destination = "/join?error=profile_sync";
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      const redirectBase = isLocalEnv
        ? origin
        : forwardedHost
        ? `https://${forwardedHost}`
        : origin;

      return NextResponse.redirect(new URL(destination, redirectBase));
    }
  }

  return NextResponse.redirect(new URL("/join?error=auth_callback", origin));
}
