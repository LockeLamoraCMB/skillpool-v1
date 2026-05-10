import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPhp } from "@/lib/paymongo";

export const metadata = {
  title: "Payment Canceled",
};

export default async function PaymentCancelPage({ searchParams }) {
  const params = await searchParams;
  const paymentId = params.payment_id;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const next = `/payments/cancel${paymentId ? `?payment_id=${paymentId}` : ""}`;
    redirect(`/join?next=${encodeURIComponent(next)}`);
  }

  let payment = null;

  if (paymentId) {
    const { data } = await supabase
      .from("payments")
      .select(`
        id,
        amount,
        status,
        payer_id,
        payee_id,
        post:forum_posts!payments_forum_post_id_fkey (
          title,
          slug
        )
      `)
      .eq("id", paymentId)
      .or(`payer_id.eq.${user.id},payee_id.eq.${user.id}`)
      .maybeSingle();

    payment = data;

    if (payment?.status === "pending" && payment.payer_id === user.id) {
      await supabase
        .from("payments")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("id", payment.id)
        .eq("status", "pending")
        .eq("payer_id", user.id);

      payment = { ...payment, status: "canceled" };
    }
  }

  return (
    <main className="min-h-screen bg-[#EFF3F5] px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl overflow-hidden rounded-[32px] border border-[#D7E1E7] bg-white shadow-[0_24px_70px_rgba(18,33,43,0.10)]">
        <div className="bg-[linear-gradient(135deg,#3b2630_0%,#6f3d4c_52%,#d7a93a_100%)] px-7 py-10 text-white sm:px-10">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/75">
            PayMongo checkout
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">
            Payment was canceled
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/82">
            No successful payment was recorded. You can return to the exchange and start a new secure checkout when you are ready.
          </p>
        </div>

        <div className="p-7 sm:p-10">
          {payment ? (
            <div className="rounded-[20px] border border-[#E1E9EE] bg-[#F8FBFC] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7B8794]">
                Transaction
              </p>
              <p className="mt-2 text-xl font-black text-[#12212B]">
                {formatPhp(payment.amount)} - {payment.status}
              </p>
              <p className="mt-2 text-sm text-[#61727E]">
                {payment.post?.title || "Skill exchange"}
              </p>
            </div>
          ) : null}

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
