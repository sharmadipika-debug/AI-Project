'use client'

import Link from 'next/link'
import { useEffect, useState, useSyncExternalStore } from 'react'
import {
  ArrowDownUp,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Bookmark,
  Clock3,
  CreditCard,
  Info,
  Landmark,
  ListFilter,
  ShieldCheck,
  Sparkles,
  Table2,
  TrendingDown,
  Wallet,
  Zap,
} from 'lucide-react'
import CountrySelector from './components/CountrySelector'
import SiteFooter from './components/SiteFooter'
import SiteHeader from './components/SiteHeader'
import { countries, countryById, currencies, popularCorridors } from './data/countries'
import { providers } from './data/providers'
import { getDemoQuotes } from './data/demo-quotes'
import type { Country, PaymentMethod, ProviderQuote, QuoteSort, ReceivingMethod } from './domain/models'
import { fxLossInReceiveCurrency, getBestOverall, getFastest, getLowestTrueCost, sortQuotes } from './services/quote-engine'
import { getPreferredAmountSnapshot, getSavedRoutesSnapshot, readSavedRoutes, savePreferredAmount, saveRoutePreferences, subscribeToPreferences } from './services/browser-preferences'

const money = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)

const amountFormat = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)

const methodLabels: Record<string, string> = {
  bank_transfer: 'Bank transfer',
  bank_wire: 'Bank wire',
  debit_card: 'Debit card',
  credit_card: 'Credit card',
  cash: 'Cash',
  bank_deposit: 'Bank deposit',
  cash_pickup: 'Cash pickup',
  mobile_wallet: 'Mobile wallet',
}

export default App

const deliveryText = (minutes: number | null) => {
  if (minutes === null) return 'Timing unavailable'
  if (minutes < 60) return `Within ${minutes} minutes`
  if (minutes < 1440) return `Within ${Math.ceil(minutes / 60)} hours`
  return `${Math.ceil(minutes / 1440)} day${minutes > 1440 ? 's' : ''}`
}

const deliveryRangeText = (minimum: number | null, maximum: number | null) => {
  if (minimum === null || maximum === null) return 'Timing unavailable'
  if (minimum === maximum) return deliveryText(maximum)
  if (maximum < 60) return `${minimum}-${maximum} min`
  if (maximum < 1440) return `${Math.floor(minimum / 60)}-${Math.ceil(maximum / 60)} hours`
  return `${Math.floor(minimum / 1440)}-${Math.ceil(maximum / 1440)} days`
}

function corridorSlug(from: Country, to: Country) {
  return `/${from.slug}-to-${to.slug}`
}

