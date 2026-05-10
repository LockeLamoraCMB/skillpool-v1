export default function StarRatingDisplay({
  average = 0,
  count = 0,
  size = "sm",
  showCount = true,
}) {
  const rounded = Math.round(Number(average || 0));
  const starClass =
    size === "lg" ? "text-lg" : size === "sm" ? "text-sm" : "text-base";

  if (!count) {
    return (
      <div className="flex items-center gap-2">
        <div className={`flex ${starClass} text-[#D1D5DB]`}>{"★★★★★"}</div>
        <span className="text-xs font-medium text-[#7B8794]">No reviews yet</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`flex ${starClass}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rounded ? "text-[#F59E0B]" : "text-[#D1D5DB]"}
          >
            ★
          </span>
        ))}
      </div>
      <span className="text-xs font-medium text-[#52606D]">
        {Number(average).toFixed(1)}
        {showCount ? ` (${count})` : ""}
      </span>
    </div>
  );
}