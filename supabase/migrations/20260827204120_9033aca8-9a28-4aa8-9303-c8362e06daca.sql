ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS whatsapp_confirmed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_confirmed_at timestamp with time zone;