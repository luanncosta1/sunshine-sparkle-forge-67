CREATE POLICY "Enable read for tickets via order reference" ON public.tickets
  FOR SELECT TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = tickets.order_id
    )
  );
