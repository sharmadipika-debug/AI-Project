import type { ProviderQuoteAdapter } from './adapter'

export const xoomAdapter: ProviderQuoteAdapter = {
  providerId: 'xoom',
  isConfigured: () => false,
  async getQuote() {
    return null
  },
}