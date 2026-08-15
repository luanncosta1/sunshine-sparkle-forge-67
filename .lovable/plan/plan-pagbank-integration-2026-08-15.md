# Plan: PagBank Integration

Implement a secure ticket purchasing flow using PagBank Checkout and Lovable Cloud.

## Database Schema
Create `public.orders` table with RLS and proper grants.
- Fields: `id`, `ticket_type`, `quantity`, `unit_price`, `total_price`, `status` (enum), `pagbank_checkout_id`, `reference_id`.

## Backend Logic
- `src/lib/payments.functions.ts`: Server function `createCheckout` to validate price, create order, and call PagBank.
- `src/lib/pagbank.server.ts`: Helper for authenticated PagBank API requests using `PAGBANK_TOKEN`.
- `src/routes/api/public/pagbank-webhook.ts`: Public endpoint to handle PagBank status updates.

## Frontend Updates
- `src/routes/index.tsx`: Update buttons to call `createCheckout` and redirect to the returned URL.
- `src/routes/order-result.tsx`: New route to display order status after returning from PagBank.

## Technical Details
- **Security**: Prices validated server-side. `PAGBANK_TOKEN` kept in secrets.
- **Webhook**: Authenticity verified using PagBank signature/token. Idempotent status updates.
- **Environment**: Sandbox by default, switchable via environment variables.

## User Actions Required
- Configure `PAGBANK_TOKEN` in project secrets.
- Register the webhook URL in PagBank Sandbox/Production dashboard.
