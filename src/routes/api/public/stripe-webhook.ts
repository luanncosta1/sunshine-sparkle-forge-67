import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { verifyStripeSignature, mapStripeStatus } = await import("@/lib/stripe.server");
          const { processOrderStatus } = await import("@/lib/fulfillment.server");

          const payload = await request.text();
          const secret = process.env["STRIPE_WEBHOOK_SECRET"];

          if (!secret) {
            console.error("STRIPE_WEBHOOK_SECRET is not configured");
            return new Response("Webhook not configured", { status: 500 });
          }

          const valid = await verifyStripeSignature(
            payload,
            request.headers.get("stripe-signature"),
            secret,
          );
          if (!valid) {
            return new Response("Invalid signature", { status: 401 });
          }

          const event = JSON.parse(payload);
          const type: string = event?.type ?? "";

          if (
            type !== "checkout.session.completed" &&
            type !== "checkout.session.async_payment_succeeded" &&
            type !== "checkout.session.async_payment_failed" &&
            type !== "checkout.session.expired"
          ) {
            return new Response("Ignored", { status: 200 });
          }

          const session = event.data?.object ?? {};
          const referenceId: string | undefined =
            session.client_reference_id || session.metadata?.reference_id;

          if (!referenceId) {
            console.error("Stripe webhook without reference id:", type);
            return new Response("Missing reference", { status: 400 });
          }

          const internalStatus =
            type === "checkout.session.expired"
              ? "expired"
              : type === "checkout.session.async_payment_failed"
                ? "declined"
                : mapStripeStatus(session.payment_status, session.status);

          const result = await processOrderStatus(referenceId, internalStatus, {
            name: session.customer_details?.name ?? null,
            email: session.customer_details?.email ?? null,
            phone: session.customer_details?.phone ?? null,
            paymentMethod: "stripe",
            transactionId:
              typeof session.payment_intent === "string" ? session.payment_intent : null,
            sessionId: session.id ?? null,
          });

          return new Response(result.message, { status: result.status });
        } catch (err) {
          console.error("Stripe webhook processing error:", err);
          return new Response("Internal error", { status: 500 });
        }
      },
    },
  },
});
