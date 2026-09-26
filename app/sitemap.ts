import type { MetadataRoute } from 'next'
import { countries, popularCorridors } from '../src/data/countries'
import { providers } from '../src/data/providers'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl) return []
  const base = siteUrl.replace(/\/$/, '')
  const pages = [
    '/',
    '/how-we-rank',
    ...providers.map((provider) => `/providers/${provider.slug}`),
    ...popularCorridors.flatMap(([fromId, toId]) => {
      const from = countries.find((country) => country.id === fromId)!
      const to = countries.find((country) => country.id === toId)!
      return [`/${from.slug}-to-${to.slug}`, `/send-money/from/${from.slug}/to/${to.slug}`]
    }),
  ]
  return pages.map((path) => ({ url: `${base}${path}`, lastModified: new Date() }))
}