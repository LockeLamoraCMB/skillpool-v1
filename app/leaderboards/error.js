"use client";

export default function LeaderboardsError({ reset }) {
  return (
    <main className="min-h-screen bg-[#EFF3F5] px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-2xl rounded-[32px] border border-red-100 bg-white p-8 text-center shadow-[0_18px_55px_rgba(18,33,43,0.06)]">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-red-500">
          Leaderboard unavailable
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-[#12212B]">
          The rankings could not load.
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-[#61727E]">
          This usually means the database migration has not been applied yet or Supabase is unavailable.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-2xl bg-[#12212B] px-5 py-3 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
