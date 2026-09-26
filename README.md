# Morrow

Next.js App Router comparison platform for international money transfers. The UI supports country/currency/amount selection, a searchable country picker, fee and FX comparisons, card/table layouts, filters, route/provider pages, and local-only saved routes and alert thresholds.

## Development

```sh
npm install
npm run dev
```

Production commands:

```sh
npm run lint
npm test
npm run typecheck
npm run build
npm start
```

## Quote integrity

Popular routes from Canada, the United States, the United Kingdom, and Australia have explicitly labeled demo scenarios. Panda Remit and bank wire are included in the sample provider/method mix. These are test data, not provider quotes, live rates, or availability claims. Other corridors return an empty state. `POST /api/quotes` validates requests and returns `503` until a live provider adapter is configured. Do not relabel scenario data as live.

`src/services/quote-engine.ts` calculates:

- FX markup: `((mid-market rate - provider rate) / mid-market rate) * 100`
- Recipient amount: `send amount * provider rate`
- Total debit: `send amount + transfer fee + payment-method fee + other disclosed charges`
- Estimated true cost in receive currency: `total debit * mid-market rate - recipient amount`
- Effective rate: `recipient amount / total debit`
- Best overall: 50% recipient payout, 30% estimated true cost, 20% delivery speed

The mid-market comparison is a benchmark, not a charge collected by a provider. Live quotes require a timestamp and are marked stale after `NEXT_PUBLIC_QUOTE_MAX_AGE_MS` (5 minutes by default).

## Supabase

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code. Apply `supabase/migrations/202609250001_morrow_core.sql` to create catalogs, corridors, manual quote, saved transfer, alert, and analytics tables with row-level security. Catalog/quote management must run server-side; user data policies are scoped to `auth.uid()`.

Provider profiles and popular corridors are seeded as typed catalog structure, but their real-world capabilities are deliberately left unverified. SEO pages render provider/corridor facts as unavailable until verified records are supplied. Set `NEXT_PUBLIC_SITE_URL` to enable canonical URLs and populated sitemap output.

## Not connected yet

This workspace does not contain provider API credentials or verified pricing feeds. The Wise, Remitly, and Xoom adapter files are disabled placeholders. Also not implemented: authenticated admin editing, provider affiliate URLs/event tracking, email/push alert delivery, historical rate feeds, OAuth, and production quote caching/rate limiting. Those require secured service configuration and provider/data agreements; the UI does not invent their results.