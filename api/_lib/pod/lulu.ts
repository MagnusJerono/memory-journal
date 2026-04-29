// Lulu xPress adapter (stub).
//
// Implements the PODProvider interface defined in ./index.ts. This file
// currently holds a typed skeleton — the real HTTP integration with the
// Lulu xPress API lives in a later phase of the premium + print plan.
//
// Docs: https://developers.lulu.com/
//
// Environment variables (see .env.example):
//   LULU_ENV             'sandbox' | 'production'
//   LULU_CLIENT_KEY      OAuth2 client key
//   LULU_CLIENT_SECRET   OAuth2 client secret
//   LULU_MARGIN_BPS      Optional margin on top of POD cost (basis points)

import type {
  PODProvider,
  Quote,
  QuoteRequest,
  SubmitJobRequest,
  SubmitJobResult,
  JobStatus,
} from './index.js';

type LuluEnv = 'sandbox' | 'production';

interface LuluConfig {
  env: LuluEnv;
  clientKey: string;
  clientSecret: string;
  marginBps: number;
}

function readConfig(): LuluConfig {
  const env = (process.env.LULU_ENV as LuluEnv | undefined) ?? 'sandbox';
  const clientKey = process.env.LULU_CLIENT_KEY ?? '';
  const clientSecret = process.env.LULU_CLIENT_SECRET ?? '';
  const marginBps = Number(process.env.LULU_MARGIN_BPS ?? '0') || 0;
  if (!clientKey || !clientSecret) {
    throw new Error(
      'Lulu credentials are not configured (LULU_CLIENT_KEY / LULU_CLIENT_SECRET).',
    );
  }
  return { env, clientKey, clientSecret, marginBps };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function baseUrl(env: LuluEnv): string {
  return env === 'production'
    ? 'https://api.lulu.com'
    : 'https://api.sandbox.lulu.com';
}

export function createLuluProvider(): PODProvider {
  return {
    name: 'lulu',

    async quote(req: QuoteRequest): Promise<Quote> {
      // TODO(premium-print, track-b): POST /print-job-cost-calculations/
      // and map the response into the Quote shape.
      readConfig();
      void req;
      throw new Error('LuluProvider.quote is not implemented yet');
    },

    async submitJob(req: SubmitJobRequest): Promise<SubmitJobResult> {
      // TODO(premium-print, track-b): POST /print-jobs/ with interior +
      // cover PDF URLs, shipping address, and external_id set to our order id.
      readConfig();
      void req;
      throw new Error('LuluProvider.submitJob is not implemented yet');
    },

    async getJobStatus(providerJobId: string): Promise<JobStatus> {
      // TODO(premium-print, track-b): GET /print-jobs/{id}/status/ and
      // translate Lulu status codes into our POrderStatus union.
      readConfig();
      void providerJobId;
      throw new Error('LuluProvider.getJobStatus is not implemented yet');
    },
  };
}
