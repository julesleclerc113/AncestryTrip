import Stripe from "stripe";

function getStripeSecretKey(): string {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is required.");
  }

  return secretKey;
}

export function getUncachableStripeClient(): Stripe {
  return new Stripe(getStripeSecretKey());
}