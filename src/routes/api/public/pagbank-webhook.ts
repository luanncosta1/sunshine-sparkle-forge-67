
import { createFileRoute } from '@tanstack/react-router'
import { mapPagBankStatus } from '@/lib/pagbank.server'
import { supabase } from '@/integrations/supabase/client'

export const Route = createFileRoute('/api/public/pagbank-webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          console.log('PagBank Webhook received:', body);

          const referenceId = body.reference_id;
          const pagBankStatus = body.status;

          if (!referenceId || !pagBankStatus) {
            return new Response('Invalid payload', { status: 400 });
          }

          const internalStatus = mapPagBankStatus(pagBankStatus);

          const { error } = await supabase
            .from('orders')
            .update({ 
              status: internalStatus,
              updated_at: new Date().toISOString()
            })
            .eq('reference_id', referenceId);

          if (error) {
            console.error('Error updating order via webhook:', error);
            return new Response('Database error', { status: 500 });
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
