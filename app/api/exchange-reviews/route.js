import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAllowedStudentEmail } from "@/lib/auth/student";

function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError("You must be signed in to leave a review.", 401);
  }

  if (!isAllowedStudentEmail(user.email)) {
    await supabase.auth.signOut();
    return jsonError("Please use your STI email account.", 403);
  }

  const body = await request.json().catch(() => null);
  const exchangeId = body?.exchangeId;
  const reviewedUserId = body?.reviewedUserId;
  const rating = Number(body?.rating);
  const comment = String(body?.comment || "").trim();

  if (!exchangeId || !reviewedUserId) {
    return jsonError("Missing exchange or reviewed student.");
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return jsonError("Choose a rating from 1 to 5 stars.");
  }

  if (!comment) {
    return jsonError("Please write a short review.");
  }

  const { data: exchange, error: exchangeError } = await supabase
    .from("skill_exchanges")
    .select("id, requester_id, provider_id, status")
    .eq("id", exchangeId)
    .maybeSingle();

  if (exchangeError) {
    return jsonError(exchangeError.message, 500);
  }

  if (!exchange) {
    return jsonError("Exchange not found.", 404);
  }

  if (exchange.status !== "completed") {
    return jsonError("Reviews can only be left after a completed exchange.");
  }

  const participants = [exchange.requester_id, exchange.provider_id].filter(Boolean);

  if (!participants.includes(user.id)) {
    return jsonError("You can only review exchanges you joined.", 403);
  }

  if (!participants.includes(reviewedUserId) || reviewedUserId === user.id) {
    return jsonError("Choose the other exchange participant to review.", 403);
  }

  const payload = {
    exchange_id: exchangeId,
    reviewer_id: user.id,
    reviewed_user_id: reviewedUserId,
    rating,
    comment,
    updated_at: new Date().toISOString(),
  };

  const { data: review, error: reviewError } = await supabase
    .from("exchange_reviews")
    .upsert(payload, {
      onConflict: "exchange_id,reviewer_id,reviewed_user_id",
    })
    .select("*")
    .single();

  if (reviewError) {
    return jsonError(reviewError.message, 500);
  }

  try {
  const { error: leaderboardError } = await supabase.rpc("refresh_leaderboard_stats");

  if (leaderboardError) {
    console.warn("Could not refresh leaderboard stats", leaderboardError);
  }
} catch (leaderboardError) {
  console.warn("Could not refresh leaderboard stats", leaderboardError);
}

  return NextResponse.json({ review });
}
