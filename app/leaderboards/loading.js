export default function LeaderboardsLoading() {
  return (
    <main className="min-h-screen bg-[#EFF3F5] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="h-[280px] animate-pulse rounded-[36px] bg-[#C8D4DC]" />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-[360px] animate-pulse rounded-[28px] bg-white shadow-[0_18px_55px_rgba(18,33,43,0.06)]"
            />
          ))}
        </div>
        <div className="mt-8 space-y-4">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[118px] animate-pulse rounded-[24px] bg-white shadow-[0_14px_40px_rgba(18,33,43,0.05)]"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
