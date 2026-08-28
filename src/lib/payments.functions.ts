
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { TICKET_PRICES, createPagBankCheckout } from "./pagbank.server";

export const createCheckout = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    ticketType: z.string(),
    quantity: z.number().int().min(1).max(20),
    whatsapp: z.string().trim().min(10).max(20),
    whatsappConfirmed: z.literal(true)
  }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { ticketType, quantity, whatsapp } = data;


    // 1. Find the active lot for this ticket type (source of truth for price/stock)
    const { data: lot, error: lotError } = await supabaseAdmin
      .from('ticket_lots')
      .select('id, lot_number, total_quantity, sold_quantity, price, active')
      .eq('ticket_type', ticketType)
      .eq('active', true)
      .order('lot_number', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (lotError) {
      console.error('Lot lookup error:', lotError);
      throw new Error('Failed to check ticket availability');
    }

    // Fallback to static price when no lot is configured (keeps checkout working)
    const unitPrice = lot?.price ?? TICKET_PRICES[ticketType];
    if (!unitPrice) {
      throw new Error(`Invalid ticket type: ${ticketType}`);
    }

    // 2. Backend stock validation — stock is a SHARED pool across ticket types,
    // so the availability is the smallest availability among all active lots.
    const { data: activeLots } = await supabaseAdmin
      .from('ticket_lots')
      .select('total_quantity, sold_quantity')
      .eq('active', true);

    if (activeLots && activeLots.length > 0) {
      const available = Math.min(
        ...activeLots.map((l) => l.total_quantity - l.sold_quantity)
      );
      if (available <= 0) {
        throw new Error('Este lote está esgotado');
      }
      if (quantity > available) {
        throw new Error(`Apenas ${available} ingresso(s) disponível(is) neste lote`);
      }
    }


    const totalPrice = unitPrice * quantity;
    const referenceId = `ORD-${Date.now()}-${crypto.randomUUID()}`;
    const lotLabel = lot ? `${lot.lot_number}º Lote` : '1º Lote';
    const ticketLabel = ticketType === 'CASADINHA' ? 'Casadinha' : 'Pista';

    // 3. Create order in database (pending)
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        ticket_type: ticketType,
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        status: 'pending',
        reference_id: referenceId,
        customer_whatsapp: whatsapp,
        whatsapp_confirmed: true,
        whatsapp_confirmed_at: new Date().toISOString()
      })

      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw new Error('Failed to create order');
    }

    // 4. Call PagBank API
    const baseUrl = process.env['APP_URL'] || 'https://huggy-launchpad-65.lovable.app';
    const checkout = await createPagBankCheckout({
      reference_id: referenceId,
      items: [{
        reference_id: ticketType,
        name: `Ingresso ${ticketLabel} — ${lotLabel} - Clube do Raul`,
        quantity,
        unit_amount: unitPrice
      }],
      notification_urls: [`${baseUrl}/api/public/pagbank-webhook`],
      redirect_url: `${baseUrl}/order-result?referenceId=${referenceId}`
    });

    // 5. Update order with PagBank checkout ID
    const checkoutUrl = checkout.links.find((l: any) => l.rel === 'PAY')?.href;
    const checkoutId = checkout.id;

    await supabaseAdmin
      .from('orders')
      .update({ pagbank_checkout_id: checkoutId })
      .eq('id', order.id);

    return { checkoutUrl };
  });

// Public availability of ticket lots (safe columns only).
export const getTicketLots = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: lots, error } = await supabaseAdmin
      .from('ticket_lots')
      .select('ticket_type, lot_number, total_quantity, sold_quantity, price, active')
      .eq('active', true)
      .order('lot_number', { ascending: true });

    if (error) {
      console.error('Lots lookup error:', error);
      throw new Error('Failed to load ticket availability');
    }

    // Keep only the first active lot per ticket type
    const byType = new Map<string, {
      ticket_type: string;
      lot_number: number;
      total_quantity: number;
      sold_quantity: number;
      available_quantity: number;
      price: number;
    }>();

    for (const lot of lots ?? []) {
      if (!byType.has(lot.ticket_type)) {
        byType.set(lot.ticket_type, {
          ticket_type: lot.ticket_type,
          lot_number: lot.lot_number,
          total_quantity: lot.total_quantity,
          sold_quantity: lot.sold_quantity,
          available_quantity: lot.total_quantity - lot.sold_quantity,
          price: lot.price
        });
      }
    }

    return Array.from(byType.values());
  });

// Returns only non-sensitive fields for a single order, looked up by its
// unguessable reference id. Orders are no longer readable directly from the client.
export const getOrderByReference = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    referenceId: z.string().min(8).max(120)
  }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        reference_id, 
        ticket_type, 
        quantity, 
        total_price, 
        status,
        customer_name,
        tickets (
          ticket_code,
          qr_code_data
        )
      `)
      .eq('reference_id', data.referenceId)
      .maybeSingle();

    if (error) {
      console.error('Order lookup error:', error);
      throw new Error('Failed to load order');
    }
    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  });
