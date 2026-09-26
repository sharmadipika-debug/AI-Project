import type { ProviderQuoteAdapter } from './adapter'

export const remitlyAdapter: ProviderQuoteAdapter = {
  providerId: 'remitly',
  isConfigured: () => false,
  async getQuote() {
    return null
  },
}