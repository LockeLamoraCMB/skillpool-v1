import crypto from "node:crypto";

const DEFAULT_PAYMENT_METHODS = ["gcash", "paymaya", "card"];

function getPayMongoSecretKey() {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;

  if (!secretKey) {
    throw new Error("PAYMONGO_SECRET_KEY is not configured.");
  }

  return secretKey;
}

export function getPaymentMethods() {
  return (process.env.PAYMONGO_PAYMENT_METHOD_TYPES || DEFAULT_PAYMENT_METHODS.join(","))
    .split(",")
    .map((method) => method.trim())
    .filter(Boolean);
}

export function toCentavos(amount) {
  const numericAmount = Number(amount || 0);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) return 0;
  return Math.round(numericAmount * 100);
}

export function formatPhp(amount) {
  const numericAmount = Number(amount || 0);
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: Number.isInteger(numericAmount) ? 0 : 2,
  }).format(numericAmount);
}

export function getAppBaseUrl(request) {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_URL;

  if (configuredUrl) {
    return configuredUrl.startsWith("http")
      ? configuredUrl.replace(/\/$/, "")
      : `https://${configuredUrl.replace(/\/$/, "")}`;
  }

  return new URL(request.url).origin;
}

export async function createCheckoutSession({
  amount,
  currency = "PHP",
  description,
  lineItemName,
  successUrl,
  cancelUrl,
  metadata = {},
  billing = null,
}) {
  const amountInCentavos = toCentavos(amount);

  if (!amountInCentavos) {
    throw new Error("Checkout amount must be greater than zero.");
  }

  const auth = Buffer.from(`${getPayMongoSecretKey()}:`).toString("base64");
  const apiBaseUrl = process.env.PAYMONGO_API_BASE_URL || "https://api.paymongo.com/v1";

  const body = {
    data: {
      attributes: {
        billing,
        cancel_url: cancelUrl,
        description,
        line_items: [
          {
            amount: amountInCentavos,
            currency,
            description,
            name: lineItemName,
            quantity: 1,
          },
        ],
        metadata,
        payment_method_types: getPaymentMethods(),
        send_email_receipt: true,
        show_description: true,
        show_line_items: true,
        success_url: successUrl,
      },
    },
  };

  if (!billing) {
    delete body.data.attributes.billing;
  }

  const response = await fetch(`${apiBaseUrl}/checkout_sessions`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const detail =
      payload?.errors?.[0]?.detail ||
      payload?.errors?.[0]?.title ||
      "PayMongo checkout session could not be created.";
    throw new Error(detail);
  }

  return payload;
}

function parseSignatureHeader(header = "") {
  return header.split(",").reduce((parts, segment) => {
    const [key, value] = segment.split("=");
    if (key && value !== undefined) {
      parts[key.trim()] = value.trim();
    }
    return parts;
  }, {});
}

function constantTimeEqual(left = "", right = "") {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyPayMongoWebhookSignature({ rawBody, signatureHeader, livemode }) {
  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("PAYMONGO_WEBHOOK_SECRET is not configured.");
  }

  const parts = parseSignatureHeader(signatureHeader);
  const timestamp = parts.t;
  const receivedSignature = livemode ? parts.li : parts.te;

  if (!timestamp || !receivedSignature) {
    return false;
  }

  const toleranceSeconds = Number(process.env.PAYMONGO_WEBHOOK_TOLERANCE_SECONDS || 300);
  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));

  if (Number.isFinite(age) && age > toleranceSeconds) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  return constantTimeEqual(expectedSignature, receivedSignature);
}
