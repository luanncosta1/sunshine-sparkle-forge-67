
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { TICKET_PRICES, createPagBankCheckout } from "./pagbank.server";
import { supabase } from "@/integrations/supabase/client";

export const createCheckout = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    ticketType: z.string(),
    quantity: z.number().min(1)
  }).parse(data))
  .handler(async ({ data }) => {
    const { ticketType, quantity } = data;
    
    // 1. Validate price in backend
    const unitPrice = TICKET_PRICES[ticketType];
    if (!unitPrice) {
      throw new Error(`Invalid ticket type: ${ticketType}`);
    }
    
    const totalPrice = unitPrice * quantity;
    const referenceId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 2. Create order in database (pending)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        ticket_type: ticketType,
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        status: 'pending',
        reference_id: referenceId
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw new Error('Failed to create order');
    }

    // 3. Call PagBank API
    const baseUrl = process.env['APP_URL'] || 'https://huggy-launchpad-65.lovable.app';
    const checkout = await createPagBankCheckout({
      reference_id: referenceId,
      items: [{
        reference_id: ticketType,
        name: `Ingresso ${ticketType} - Clube do Raul`,
        quantity,
        unit_amount: unitPrice
      }],
      notification_urls: [`${baseUrl}/api/public/pagbank-webhook`],
      redirect_url: `${baseUrl}/order-result?referenceId=${referenceId}`
    });

    // 4. Update order with PagBank checkout ID
    const checkoutUrl = checkout.links.find((l: any) => l.rel === 'PAY')?.href;
    const checkoutId = checkout.id;

    await supabase
      .from('orders')
      .update({ pagbank_checkout_id: checkoutId })
      .eq('id', order.id);

    return { checkoutUrl };
  });
