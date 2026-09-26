import type { ProviderQuote } from '../domain/models'

const defaultMaxAgeMs = 5 * 60 * 1000

export function getQuoteFreshness(quote: ProviderQuote, now = Date.now()) {
  if (quote.source === 'demo') return { stale: true, label: 'Demo scenario; no quote timestamp' }
  if (!quote.quoteTimestamp) return { stale: true, label: 'Rate timestamp unavailable' }

  const timestamp = Date.parse(quote.quoteTimestamp)
  if (!Number.isFinite(timestamp)) return { stale: true, label: 'Rate timestamp invalid' }

  const age = now - timestamp
  const maxAge = Number(process.env.NEXT_PUBLIC_QUOTE_MAX_AGE_MS) || defaultMaxAgeMs
  if (age > maxAge || age < 0) return { stale: true, label: 'Rate may have changed; confirm with provider' }

  const minutes = Math.floor(age / 60000)
  return { stale: false, label: minutes < 1 ? 'Updated just now' : `Updated ${minutes} min ago` }
}