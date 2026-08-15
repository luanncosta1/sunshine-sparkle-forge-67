
import { randomBytes, createHash } from 'crypto';

/**
 * Generates a unique, secure ticket code.
 */
export function generateTicketCode(orderId: string): string {
  const randomPart = randomBytes(4).toString('hex').toUpperCase();
  const timestampPart = Date.now().toString(36).toUpperCase();
  const hash = createHash('sha256')
    .update(`${orderId}-${randomPart}-${timestampPart}`)
    .digest('hex')
    .substring(0, 6)
    .toUpperCase();
    
  return `TKT-${hash}-${randomPart}`;
}

/**
 * Generates QR code data string.
 * This will be used to generate the QR code image on the frontend or via an API.
 */
export function generateQrCodeData(ticketCode: string): string {
  // In a real scenario, this might be a signed URL or a JSON payload
  const baseUrl = process.env['APP_URL'] || 'https://huggy-launchpad-65.lovable.app';
  return `${baseUrl}/verify-ticket?code=${ticketCode}`;
}
