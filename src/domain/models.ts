export type Country = {
  id: string
  slug: string
  name: string
  iso2: string
  currencyCodes: string[]
  flag: string
  popular?: boolean
}

export type Currency = {
  code: string
  name: string
  usdReferenceValue: number | null
}

export type TransferMethod = 'website' | 'mobile_app' | 'in_person'
export type PaymentMethod = 'bank_transfer' | 'bank_wire' | 'debit_card' | 'credit_card' | 'cash'
export type ReceivingMethod = 'bank_deposit' | 'cash_pickup' | 'mobile_wallet'

export type ProviderRecord = {
  id: string
  slug: string
  name: string
  logoUrl: string | null
  websiteUrl: string | null
  affiliateUrl: string | null
  affiliateTrackingId: string | null
  supportedFromCountries: string[]
  supportedToCountries: string[]
  supportedCurrencies: string[]
  feeType: 'fixed' | 'percentage' | 'variable' | 'unknown'
  minimumTransfer: number | null
  maximumTransfer: number | null
  estimatedDeliveryMinMinutes: number | null
  estimatedDeliveryMaxMinutes: number | null
  transferMethods: TransferMethod[]
  paymentMethods: PaymentMethod[]
  receivingMethods: ReceivingMethod[]
  cashPickup: boolean | null
  bankDeposit: boolean | null
  mobileWallet: boolean | null
  debitCard: boolean | null
  creditCard: boolean | null
  bankTransfer: boolean | null
  promotionalRate: string | null
  promoDescription: string | null
  rating: number | null
  pros: string[]
  cons: string[]
  securityInformation: string | null
  regulatoryInformation: string | null
  customerSupport: string | null
  lastUpdated: string | null
  enabled: boolean
}

export type Corridor = {
  fromCountryId: string
  toCountryId: string
  fromCurrency: string
  toCurrency: string
  enabled: boolean
  featured: boolean
}

export type QuoteRequest = {
  fromCountryId: string
  toCountryId: string
  sendAmount: number
  sendCurrency: string
  receiveCurrency: string
  paymentMethod?: PaymentMethod
  receivingMethod?: ReceivingMethod
}

export type QuoteSource = 'live' | 'manual' | 'demo'

export type ProviderQuote = {
  providerId: string
  sendAmount: number
  sendCurrency: string
  receiveCurrency: string
  transferFee: number
  paymentMethodFee: number
  otherDisclosedCharges: number
  providerExchangeRate: number
  midMarketRate: number | null
  fxMarkupPercent: number | null
  recipientAmount: number
  totalDebit: number
  trueCostInReceiveCurrency: number | null
  effectiveExchangeRate: number
  estimatedDeliveryMinMinutes: number | null
  estimatedDeliveryMaxMinutes: number | null
  paymentMethods: PaymentMethod[]
  receivingMethods: ReceivingMethod[]
  advantages: string[]
  disadvantages: string[]
  quoteTimestamp: string | null
  source: QuoteSource
  affiliateUrl: string | null
}

export type ProviderQuoteInput = Pick<ProviderQuote,
  | 'providerId'
  | 'sendCurrency'
  | 'receiveCurrency'
  | 'transferFee'
  | 'paymentMethodFee'
  | 'otherDisclosedCharges'
  | 'providerExchangeRate'
  | 'midMarketRate'
  | 'estimatedDeliveryMinMinutes'
  | 'estimatedDeliveryMaxMinutes'
  | 'paymentMethods'
  | 'receivingMethods'
  | 'advantages'
  | 'disadvantages'
  | 'quoteTimestamp'
  | 'source'
  | 'affiliateUrl'
>

export type QuoteSort =
  | 'best_overall'
  | 'most_received'
  | 'lowest_cost'
  | 'fastest'
  | 'lowest_fee'
  | 'best_rate'

export type QuoteAvailability =
  | { status: 'available'; quotes: ProviderQuote[] }
  | { status: 'unavailable'; reason: string }