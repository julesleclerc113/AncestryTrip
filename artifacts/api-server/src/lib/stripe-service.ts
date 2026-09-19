import type Stripe from "stripe";
import { getUncachableStripeClient } from "../stripeClient";

const PRODUCTS = {
  "heritage-trip": {
    name: "Heritage Trip",
    description: "A personalized, printable ancestry travel report.",
    amount: 1900,
  },
  "deep-heritage-trip": {
    name: "Deep Heritage Trip",
    description: "An expanded ancestry travel report with deeper research planning.",
    amount: 4900,
  },
} as const;

export async function getOrCreatePrice(productKey: keyof typeof PRODUCTS): Promise<Stripe.Price> {
  const config = PRODUCTS[productKey];
  const stripe = await getUncachableStripeClient();
  const products = await stripe.products.search({
    query: `name:'${config.name}' AND active:'true'`,
  });
  const product = products.data[0] ?? await stripe.products.create({
    name: config.name,
    description: config.description,
    metadata: { ancestryTripProduct: productKey },
  });
  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 20 });
  const matching = prices.data.find(
    (price) => price.unit_amount === config.amount && price.currency === "usd" && price.type === "one_time",
  );
  return matching ?? stripe.prices.create({
    product: product.id,
    unit_amount: config.amount,
    currency: "usd",
    metadata: { ancestryTripProduct: productKey },
  });
}

export async function createCheckoutSession(args: {
  product: keyof typeof PRODUCTS;
  email: string;
  previewId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const stripe = await getUncachableStripeClient();
  const price = await getOrCreatePrice(args.product);
  return stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: price.id, quantity: 1 }],
    customer_email: args.email,
    success_url: args.successUrl,
    cancel_url: args.cancelUrl,
    metadata: { previewId: args.previewId, product: args.product },
  });
}

export async function retrieveCheckoutSession(sessionId: string) {
  const stripe = await getUncachableStripeClient();
  return stripe.checkout.sessions.retrieve(sessionId);
}