import type { ProviderQuote, ProviderQuoteInput, QuoteRequest } from '../domain/models'
import { calculateQuote } from '../services/quote-engine'

type DemoScenario = {
  fromCountryId: string
  toCountryId: string
  sendCurrency: string
  receiveCurrency: string
  midMarketRate: number
  providers: Array<{
    providerId: string
    transferFee: number
    paymentMethodFee: number
    otherDisclosedCharges: number
    providerRate: number
    deliveryMin: number
    deliveryMax: number
    paymentMethods: ProviderQuote['paymentMethods']
    receivingMethods: ProviderQuote['receivingMethods']
    advantages?: string[]
    disadvantages?: string[]
  }>
}

export const demoScenarios: DemoScenario[] = [
  {
    fromCountryId: 'CA', toCountryId: 'NP', sendCurrency: 'CAD', receiveCurrency: 'NPR', midMarketRate: 105,
    providers: [
      { providerId: 'wise', transferFee: 8.72, paymentMethodFee: 0, otherDisclosedCharges: 0, providerRate: 104.82, deliveryMin: 5, deliveryMax: 30, paymentMethods: ['bank_transfer', 'debit_card'], receivingMethods: ['bank_deposit'] },
      { providerId: 'remitly', transferFee: 4.99, paymentMethodFee: 0, otherDisclosedCharges: 0, providerRate: 103.5, deliveryMin: 5, deliveryMax: 60, paymentMethods: ['bank_transfer', 'debit_card'], receivingMethods: ['bank_deposit', 'cash_pickup'] },
      { providerId: 'worldremit', transferFee: 3.99, paymentMethodFee: 0, otherDisclosedCharges: 0, providerRate: 102.9, deliveryMin: 60, deliveryMax: 1440, paymentMethods: ['bank_transfer', 'debit_card'], receivingMethods: ['bank_deposit', 'cash_pickup', 'mobile_wallet'] },
      { providerId: 'panda-remit', transferFee: 6.49, paymentMethodFee: 0, otherDisclosedCharges: 0, providerRate: 104, deliveryMin: 30, deliveryMax: 240, paymentMethods: ['bank_wire', 'bank_transfer', 'debit_card'], receivingMethods: ['bank_deposit', 'mobile_wallet'] },
    ],
  },
]

const demoUsdValues: Record<string, number> = {
  CAD: 0.73,
  USD: 1,
  GBP: 1.28,
  AUD: 0.66,
  NPR: 0.0075,
  INR: 0.0114,
  PHP: 0.0175,
  PKR: 0.0036,
  BDT: 0.0084,
  MXN: 0.059,
  NGN: 0.00065,
  VND: 0.00004,
  LKR: 0.0031,
  CNY: 0.14,
}

const popularSendCountries = [
  { countryId: 'CA', currency: 'CAD' },
  { countryId: 'US', currency: 'USD' },
  { countryId: 'GB', currency: 'GBP' },
  { countryId: 'AU', currency: 'AUD' },
]

const popularReceiveCountries = [
  { countryId: 'IN', currency: 'INR' },
  { countryId: 'NP', currency: 'NPR' },
  { countryId: 'PH', currency: 'PHP' },
  { countryId: 'PK', currency: 'PKR' },
  { countryId: 'BD', currency: 'BDT' },
  { countryId: 'MX', currency: 'MXN' },
  { countryId: 'NG', currency: 'NGN' },
  { countryId: 'VN', currency: 'VND' },
  { countryId: 'LK', currency: 'LKR' },
  { countryId: 'CN', currency: 'CNY' },
]

const demoProviderTerms = [
  { providerId: 'wise', feeCad: 8.72, rateFactor: 0.9983, deliveryMin: 5, deliveryMax: 30, receivingMethods: ['bank_deposit'] as ProviderQuote['receivingMethods'], paymentMethods: ['bank_transfer', 'debit_card'] as ProviderQuote['paymentMethods'] },
  { providerId: 'remitly', feeCad: 4.99, rateFactor: 0.9857, deliveryMin: 5, deliveryMax: 60, receivingMethods: ['bank_deposit', 'cash_pickup'] as ProviderQuote['receivingMethods'], paymentMethods: ['bank_transfer', 'debit_card'] as ProviderQuote['paymentMethods'] },
  { providerId: 'worldremit', feeCad: 3.99, rateFactor: 0.98, deliveryMin: 60, deliveryMax: 1440, receivingMethods: ['bank_deposit', 'cash_pickup', 'mobile_wallet'] as ProviderQuote['receivingMethods'], paymentMethods: ['bank_transfer', 'debit_card'] as ProviderQuote['paymentMethods'] },
  { providerId: 'panda-remit', feeCad: 6.49, rateFactor: 0.99, deliveryMin: 15, deliveryMax: 180, receivingMethods: ['bank_deposit', 'mobile_wallet'] as ProviderQuote['receivingMethods'], paymentMethods: ['bank_wire', 'bank_transfer', 'debit_card'] as ProviderQuote['paymentMethods'] },
]

