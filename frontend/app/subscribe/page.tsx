import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import SubscribeForm from "../components/SubscribeForm";
import SubscriptionStatus from "../components/SubscriptionStatus";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function SubscriptionPage() {
  const userId = "user_123";
  const email = "user@example.com";

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Subscription</h1>

      <SubscriptionStatus userId={userId} />

      <div className="mt-8">
        <Elements stripe={stripePromise}>
          <SubscribeForm userId={userId} email={email} />
        </Elements>
      </div>
    </div>
  );
}
