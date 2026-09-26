import type { ProviderQuote, ProviderQuoteInput, QuoteRequest, QuoteSort } from '../domain/models'

export type Recommendation = {
  providerId: string
  rationale: string
}

export function calculateQuote(request: QuoteRequest, input: ProviderQuoteInput): ProviderQuote {
  // These formulas operate on a provider-supplied rate and fees. They do not
  // generate a live rate; the adapter must obtain those inputs from the provider.
  const totalDebit = request.sendAmount + input.transferFee + input.paymentMethodFee + input.otherDisclosedCharges
  const recipientAmount = request.sendAmount * input.providerExchangeRate
  const fxMarkupPercent = input.midMarketRate === null
    ? null
    : ((input.midMarketRate - input.providerExchangeRate) / input.midMarketRate) * 100

  return {
    ...input,
    sendAmount: request.sendAmount,
    totalDebit,
    recipientAmount,
    fxMarkupPercent,
    trueCostInReceiveCurrency: input.midMarketRate === null
      ? null
      : totalDebit * input.midMarketRate - recipientAmount,
    effectiveExchangeRate: totalDebit > 0 ? recipientAmount / totalDebit : 0,
  }
}

export const totalCostInSendCurrency = (quote: ProviderQuote) =>
  quote.transferFee + quote.paymentMethodFee + quote.otherDisclosedCharges

export const fxLossInReceiveCurrency = (quote: ProviderQuote) => {
  if (quote.midMarketRate === null) return null
  return quote.sendAmount * (quote.midMarketRate - quote.providerExchangeRate)
}

export function sortQuotes(quotes: ProviderQuote[], mode: QuoteSort): ProviderQuote[] {
  const sorted = [...quotes]
  const compare = {
    most_received: (a: ProviderQuote, b: ProviderQuote) => b.recipientAmount - a.recipientAmount,
    lowest_cost: (a: ProviderQuote, b: ProviderQuote) => (a.trueCostInReceiveCurrency ?? Infinity) - (b.trueCostInReceiveCurrency ?? Infinity),
    fastest: (a: ProviderQuote, b: ProviderQuote) => (a.estimatedDeliveryMaxMinutes ?? Infinity) - (b.estimatedDeliveryMaxMinutes ?? Infinity),
    lowest_fee: (a: ProviderQuote, b: ProviderQuote) => totalCostInSendCurrency(a) - totalCostInSendCurrency(b),
    best_rate: (a: ProviderQuote, b: ProviderQuote) => b.providerExchangeRate - a.providerExchangeRate,
    best_overall: (a: ProviderQuote, b: ProviderQuote) => bestOverallScore(b, quotes) - bestOverallScore(a, quotes),
  }[mode]
  return sorted.sort(compare)
}

function bestOverallScore(quote: ProviderQuote, quotes: ProviderQuote[]) {
  const costs = quotes.flatMap((item) => item.trueCostInReceiveCurrency === null ? [] : [item.trueCostInReceiveCurrency])
  const fastest = Math.min(...quotes.flatMap((item) => item.estimatedDeliveryMaxMinutes === null ? [] : [item.estimatedDeliveryMaxMinutes]))
  const highestPayout = Math.max(...quotes.map((item) => item.recipientAmount))
  const lowestCost = Math.min(...costs)
  const payoutScore = highestPayout > 0 ? quote.recipientAmount / highestPayout * 50 : 0
  const costScore = quote.trueCostInReceiveCurrency !== null && lowestCost > 0
    ? lowestCost / quote.trueCostInReceiveCurrency * 30
    : quote.trueCostInReceiveCurrency === 0 && lowestCost === 0 ? 30 : 0
  const speedScore = quote.estimatedDeliveryMaxMinutes !== null && fastest > 0
    ? fastest / quote.estimatedDeliveryMaxMinutes * 20
    : 0
  return payoutScore + costScore + speedScore
}

export function getBestOverall(quotes: ProviderQuote[]): Recommendation | null {
  if (!quotes.length) return null
  const [winner] = sortQuotes(quotes, 'best_overall')
  const averagePayout = quotes.reduce((sum, quote) => sum + quote.recipientAmount, 0) / quotes.length
  const aboveAverage = winner.recipientAmount - averagePayout
  const maxDelivery = winner.estimatedDeliveryMaxMinutes
  const delivery = maxDelivery === null
    ? 'delivery timing is not available'
    : maxDelivery < 60
      ? `estimated delivery is within ${maxDelivery} minutes`
      : `estimated delivery is within ${Math.ceil(maxDelivery / 60)} hours`
  const payoutReason = aboveAverage > 0
    ? `the recipient gets ${aboveAverage.toLocaleString('en-US', { maximumFractionDigits: 0 })} ${winner.receiveCurrency} more than the provider average`
    : `the recipient gets the highest amount among compared providers`
  const score = bestOverallScore(winner, quotes)
  return {
    providerId: winner.providerId,
    rationale: `Best overall by the transparent 50% payout, 30% true-cost, 20% speed score (${score.toFixed(1)} points): ${payoutReason}; ${delivery}.`,
  }
}

export function getLowestTrueCost(quotes: ProviderQuote[]): ProviderQuote | null {
  return sortQuotes(quotes, 'lowest_cost')[0] ?? null
}

export function getFastest(quotes: ProviderQuote[]): ProviderQuote | null {
  return sortQuotes(quotes, 'fastest')[0] ?? null
}
