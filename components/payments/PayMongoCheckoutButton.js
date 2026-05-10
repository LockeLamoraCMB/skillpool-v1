"use client";

import { useState } from "react";

export default function PayMongoCheckoutButton({ exchangeId, className = "" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout() {
    setLoading(true);
    setError("");

    const response = await fetch("/api/payments/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ exchangeId }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.checkoutUrl) {
      setLoading(false);
      setError(result.error || "Payment checkout could not be started.");
      return;
    }

    window.location.assign(result.checkoutUrl);
  }

  return (
    <div>
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className={
          className ||
          "rounded-2xl bg-[#12212B] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        }
      >
        {loading ? "Opening PayMongo..." : "Pay securely with PayMongo"}
      </button>

      {error ? (
        <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
