"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ReviewForm from "@/components/forum/ReviewForm";
import PayMongoCheckoutButton from "@/components/payments/PayMongoCheckoutButton";

function formatPhp(amount) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: Number.isInteger(Number(amount)) ? 0 : 2,
  }).format(Number(amount || 0));
}

function getLatestPayment(payments = [], exchangeId) {
  return payments
    .filter((payment) => payment.exchange_id === exchangeId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
}

export default function ExchangeActions({
  post,
  postId,
  postAuthorId,
  exchanges,
  reviews,
  payments = [],
  currentUserId,
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [busyKey, setBusyKey] = useState("");
  const [error, setError] = useState("");

  const resolvedPost =
    post || {
      id: postId,
      author_id: postAuthorId,
      post_type: "offer",
      price_amount: 0,
    };

  const isAuthor = currentUserId === resolvedPost.author_id;
  const priceAmount = Number(resolvedPost.price_amount || 0);

  const myExchange = (exchanges || []).find(
    (exchange) =>
      exchange.requester_id === currentUserId || exchange.provider_id === currentUserId
  );
  const myLatestPayment = myExchange ? getLatestPayment(payments, myExchange.id) : null;
  const myExchangeCanComplete = priceAmount <= 0 || myLatestPayment?.status === "paid";

  const reviewable = (exchanges || [])
    .filter(
      (exchange) =>
        exchange.status === "completed" &&
        (exchange.requester_id === currentUserId ||
          exchange.provider_id === currentUserId)
    )
    .map((exchange) => {
      const target =
        exchange.requester_id === currentUserId
          ? exchange.provider
          : exchange.requester;

      const existingReview = (reviews || []).find(
        (review) =>
          review.exchange_id === exchange.id &&
          review.reviewer_id === currentUserId &&
          review.reviewed_user_id === target.id
      );

      return {
        exchange,
        target,
        existingReview,
      };
    });

  async function requestExchange() {
    setBusyKey("request");
    setError("");

    const payload =
      resolvedPost.post_type === "offer"
        ? {
            forum_post_id: resolvedPost.id,
            requester_id: currentUserId,
            provider_id: resolvedPost.author_id,
            status: "requested",
          }
        : {
            forum_post_id: resolvedPost.id,
            requester_id: resolvedPost.author_id,
            provider_id: currentUserId,
            status: "requested",
          };

    const { error: insertError } = await supabase
      .from("skill_exchanges")
      .insert(payload);

    setBusyKey("");

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.refresh();
  }

  async function updateExchange(exchangeId, nextStatus) {
    setBusyKey(`${exchangeId}:${nextStatus}`);
    setError("");

    const payload =
      nextStatus === "completed"
        ? {
            status: "completed",
            completed_at: new Date().toISOString(),
          }
        : {
            status: nextStatus,
          };

    const { error: updateError } = await supabase
      .from("skill_exchanges")
      .update(payload)
      .eq("id", exchangeId);

    setBusyKey("");

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[24px] border border-[#D9E2E8] bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-2xl font-black text-[#12212B]">Skill exchange</h3>
            <p className="mt-2 text-[15px] leading-7 text-[#52606D]">
              When a thread turns into a completed exchange, both participants can
              leave a 5-star review.
            </p>
          </div>

          {!isAuthor && !myExchange ? (
            <button
              type="button"
              onClick={requestExchange}
              disabled={busyKey === "request"}
              className="rounded-2xl bg-[#12212B] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busyKey === "request"
                ? "Requesting..."
                : resolvedPost.post_type === "offer"
                ? "Request skill exchange"
                : "Offer help"}
            </button>
          ) : null}
        </div>

        {error ? (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {!isAuthor && myExchange ? (
          <div className="mt-6 rounded-[20px] bg-[#F8FBFC] p-5">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#7B8794]">
              Your exchange status
            </p>
            <p className="mt-3 text-lg font-semibold capitalize text-[#12212B]">
              {myExchange.status}
            </p>

            {priceAmount > 0 ? (
              <div className="mt-5 rounded-[18px] border border-[#DDE7EC] bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7B8794]">
                      Payment
                    </p>
                    <p className="mt-2 text-lg font-black text-[#12212B]">
                      {formatPhp(priceAmount)}
                    </p>
                    <p className="mt-1 text-sm text-[#61727E]">
                      Secure checkout is completed through PayMongo.
                    </p>
                  </div>

                  {(() => {
                    const latestPayment = getLatestPayment(payments, myExchange.id);

                    if (latestPayment?.status === "paid") {
                      return (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">
                          Paid
                        </span>
                      );
                    }

                    if (myExchange.requester_id === currentUserId && myExchange.status === "accepted") {
                      return <PayMongoCheckoutButton exchangeId={myExchange.id} />;
                    }

                    return (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-amber-700">
                        {latestPayment?.status || "Awaiting checkout"}
                      </span>
                    );
                  })()}
                </div>
              </div>
            ) : null}

            {myExchange.status === "accepted" && myExchangeCanComplete ? (
              <button
                type="button"
                onClick={() => updateExchange(myExchange.id, "completed")}
                disabled={busyKey === `${myExchange.id}:completed`}
                className="mt-4 rounded-2xl bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {busyKey === `${myExchange.id}:completed`
                  ? "Updating..."
                  : "Mark exchange completed"}
              </button>
            ) : myExchange.status === "accepted" && !myExchangeCanComplete ? (
              <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                Complete payment before marking this exchange done.
              </p>
            ) : null}
          </div>
        ) : null}

        {isAuthor ? (
          <div className="mt-6 space-y-4">
            {(exchanges || []).length ? (
              exchanges.map((exchange) => {
                const otherUser =
                  exchange.requester_id === currentUserId
                    ? exchange.provider
                    : exchange.requester;
                const latestPayment = getLatestPayment(payments, exchange.id);

                return (
                  <div
                    key={exchange.id}
                    className="rounded-[20px] border border-[#E7EEF2] bg-[#F8FBFC] p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-bold text-[#12212B]">
                          Exchange with {otherUser?.username || "Student"}
                        </p>
                        <p className="mt-1 text-sm capitalize text-[#52606D]">
                          Status: {exchange.status}
                        </p>
                        {priceAmount > 0 ? (
                          <p className="mt-1 text-sm text-[#52606D]">
                            Payment: {latestPayment?.status || "not started"} - {formatPhp(priceAmount)}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {exchange.status === "requested" ? (
                          <button
                            type="button"
                            onClick={() => updateExchange(exchange.id, "accepted")}
                            disabled={busyKey === `${exchange.id}:accepted`}
                            className="rounded-2xl bg-[#12212B] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                          >
                            {busyKey === `${exchange.id}:accepted`
                              ? "Accepting..."
                              : "Accept"}
                          </button>
                        ) : null}

                        {exchange.status === "accepted" &&
                        (priceAmount <= 0 || latestPayment?.status === "paid") ? (
                          <button
                            type="button"
                            onClick={() => updateExchange(exchange.id, "completed")}
                            disabled={busyKey === `${exchange.id}:completed`}
                            className="rounded-2xl bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                          >
                            {busyKey === `${exchange.id}:completed`
                              ? "Updating..."
                              : "Mark completed"}
                          </button>
                        ) : exchange.status === "accepted" && priceAmount > 0 ? (
                          <span className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
                            Awaiting payment
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[20px] border border-dashed border-[#D7E1E8] bg-[#FAFCFD] p-5 text-sm text-[#61727E]">
                No exchange requests yet for this thread.
              </div>
            )}
          </div>
        ) : null}
      </section>

      {reviewable.length ? (
        <section className="rounded-[24px] border border-[#D9E2E8] bg-white p-6">
          <h3 className="text-2xl font-black text-[#12212B]">Leave a review</h3>
          <div className="mt-5 space-y-6">
            {reviewable.map(({ exchange, target, existingReview }) => (
              <ReviewForm
                key={exchange.id}
                exchangeId={exchange.id}
                reviewerId={currentUserId}
                reviewedUserId={target.id}
                reviewedUsername={target.username || "student"}
                existingReview={existingReview}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
