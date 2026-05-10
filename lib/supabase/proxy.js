import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import {
  buildJoinRedirect,
  isAllowedStudentEmail,
  isProtectedStudentPath,
} from "@/lib/auth/student";

export async function updateSession(request) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtectedStudentPath(pathname)) {
    if (!user) {
      return NextResponse.redirect(
        new URL(buildJoinRedirect(pathname, request.nextUrl.search), request.url)
      );
    }

    if (!isAllowedStudentEmail(user.email)) {
      return NextResponse.redirect(
        new URL("/join?error=student_email_required", request.url)
      );
    }
  }

  return response;
}
