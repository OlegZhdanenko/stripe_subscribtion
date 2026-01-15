"use client";

import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import axios from "axios";

export default function TrialPaymentForm({ userId, email, priceId }: any) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleTrial = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:8000/api/stripe/create-trial",
        {
          userId,
          email,
          priceId,
        }
      );

      const result = await stripe!.confirmCardPayment(
        data.paymentIntentClientSecret,
        {
          payment_method: {
            card: elements!.getElement(CardElement)!,
          },
        }
      );

      if (result.error) {
        alert(result.error.message);
      } else {
        alert(
          "Trial subscription created successfully. $1 reserved on your card."
        );
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Start Your Trial
        </h2>
        <div className="mb-4">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "18px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                  padding: "12px 0",
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
        <button
          onClick={handleTrial}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Processing..." : "Start Trial"}
        </button>
      </div>
    </div>
  );
}
