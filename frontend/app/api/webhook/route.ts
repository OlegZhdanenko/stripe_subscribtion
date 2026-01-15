import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();

  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;

    if (sub.status === "active") {
      const piId = sub.metadata.trialPaymentIntentId;

      if (piId) {
        await stripe.refunds.create({
          payment_intent: piId,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
