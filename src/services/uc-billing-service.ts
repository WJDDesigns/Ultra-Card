/**
 * Ultra Card billing service.
 *
 * Reads WooCommerce subscription + invoice data from ultracard.io through the
 * existing authenticated fetch path (Connect proxy holds the JWT server-side).
 * Read-only: payment method changes and cancellations happen on ultracard.io
 * (PCI), so the UI deep-links to the exact My Account pages for those actions.
 */
import { ucCloudAuthService } from './uc-cloud-auth-service';

const API_BASE = 'https://ultracard.io/wp-json/ultra-card/v1';

export interface WooSubscription {
  status: string;
  next_payment_date?: string;
  last_payment_date?: string;
  start_date?: string;
  trial_end?: number;
  billing_period?: string;
  billing_interval?: string;
  total?: string;
  currency?: string;
  payment_method_title?: string;
  view_subscription_url?: string;
  subscription_id?: number;
}

export interface BillingInvoice {
  order_id: number;
  date: string;
  status: string;
  total: string;
  currency: string;
  payment_method?: string;
  invoice_url?: string;
  download_invoice_url?: string;
}

export interface BillingSummary {
  tier: string;
  status: string;
  woocommerce: WooSubscription | null;
  invoices: BillingInvoice[];
}

/** Currency symbol for the common cases; falls back to the code. */
export function formatMoney(total?: string, currency?: string): string {
  if (!total) return '—';
  const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£' };
  const sym = symbols[currency || ''] || `${currency || ''} `;
  return `${sym}${total}`;
}

export function formatBillingDate(raw?: string): string {
  if (!raw) return '—';
  const d = new Date(raw.includes('T') ? raw : raw.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Fetch subscription + invoices for the signed-in user.
 * Throws when not authenticated or when the proxy rejects the request
 * (e.g. non-admin HA users); callers should hide the billing UI on error.
 */
export async function fetchBillingSummary(): Promise<BillingSummary> {
  const [subRes, invRes] = await Promise.all([
    ucCloudAuthService.authenticatedFetch(`${API_BASE}/subscription`),
    ucCloudAuthService.authenticatedFetch(`${API_BASE}/subscription/invoices`),
  ]);

  if (!subRes.ok) {
    throw new Error(`Could not load subscription (HTTP ${subRes.status})`);
  }

  const sub = (await subRes.json()) as {
    tier?: string;
    status?: string;
    woocommerce?: WooSubscription | null;
  };

  let invoices: BillingInvoice[] = [];
  if (invRes.ok) {
    const data = (await invRes.json()) as { invoices?: BillingInvoice[] };
    invoices = Array.isArray(data?.invoices) ? data.invoices : [];
  }

  return {
    tier: sub?.tier || 'free',
    status: sub?.status || 'unknown',
    woocommerce: sub?.woocommerce ?? null,
    invoices,
  };
}
