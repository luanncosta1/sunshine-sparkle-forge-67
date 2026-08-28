-- 1. Remove tautological public SELECT policy on tickets
DROP POLICY IF EXISTS "Enable read for tickets via order reference" ON public.tickets;

CREATE POLICY "Service role full access to tickets"
ON public.tickets
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2. Revoke Data API access for anon/authenticated on sensitive tables
REVOKE ALL ON public.tickets FROM anon, authenticated;
REVOKE ALL ON public.orders FROM anon, authenticated;
GRANT ALL ON public.tickets TO service_role;
GRANT ALL ON public.orders TO service_role;

-- 3. Storage policies for the private 'tickets' bucket: server-only access
DROP POLICY IF EXISTS "Service role can read ticket pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Service role can insert ticket pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Service role can update ticket pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete ticket pdfs" ON storage.objects;

CREATE POLICY "Service role can read ticket pdfs"
ON storage.objects FOR SELECT TO service_role
USING (bucket_id = 'tickets');

CREATE POLICY "Service role can insert ticket pdfs"
ON storage.objects FOR INSERT TO service_role
WITH CHECK (bucket_id = 'tickets');

CREATE POLICY "Service role can update ticket pdfs"
ON storage.objects FOR UPDATE TO service_role
USING (bucket_id = 'tickets')
WITH CHECK (bucket_id = 'tickets');

CREATE POLICY "Service role can delete ticket pdfs"
ON storage.objects FOR DELETE TO service_role
USING (bucket_id = 'tickets');