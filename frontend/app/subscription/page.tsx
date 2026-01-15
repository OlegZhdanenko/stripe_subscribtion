"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import SubscriptionStatus from "./SubscriptionStatus";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function SubscriptionPage() {
  const userId: string = "user_123";
  const email: string = "user@example.com";
  const priceId: string = "price_1SokfDK7nimlv5qdLO8776KR";

  return (
    <Elements stripe={stripePromise}>
      <SubscriptionStatus userId={userId} email={email} priceId={priceId} />
    </Elements>
  );
}
