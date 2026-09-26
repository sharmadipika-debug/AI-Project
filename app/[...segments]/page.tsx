import Link from 'next/link'
import { Info } from 'lucide-react'
import { notFound } from 'next/navigation'
import { countries } from '../../src/data/countries'
import { providers } from '../../src/data/providers'
import SiteFooter from '../../src/components/SiteFooter'
import SiteHeader from '../../src/components/SiteHeader'
import { generateRouteMetadata, getStaticRoutes, resolveRoute, type PageProps } from '../route-data'

export const generateMetadata = generateRouteMetadata

export const generateStaticParams = getStaticRoutes

function Breadcrumbs({ items }: { items: Array<{ name: string; href?: string }> }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.href,
    })),
  }
  return <>
    <nav className="page-breadcrumbs" aria-label="Breadcrumb">{items.map((item, index) => <span key={item.name}>{index > 0 && <b>/</b>}{item.href ? <Link href={item.href}>{item.name}</Link> : item.name}</span>)}</nav>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  </>
}

function MethodologyPage() {
  return <article className="editorial-page"><Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'How we rank' }]} /><span className="section-kicker">EDITORIAL METHODOLOGY</span><h1>How Morrow compares providers.</h1><p className="editorial-lead">Rankings are based on transfer outcomes, not advertised fees or affiliate commission.</p>
    <section><h2>Recipient amount</h2><p>Recipient payout equals the send amount multiplied by the provider exchange rate. Transfer and payment fees are shown separately and included in the total debit.</p></section>
    <section><h2>Exchange-rate difference</h2><p>FX markup is ((mid-market reference rate - provider rate) / mid-market reference rate) x 100. The estimated FX loss is the send amount multiplied by the rate difference. A mid-market comparison is a benchmark, not a fee the provider charges.</p></section>
    <section><h2>Estimated true cost</h2><p>Estimated true cost in the receive currency equals total debit at the reference rate minus recipient payout. This combines disclosed fees and the rate difference so a zero-fee offer is not automatically ranked as cheapest.</p></section>
    <section><h2>Best overall</h2><p>When comparable data exists, the transparent score weights recipient payout at 50%, estimated true cost at 30%, and delivery speed at 20%. The detailed result explains the score. Users can instead sort by payout, cost, speed, fee, or exchange rate.</p></section>
    <section><h2>Quote freshness and affiliate relationships</h2><p>Live quotes must include a provider and quote timestamp. Stale, missing, or invalid timestamps are marked for confirmation. Morrow currently has no live provider integrations or affiliate links. If affiliate links are introduced, commission will not affect ranking.</p></section>
    <section className="page-callout"><strong>Comparison platform only.</strong> Transfers are completed directly through the selected provider. Confirm the final quote, eligibility, fees, and timing with that provider.</section><Link className="compare-button page-cta" href="/">Start a comparison <span aria-hidden="true">-&gt;</span></Link>
  </article>
}

function ProviderPage({ providerId }: { providerId: string }) {
  const provider = providers.find((item) => item.id === providerId)
  if (!provider) return notFound()
  return <article className="editorial-page"><Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Providers', href: '/' }, { name: provider.name }]} /><span className="section-kicker">PROVIDER DIRECTORY</span><h1>{provider.name}</h1><p className="editorial-lead">Independent provider profile. Product characteristics below are general comparison notes, not a live quote or universal availability claim.</p>
    <div className="page-callout"><Info size={17} /><span>Quote unavailable: Morrow has no live {provider.name} adapter configured. No sample figures are presented as current pricing.</span></div>
    <section><h2>Provider facts</h2><dl className="provider-facts"><div><dt>Fee model</dt><dd>{provider.feeType === 'variable' ? 'Variable; check exact route and payment method' : provider.feeType}</dd></div><div><dt>Transfer channels</dt><dd>{provider.transferMethods.join(', ') || 'Not listed'}</dd></div><div><dt>Payment methods</dt><dd>{provider.paymentMethods.join(', ') || 'Not listed'}</dd></div><div><dt>Receiving methods</dt><dd>{provider.receivingMethods.join(', ') || 'Not listed'}</dd></div><div><dt>Advantages</dt><dd><ul>{provider.pros.map((item) => <li key={item}>{item}</li>)}</ul></dd></div><div><dt>Disadvantages</dt><dd><ul>{provider.cons.map((item) => <li key={item}>{item}</li>)}</ul></dd></div><div><dt>Security / regulatory note</dt><dd>{provider.securityInformation ?? 'Confirm local licensing and requirements with the provider.'}</dd></div><div><dt>Information reviewed</dt><dd>{provider.lastUpdated ?? 'Not dated'}</dd></div></dl></section>
    <section><h2>Compare a corridor</h2><p>Country-level availability and prices must be checked with the provider before transfer.</p>{provider.websiteUrl && <a className="compare-button page-cta" href={provider.websiteUrl} target="_blank" rel="noreferrer">Check live rate at {provider.name} <span aria-hidden="true">-&gt;</span></a>}<Link className="compare-button page-cta" href="/">Compare transfer options <span aria-hidden="true">-&gt;</span></Link></section>
  </article>
}

