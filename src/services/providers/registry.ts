import type { QuoteAvailability, QuoteRequest } from '../../domain/models'
import { remitlyAdapter } from './remitly'
import { wiseAdapter } from './wise'
import { xoomAdapter } from './xoom'
import type { ProviderQuoteAdapter } from './adapter'

const adapters: ProviderQuoteAdapter[] = [wiseAdapter, remitlyAdapter, xoomAdapter]

export async function fetchLiveQuotes(request: QuoteRequest): Promise<QuoteAvailability> {
  const configured = adapters.filter((adapter) => adapter.isConfigured())
  if (configured.length === 0) {
    return { status: 'unavailable', reason: 'No provider quote adapters are configured.' }
  }

  const quotes = (await Promise.all(configured.map((adapter) => adapter.getQuote(request))))
    .filter((quote) => quote !== null)

  return quotes.length
    ? { status: 'available', quotes }
    : { status: 'unavailable', reason: 'No configured provider returned a quote for this corridor.' }
}
