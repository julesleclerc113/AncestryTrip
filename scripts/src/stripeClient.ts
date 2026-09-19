import Stripe from "stripe";

async function getStripeCredentials(): Promise<string> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? `repl ${process.env.REPL_IDENTITY}`
    : process.env.WEB_REPL_RENEWAL
      ? `depl ${process.env.WEB_REPL_RENEWAL}`
      : null;
  if (!hostname || !xReplitToken) throw new Error("Stripe integration environment is not available.");

  const response = await fetch(
    `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=stripe`,
    { headers: { Accept: "application/json", X_REPLIT_TOKEN: xReplitToken } },
  );
  if (!response.ok) throw new Error(`Unable to read Stripe connection: ${response.status}`);
  const data = (await response.json()) as {
    items?: Array<{ settings?: { secret?: string; secret_key?: string } }>;
  };
  const settings = data.items?.[0]?.settings;
  const secretKey = settings?.secret_key ?? settings?.secret;
  if (!secretKey) throw new Error("Stripe is not connected with a secret key.");
  return secretKey;
}

export async function getUncachableStripeClient(): Promise<Stripe> {
  return new Stripe(await getStripeCredentials());
}