function CorridorPage({ fromId, toId }: { fromId: string; toId: string }) {
  const from = countries.find((country) => country.id === fromId)!
  const to = countries.find((country) => country.id === toId)!
  const hasDemoScenario = from.id === 'CA' && to.id === 'NP'
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Does Morrow transfer money?', acceptedAnswer: { '@type': 'Answer', text: 'No. Morrow compares providers. Transfers are completed directly through the selected provider.' } },
      { '@type': 'Question', name: 'Are rates guaranteed?', acceptedAnswer: { '@type': 'Answer', text: 'No. Rates, fees, transfer times, and corridor availability can change. Confirm the final quote directly with a provider.' } },
    ],
  }
  return <article className="editorial-page"><Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Transfer routes', href: '/#popular-routes' }, { name: `${from.name} to ${to.name}` }]} /><span className="section-kicker">COUNTRY TRANSFER GUIDE</span><h1>Best ways to send money from {from.name} to {to.name}.</h1><p className="editorial-lead">Compare the details that matter before sending {from.currencyCodes[0]} and receiving {to.currencyCodes[0]}.</p>
    <div className="page-callout"><Info size={17} /><span>Live exchange rates and provider quotes are not connected. {hasDemoScenario ? 'The homepage has a clearly labeled test scenario for this corridor; it is not current pricing.' : 'There is no sample quote for this corridor, so no provider prices are shown.'}</span></div>
    <section><h2>What to compare</h2><ul className="editorial-list"><li>Transfer fee, payment-method fee, and any other disclosed charge</li><li>Provider exchange rate compared with a timestamped mid-market reference rate</li><li>Recipient amount after conversion, plus estimated total debit</li><li>Expected delivery range, payment options, bank deposit, cash pickup, and wallet availability</li></ul></section>
    <section><h2>Rate and quote status</h2><p>Latest available rate: unavailable. We will only display a rate when a configured source returns a timestamped quote for this corridor. Confirm availability, final fees, and delivery with the provider.</p></section>
    <section><h2>Frequently asked questions</h2><details><summary>Does Morrow transfer money?</summary><p>No. Morrow compares providers; transfers are completed directly through the selected provider.</p></details><details><summary>Are rates guaranteed?</summary><p>No. Rates, fees, transfer times, and corridor availability can change. Confirm the final quote directly with a provider.</p></details></section>
    <Link className="compare-button page-cta" href="/">Compare a transfer <span aria-hidden="true">-&gt;</span></Link><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
  </article>
}

export default async function DirectoryPage({ params }: PageProps) {
  const { segments } = await params
  const route = resolveRoute(segments)
  if (!route) notFound()
  const content = route.type === 'methodology'
    ? <MethodologyPage />
    : route.type === 'provider'
      ? <ProviderPage providerId={route.providerId} />
      : <CorridorPage fromId={route.fromId} toId={route.toId} />
  return <div className="app-shell"><SiteHeader active={route.type === 'methodology' ? 'methodology' : ''} /><main className="editorial-workspace">{content}</main><SiteFooter /></div>
}