const popularRouteScenarios: DemoScenario[] = popularSendCountries.flatMap((from) =>
  popularReceiveCountries
    .filter((to) => !(from.countryId === 'CA' && to.countryId === 'NP'))
    .map((to) => {
      const midMarketRate = demoUsdValues[from.currency] / demoUsdValues[to.currency]
      return {
        fromCountryId: from.countryId,
        toCountryId: to.countryId,
        sendCurrency: from.currency,
        receiveCurrency: to.currency,
        midMarketRate,
        providers: demoProviderTerms.map((provider) => ({
          providerId: provider.providerId,
          transferFee: provider.feeCad * demoUsdValues.CAD / demoUsdValues[from.currency],
          paymentMethodFee: 0,
          otherDisclosedCharges: 0,
          providerRate: midMarketRate * provider.rateFactor,
          deliveryMin: provider.deliveryMin,
          deliveryMax: provider.deliveryMax,
          paymentMethods: provider.paymentMethods,
          receivingMethods: provider.receivingMethods,
          advantages: [],
          disadvantages: [],
        })),
      }
    }),
)

demoScenarios.push(...popularRouteScenarios)

export function getDemoQuotes(request: QuoteRequest): ProviderQuote[] {
  const scenario = demoScenarios.find((item) =>
    item.fromCountryId === request.fromCountryId &&
    item.toCountryId === request.toCountryId &&
    item.sendCurrency === request.sendCurrency &&
    item.receiveCurrency === request.receiveCurrency,
  )

  if (!scenario || request.sendAmount <= 0) return []

  const quotes = scenario.providers
    .filter((item) => !request.paymentMethod || item.paymentMethods.includes(request.paymentMethod))
    .filter((item) => !request.receivingMethod || item.receivingMethods.includes(request.receivingMethod))
    .map((item) => calculateQuote(request, {
      providerId: item.providerId,
      sendCurrency: request.sendCurrency,
      receiveCurrency: request.receiveCurrency,
      transferFee: item.transferFee,
      paymentMethodFee: item.paymentMethodFee,
      otherDisclosedCharges: item.otherDisclosedCharges,
      providerExchangeRate: item.providerRate,
      midMarketRate: scenario.midMarketRate,
      estimatedDeliveryMinMinutes: item.deliveryMin,
      estimatedDeliveryMaxMinutes: item.deliveryMax,
      paymentMethods: item.paymentMethods,
      receivingMethods: item.receivingMethods,
      advantages: item.advantages ?? [],
      disadvantages: item.disadvantages ?? [],
      quoteTimestamp: null,
      source: 'demo',
      affiliateUrl: null,
    } satisfies ProviderQuoteInput))

  if (quotes.length === 0) return []

  const highestPayout = Math.max(...quotes.map((quote) => quote.recipientAmount))
  const lowestFee = Math.min(...quotes.map((quote) => quote.transferFee + quote.paymentMethodFee + quote.otherDisclosedCharges))
  const fastestDelivery = Math.min(...quotes.map((quote) => quote.estimatedDeliveryMaxMinutes ?? Infinity))

  return quotes.map((quote) => ({
    ...quote,
    advantages: [
      ...(quote.recipientAmount === highestPayout ? ['Highest recipient payout in this demo comparison'] : []),
      ...(quote.transferFee + quote.paymentMethodFee + quote.otherDisclosedCharges === lowestFee ? ['Lowest disclosed fees in this demo comparison'] : []),
      ...(quote.estimatedDeliveryMaxMinutes === fastestDelivery ? ['Fastest estimated arrival in this demo comparison'] : []),
      ...(quote.paymentMethods.includes('bank_wire') ? ['Bank wire listed as a demo payment option'] : []),
      ...(!quote.paymentMethods.includes('bank_wire') && quote.recipientAmount < highestPayout && quote.transferFee + quote.paymentMethodFee + quote.otherDisclosedCharges > lowestFee && quote.estimatedDeliveryMaxMinutes !== fastestDelivery
        ? [`${quote.paymentMethods.length} payment methods listed for this demo route`]
        : []),
    ],
    disadvantages: [
      ...(quote.recipientAmount < highestPayout ? ['Lower recipient payout than the top demo option'] : []),
      ...(quote.transferFee + quote.paymentMethodFee + quote.otherDisclosedCharges > lowestFee ? ['Higher disclosed fees than the lowest-fee demo option'] : []),
      ...(quote.estimatedDeliveryMaxMinutes !== null && quote.estimatedDeliveryMaxMinutes > fastestDelivery ? ['Longer estimated arrival than the fastest demo option'] : []),
      ...(
        quote.recipientAmount === highestPayout &&
        quote.transferFee + quote.paymentMethodFee + quote.otherDisclosedCharges === lowestFee &&
        quote.estimatedDeliveryMaxMinutes === fastestDelivery
          ? ['No relative downside identified in this demo set; not a provider-wide assessment']
          : []
      ),
    ],
  }))
}