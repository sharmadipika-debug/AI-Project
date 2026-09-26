import type { Metadata } from 'next'
import '../src/index.css'
import '../src/App.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: {
    default: 'Morrow | Compare international money transfers',
    template: '%s | Morrow',
  },
  description: 'Compare transfer fees, exchange rates, delivery estimates, and recipient payout. Confirm every live quote directly with the provider.',
  applicationName: 'Morrow',
  icons: { icon: '/favicon.svg' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'Morrow',
    title: 'Compare international money transfers | Morrow',
    description: 'Compare fees, exchange rates, delivery estimates, and recipient payout.',
  },
  twitter: {
    card: 'summary',
    title: 'Compare international money transfers | Morrow',
    description: 'Compare fees, exchange rates, delivery estimates, and recipient payout.',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Morrow',
    description: 'An independent comparison platform for international money transfer providers.',
    url: siteUrl,
  }

  return (
    <html lang="en">
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      </body>
    </html>
  )
}