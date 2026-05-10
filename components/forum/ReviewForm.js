"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StarRatingInput from "@/components/forum/StarRatingInput";
import StarRatingDisplay from "@/components/forum/StarRatingDisplay";

export default function ReviewForm({
  exchangeId,
  reviewerId,
  reviewedUserId,
  reviewedUsername,
  existingReview,
}) {
  const router = useRouter();

  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSubmit(event) {
  event.preventDefault();
  setError("");
  setNotice("");

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    setError("Please choose a rating from 1 to 5 stars.");
    return;
  }

  if (!comment.trim()) {
    setError("Please write a short review.");
    return;
  }

  setSubmitting(true);

  const response = await fetch("/api/exchange-reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      exchangeId,
      reviewerId,
      reviewedUserId,
      rating,
      comment: comment.trim(),
    }),
  });

  const result = await response.json().catch(() => ({}));

  setSubmitting(false);

  if (!response.ok) {
    setError(result.error || "Review could not be saved.");
    return;
  }

  setNotice(existingReview ? "Review updated." : "Review submitted.");
  router.refresh();
}
  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[20px] border border-[#E7EEF2] bg-[#F8FBFC] p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#7B8794]">
            Review student
          </p>
          <p className="mt-2 text-lg font-semibold text-[#12212B]">
            {reviewedUsername}
          </p>
        </div>

        {existingReview ? (
          <StarRatingDisplay
            average={existingReview.rating}
            count={1}
            showCount={false}
          />
        ) : null}
      </div>

      <div className="mt-5">
        <StarRatingInput value={rating} onChange={setRating} />
      </div>

      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        className="mt-5 min-h-[120px] w-full rounded-2xl border border-[#D3DDE5] bg-white px-4 py-3 outline-none focus:border-[#7EA9B9]"
        placeholder="How did the exchange go?"
      />

      {error ? (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {notice ? (
        <p className="mt-4 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
          {notice}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 rounded-2xl bg-[#12212B] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {submitting ? "Saving..." : existingReview ? "Update review" : "Submit review"}
      </button>
    </form>
  );
}
