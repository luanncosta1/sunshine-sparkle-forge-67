// Stripe integration (production-ready) using the official Stripe REST API.
// Runs only on the server; STRIPE_SECRET_KEY is never exposed to the client.

// Ticket prices are sourced from the active lot in the `ticket_lots` table
// (source of truth). This map is only a last-resort fallback in cents.
export const TICKET_PRICES: Record<string, number> = {
  PISTA: 3000, // 30.00 in cents
  CASADINHA: 5000, // 50.00 in cents
};

const STRIPE_API = "https://api.stripe.com/v1";

function requireSecretKey(): string {
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return key;
}

/** Flattens a nested object into Stripe's form-encoded parameter syntax. */
function toFormBody(obj: Record<string, unknown>, prefix = ""): string[] {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    const name = prefix ? `${prefix}[${key}]` : key;
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === "object" && item !== null) {
          parts.push(...toFormBody(item as Record<string, unknown>, `${name}[${index}]`));
        } else {
          parts.push(`${encodeURIComponent(`${name}[${index}]`)}=${encodeURIComponent(String(item))}`);
        }
      });
    } else if (typeof value === "object") {
      parts.push(...toFormBody(value as Record<string, unknown>, name));
    } else {
      parts.push(`${encodeURIComponent(name)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts;
}

async function stripeRequest(path: string, params?: Record<string, unknown>) {
  const key = requireSecretKey();
  const isPost = !!params;

  const response = await fetch(`${STRIPE_API}${path}`, {
    method: isPost ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${key}`,
      ...(isPost ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    ...(isPost ? { body: toFormBody(params!).join("&") } : {}),
  });

  // Read as text first so a non-JSON response (proxy/CDN error page) never
  // breaks with "is not valid JSON".
  const raw = await response.text();
  let parsed: any = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    console.error("Stripe non-JSON response:", response.status, raw.slice(0, 500));
    throw new Error(`Stripe error (HTTP ${response.status}). Tente novamente em instantes.`);
  }

  if (!response.ok) {
    console.error("Stripe API error:", response.status, parsed);
    throw new Error(parsed?.error?.message || `Stripe error (HTTP ${response.status})`);
  }

  return parsed;
}

export interface StripeCheckoutParams {
  referenceId: string;
  productName: string;
  unitAmount: number; // in cents
  quantity: number;
  successUrl: string;
  cancelUrl: string;
  whatsapp?: string;
}

export async function createStripeCheckoutSession(data: StripeCheckoutParams) {
  const session = await stripeRequest("/checkout/sessions", {
    mode: "payment",
    client_reference_id: data.referenceId,
    success_url: data.successUrl,
    cancel_url: data.cancelUrl,
    line_items: [
      {
        quantity: data.quantity,
        price_data: {
          currency: "brl",
          unit_amount: data.unitAmount,
          product_data: { name: data.productName },
        },
      },
    ],
    metadata: {
      reference_id: data.referenceId,
      ...(data.whatsapp ? { whatsapp: data.whatsapp } : {}),
    },
    payment_intent_data: {
      metadata: { reference_id: data.referenceId },
    },
  });

  if (!session?.url || !session?.id) {
    throw new Error("Stripe did not return a checkout URL");
  }

  return { id: session.id as string, url: session.url as string };
}

export async function retrieveStripeSession(sessionId: string) {
  return stripeRequest(`/checkout/sessions/${sessionId}`);
}

/** Maps Stripe Checkout Session / PaymentIntent state to our internal status. */
export function mapStripeStatus(
  paymentStatus: string | null | undefined,
  sessionStatus?: string | null,
): string {
  if (paymentStatus === "paid") return "paid";
  if (paymentStatus === "no_payment_required") return "paid";
  if (sessionStatus === "expired") return "expired";
  if (paymentStatus === "unpaid") return "pending";
  return "pending";
}

/** Verifies the Stripe-Signature header (HMAC SHA-256, Web Crypto). */
export async function verifyStripeSignature(
  payload: string,
  signatureHeader: string | null,
  secret: string,
  toleranceSeconds = 300,
): Promise<boolean> {
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const [k, ...rest] = p.trim().split("=");
      return [k, rest.join("=")];
    }),
  ) as Record<string, string>;

  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) return false;

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > toleranceSeconds) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${payload}`));
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}
