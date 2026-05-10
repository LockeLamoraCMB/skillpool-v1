import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createCheckoutSession,
  formatPhp,
  getAppBaseUrl,
  toCentavos,
} from "@/lib/paymongo";
import { isAllowedStudentEmail } from "@/lib/auth/student";

export const runtime = "nodejs";

function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError("You must be signed in to pay for an exchange.", 401);
  }

  if (!isAllowedStudentEmail(user.email)) {
    await supabase.auth.signOut();
    return jsonError("Please use your STI email account.", 403);
  }

  const body = await request.json().catch(() => null);
  const exchangeId = body?.exchangeId;

  if (!exchangeId) {
    return jsonError("Missing exchange.");
  }

  const { data: exchange, error: exchangeError } = await supabase
    .from("skill_exchanges")
    .select(`
      id,
      forum_post_id,
      requester_id,
      provider_id,
      status,
      requester:profiles!skill_exchanges_requester_id_fkey (
        id,
        email,
        full_name,
        username
      ),
      provider:profiles!skill_exchanges_provider_id_fkey (
        id,
        email,
        full_name,
        username
      ),
      post:forum_posts!skill_exchanges_forum_post_id_fkey (
        id,
        title,
        slug,
        post_type,
        price_amount
      )
    `)
    .eq("id", exchangeId)
    .maybeSingle();

  if (exchangeError) {
    return jsonError(exchangeError.message, 500);
  }

  if (!exchange) {
    return jsonError("Exchange not found.", 404);
  }

  if (exchange.requester_id !== user.id) {
    return jsonError("Only the requester can pay for this exchange.", 403);
  }

  if (!["accepted", "completed"].includes(exchange.status)) {
    return jsonError("The exchange must be accepted before payment.");
  }

  const amount = Number(exchange.post?.price_amount || 0);
  const amountInCentavos = toCentavos(amount);

  if (!amountInCentavos) {
    return jsonError("This exchange does not have a payable service fee.");
  }

  const { data: existingPayments, error: existingError } = await supabase
    .from("payments")
    .select("*")
    .eq("exchange_id", exchange.id)
    .eq("payer_id", user.id)
    .in("status", ["pending", "paid"])
    .order("created_at", { ascending: false })
    .limit(1);

  if (existingError) {
    return jsonError(existingError.message, 500);
  }

  const existingPayment = existingPayments?.[0];

  if (existingPayment?.status === "paid") {
    return NextResponse.json({
      status: "paid",
      paymentId: existingPayment.id,
      message: "This exchange has already been paid.",
    });
  }

  if (existingPayment?.checkout_url) {
    return NextResponse.json({
      checkoutUrl: existingPayment.checkout_url,
      paymentId: existingPayment.id,
      status: existingPayment.status,
    });
  }

  const paymentPayload = {
    payer_id: user.id,
    payee_id: exchange.provider_id,
    exchange_id: exchange.id,
    forum_post_id: exchange.forum_post_id,
    amount,
    amount_centavos: amountInCentavos,
    currency: "PHP",
    status: "pending",
    metadata: {
      source: "skill_exchange",
      post_slug: exchange.post?.slug,
    },
  };

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert(paymentPayload)
    .select("*")
    .single();

  if (paymentError) {
    return jsonError(paymentError.message, 500);
  }

  const baseUrl = getAppBaseUrl(request);
  const successUrl = `${baseUrl}/payments/success?payment_id=${payment.id}`;
  const cancelUrl = `${baseUrl}/payments/cancel?payment_id=${payment.id}`;
  const description = `Skillpool exchange: ${exchange.post?.title || "Student service"}`;

  let checkout;
  try {
    checkout = await createCheckoutSession({
      amount,
      description,
      lineItemName: exchange.post?.title || "Skillpool exchange",
      successUrl,
      cancelUrl,
      metadata: {
        skillpool_payment_id: payment.id,
        skillpool_exchange_id: exchange.id,
        skillpool_post_id: exchange.forum_post_id,
        payer_id: user.id,
        payee_id: exchange.provider_id,
      },
      billing: {
        email: user.email,
        name:
          exchange.requester?.full_name ||
          exchange.requester?.username ||
          user.email,
      },
    });
  } catch (checkoutError) {
    await supabase
      .from("payments")
      .update({
        status: "failed",
        failure_reason: checkoutError.message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    return jsonError(checkoutError.message, 502);
  }

  const checkoutSession = checkout?.data;
  const checkoutUrl = checkoutSession?.attributes?.checkout_url;

  if (!checkoutSession?.id || !checkoutUrl) {
    return jsonError("PayMongo did not return a checkout URL.", 502);
  }

  const { error: updateError } = await supabase
    .from("payments")
    .update({
      checkout_url: checkoutUrl,
      paymongo_checkout_session_id: checkoutSession.id,
      provider_response: checkout,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payment.id);

  if (updateError) {
    return jsonError(updateError.message, 500);
  }

  return NextResponse.json({
    checkoutUrl,
    paymentId: payment.id,
    status: "pending",
    amountLabel: formatPhp(amount),
  });
}
