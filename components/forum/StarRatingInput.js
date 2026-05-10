"use client";

export default function StarRatingInput({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-3xl transition ${
            star <= value ? "text-[#F59E0B]" : "text-[#D1D5DB]"
          }`}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
}