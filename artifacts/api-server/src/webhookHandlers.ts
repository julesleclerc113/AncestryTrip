import Stripe from "stripe";

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error("Stripe webhook payload must be a raw Buffer.");
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const event = stripe.webhooks.constructEvent(
      payload.toString(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        // Handle payment_intent.succeeded event
        break;
      case "payment_intent.payment_failed":
        // Handle payment_intent.payment_failed event
        break;
      // Add other event handlers as needed
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }
}
