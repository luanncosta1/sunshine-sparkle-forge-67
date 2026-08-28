UPDATE public.ticket_lots
SET sold_quantity = (SELECT MAX(sold_quantity) FROM public.ticket_lots WHERE active = true),
    updated_at = now()
WHERE active = true;

CREATE OR REPLACE FUNCTION public.sell_lot_stock(_ticket_type text, _quantity integer)
RETURNS boolean
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  rows_updated INTEGER;
BEGIN
  -- Shared stock pool: selling any ticket type decrements every active lot.
  IF EXISTS (
    SELECT 1 FROM public.ticket_lots
    WHERE active = true AND (total_quantity - sold_quantity) < _quantity
  ) THEN
    RETURN false;
  END IF;

  UPDATE public.ticket_lots
  SET sold_quantity = sold_quantity + _quantity,
      updated_at = now()
  WHERE active = true;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated > 0;
END;
$function$;