---
name: Stripe integration setup
description: Replit Stripe connector fields and bundled migration behavior for this workspace.
---

The Replit Stripe connection exposes the secret credential as `settings.secret` (not only `settings.secret_key`). When the API server bundles `stripe-replit-sync`, its filesystem migrations can be lost; keep that package externalized so runtime migrations resolve from its installed package.

**Why:** The connector returned a healthy connection with `secret`, while the default template expected `secret_key`; bundling also made StripeSync start without creating its `stripe` tables.

**How to apply:** Preserve the credential aliases in the Stripe client and the external dependency entries in the API server build configuration when changing Stripe setup.