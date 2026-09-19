import { getUncachableStripeClient } from "./stripeClient";

const products = [
  {
    key: "heritage-trip",
    name: "Heritage Trip",
    description: "A personalized, printable ancestry travel report.",
    amount: 1900,
  },
  {
    key: "deep-heritage-trip",
    name: "Deep Heritage Trip",
    description: "An expanded ancestry travel report with deeper research planning.",
    amount: 4900,
  },
] as const;

const stripe = await getUncachableStripeClient();

for (const config of products) {
  const matches = await stripe.products.search({
    query: `name:'${config.name}' AND active:'true'`,
  });
  const product = matches.data[0] ?? await stripe.products.create({
    name: config.name,
    description: config.description,
    metadata: { ancestryTripProduct: config.key },
  });
  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 20 });
  const price = prices.data.find(
    (candidate) =>
      candidate.unit_amount === config.amount &&
      candidate.currency === "usd" &&
      candidate.type === "one_time",
  ) ?? await stripe.prices.create({
    product: product.id,
    unit_amount: config.amount,
    currency: "usd",
    metadata: { ancestryTripProduct: config.key },
  });
  console.log(`${config.key}: ${product.id} / ${price.id}`);
}