const jsonResponse = (body: object, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

export function parseGoogleFinanceRate(html: string): number | null {
  const rateText = html.match(/<div\b[^>]*class="[^"]*\bN6SYTe\b[^"]*"[^>]*>\s*<span\b[^>]*jsname="Pdsbrc"[^>]*>\s*<span[^>]*>([^<]+)<\/span>/)?.[1]
    ?.replace(/,/g, '')
    .trim()
  const rate = Number(rateText)
  return Number.isFinite(rate) && rate > 0 ? rate : null
}

export function parseGoogleFinanceTimestamp(html: string, now = new Date()): string | null {
  const timestampText = html.match(/<div\b[^>]*class="[^"]*\bjZZ2de\b[^"]*"[^>]*>([^<]+)<\/div>/)?.[1]
    ?.replace(/&nbsp;/g, ' ')
    .replace(/\u202f/g, ' ')
    .trim()
  const match = timestampText?.match(/^([A-Z][a-z]{2}) (\d{1,2}), (\d{1,2}):(\d{2}):(\d{2}) (AM|PM) UTC$/)
  if (!match) return null

  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(match[1])
  if (month < 0) return null
  const day = Number(match[2])
  const hour = Number(match[3]) % 12 + (match[6] === 'PM' ? 12 : 0)
  const timestamp = (year: number) => Date.UTC(year, month, day, hour, Number(match[4]), Number(match[5]))
  let timestampMs = timestamp(now.getUTCFullYear())
  if (timestampMs > now.getTime() + 12 * 60 * 60 * 1000) timestampMs = timestamp(now.getUTCFullYear() - 1)
  return new Date(timestampMs).toISOString()
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')?.toUpperCase()
  const to = searchParams.get('to')?.toUpperCase()

  if (!from || !to || !/^[A-Z]{3}$/.test(from) || !/^[A-Z]{3}$/.test(to)) {
    return jsonResponse({ status: 'invalid_request', reason: 'Currency codes must contain three letters.' }, 400)
  }

  if (from === to) {
    return jsonResponse({ status: 'available', rate: 1, timestamp: new Date().toISOString(), source: 'Identity rate' })
  }

  try {
    const response = await fetch(`https://www.google.com/finance/quote/${from}-${to}?hl=en`, {
      headers: { Accept: 'text/html', 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(7000),
      cache: 'no-store',
    })
    if (!response.ok) {
      const reason = response.status === 404
        ? `Google Finance does not list a direct ${from}/${to} currency quote.`
        : `Google Finance could not return a quote right now (HTTP ${response.status}).`
      return jsonResponse({ status: 'unavailable', reason }, 503)
    }

    const html = await response.text()
    const rate = parseGoogleFinanceRate(html)
    const timestamp = parseGoogleFinanceTimestamp(html)

    if (rate === null || timestamp === null) {
      return jsonResponse({ status: 'unavailable', reason: `Google Finance did not return a readable ${from}/${to} rate and update time; this pair may not be supported.` }, 503)
    }

    return jsonResponse({
      status: 'available',
      rate,
      timestamp,
      source: 'Google Finance',
    })
  } catch (error) {
    const reason = error instanceof Error && error.name === 'TimeoutError'
      ? 'Google Finance did not respond before the request timed out.'
      : 'Could not reach Google Finance. Check the connection and try again.'
    return jsonResponse({ status: 'unavailable', reason }, 503)
  }
}