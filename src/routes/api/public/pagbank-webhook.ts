
import { createFileRoute } from '@tanstack/react-router'
import { mapPagBankStatus } from '@/lib/pagbank.server'

export const Route = createFileRoute('/api/public/pagbank-webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
          const { generateTicketCode, generateQrCodeData } = await import('@/lib/tickets.server');
          const body = await request.json();

          console.log('PagBank Webhook received:', JSON.stringify(body));

          const referenceId = body?.reference_id;
          const pagBankStatus = body?.status;
          const pagBankTransactionId = body?.id;

          if (!referenceId || !pagBankStatus) {
            return new Response('Invalid payload', { status: 400 });
          }

          const internalStatus = mapPagBankStatus(pagBankStatus);

          // 1. Fetch current order status (Idempotency check)
          const { data: order, error: fetchError } = await supabaseAdmin
            .from('orders')
            .select('id, status, customer_name')
            .eq('reference_id', referenceId)
            .maybeSingle();

          if (fetchError || !order) {
            console.error('Order not found for webhook:', referenceId);
            return new Response('Order not found', { status: 404 });
          }

          // If already paid, don't process again
          if (order.status === 'paid') {
            console.log(`Order ${referenceId} already marked as paid. Skipping automation.`);
            return new Response('Already processed', { status: 200 });
          }

          // 2. Extract customer data if available
          const customer = body?.customer || {};
          const paymentMethod = body?.payment_method?.type || 'unknown';

          // 3. Update order status
          const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update({
              status: internalStatus,
              pagbank_transaction_id: pagBankTransactionId,
              customer_name: customer.name || order.customer_name,
              customer_email: customer.email,
              customer_phone: customer.phones?.[0] ? `${customer.phones[0].area}${customer.phones[0].number}` : null,
              payment_method: paymentMethod,
              updated_at: new Date().toISOString()
            })
            .eq('id', order.id);

          if (updateError) {
            console.error('Error updating order via webhook:', updateError);
            return new Response('Database error', { status: 500 });
          }

          // 4. If PAID, generate ticket
          if (internalStatus === 'paid') {
            const ticketCode = generateTicketCode(order.id);
            const qrCodeData = generateQrCodeData(ticketCode);

            const { error: ticketError } = await supabaseAdmin
              .from('tickets')
              .insert({
                order_id: order.id,
                ticket_code: ticketCode,
                qr_code_data: qrCodeData,
                status: 'valid'
              });

            if (ticketError) {
              console.error('Error generating ticket:', ticketError);
              // We don't fail the webhook here but log the error
            } else {
              console.log(`Ticket ${ticketCode} generated for order ${referenceId}`);
              
              // FUTURE: Trigger WhatsApp/Email notifications here
              // triggerNotifications(order, ticketCode, qrCodeData);
            }
          }

          return new Response('OK', { status: 200 });
        } catch (err) {
          console.error('Webhook processing error:', err);
          return new Response('Internal error', { status: 500 });
        }
      }
    }
  }
})

