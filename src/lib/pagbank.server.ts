
// Ticket prices are sourced from the active lot in the `ticket_lots` table
// (source of truth). This map is only a last-resort fallback in cents.
export const TICKET_PRICES: Record<string, number> = {
  "PISTA": 3000,      // 30.00 in cents
  "CASADINHA": 5000   // 50.00 in cents
};

export interface PagBankCheckoutItem {
  reference_id: string;
  name: string;
  quantity: number;
  unit_amount: number;
}

export interface PagBankCheckoutRequest {
  reference_id: string;
  items: PagBankCheckoutItem[];
  notification_urls: string[];
  redirect_url: string;
}

export async function createPagBankCheckout(data: PagBankCheckoutRequest) {
  const token = process.env['PAGBANK_TOKEN'];
  const isSandbox = process.env['PAGBANK_ENV'] !== 'production';
  const baseUrl = isSandbox 
    ? 'https://sandbox.api.pagseguro.com' 
    : 'https://api.pagseguro.com';

  if (!token) {
    throw new Error('PAGBANK_TOKEN is not configured');
  }

  const response = await fetch(`${baseUrl}/checkouts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      reference_id: data.reference_id,
      items: data.items.map(item => ({
        reference_id: item.reference_id,
        name: item.name,
        quantity: item.quantity,
        unit_amount: item.unit_amount
      })),
      notification_urls: data.notification_urls,
      redirect_url: data.redirect_url
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('PagBank API Error:', errorData);
    throw new Error(`PagBank Checkout Error: ${response.statusText}`);
  }

  return response.json();
}

export function mapPagBankStatus(pagBankStatus: string): string {
  const mapping: Record<string, string> = {
    'PAID': 'paid',
    'IN_ANALYSIS': 'in_analysis',
    'WAITING': 'pending',
    'DECLINED': 'declined',
    'CANCELED': 'canceled',
    'EXPIRED': 'expired'
  };
  return mapping[pagBankStatus] || 'pending';
}
