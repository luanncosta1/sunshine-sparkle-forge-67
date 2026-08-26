CREATE TABLE public.ticket_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_type TEXT NOT NULL,
  lot_number INTEGER NOT NULL DEFAULT 1,
  total_quantity INTEGER NOT NULL,
  sold_quantity INTEGER NOT NULL DEFAULT 0,
  price INTEGER NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (ticket_type, lot_number)
);

GRANT SELECT ON public.ticket_lots TO anon;
GRANT SELECT ON public.ticket_lots TO authenticated;
GRANT ALL ON public.ticket_lots TO service_role;

ALTER TABLE public.ticket_lots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ticket lots availability"
ON public.ticket_lots
FOR SELECT
TO anon, authenticated
USING (true);

-- Seed: 1st lot for PISTA (R$ 30,00) and CASADINHA (R$ 50,00), 100 each
INSERT INTO public.ticket_lots (ticket_type, lot_number, total_quantity, sold_quantity, price, active) VALUES
  ('PISTA', 1, 100, 0, 3000, true),
  ('CASADINHA', 1, 100, 0, 5000, true);

-- Atomic stock sale: only increments when enough stock remains.
-- Prevents overselling even with simultaneous purchases.
CREATE OR REPLACE FUNCTION public.sell_lot_stock(_ticket_type TEXT, _quantity INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  rows_updated INTEGER;
BEGIN
  UPDATE public.ticket_lots
  SET sold_quantity = sold_quantity + _quantity,
      updated_at = now()
  WHERE id = (
    SELECT id FROM public.ticket_lots
    WHERE ticket_type = _ticket_type AND active = true
    ORDER BY lot_number ASC
    LIMIT 1
  )
  AND (total_quantity - sold_quantity) >= _quantity;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sell_lot_stock(TEXT, INTEGER) TO service_role;