import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPayMongoWebhookSignature } from "@/lib/paymongo";

export const runtime = "nodejs";

function getPaymentFromCheckout(checkoutAttributes = {}) {
  const payment = checkoutAttributes.payments?.[0];
  if (!payment) return null;
  return payment.data || payment;
}

function getPaidAt(paymentAttributes = {}, fallback = null) {
  if (paymentAttributes.paid_at) {
    return new Date(Number(paymentAttributes.paid_at) * 1000).toISOString();
  }

  return fallback || new Date().toISOString();
}

function getUpdateForEvent(eventType, resource) {
  const attributes = resource?.attributes || {};
  const checkoutPayment = getPaymentFromCheckout(attributes);
  const paymentResource = resource?.type === "payment" ? resource : checkoutPayment;
  const paymentAttributes = paymentResource?.attributes || {};
  const metadata = attributes.metadata || paymentAttributes.metadata || {};

  const update = {
    provider_response: resource,
    updated_at: new Date().toISOString(),
  };

  if (resource?.type === "checkout_session") {
    update.paymongo_checkout_session_id = resource.id;
    update.checkout_url = attributes.checkout_url || null;
  }

  if (paymentResource?.id) {
    update.paymongo_payment_id = paymentResource.id;
  }

  if (paymentAttributes.payment_intent_id) {
    update.paymongo_payment_intent_id = paymentAttributes.payment_intent_id;
  }

  if (eventType === "checkout_session.payment.paid" || eventType === "payment.paid") {
    update.status = "paid";
    update.paid_at = getPaidAt(paymentAttributes);
  } else if (eventType === "payment.failed" || eventType === "checkout_session.payment.failed") {
    update.status = "failed";
    update.failure_reason =
      paymentAttributes.failed_message ||
      paymentAttributes.status ||
      "PayMongo reported a failed payment.";
  } else if (eventType === "checkout_session.expired") {
    update.status = "expired";
  } else if (eventType === "payment.refunded" || eventType === "payment.refund.updated") {
    update.status = "refunded";
  }

  return {
    metadata,
    update,
    checkoutSessionId: resource?.type === "checkout_session" ? resource.id : null,
    paymentId: paymentResource?.id || null,
  };
}

async function updatePayment(admin, eventType, resource) {
  const { metadata, update, checkoutSessionId, paymentId } = getUpdateForEvent(
    eventType,
    resource
  );

  if (!update.status) {
    return null;
  }

  let query = admin.from("payments").update(update);

  if (metadata.skillpool_payment_id) {
    query = query.eq("id", metadata.skillpool_payment_id);
  } else if (checkoutSessionId) {
    query = query.eq("paymongo_checkout_session_id", checkoutSessionId);
  } else if (paymentId) {
    query = query.eq("paymongo_payment_id", paymentId);
  } else {
    return null;
  }

  const { data, error } = await query.select("id, exchange_id, status").maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function POST(request) {
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("paymongo-signature") || "";
  const payload = JSON.parse(rawBody || "{}");
  const event = payload?.data;
  const attributes = event?.attributes || {};
  const eventType = attributes.type;
  const livemode = Boolean(attributes.livemode);

  const verified = verifyPayMongoWebhookSignature({
    rawBody,
    signatureHeader,
    livemode,
  });

  if (!verified) {
    return NextResponse.json({ error: "Invalid PayMongo signature." }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: eventRow, error: eventError } = await admin
    .from("payment_events")
    .insert({
      event_id: event.id,
      event_type: eventType,
      payload,
    })
    .select("id")
    .single();

  if (eventError) {
    if (eventError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }

    throw eventError;
  }

  try {
    const payment = await updatePayment(admin, eventType, attributes.data);

    await admin
      .from("payment_events")
      .update({
        payment_id: payment?.id || null,
        processed_at: new Date().toISOString(),
      })
      .eq("id", eventRow.id);

    if (payment?.status === "paid") {
      await admin.rpc("refresh_leaderboard_stats").catch(() => null);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    await admin
      .from("payment_events")
      .update({
        processing_error: error.message,
        processed_at: new Date().toISOString(),
      })
      .eq("id", eventRow.id);

    throw error;
  }
}
