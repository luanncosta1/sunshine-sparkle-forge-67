ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_whatsapp TEXT;

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS ticket_number INTEGER,
  ADD COLUMN IF NOT EXISTS ticket_type TEXT,
  ADD COLUMN IF NOT EXISTS lot_number INTEGER,
  ADD COLUMN IF NOT EXISTS customer_whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS pdf_path TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_sent BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_sent_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS tickets_ticket_number_key ON public.tickets (ticket_number);

CREATE SEQUENCE IF NOT EXISTS public.ticket_number_seq AS INTEGER START WITH 1 OWNED BY NONE;

CREATE OR REPLACE FUNCTION public.next_ticket_numbers(_count integer)
RETURNS SETOF integer
LANGUAGE sql
SET search_path TO 'public'
AS $$
  SELECT nextval('public.ticket_number_seq')::integer FROM generate_series(1, _count);
$$;

REVOKE ALL ON FUNCTION public.next_ticket_numbers(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.next_ticket_numbers(integer) TO service_role;