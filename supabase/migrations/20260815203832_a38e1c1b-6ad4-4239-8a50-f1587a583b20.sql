DROP POLICY IF EXISTS "Allow anyone to select an order by reference_id" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated users to insert orders" ON public.orders;
REVOKE ALL ON public.orders FROM anon;
REVOKE ALL ON public.orders FROM authenticated;
GRANT ALL ON public.orders TO service_role;