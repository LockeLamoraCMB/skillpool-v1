import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatForumDate } from "@/lib/forum";
import StarRatingDisplay from "@/components/forum/StarRatingDisplay";
import ExchangeActions from "@/components/forum/ExchangeActions";

export default async function ForumPostDetailPage({ params }) {
  const { slug } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/join");
  }

  const { data: post, error: postError } = await supabase
    .from("forum_post_feed")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (postError) {
    throw new Error(postError.message);
  }

  if (!post) {
    notFound();
  }

  const { data: exchanges, error: exchangesError } = await supabase
    .from("skill_exchanges")
    .select(`
      id,
      forum_post_id,
      requester_id,
      provider_id,
      status,
      note,
      created_at,
      updated_at,
      completed_at,
      requester:profiles!skill_exchanges_requester_id_fkey (
        id,
        username,
        full_name,
        avatar_url,
        role,
        program
      ),
      provider:profiles!skill_exchanges_provider_id_fkey (
        id,
        username,
        full_name,
        avatar_url,
        role,
        program
      )
    `)
    .eq("forum_post_id", post.id)
    .order("created_at", { ascending: false });

  if (exchangesError) {
    throw new Error(exchangesError.message);
  }

  const exchangeIds = (exchanges || []).map((exchange) => exchange.id);

  let reviews = [];
  let payments = [];

  if (exchangeIds.length) {
    const { data: reviewData, error: reviewsError } = await supabase
      .from("exchange_reviews")
      .select(`
        id,
        exchange_id,
        reviewer_id,
        reviewed_user_id,
        rating,
        comment,
        created_at,
        updated_at,
        reviewer:profiles!exchange_reviews_reviewer_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .in("exchange_id", exchangeIds)
      .order("created_at", { ascending: false });

    if (reviewsError) {
      throw new Error(reviewsError.message);
    }

    reviews = reviewData || [];

    const { data: paymentData, error: paymentsError } = await supabase
      .from("payments")
      .select("id, exchange_id, payer_id, payee_id, amount, currency, status, checkout_url, paid_at, created_at")
      .in("exchange_id", exchangeIds)
      .order("created_at", { ascending: false });

    if (!paymentsError) {
      payments = paymentData || [];
    }
  }

  return (
    <main className="min-h-screen bg-[#EFF3F5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-[28px] border border-[#D7E1E7] bg-white p-6 shadow-[0_12px_35px_rgba(23,43,58,0.06)] sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[#D7E1E8] bg-[#F7FAFB] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#556370]">
                {post.category}
              </span>
              <span className="text-sm text-[#7B8794]">
                {formatForumDate(post.created_at)}
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-[#12212B]">
              {post.title}
            </h1>

            {post.tags?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#D7E1E8] bg-[#F8FBFC] px-3 py-1 text-xs font-semibold text-[#52606D]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-8 whitespace-pre-wrap text-[16px] leading-8 text-[#334155]">
              {post.body}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[28px] border border-[#D7E1E7] bg-white p-6 shadow-[0_12px_35px_rgba(23,43,58,0.06)]">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-full border border-[#D7E1E8]">
                  <img
                    src={post.author_avatar_url || "/profile/avatar.png"}
                    alt={post.author_username}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <p className="text-lg font-black text-[#12212B]">
                    {post.author_username}
                  </p>
                  <p className="mt-1 text-sm text-[#52606D]">{post.author_role}</p>
                </div>
              </div>

              <div className="mt-5">
                <StarRatingDisplay
                  average={post.author_average_rating}
                  count={post.author_review_count}
                  size="lg"
                />
              </div>
            </section>

            <ExchangeActions
              post={post}
              currentUserId={user.id}
              exchanges={exchanges || []}
              reviews={reviews || []}
              payments={payments}
            />
          </aside>
        </div>

        <section className="mt-6 rounded-[28px] border border-[#D7E1E7] bg-white p-6 shadow-[0_12px_35px_rgba(23,43,58,0.06)] sm:p-8">
          <h2 className="text-2xl font-black text-[#12212B]">Recent reviews</h2>

          {reviews.length ? (
            <div className="mt-6 grid gap-4">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-[20px] border border-[#E7EEF2] bg-[#F8FBFC] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-full border border-[#D7E1E8]">
                        <img
                          src={review.reviewer?.avatar_url || "/profile/avatar.png"}
                          alt={review.reviewer?.username || "Reviewer"}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-[#12212B]">
                          {review.reviewer?.username || "Student reviewer"}
                        </p>
                        <p className="mt-1 text-xs text-[#7B8794]">
                          {formatForumDate(review.created_at)}
                        </p>
                      </div>
                    </div>

                    <StarRatingDisplay
                      average={review.rating}
                      count={1}
                      showCount={false}
                    />
                  </div>

                  <p className="mt-4 text-[15px] leading-7 text-[#52606D]">
                    {review.comment}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[20px] border border-dashed border-[#D7E1E8] bg-[#FAFCFD] p-5 text-sm text-[#61727E]">
              No reviews yet for exchanges related to this thread.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
