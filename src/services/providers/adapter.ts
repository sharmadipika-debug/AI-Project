import type { ProviderQuote, QuoteRequest } from '../../domain/models'

export interface ProviderQuoteAdapter {
  providerId: string
  isConfigured(): boolean
  getQuote(request: QuoteRequest): Promise<ProviderQuote | null>
}