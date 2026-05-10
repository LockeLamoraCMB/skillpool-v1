# Skillpool V1 Supabase integration notes

These notes keep the backend intentionally simple so you can replace mock data page by page.

## 1) Add the Supabase packages later
Install the current JavaScript client and the SSR helper package:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## 2) Add environment variables
Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

If your project is still using the older anon key naming, you can adapt the helper file, but new projects should use the publishable key naming.

## 3) Create browser and server helpers
A clean place for these is:

- `lib/supabase/client.js`
- `lib/supabase/server.js`

Use the browser helper in client components and the server helper in server components, server actions, and route handlers.

## 4) Replace mock auth on the Join page
Start with two simple flows:

- Email + password sign up / sign in
- Microsoft sign in for verified students

For the Microsoft button, wire it to `supabase.auth.signInWithOAuth(...)` with the Microsoft provider your project uses. Keep the STI verification rule separate from the button itself.

## 5) Enforce student-only access
After login, verify the authenticated email matches your official STI student email domain.

Suggested approach:
- allow sign-in
- inspect the returned user email on the server
- if the email domain is not your approved STI domain, sign the user out or mark access as blocked
- only mark `profiles.is_verified = true` for approved student accounts

This is safer than relying on the front-end form alone.

## 6) Create a profile row on first login
On first successful sign in:
- read the authenticated user from `auth.users`
- upsert into `public.profiles`
- fill `email`, `full_name`, `username`, `avatar_url`, and `is_verified`

This keeps your app-specific profile data separate from the auth system.

## 7) Swap mock data page by page
Recommended order:
1. `Join` page for auth
2. `Forum` page for real listings
3. `Thread details` page for replies and reviews
4. `Profile` page
5. `Leaderboards` page

That lets the demo feel real quickly without overbuilding the whole backend.

## 8) Query strategy for V1
Keep the first version simple:
- fetch programs and courses once
- fetch recent listings for the forum page
- fetch one listing plus replies/reviews for the detail page
- fetch leaderboard data with a simple ordered select on `score desc`

## 9) Keep writes small in V1
Only allow:
- create listing
- create reply
- create review after a completed request
- update own profile
- update own listing status

That is enough to demonstrate the product without building advanced workflows yet.

## 10) Add trust features later
Good V2 upgrades:
- computed rating summaries
- automatic badge assignment
- leaderboard score function
- direct messaging
- report / moderation tools
- file attachments