function App() {
  const [fromCountry, setFromCountry] = useState(countryById('CA')!)
  const [toCountry, setToCountry] = useState(countryById('NP')!)
  const [sendCurrency, setSendCurrency] = useState('CAD')
  const [receiveCurrency, setReceiveCurrency] = useState('NPR')
  const sendAmount = useSyncExternalStore(subscribeToPreferences, getPreferredAmountSnapshot, () => '1000')
  const savedRoutesSnapshot = useSyncExternalStore(subscribeToPreferences, getSavedRoutesSnapshot, () => '[]')
  const savedRoutes = readSavedRoutes(savedRoutesSnapshot)
  const [sortMode, setSortMode] = useState<QuoteSort>('best_overall')
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | 'all'>('all')
  const [receivingFilter, setReceivingFilter] = useState<ReceivingMethod | 'all'>('all')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [alertTarget, setAlertTarget] = useState('')
  const [alertSaved, setAlertSaved] = useState(false)
  const [liveQuotes, setLiveQuotes] = useState<ProviderQuote[] | null>(null)
  const [liveStatus, setLiveStatus] = useState<'idle' | 'loading' | 'available' | 'unavailable'>('idle')

  const routeKey = `${fromCountry.id}-${toCountry.id}`
  const saved = savedRoutes.includes(routeKey)
  const amount = Math.max(0, Number(sendAmount) || 0)
  const request = {
    fromCountryId: fromCountry.id,
    toCountryId: toCountry.id,
    sendAmount: amount,
    sendCurrency,
    receiveCurrency,
    paymentMethod: paymentFilter === 'all' ? undefined : paymentFilter,
    receivingMethod: receivingFilter === 'all' ? undefined : receivingFilter,
  }
  const allQuotes = getDemoQuotes(request)
  useEffect(() => {
    const controller = new AbortController()
    setLiveStatus('loading')
    fetch('/api/quotes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request), signal: controller.signal })
      .then(async (response) => response.ok ? response.json() : null)
      .then((result) => {
        if (controller.signal.aborted) return
        const quotes = result?.status === 'available' ? result.quotes : []
        setLiveQuotes(quotes)
        setLiveStatus(quotes.length ? 'available' : 'unavailable')
      })
      .catch(() => { if (!controller.signal.aborted) { setLiveQuotes([]); setLiveStatus('unavailable') } })
    return () => controller.abort()
  }, [fromCountry.id, toCountry.id, amount, sendCurrency, receiveCurrency, paymentFilter, receivingFilter])

  const displayedQuotes = liveStatus === 'available' ? (liveQuotes ?? []) : allQuotes
  const sortedQuotes = sortQuotes(displayedQuotes, sortMode)
  const bestOverall = getBestOverall(displayedQuotes)
  const lowestCost = getLowestTrueCost(displayedQuotes)
  const fastest = getFastest(displayedQuotes)
  const mostReceived = sortQuotes(displayedQuotes, 'most_received')[0]
  const bestCashPickup = sortQuotes(displayedQuotes.filter((quote) => quote.receivingMethods.includes('cash_pickup')), 'most_received')[0]
  const bestBankTransfer = sortQuotes(displayedQuotes.filter((quote) => quote.paymentMethods.some((method) => method === 'bank_transfer' || method === 'bank_wire')), 'most_received')[0]
  const changeCountry = (direction: 'from' | 'to', country: Country) => {
    if (direction === 'from') {
      setFromCountry(country)
      setSendCurrency(country.currencyCodes[0])
    } else {
      setToCountry(country)
      setReceiveCurrency(country.currencyCodes[0])
    }
  }

  const swapCountries = () => {
    setFromCountry(toCountry)
    setToCountry(fromCountry)
    setSendCurrency(toCountry.currencyCodes[0])
    setReceiveCurrency(fromCountry.currencyCodes[0])
  }

  const toggleSavedRoute = () => {
    const nextRoutes = saved ? savedRoutes.filter((route) => route !== routeKey) : [...new Set([...savedRoutes, routeKey])]
    saveRoutePreferences(nextRoutes)
  }

  const card = (quote: typeof allQuotes[number]) => {
    const provider = providers.find((item) => item.id === quote.providerId)
    if (!provider) return null
    const labels = [
      ...(bestOverall?.providerId === quote.providerId ? ['Best overall'] : []),
      ...(mostReceived?.providerId === quote.providerId ? ['Most money received'] : []),
      ...(lowestCost?.providerId === quote.providerId ? ['Lowest cost'] : []),
      ...(fastest?.providerId === quote.providerId ? ['Fastest'] : []),
      ...(bestCashPickup?.providerId === quote.providerId ? ['Best for cash pickup'] : []),
      ...(bestBankTransfer?.providerId === quote.providerId ? ['Best for bank transfer'] : []),
    ]
    const fxLoss = fxLossInReceiveCurrency(quote)

    return (
      <article className="provider-card" key={quote.providerId}>
        <div className="provider-main">
          <div className="provider-identity">
            <div className={`provider-mark mark-${quote.providerId}`} aria-hidden="true">{provider.name.slice(0, 1)}</div>
            <div className="provider-name-block">
              <div className="provider-name-line"><h3>{provider.name}</h3>{bestOverall?.providerId === quote.providerId && <BadgeCheck size={16} className="verified-icon" aria-label="Best overall" />}</div>
              <div className="provider-badges">{labels.map((label) => <span className="provider-badge" key={label}>{label}</span>)}</div>
            </div>
          </div>
          <div className="quote-stat recipient-stat"><span className="stat-label">RECIPIENT GETS</span><strong>{money(quote.recipientAmount, receiveCurrency)}</strong><span className="offer-tag">DEMO SCENARIO</span></div>
          <div className="quote-stat"><span className="stat-label">TRANSFER FEE</span><strong>{money(quote.transferFee, sendCurrency)}</strong><span className="stat-foot">Payment: {money(quote.paymentMethodFee, sendCurrency)}</span><span className="stat-foot">Other: {money(quote.otherDisclosedCharges, sendCurrency)}</span></div>
          <div className="quote-stat"><span className="stat-label">EXCHANGE RATE</span><strong>1 {sendCurrency} = {quote.providerExchangeRate.toLocaleString('en-US', { maximumFractionDigits: 4 })} {receiveCurrency}</strong><span className="stat-foot">Effective {quote.effectiveExchangeRate.toLocaleString('en-US', { maximumFractionDigits: 4 })}</span><span className="markup-text">FX markup {quote.fxMarkupPercent?.toFixed(2) ?? 'N/A'}%</span></div>
          <div className="quote-stat"><span className="stat-label">TOTAL COST</span><strong>{money(quote.trueCostInReceiveCurrency ?? 0, receiveCurrency)}</strong><span className="stat-foot">FX difference + disclosed fees</span><span className="true-cost">{money(quote.totalDebit, sendCurrency)} total debit</span></div>
          <div className="quote-stat delivery-stat"><span className="stat-label">EST. ARRIVAL</span><strong><Clock3 size={15} />{deliveryRangeText(quote.estimatedDeliveryMinMinutes, quote.estimatedDeliveryMaxMinutes)}</strong><span className="stat-foot">Scenario only</span></div>
        </div>
        <div className="provider-details">
          <div className="method-group"><span className="detail-label"><CreditCard size={14} /> PAYMENT METHODS</span><span>{quote.paymentMethods.map((method) => methodLabels[method]).join(' · ')}</span></div>
          <div className="method-group"><span className="detail-label"><Landmark size={14} /> RECEIVING METHODS</span><span>{quote.receivingMethods.map((method) => methodLabels[method]).join(' · ')}</span></div>
          <div className="provider-tradeoffs">
            <div className="tradeoff-column"><span className="detail-label">ADVANTAGES · DEMO COMPARISON</span><ul>{quote.advantages.map((advantage) => <li key={advantage}>{advantage}</li>)}</ul></div>
            <div className="tradeoff-column"><span className="detail-label">DISADVANTAGES · DEMO COMPARISON</span><ul>{quote.disadvantages.map((disadvantage) => <li key={disadvantage}>{disadvantage}</li>)}</ul></div>
            {fxLoss !== null && <span className="tradeoff-footnote">Approx. {money(fxLoss, receiveCurrency)} below mid-market before disclosed fees. Benchmark only, not a provider charge.</span>}
            <span className="tradeoff-footnote">These scenario trade-offs are not verified provider-wide product claims.</span>
          </div>
          <div className="provider-actions"><Link className="provider-link" href={`/providers/${provider.slug}`}>Provider profile <ArrowRight size={15} /></Link>{provider.websiteUrl && <a className="provider-link live-link" href={provider.websiteUrl} target="_blank" rel="noreferrer">Check live rate <ArrowRight size={15} /></a>}</div>
        </div>
      </article>
    )
  }

  return (
    <div className="app-shell">
      <SiteHeader active="compare" />

      <main id="top">
        <section className="workspace">
          <div className="intro-row">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> INTERNATIONAL TRANSFER COMPARISON</div>
              <h1>Compare international<br /><em>money transfers.</em></h1>
              <p className="intro-copy">See fees, exchange rates, transfer speeds and how much<br className="desktop-break" /> your recipient could receive.</p>
            </div>
            <div className="trust-flag"><ShieldCheck size={18} /><span>Compare only.<br /><strong>Transfers happen with providers.</strong></span></div>
          </div>

          <form className="calculator" aria-label="Compare transfer options" onSubmit={(event) => { event.preventDefault(); document.getElementById('compare')?.scrollIntoView({ behavior: 'smooth' }) }}>
            <div className="calculator-heading"><div><span className="section-kicker">COMPARE A TRANSFER</span><h2>Where are you sending?</h2></div><button className="save-route" type="button" onClick={toggleSavedRoute} aria-pressed={saved}><Bookmark size={15} />{saved ? 'Saved' : 'Save route'}</button></div>
            <div className="transfer-fields">
              <CountrySelector id="from-country" label="FROM" value={fromCountry} countries={countries} onChange={(country) => changeCountry('from', country)} />
              <button className="route-switch" type="button" onClick={swapCountries} aria-label="Swap sending and receiving countries"><ArrowDownUp size={17} /></button>
              <CountrySelector id="to-country" label="TO" value={toCountry} countries={countries} onChange={(country) => changeCountry('to', country)} />
              <div className="amount-field"><label htmlFor="send-amount">YOU SEND</label><div className="amount-input"><input id="send-amount" type="number" min="1" step="0.01" value={sendAmount} onChange={(event) => savePreferredAmount(event.target.value)} aria-label="Amount to send" /><select aria-label="Sending currency" value={sendCurrency} onChange={(event) => setSendCurrency(event.target.value)}>{currencies.map((currency) => <option key={currency}>{currency}</option>)}</select></div></div>
              <div className="currency-field"><label htmlFor="receive-currency">THEY RECEIVE</label><select id="receive-currency" value={receiveCurrency} onChange={(event) => setReceiveCurrency(event.target.value)}>{currencies.map((currency) => <option key={currency}>{currency}</option>)}</select><small>Default: {toCountry.currencyCodes[0]}</small></div>
            </div>
            <div className="calculator-bottom"><div className="quote-note"><Info size={15} /><span>{liveStatus === 'loading' ? 'Checking live provider quotes…' : liveStatus === 'available' ? 'Live provider quote · confirm before sending.' : 'Live provider quotes unavailable; showing demo scenarios.'}</span></div><button className="compare-button" type="submit">Compare transfer options <ArrowRight size={17} /></button></div>
          </form>

          <section className="recommendations" aria-label="Transfer comparison priorities">
            <div className="recommendation-heading"><div><span className="section-kicker">COMPARE BY PRIORITY</span><h2>Best for your transfer</h2></div><span className="based-on"><Sparkles size={15} /> {amountFormat(amount, sendCurrency)} sent</span></div>
            <div className="recommendation-grid">
              <button className={`recommendation-item ${sortMode === 'best_overall' ? 'recommendation-selected' : ''}`} onClick={() => setSortMode('best_overall')}><span className="recommendation-icon overall-icon"><Sparkles size={17} /></span><span className="recommendation-copy"><span>BEST OVERALL</span><strong>{bestOverall ? providers.find((item) => item.id === bestOverall.providerId)?.name : 'No quote'}</strong></span><ArrowRight className="recommendation-arrow" size={16} /></button>
              <button className={`recommendation-item ${sortMode === 'most_received' ? 'recommendation-selected' : ''}`} onClick={() => setSortMode('most_received')}><span className="recommendation-icon payout-icon"><Wallet size={17} /></span><span className="recommendation-copy"><span>MOST RECEIVED</span><strong>{mostReceived ? providers.find((item) => item.id === mostReceived.providerId)?.name : 'No quote'}</strong></span><ArrowRight className="recommendation-arrow" size={16} /></button>
              <button className={`recommendation-item ${sortMode === 'lowest_cost' ? 'recommendation-selected' : ''}`} onClick={() => setSortMode('lowest_cost')}><span className="recommendation-icon cost-icon"><TrendingDown size={17} /></span><span className="recommendation-copy"><span>LOWEST COST</span><strong>{lowestCost ? providers.find((item) => item.id === lowestCost.providerId)?.name : 'No quote'}</strong></span><ArrowRight className="recommendation-arrow" size={16} /></button>
              <button className={`recommendation-item ${sortMode === 'fastest' ? 'recommendation-selected' : ''}`} onClick={() => setSortMode('fastest')}><span className="recommendation-icon speed-icon"><Zap size={17} /></span><span className="recommendation-copy"><span>FASTEST</span><strong>{fastest ? providers.find((item) => item.id === fastest.providerId)?.name : 'No quote'}</strong></span><ArrowRight className="recommendation-arrow" size={16} /></button>
            </div>
          </section>

          <section className="comparison" id="compare">
            <div className="comparison-heading"><div><span className="section-kicker">THE FULL PICTURE</span><h2>Transfer options <span className="result-count">{sortedQuotes.length.toString().padStart(2, '0')}</span></h2></div><div className="comparison-controls"><label className="sort-control"><span>Sort</span><select aria-label="Sort providers" value={sortMode} onChange={(event) => setSortMode(event.target.value as QuoteSort)}><option value="best_overall">Best overall</option><option value="most_received">Most recipient receives</option><option value="lowest_cost">Lowest total cost</option><option value="fastest">Fastest</option><option value="lowest_fee">Lowest fee</option><option value="best_rate">Best exchange rate</option></select></label><div className="view-toggle" role="group" aria-label="Result layout"><button aria-pressed={viewMode === 'cards'} aria-label="Card view" onClick={() => setViewMode('cards')} type="button"><ListFilter size={15} /></button><button aria-pressed={viewMode === 'table'} aria-label="Table view" onClick={() => setViewMode('table')} type="button"><Table2 size={15} /></button></div></div></div>
            <div className="filters-row"><label><span>Payment</span><select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value as PaymentMethod | 'all')}><option value="all">Any payment</option><option value="bank_transfer">Bank transfer</option><option value="bank_wire">Bank wire</option><option value="debit_card">Debit card</option><option value="credit_card">Credit card</option><option value="cash">Cash</option></select></label><label><span>Receiving</span><select value={receivingFilter} onChange={(event) => setReceivingFilter(event.target.value as ReceivingMethod | 'all')}><option value="all">Any receiving method</option><option value="bank_deposit">Bank deposit</option><option value="cash_pickup">Cash pickup</option><option value="mobile_wallet">Mobile wallet</option></select></label><span className="demo-freshness"><span className="demo-dot" /> {liveStatus === 'available' ? 'Live quote · timestamped response' : 'Demo scenario · no live quote available'}</span></div>
            {sortedQuotes.length === 0 ? <div className="empty-state"><Banknote size={25} /><h3>No comparison data available for this route.</h3><p>There is no demo scenario for this corridor, and live provider pricing is not connected. Try a popular route from Canada, the US, the UK, or Australia, or check back when verified provider data is available.</p><Link href="/how-we-rank">How we handle quote data <ArrowRight size={14} /></Link></div> : <>
              {viewMode === 'cards' ? <div className="provider-list">{sortedQuotes.map(card)}</div> : <div className="table-scroll"><table className="comparison-table"><thead><tr><th>Provider</th><th>You send</th><th>Transfer fee</th><th>Exchange rate</th><th>FX markup</th><th>Recipient gets</th><th>Total cost</th><th>Speed</th><th>Payment</th><th>Receiving</th><th>Rating</th><th>Action</th></tr></thead><tbody>{sortedQuotes.map((quote) => { const provider = providers.find((item) => item.id === quote.providerId); return provider && <tr key={quote.providerId}><th>{provider.name}<small>Demo scenario</small></th><td>{money(quote.sendAmount, sendCurrency)}</td><td>{money(quote.transferFee + quote.paymentMethodFee + quote.otherDisclosedCharges, sendCurrency)}</td><td>{quote.providerExchangeRate.toLocaleString('en-US', { maximumFractionDigits: 4 })}</td><td>{quote.fxMarkupPercent?.toFixed(2)}%</td><td className="table-recipient">{money(quote.recipientAmount, receiveCurrency)}</td><td>{money(quote.trueCostInReceiveCurrency ?? 0, receiveCurrency)}<small>FX cost vs reference</small></td><td>{deliveryRangeText(quote.estimatedDeliveryMinMinutes, quote.estimatedDeliveryMaxMinutes)}</td><td>{quote.paymentMethods.map((item) => methodLabels[item]).join(', ')}</td><td>{quote.receivingMethods.map((item) => methodLabels[item]).join(', ')}</td><td>Not rated</td><td><Link href={`/providers/${provider.slug}`}>Profile</Link></td></tr>})}</tbody></table></div>}
              <p className="best-rationale"><Sparkles size={15} /> {bestOverall?.rationale} The best-overall badge uses recipient payout (50%), true cost (30%) and speed (20%); <Link href="/how-we-rank">see the calculation</Link>.</p>
            </>}
            <div className="cost-note"><Info size={15} /><p><strong>True cost is not a provider fee.</strong> We estimate the difference between the total debit at a reference mid-market rate and the recipient payout. The reference-rate difference is a comparison benchmark, not a charge collected by the provider.</p></div>
          </section>

          <section className="cost-explainer"><div className="cost-icon-large"><TrendingDown size={20} /></div><div><span className="section-kicker">COMPARE MORE THAN TRANSFER FEES</span><h2>A zero fee can still cost more.</h2><p>When a provider returns a live rate, Morrow calculates the result from that response. It never invents a live rate from a formula.</p></div><div className="formula-card"><span>LIVE QUOTE CALCULATIONS</span><strong>recipient = amount × provider rate</strong><small>total debit = amount + fees · effective rate = recipient ÷ total debit</small></div></section>

          <section className="how-section" id="how-it-works"><div className="section-title"><span className="section-kicker">HOW IT WORKS</span><h2>Five steps to a clearer comparison.</h2></div><div className="steps-grid">{['Choose where you are sending from', 'Choose the receiving country', 'Enter the amount and currencies', 'Compare fees, rates and speed', 'Confirm the quote with the provider'].map((step, index) => <div className="step-item" key={step}><span>0{index + 1}</span><p>{step}</p></div>)}</div></section>

          <section className="priority-section"><div className="section-title"><span className="section-kicker">FIND THE RIGHT FIT</span><h2>Compare by what matters to you.</h2></div><div className="priority-links"><a href="#compare" onClick={() => setSortMode('lowest_cost')}><TrendingDown size={17} /> Lowest cost</a><a href="#compare" onClick={() => setSortMode('fastest')}><Zap size={17} /> Fastest arrival</a><a href="#compare" onClick={() => setSortMode('best_rate')}><ArrowDownUp size={17} /> Best exchange rate</a><button onClick={() => setReceivingFilter('cash_pickup')}><Banknote size={17} /> Cash pickup</button><button onClick={() => setReceivingFilter('bank_deposit')}><Landmark size={17} /> Bank deposit</button><button onClick={() => setReceivingFilter('mobile_wallet')}><Wallet size={17} /> Mobile wallet</button></div></section>

          <section className="popular-section" id="popular-routes"><div className="section-title"><span className="section-kicker">POPULAR TRANSFER ROUTES</span><h2>Explore a corridor.</h2></div><div className="route-links">{popularCorridors.map(([fromId, toId]) => { const from = countryById(fromId)!; const to = countryById(toId)!; return <Link href={corridorSlug(from, to)} key={`${fromId}-${toId}`}><span>{from.flag} {from.name}</span><ArrowRight size={14} /><span>{to.flag} {to.name}</span></Link> })}</div></section>

          <section className="popular-section"><div className="section-title"><span className="section-kicker">PROVIDER DIRECTORY</span><h2>Provider profiles.</h2></div><div className="provider-directory">{providers.map((provider) => <Link href={`/providers/${provider.slug}`} key={provider.id}><span className={`provider-mark mark-${provider.id}`}>{provider.name.slice(0, 1)}</span><span>{provider.name}</span><ArrowRight size={14} /></Link>)}</div></section>

          <section className="history-panel"><div><span className="section-kicker">HISTORICAL EXCHANGE RATES</span><h2>Rate history is not connected yet.</h2><p>We will show 24-hour to 1-year history when a verified FX feed is configured.</p></div><div className="history-placeholder"><TrendingDown size={22} /><span>No historical rate series available</span></div></section>

          <section className="alert-panel"><div><span className="section-kicker">RATE ALERTS</span><h2>Save a target rate.</h2><p>Alerts are saved in this browser only. Email and push delivery are not connected.</p></div><form onSubmit={(event) => { event.preventDefault(); if (Number(alertTarget) > 0) { localStorage.setItem(`morrow:alert:${sendCurrency}-${receiveCurrency}`, alertTarget); setAlertSaved(true) } }}><label htmlFor="alert-target">Alert when 1 {sendCurrency} reaches</label><div><input id="alert-target" type="number" min="0.0001" step="any" placeholder="Target rate" value={alertTarget} onChange={(event) => { setAlertTarget(event.target.value); setAlertSaved(false) }} /><span>{receiveCurrency}</span><button type="submit">{alertSaved ? 'Saved' : 'Save alert'}</button></div></form></section>

          <section className="faq-section"><div className="section-title"><span className="section-kicker">FREQUENTLY ASKED QUESTIONS</span><h2>Transfer comparison, explained.</h2></div><details><summary>How do you calculate the true cost?</summary><p>We calculate the total debit, then compare its value at a mid-market reference rate with the recipient payout. This includes disclosed transfer and payment fees plus the rate difference. The reference-rate comparison is not an additional provider charge.</p></details><details><summary>Are these today's provider rates?</summary><p>No. The Canada-to-Nepal rows use clearly labeled test scenarios with no provider quote timestamp. Other routes return no quote until a verified source is connected. Always confirm rates, availability, fees and transfer times with the provider.</p></details><details><summary>Does Morrow send my money?</summary><p>No. Morrow is a comparison platform. Transfers are completed directly through the selected provider.</p></details></section>

          <div className="data-disclaimer" id="about-data"><Info size={15} /><p><strong>Data and affiliate disclosure.</strong> Demo figures are test scenarios, not live provider quotes or claims about provider availability. Morrow does not currently use affiliate links. If affiliate links are enabled in the future, they will be disclosed and will not affect rankings. Rates, fees, timing and availability can change; confirm the final quote with the provider.</p></div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
