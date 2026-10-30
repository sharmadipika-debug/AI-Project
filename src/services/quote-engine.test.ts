import { describe, expect, it } from 'vitest'
import { parseGoogleFinanceRate, parseGoogleFinanceTimestamp } from '../../app/api/fx-rate/route'
import { getDemoQuotes } from '../data/demo-quotes'
import { getBestOverall, sortQuotes, totalCostInSendCurrency } from './quote-engine'

const request = {
  fromCountryId: 'CA',
  toCountryId: 'NP',
  sendAmount: 1000,
  sendCurrency: 'CAD',
  receiveCurrency: 'NPR',
}

describe('remittance quote comparison', () => {
  it('reads the Google Finance headline instead of related-asset prices', () => {
    const html = '<div class="N6SYTe"><span jsname="Pdsbrc"><span>108.8608</span></span></div><td><span jsname="Pdsbrc"><span>1,114.28</span></span></td><div class="jZZ2de">Oct 30, 5:17:00\u202fPM UTC</div>'

    expect(parseGoogleFinanceRate(html)).toBeCloseTo(108.8608)
    expect(parseGoogleFinanceTimestamp(html, new Date('2026-10-30T17:20:00Z'))).toBe('2026-10-30T17:17:00.000Z')
  })

  it('includes transfer fees and exchange-rate loss in true cost', () => {
    const [wise] = getDemoQuotes(request)

    expect(wise.transferFee).toBe(8.72)
    expect(wise.totalDebit).toBeCloseTo(1008.72)
    expect(wise.recipientAmount).toBe(104820)
    expect(wise.fxMarkupPercent).toBeCloseTo(0.17142857)
    expect(wise.trueCostInReceiveCurrency).toBeCloseTo(1095.6)
    expect(wise.effectiveExchangeRate).toBeCloseTo(104820 / 1008.72)
  })

  it('scales labeled demo rates from the latest market reference', () => {
    const [wise, remitly] = getDemoQuotes(request, 110)

    expect(wise.midMarketRate).toBe(110)
    expect(wise.providerExchangeRate).toBeCloseTo(110 * (104.82 / 105))
    expect(remitly.providerExchangeRate).toBeCloseTo(110 * (103.5 / 105))
    expect(wise.source).toBe('demo')
    expect(wise.quoteTimestamp).toBeNull()
  })

  it('does not equate the lowest fee with the lowest true cost', () => {
    const quotes = getDemoQuotes(request)

    expect(sortQuotes(quotes, 'lowest_fee')[0].providerId).toBe('worldremit')
    expect(sortQuotes(quotes, 'lowest_cost')[0].providerId).toBe('wise')
  })

  it('provides a visible rationale for the weighted overall recommendation', () => {
    const recommendation = getBestOverall(getDemoQuotes(request))

    expect(recommendation?.providerId).toBe('wise')
    expect(recommendation?.rationale).toContain('50% payout, 30% true-cost, 20% speed')
  })

  it('provides labeled demo options for the advertised popular corridors', () => {
    const routes = [
      { fromCountryId: 'CA', toCountryId: 'PH', sendCurrency: 'CAD', receiveCurrency: 'PHP' },
      { fromCountryId: 'US', toCountryId: 'IN', sendCurrency: 'USD', receiveCurrency: 'INR' },
      { fromCountryId: 'GB', toCountryId: 'PK', sendCurrency: 'GBP', receiveCurrency: 'PKR' },
      { fromCountryId: 'AU', toCountryId: 'BD', sendCurrency: 'AUD', receiveCurrency: 'BDT' },
    ]

    for (const route of routes) {
      const quotes = getDemoQuotes({ ...request, ...route })
      expect(quotes).toHaveLength(4)
      expect(quotes.every((quote) => quote.source === 'demo' && quote.quoteTimestamp === null)).toBe(true)
      expect(quotes.every((quote) => quote.advantages.length > 0 && quote.disadvantages.length > 0)).toBe(true)
    }
  })

  it('returns no demo results for corridors without a configured scenario', () => {
    expect(getDemoQuotes({
      ...request,
      fromCountryId: 'DE',
      toCountryId: 'CA',
      sendCurrency: 'EUR',
      receiveCurrency: 'CAD',
    })).toEqual([])
  })

  it('includes Panda Remit as a bank-wire option in demo scenarios', () => {
    const quotes = getDemoQuotes(request)
    const panda = quotes.find((quote) => quote.providerId === 'panda-remit')

    expect(panda).toBeDefined()
    expect(panda?.paymentMethods).toContain('bank_wire')
    expect(getDemoQuotes({ ...request, paymentMethod: 'bank_wire' }).map((quote) => quote.providerId)).toEqual(['panda-remit'])
  })

  it('reports disclosed fee totals separately from the FX-based true cost', () => {
    const [wise] = getDemoQuotes(request)
    expect(totalCostInSendCurrency(wise)).toBe(8.72)
    expect(wise.trueCostInReceiveCurrency).toBeGreaterThan(0)
  })
})