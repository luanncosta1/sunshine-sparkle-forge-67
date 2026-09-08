// Shared post-payment fulfillment: stock decrement, ticket generation and
// PDF rendering. Payment-gateway agnostic.

export interface FulfillmentCustomer {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  paymentMethod?: string | null;
  transactionId?: string | null;
  sessionId?: string | null;
}

export async function processOrderStatus(
  referenceId: string,
  internalStatus: string,
  customer: FulfillmentCustomer = {},
): Promise<{ ok: boolean; message: string; status: number }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { generateTicketCode, generateQrCodeData } = await import("@/lib/tickets.server");
  const { renderTicketPdf, formatTicketNumber } = await import("@/lib/ticket-pdf.server");

  // 1. Fetch current order (idempotency check)
  const { data: order, error: fetchError } = await supabaseAdmin
    .from("orders")
    .select("id, status, customer_name, customer_whatsapp, ticket_type, quantity")
    .eq("reference_id", referenceId)
    .maybeSingle();

  if (fetchError || !order) {
    console.error("Order not found for fulfillment:", referenceId);
    return { ok: false, message: "Order not found", status: 404 };
  }

  if (order.status === "paid") {
    return { ok: true, message: "Already processed", status: 200 };
  }

  // 2. Update order status / customer data
  const { error: updateError } = await supabaseAdmin
    .from("orders")
    .update({
      status: internalStatus,
      stripe_payment_intent_id: customer.transactionId ?? undefined,
      stripe_session_id: customer.sessionId ?? undefined,
      customer_name: customer.name || order.customer_name,
      customer_email: customer.email ?? undefined,
      customer_phone: customer.phone ?? undefined,
      payment_method: customer.paymentMethod || "stripe",
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (updateError) {
    console.error("Error updating order:", updateError);
    return { ok: false, message: "Database error", status: 500 };
  }

  if (internalStatus !== "paid") {
    return { ok: true, message: "OK", status: 200 };
  }

  // 3a. Atomically increment sold quantity (shared pool across lots)
  const { data: stockSold, error: stockError } = await supabaseAdmin.rpc("sell_lot_stock", {
    _ticket_type: order.ticket_type,
    _quantity: order.quantity,
  });

  if (stockError) {
    console.error("Error updating lot stock:", stockError);
  } else if (stockSold === false) {
    console.error(
      `CRITICAL: Payment confirmed for order ${referenceId} but lot ${order.ticket_type} is sold out. Manual review required.`,
    );
  }

  // 3b. Current lot number (printed on the ticket)
  const { data: lot } = await supabaseAdmin
    .from("ticket_lots")
    .select("lot_number")
    .eq("ticket_type", order.ticket_type)
    .eq("active", true)
    .order("lot_number", { ascending: true })
    .limit(1)
    .maybeSingle();
  const lotNumber = lot?.lot_number ?? 1;

  // 3c. Guard against duplicate generation (webhook retries)
  const { data: existing } = await supabaseAdmin
    .from("tickets")
    .select("id")
    .eq("order_id", order.id)
    .limit(1);

  if (existing && existing.length > 0) {
    return { ok: true, message: "Already processed", status: 200 };
  }

  // 3d. Reserve sequential numbers in the database
  const { data: numbers, error: seqError } = await supabaseAdmin.rpc("next_ticket_numbers", {
    _count: order.quantity,
  });

  if (seqError || !numbers) {
    console.error("Error reserving ticket numbers:", seqError);
    return { ok: false, message: "Numbering error", status: 500 };
  }

  const ticketNumbers = (numbers as unknown as number[]).map((n) => Number(n));
  const whatsapp = order.customer_whatsapp || customer.phone || null;

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
        .from("tickets")
        .upload(pdfPath, pdfBytes, { contentType: "application/pdf", upsert: true });

      if (uploadError) {
        console.error("Error uploading ticket PDF:", uploadError);
        pdfPath = null;
      }
    } catch (pdfErr) {
      console.error("Error rendering ticket PDF:", pdfErr);
      pdfPath = null;
    }

    const { error: ticketError } = await supabaseAdmin.from("tickets").insert({
      order_id: order.id,
      ticket_code: ticketCode,
      qr_code_data: qrCodeData,
      status: "valid",
      ticket_number: ticketNumber,
      ticket_type: order.ticket_type,
      lot_number: lotNumber,
      customer_whatsapp: whatsapp,
      pdf_path: pdfPath,
      whatsapp_sent: false,
    });

    if (ticketError) {
      console.error("Error generating ticket:", ticketError);
    } else {
      console.log(
        `Ticket ${formatTicketNumber(ticketNumber)} (${ticketCode}) generated for order ${referenceId}`,
      );
    }
  }

  return { ok: true, message: "OK", status: 200 };
}
