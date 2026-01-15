"use client";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import SubscribePage from "./subscribe/page";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function App() {
  return (
    <Elements stripe={stripePromise}>
      <SubscribePage />
    </Elements>
  );
}
