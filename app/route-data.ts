import type { Metadata } from 'next'
import { countries, countryBySlug, popularCorridors } from '../src/data/countries'
import { providerBySlug, providers } from '../src/data/providers'

export type PageProps = { params: Promise<{ segments: string[] }> }

export type ResolvedRoute =
  | { type: 'methodology' }
  | { type: 'provider'; providerId: string }
  | { type: 'corridor'; fromId: string; toId: string }

export function resolveRoute(segments: string[]): ResolvedRoute | null {
  if (segments.length === 1 && segments[0] === 'how-we-rank') return { type: 'methodology' }
  if (segments.length === 2 && segments[0] === 'providers') {
    const provider = providerBySlug(segments[1])
    return provider ? { type: 'provider', providerId: provider.id } : null
  }
  if (segments.length === 1) {
    const match = countries.flatMap((from) => countries.map((to) => ({ from, to })))
      .find(({ from, to }) => `${from.slug}-to-${to.slug}` === segments[0])
    if (match) return { type: 'corridor', fromId: match.from.id, toId: match.to.id }
  }
  if (segments.length === 5 && segments[0] === 'send-money' && segments[1] === 'from' && segments[3] === 'to') {
    const from = countryBySlug(segments[2])
    const to = countryBySlug(segments[4])
    if (from && to) return { type: 'corridor', fromId: from.id, toId: to.id }
  }
  return null
}

export function getTitle(route: ResolvedRoute) {
  if (route.type === 'methodology') return 'How we rank providers'
  if (route.type === 'provider') return `${providerBySlug(route.providerId)?.name} provider profile`
  const from = countries.find((country) => country.id === route.fromId)!
  const to = countries.find((country) => country.id === route.toId)!
  return `Best ways to send money from ${from.name} to ${to.name}`
}

export function getDescription(route: ResolvedRoute) {
  if (route.type === 'methodology') return 'Learn how Morrow compares fees, exchange-rate differences, recipient payouts, transfer speed, and affiliate relationships.'
  if (route.type === 'provider') return `Provider facts, corridor coverage, and quote freshness for ${providerBySlug(route.providerId)?.name}. Live provider pricing is not connected.`
  const from = countries.find((country) => country.id === route.fromId)!
  const to = countries.find((country) => country.id === route.toId)!
  return `Compare transfer fees, exchange rates, speed, and recipient payout for sending money from ${from.name} to ${to.name}. Live provider quotes are not connected.`
}

export async function generateRouteMetadata({ params }: PageProps): Promise<Metadata> {
  const { segments } = await params
  const route = resolveRoute(segments)
  if (!route) return { title: 'Page not found', robots: { index: false, follow: false } }
  const title = getTitle(route)
  const description = getDescription(route)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const canonical = siteUrl
    ? new URL(`/${segments.join('/')}`, siteUrl)
    : `/${segments.join('/')}`
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'article' },
    twitter: { card: 'summary', title, description },
  }
}

export function getStaticRoutes() {
  return [
    { segments: ['how-we-rank'] },
    ...providers.map((provider) => ({ segments: ['providers', provider.slug] })),
    ...popularCorridors.flatMap(([fromId, toId]) => {
      const from = countries.find((country) => country.id === fromId)!
      const to = countries.find((country) => country.id === toId)!
      return [
        { segments: [`${from.slug}-to-${to.slug}`] },
        { segments: ['send-money', 'from', from.slug, 'to', to.slug] },
      ]
    }),
  ]
}