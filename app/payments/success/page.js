import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPhp } from "@/lib/paymongo";

export const metadata = {
  title: "Payment Status",
};

export default async function PaymentSuccessPage({ searchParams }) {
  const params = await searchParams;
  const paymentId = params.payment_id;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const next = `/payments/success${paymentId ? `?payment_id=${paymentId}` : ""}`;
    redirect(`/join?next=${encodeURIComponent(next)}`);
  }

  const { data: payment } = paymentId
    ? await supabase
        .from("payments")
        .select(`
          id,
          amount,
          currency,
          status,
          paid_at,
          payer_id,
          payee_id,
          forum_post_id,
          post:forum_posts!payments_forum_post_id_fkey (
            title,
            slug
          )
        `)
        .eq("id", paymentId)
        .or(`payer_id.eq.${user.id},payee_id.eq.${user.id}`)
        .maybeSingle()
    : { data: null };

  const paid = payment?.status === "paid";

  return (
    <main className="min-h-screen bg-[#EFF3F5] px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl overflow-hidden rounded-[32px] border border-[#D7E1E7] bg-white shadow-[0_24px_70px_rgba(18,33,43,0.10)]">
        <div className="bg-[linear-gradient(135deg,#12312f_0%,#3b596c_48%,#b4d2e7_100%)] px-7 py-10 text-white sm:px-10">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/75">
            PayMongo checkout
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">
            {paid ? "Payment confirmed" : "Payment is processing"}
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/82">
            {paid
              ? "PayMongo has confirmed this exchange payment and Skillpool has recorded it."
              : "You returned from checkout. The final payment state is confirmed by PayMongo webhook delivery, so this may update shortly."}
          </p>
        </div>

        <div className="p-7 sm:p-10">
          {payment ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[20px] border border-[#E1E9EE] bg-[#F8FBFC] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7B8794]">
                  Amount
                </p>
                <p className="mt-2 text-xl font-black text-[#12212B]">
                  {formatPhp(payment.amount)}
                </p>
              </div>
              <div className="rounded-[20px] border border-[#E1E9EE] bg-[#F8FBFC] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7B8794]">
                  Status
                </p>
                <p className="mt-2 text-xl font-black capitalize text-[#12212B]">
                  {payment.status}
                </p>
              </div>
              <div className="rounded-[20px] border border-[#E1E9EE] bg-[#F8FBFC] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7B8794]">
                  Thread
                </p>
                <p className="mt-2 line-clamp-2 text-sm font-bold text-[#12212B]">
                  {payment.post?.title || "Skill exchange"}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-[20px] border border-dashed border-[#D7E1E8] bg-[#FAFCFD] p-6 text-sm text-[#61727E]">
              Payment record was not found for this account.
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {payment?.post?.slug ? (
              <Link
                href={`/forum/post/${payment.post.slug}`}
                className="rounded-2xl bg-[#12212B] px-5 py-3 text-sm font-semibold text-white"
              >
                Return to exchange
              </Link>
            ) : null}
            <Link
              href="/forum"
              className="rounded-2xl border border-[#D7E1E8] bg-white px-5 py-3 text-sm font-semibold text-[#12212B]"
            >
              Go to forum
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
