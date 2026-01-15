"use client";

import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";

export default function SubscribeForm({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubscribe = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      const { paymentMethod, error: pmError } =
        await stripe.createPaymentMethod({
          type: "card",
          card: elements.getElement(CardElement)!,
        });

      if (pmError || !paymentMethod) {
        throw new Error(pmError?.message || "Failed to create payment method");
      }

      const chargeRes = await fetch(
        "http://localhost:8000/api/subscription/trial-charge",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
          },
          body: JSON.stringify({
            paymentMethodId: paymentMethod.id,
            email,
          }),
        }
      );

      if (!chargeRes.ok) {
        const data = await chargeRes.json();
        throw new Error(data.message || "Trial charge failed");
      }

      const subRes = await fetch(
        "http://localhost:8000/api/subscription/subscribe",
        {
          method: "POST",
          headers: { "x-user-id": userId },
        }
      );

      if (!subRes.ok) {
        throw new Error("Failed to create subscription");
      }

      setSuccess(true);
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-4 border rounded-xl bg-green-50 text-green-700">
        ✅ Trial started successfully! Refreshing...
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-xl max-w-md">
      <h2 className="text-xl font-bold mb-4">Start 7-Day Trial</h2>
      <p className="text-sm text-gray-600 mb-4">
        Well charge $1 to verify your card (refundable if you cancel during
        trial)
      </p>

      <div className="p-3 border rounded mb-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": { color: "#aab7c4" },
              },
            },
          }}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleSubscribe}
        disabled={loading || !stripe}
        className="w-full bg-black text-white py-3 rounded font-medium hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Start Trial ($1 refundable)"}
      </button>
    </div>
  );
}
