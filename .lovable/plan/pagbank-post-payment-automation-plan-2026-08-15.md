# PagBank Post-Payment Automation Plan

Prepare the structure for secure ticket generation and event management after PagBank confirmation.

## Database Schema Changes

### 1. Update `orders` table
Add fields to store buyer data and PagBank transaction details.
```sql
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS pagbank_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS event_id TEXT DEFAULT 'esquenta-2026',
ADD COLUMN IF NOT EXISTS payment_method TEXT;
```

### 2. Create `tickets` table
Store the generated tickets linked to orders.
```sql
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  ticket_code TEXT UNIQUE NOT NULL,
  qr_code_data TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'valid', -- valid, used, canceled
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.tickets TO authenticated;
GRANT ALL ON public.tickets TO service_role;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
-- Tickets are only accessible by admin for now, or via specific order reference
```

## Backend Implementation

### 1. Update `src/lib/payments.functions.ts`
- Modify `createCheckout` to accept customer data (name, email, phone) if provided by the frontend in the future, but for now, ensure the `orders` table is ready to receive them from the webhook.
- Update `getOrderByReference` to return ticket information if the order is paid.

### 2. Update `src/routes/api/public/pagbank-webhook.ts`
- Implement **Idempotency**: Check if the order status is already 'paid' before processing.
- **Data Collection**: Capture `customer` info from the PagBank payload (name, email, phone) and save to the `orders` table.
- **Ticket Generation**: When status is `PAID`:
    1. Generate a secure unique `ticket_code`.
    2. Save to `tickets` table.
    3. (Placeholder) Logic for WhatsApp/Email notification.

### 3. Secure Helper for Ticket Generation
Create `src/lib/tickets.server.ts` to handle unique code generation using crypto.

## Technical Details
- **Idempotency**: Webhook will use `orders.status` and `tickets` existence check.
- **Security**: Database writes only via `supabaseAdmin` in server contexts.
- **Environment**: Using existing `PAGBANK_TOKEN` and `APP_URL` secrets.
