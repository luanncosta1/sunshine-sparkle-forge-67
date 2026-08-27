
import { createFileRoute } from '@tanstack/react-router'
import { mapPagBankStatus } from '@/lib/pagbank.server'

export const Route = createFileRoute('/api/public/pagbank-webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
          const { generateTicketCode, generateQrCodeData } = await import('@/lib/tickets.server');
          const { renderTicketPdf, formatTicketNumber } = await import('@/lib/ticket-pdf.server');
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
            .select('id, status, customer_name, customer_whatsapp, ticket_type, quantity')
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
          const phone = customer.phones?.[0]
            ? `${customer.phones[0].area}${customer.phones[0].number}`
            : null;

          // 3. Update order status
          const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update({
              status: internalStatus,
              pagbank_transaction_id: pagBankTransactionId,
              customer_name: customer.name || order.customer_name,
              customer_email: customer.email,
              customer_phone: phone,
              payment_method: paymentMethod,
              updated_at: new Date().toISOString()
            })
            .eq('id', order.id);

          if (updateError) {
            console.error('Error updating order via webhook:', updateError);
            return new Response('Database error', { status: 500 });
          }

          // 4. If PAID, register the sale in stock and generate the tickets
          if (internalStatus === 'paid') {
            // 4a. Atomically increment sold quantity for the active lot.
            const { data: stockSold, error: stockError } = await supabaseAdmin
              .rpc('sell_lot_stock', {
                _ticket_type: order.ticket_type,
                _quantity: order.quantity
              });

            if (stockError) {
              console.error('Error updating lot stock:', stockError);
            } else if (stockSold === false) {
              console.error(`CRITICAL: Payment confirmed for order ${referenceId} but lot ${order.ticket_type} is sold out. Manual review required.`);
            }

            // 4b. Current lot number (for printing on the ticket)
            const { data: lot } = await supabaseAdmin
              .from('ticket_lots')
              .select('lot_number')
              .eq('ticket_type', order.ticket_type)
              .eq('active', true)
              .order('lot_number', { ascending: true })
              .limit(1)
              .maybeSingle();
            const lotNumber = lot?.lot_number ?? 1;

            // 4c. Guard against duplicate generation (webhook retries)
            const { data: existing } = await supabaseAdmin
              .from('tickets')
              .select('id')
              .eq('order_id', order.id)
              .limit(1);

            if (existing && existing.length > 0) {
              console.log(`Tickets already generated for order ${referenceId}.`);
              return new Response('Already processed', { status: 200 });
            }

            // 4d. Reserve the sequential numbers in the database (never in the client)
            const { data: numbers, error: seqError } = await supabaseAdmin
              .rpc('next_ticket_numbers', { _count: order.quantity });

            if (seqError || !numbers) {
              console.error('Error reserving ticket numbers:', seqError);
              return new Response('Numbering error', { status: 500 });
            }

            const ticketNumbers = (numbers as unknown as number[]).map((n) => Number(n));
            const whatsapp = order.customer_whatsapp || phone;

            for (const ticketNumber of ticketNumbers) {
              const ticketCode = generateTicketCode(order.id);
              const qrCodeData = generateQrCodeData(ticketCode);
              let pdfPath: string | null = null;

              try {
                const pdfBytes = await renderTicketPdf({
                  ticketNumber,
                  ticketCode,
                  ticketType: order.ticket_type,
                  lotNumber,
                  referenceId,
                });

                pdfPath = `${referenceId}/ingresso-${formatTicketNumber(ticketNumber)}.pdf`;
                const { error: uploadError } = await supabaseAdmin.storage
                  .from('tickets')
                  .upload(pdfPath, pdfBytes, { contentType: 'application/pdf', upsert: true });

                if (uploadError) {
                  console.error('Error uploading ticket PDF:', uploadError);
                  pdfPath = null;
                }
              } catch (pdfErr) {
                console.error('Error rendering ticket PDF:', pdfErr);
                pdfPath = null;
              }

              const { error: ticketError } = await supabaseAdmin
                .from('tickets')
                .insert({
                  order_id: order.id,
                  ticket_code: ticketCode,
                  qr_code_data: qrCodeData,
                  status: 'valid',
                  ticket_number: ticketNumber,
                  ticket_type: order.ticket_type,
                  lot_number: lotNumber,
                  customer_whatsapp: whatsapp,
                  pdf_path: pdfPath,
                  whatsapp_sent: false
                });

              if (ticketError) {
                console.error('Error generating ticket:', ticketError);
              } else {
                console.log(`Ticket ${formatTicketNumber(ticketNumber)} (${ticketCode}) generated for order ${referenceId}`);
                // FUTURE: send the PDF through the WhatsApp provider and set whatsapp_sent = true
              }
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
