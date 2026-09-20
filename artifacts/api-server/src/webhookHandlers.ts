import Stripe from "stripe";
import { logger } from "./lib/logger";

export class WebhookHandlers {
  static async processWebhook(
    payload: Buffer,
    signature: string,
  ): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error("Stripe webhook payload must be a raw Buffer.");
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is required.");
    }

    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is required.");
    }

    const stripe = new Stripe(secretKey);

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );

    logger.info({ eventType: event.type }, "Stripe webhook received");
  }
}