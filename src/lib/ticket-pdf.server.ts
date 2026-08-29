import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
const ticketTemplate = { url: '/images/ticket_template.jpg' };

const TEMPLATE_WIDTH = 1600;
const TEMPLATE_HEIGHT = 900;
const FOOTER_HEIGHT = 104;

let cachedTemplate: Uint8Array | null = null;

function appUrl() {
  return process.env['APP_URL'] || 'https://huggy-launchpad-65.lovable.app';
}

/** Downloads (and caches) the official ticket artwork used as the PDF template. */
async function getTemplateBytes(): Promise<Uint8Array> {
  if (cachedTemplate) return cachedTemplate;
  const url = ticketTemplate.url.startsWith('http')
    ? ticketTemplate.url
    : `${appUrl()}${ticketTemplate.url}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ticket template: ${res.status}`);
  cachedTemplate = new Uint8Array(await res.arrayBuffer());
  return cachedTemplate;
}

export function formatTicketNumber(n: number): string {
  return String(n).padStart(4, '0');
}

export interface TicketPdfData {
  ticketNumber: number;
  ticketCode: string;
  ticketType: string;
  lotNumber: number;
  referenceId: string;
  purchasedAt?: Date;
}

/**
 * Builds the final ticket PDF.
 * The provided artwork is embedded untouched (same colors, logo, art, proportions).
 * Dynamic data is printed on a brand-styled band added below the artwork, so the
 * original design is never covered or modified.
 */
export async function renderTicketPdf(data: TicketPdfData): Promise<Uint8Array> {
  const templateBytes = await getTemplateBytes();
  const pdf = await PDFDocument.create();
  const image = await pdf.embedJpg(templateBytes);

  const page = pdf.addPage([TEMPLATE_WIDTH, TEMPLATE_HEIGHT + FOOTER_HEIGHT]);
  page.drawImage(image, {
    x: 0,
    y: FOOTER_HEIGHT,
    width: TEMPLATE_WIDTH,
    height: TEMPLATE_HEIGHT,
  });

  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const orange = rgb(0.94, 0.36, 0.11);
  const white = rgb(1, 1, 1);

  // Brand band with the dynamic purchase data
  page.drawRectangle({ x: 0, y: 0, width: TEMPLATE_WIDTH, height: FOOTER_HEIGHT, color: rgb(0.05, 0.04, 0.04) });
  page.drawRectangle({ x: 0, y: FOOTER_HEIGHT - 5, width: TEMPLATE_WIDTH, height: 5, color: orange });

  const number = formatTicketNumber(data.ticketNumber);
  page.drawText('NÚMERO DO INGRESSO', { x: 48, y: FOOTER_HEIGHT - 44, size: 16, font: regular, color: white, opacity: 0.75 });
  page.drawText(number, { x: 48, y: FOOTER_HEIGHT - 84, size: 34, font: bold, color: orange });

  const date = (data.purchasedAt ?? new Date()).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const info: Array<[string, string]> = [
    ['TIPO', data.ticketType],
    ['LOTE', `${data.lotNumber}º LOTE`],
    ['COMPRA', data.referenceId.slice(0, 22)],
    ['EMISSÃO', date],
  ];

  let x = 320;
  for (const [label, value] of info) {
    page.drawText(label, { x, y: FOOTER_HEIGHT - 44, size: 14, font: regular, color: white, opacity: 0.6 });
    page.drawText(value, { x, y: FOOTER_HEIGHT - 76, size: 20, font: bold, color: white });
    x += 300;
  }

  page.drawText(data.ticketCode, {
    x: TEMPLATE_WIDTH - 48 - bold.widthOfTextAtSize(data.ticketCode, 16),
    y: FOOTER_HEIGHT - 76,
    size: 16,
    font: bold,
    color: white,
    opacity: 0.8,
  });
  page.drawText('VALIDAÇÃO NA ENTRADA', {
    x: TEMPLATE_WIDTH - 48 - regular.widthOfTextAtSize('VALIDAÇÃO NA ENTRADA', 13),
    y: FOOTER_HEIGHT - 44,
    size: 13,
    font: regular,
    color: white,
    opacity: 0.5,
  });

  return pdf.save();
}
