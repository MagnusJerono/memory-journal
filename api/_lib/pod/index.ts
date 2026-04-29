// Print-on-demand provider adapter interface.
//
// v1 implementation: Lulu xPress (see ./lulu.ts).
// The interface is intentionally narrow so we can swap or add providers later
// (Gelato, Cloudprinter, etc.) without touching call sites in api/print/*.

export type BookBinding = 'softcover' | 'hardcover';
export type PaperType = 'standard' | 'premium';

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  state?: string;
  countryCode: string; // ISO 3166-1 alpha-2
  phone?: string;
  email: string;
}

export interface BookSpec {
  title: string;
  pageCount: number;
  binding: BookBinding;
  paper: PaperType;
  trimSizeInches: { width: number; height: number };
  /** Publicly accessible URL (or signed URL) to the interior PDF. */
  interiorPdfUrl: string;
  /** Publicly accessible URL (or signed URL) to the cover PDF. */
  coverPdfUrl: string;
}

export interface QuoteRequest {
  book: BookSpec;
  shippingAddress: ShippingAddress;
  /** Desired currency for the returned quote. ISO 4217. */
  currency: string;
}

export interface Quote {
  provider: 'lulu';
  /** Base cost of manufacturing the book, in minor units (cents). */
  productCostCents: number;
  /** Shipping cost to the given address, in minor units (cents). */
  shippingCostCents: number;
  /** Taxes and fees the provider collects, in minor units (cents). */
  taxCents: number;
  /** Sum of the above — what we pay the POD provider. */
  subtotalCents: number;
  currency: string;
  /** Opaque token the provider may require at submission time. */
  providerQuoteToken?: string;
  /** Short human-friendly list of SKU/options for display in checkout. */
  lineItems: Array<{ label: string; amountCents: number }>;
}

export interface SubmitJobRequest {
  /** Our internal order id (book_orders.id) — used for correlation. */
  externalId: string;
  book: BookSpec;
  shippingAddress: ShippingAddress;
  /** Only required when the provider pins pricing to a prior quote. */
  providerQuoteToken?: string;
}

export interface SubmitJobResult {
  providerJobId: string;
  initialStatus: POrderStatus;
}

export type POrderStatus =
  | 'submitted'
  | 'printing'
  | 'shipped'
  | 'delivered'
  | 'canceled'
  | 'failed';

export interface JobStatus {
  providerJobId: string;
  status: POrderStatus;
  trackingUrl?: string;
  trackingCarrier?: string;
  updatedAt: string; // ISO timestamp
}

export interface PODProvider {
  readonly name: 'lulu';
  quote(req: QuoteRequest): Promise<Quote>;
  submitJob(req: SubmitJobRequest): Promise<SubmitJobResult>;
  getJobStatus(providerJobId: string): Promise<JobStatus>;
}

import { createLuluProvider } from './lulu.js';

let cachedProvider: PODProvider | null = null;

/**
 * Returns the default configured POD provider. Currently always Lulu.
 * Reads environment variables lazily so missing credentials surface
 * on first use, not on module load.
 */
export function getDefaultPODProvider(): PODProvider {
  if (!cachedProvider) {
    cachedProvider = createLuluProvider();
  }
  return cachedProvider;
}
