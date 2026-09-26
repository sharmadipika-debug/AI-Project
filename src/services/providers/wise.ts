import { calculateQuote } from '../quote-engine'
import type { ProviderQuoteAdapter } from './adapter'
import type { QuoteRequest } from '../../domain/models'

type WiseQuote = {
  rate?: number
  sourceAmount?: number
  targetAmount?: number
  fee?: number
  feePercentage?: number
  rateType?: string
  estimatedDelivery?: string
}

export const wiseAdapter: ProviderQuoteAdapter = {
  providerId: 'wise',
  isConfigured: () => Boolean(process.env.WISE_API_TOKEN),
  async getQuote(request: QuoteRequest) {
    const token = process.env.WISE_API_TOKEN
    if (!token) return null

    const response = await fetch('https://api.wise.com/2026Q3/quotes', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-External-Correlation-Id': crypto.randomUUID(),
      },
      body: JSON.stringify({
        sourceCurrency: request.sendCurrency,
        targetCurrency: request.receiveCurrency,
        sourceAmount: request.sendAmount,
        targetAmount: null,
      }),
      cache: 'no-store',
    })
    if (!response.ok) return null

    const quote = await response.json() as WiseQuote
    if (!quote.rate || quote.targetAmount === undefined) return null
    const fee = Number(quote.fee ?? 0)
    const totalDebit = Number(quote.sourceAmount ?? request.sendAmount)
    return calculateQuote(request, {
      providerId: 'wise',
      sendCurrency: request.sendCurrency,
      receiveCurrency: request.receiveCurrency,
      transferFee: fee,
      paymentMethodFee: 0,
      otherDisclosedCharges: 0,
      providerExchangeRate: Number(quote.rate),
      midMarketRate: null,
      estimatedDeliveryMinMinutes: null,
      estimatedDeliveryMaxMinutes: null,
      paymentMethods: ['bank_transfer', 'debit_card'],
      receivingMethods: ['bank_deposit'],
      advantages: ['Live Wise quote returned from the official API'],
      disadvantages: ['Delivery options and timing vary by corridor'],
      quoteTimestamp: new Date().toISOString(),
      source: 'live',
      affiliateUrl: null,
    })
  },
}
