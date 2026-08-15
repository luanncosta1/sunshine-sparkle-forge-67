
CREATE TABLE public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_type text NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    unit_price integer NOT NULL,
    total_price integer NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    pagbank_checkout_id text,
    reference_id text UNIQUE NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT status_check CHECK (status IN ('pending', 'paid', 'in_analysis', 'declined', 'canceled', 'expired'))
);

GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT SELECT ON public.orders TO anon;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to select an order by reference_id"
ON public.orders FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow service role full access"
ON public.orders FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
